# Yalla Bye — Full CTF Write-up

**Event:** Bracken CTF — Overpass  
**Challenge:** Yalla Bye  
**Category:** Cryptography  
**Points:** 304  
**Remote service:** `nc vps3.ctf.bracken.sh 30029`  
**Provided file:** `server.py`  
**Vulnerability:** Predictable relationships between consecutive ECDSA nonces  
**Outcome:** Private-key recovery, authenticated admin-ticket forgery, and root-vault access

> **Verification note:** The exploit was successfully tested against a locally hosted equivalent of the provided server, using a deliberately configured test flag, `OVERPASS{LOCAL_TEST_SUCCESS}`. This is not the flag from the remote CTF instance. The live flag was not obtained in this environment.

## 1. Challenge overview

The challenge exposes a menu-driven cryptographic service. Each new connection starts a session with a fresh ECDSA private key and an advertised public key. The available operations are:

1. Request a signed logout token by supplying a nonempty reason.
2. Unlock the root vault by submitting an admin ticket in hexadecimal.
3. Exit.

The service limits us to **three logout signatures per connection**. The goal is to forge a valid admin ticket containing the claims `grant=root_admin` and `action=claim_flag`. If the ticket is accepted, the service prints the flag.

The important observation is that the server uses **secp256k1 ECDSA** for logout tokens, but generates successive signing nonces with a multiplicative recurrence. Three consecutive signatures are exactly enough to recover the private key algebraically.

## 2. Inspecting the source code

The secp256k1 parameters appear at the top of `server.py`:

```python
p = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
n = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
G = (Gx, Gy)
```

The session constructor chooses a random ECDSA private key `d`, a random multiplier `A`, and an initial nonce `current_k`:

```python
self.d = int.from_bytes(os.urandom(32), "big") % n
self.pub = point_mul(self.d, G)
self.A = int.from_bytes(os.urandom(32), "big") % n
self.current_k = int.from_bytes(os.urandom(32), "big") % n
self.query_budget = 3
```

The signing routine performs a standard ECDSA computation:

```python
z = int(hashlib.sha256(message_str.encode("utf-8")).hexdigest(), 16) % n
k = self.current_k
R = point_mul(k, G)
r = R[0] % n
s = (pow(k, n - 2, n) * (z + r * self.d)) % n
```

Then the nonce state is updated:

```python
self.current_k = (self.A * self.current_k) % n
```

The service reveals `r`, `s`, and `z` for every issued signature. It also prints the public point `Q = dG` at connection startup.

Although the code contains a function named `verify_twisted_edwards_ed25519`, it is not used by the menu or ticket validation code. The actual cryptographic attack targets secp256k1 ECDSA.

## 3. The nonce-generation vulnerability

ECDSA requires a secret, unpredictable nonce `k` for each signature. In this implementation, the initial nonce and multiplier are random, but consecutive nonces are correlated:

```text
k0 = k
k1 = A · k                 (mod n)
k2 = A² · k                (mod n)
```

Consequently:

```text
k1² = k0 · k2              (mod n)
```

We do not need to know `A` or any nonce value. The relation alone leaks enough information when combined with three ECDSA signatures.

For signature `i`, the ECDSA equation is:

```text
s_i = k_i^(-1) · (z_i + r_i · d)       (mod n)
```

Rearranging gives:

```text
k_i = (z_i + r_i · d) · s_i^(-1)      (mod n)
```

Substituting these expressions into `k1² = k0 · k2`:

```text
[(z1 + r1·d) / s1]²
    = [(z0 + r0·d) / s0] · [(z2 + r2·d) / s2]    (mod n)
```

Clearing denominators:

```text
s0·s2·(z1 + r1·d)² - s1²·(z0 + r0·d)·(z2 + r2·d) = 0  (mod n)
```

This is a **quadratic equation in the unknown private key `d`**.

## 4. Recovering the ECDSA private key

Define:

```text
v = s0 · s2   (mod n)
w = s1²      (mod n)
```

Expanding the previous equation yields:

```text
a·d² + b·d + c = 0       (mod n)
```

with coefficients:

```text
a = v·r1² - w·r0·r2
b = 2·v·z1·r1 - w·(z0·r2 + z2·r0)
c = v·z1² - w·z0·z2
```

All operations are modulo the secp256k1 group order `n`. Since `n` is prime, we can solve the quadratic using modular arithmetic:

```text
Δ = b² - 4ac                  (mod n)
d = (-b ± sqrt(Δ)) / (2a)    (mod n)
```

Division means multiplication by a modular inverse. The exploit uses the **Tonelli–Shanks algorithm** to compute `sqrt(Δ)` modulo `n`. In the rare degenerate case `a = 0`, the solver falls back to the linear equation.

There can be two possible private-key candidates. The server exposes its public key, so we verify each candidate using elliptic-curve point multiplication:

```text
Q_candidate = d_candidate · G
```

The candidate satisfying `Q_candidate == Q_server` is the correct ECDSA private key.

The core of the exploit is:

```python
v, w = s0*s2 % N, s1*s1 % N
a = (v*r1*r1 - w*r0*r2) % N
b = (2*v*z1*r1 - w*(z0*r2 + z2*r0)) % N
c = (v*z1*z1 - w*z0*z2) % N

disc = (b*b - 4*a*c) % N
square_root = sqrt_mod_prime(disc, N)
inv_2a = pow(2*a % N, -1, N)
roots = [((-b + e*square_root)*inv_2a) % N for e in (1, -1)]

for d in roots:
    if ec_mul(d) == public_point:
        return d
```

This code excerpt shows the normal quadratic case; the complete solver also handles the degenerate linear case.

## 5. Understanding the admin ticket format

Once `d` is known, the vault can be unlocked without bypassing AES or HMAC. The ticket's cryptographic keys are derived directly from that same ECDSA private key:

```python
secret = d.to_bytes(32, "big")
k_enc = hashlib.sha256(secret + b":yalla_enc").digest()
k_mac = hashlib.sha256(secret + b":yalla_mac").digest()
```

The server expects the plaintext:

```text
grant=root_admin;scope=all;action=claim_flag
```

It encrypts this value with **AES-256-CTR**, using a random 16-byte IV. It then calculates an **HMAC-SHA256** over the IV concatenated with the ciphertext:

```text
ciphertext = AES-256-CTR(k_enc, IV, plaintext)
tag        = HMAC-SHA256(k_mac, IV || ciphertext)
ticket     = hex(IV || ciphertext || tag)
```

On verification, the server first checks the MAC, decrypts the ciphertext, parses the semicolon-delimited claims, and verifies both:

```python
claims.get("grant") == "root_admin"
claims.get("action") == "claim_flag"
```

Our exploit reproduces this structure. It calls the system `openssl` executable to perform AES-256-CTR encryption, computes HMAC-SHA256 with Python's standard library, and sends the resulting ticket through menu option 2.

**Why this works:** AES-CTR and HMAC are not broken. The signing nonce flaw exposes `d`, and the ticket system reuses `d` to derive both symmetric keys. That single key compromise breaks the trust boundary between logout signing and root-vault authorization.

## 6. Exploitation procedure

The complete solver automatically performs the following steps:

1. Open one TCP connection to `vps3.ctf.bracken.sh:30029`.
2. Parse the advertised secp256k1 public key from the greeting.
3. Submit menu option `1` three times, with the messages `logout_0`, `logout_1`, and `logout_2`.
4. Parse the three `(r, s, z)` signature tuples.
5. Construct and solve the quadratic congruence for `d`.
6. Validate the correct private key against the public point.
7. Derive the AES encryption and HMAC keys from `d`.
8. Encrypt the root-admin payload, generate its HMAC, and assemble the hexadecimal ticket.
9. Submit the ticket using menu option `2` **on the same TCP connection**.
10. Read the server's response and extract the flag if present.

The same connection requirement is important: a new connection generates a new `d`, so a ticket derived from an earlier session would not validate in a later one.

### Running the exploit

Requirements: Python 3 and the system `openssl` command; no Python packages need to be installed for the provided solver.

```bash
python3 yalla_bye_solve.py
```

Or specify the host and port explicitly:

```bash
python3 yalla_bye_solve.py vps3.ctf.bracken.sh 30029
```

## 7. Verification and result

The solver was tested locally against an equivalent instance of the supplied service logic, with `OVERPASS{LOCAL_TEST_SUCCESS}` deliberately set as the flag. The locally available environment lacked `pycryptodome`, so the local harness used the `cryptography` package to implement the same AES-256-CTR operation; the supplied challenge server and exploit logic were otherwise preserved for this test.

Observed local output (private key omitted, because it changes each session):

```text
[+] Public key received
[+] Obtained signature 1/3
[+] Obtained signature 2/3
[+] Obtained signature 3/3
[+] RECOVERED PRIVATE KEY: ...

[+] MABROOOOK! Root admin verified! 🎉
[+] FLAG: OVERPASS{LOCAL_TEST_SUCCESS}

[FLAG] OVERPASS{LOCAL_TEST_SUCCESS}
```

This confirms that the attack can recover the key and produce a valid authenticated ticket under the tested service logic. **The real remote flag is not provided here and must be retrieved by running the solver against the challenge endpoint.**

## 8. Lessons learned

- ECDSA does not require merely *different* nonces; they must be secure and not reveal exploitable algebraic relationships.
- A random initial nonce and a random multiplier do not make a multiplicative nonce sequence safe for signatures.
- Three correlated signatures can expose a full 256-bit ECDSA secret key when the nonce relation collapses to a solvable polynomial.
- Public-key verification provides a simple way to select the correct modular quadratic root.
- Reusing a signing private key as the source for unrelated authorization keys amplifies the damage from a signing failure.
- Recommended remediation: use a well-reviewed ECDSA implementation with a secure per-signature nonce strategy (such as RFC 6979 deterministic nonces where appropriate) and maintain independent keys for ticket authentication/encryption.

## Conclusion

**Yalla Bye** is an ECDSA related-nonce attack. The server reveals exactly three signatures whose nonces form a geometric progression. The relation `k1² = k0·k2 (mod n)` turns the three ECDSA equations into a quadratic congruence in the private key. Solving that equation recovers `d`, and because the vault's AES and HMAC keys are derived from `d`, we can forge a legitimate root-admin ticket and reach the flag response.

---

## Appendix A — Full Python exploit

Save the following as `yalla_bye_solve.py`. The script uses only Python's standard library plus the system `openssl` executable.

```python
#!/usr/bin/env python3
"""Yalla Bye CTF: recover secp256k1 ECDSA key from 3 geometric nonces.
Standard-library Python + system openssl command (no pip packages needed).
Usage: python3 yalla_bye_solve.py [host] [port]
"""
import hashlib
import hmac
import os
import re
import socket
import subprocess
import sys

P = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
G = (0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798,
     0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8)


def ec_add(A, B):
    if A is None: return B
    if B is None: return A
    x1, y1 = A
    x2, y2 = B
    if x1 == x2:
        if (y1 + y2) % P == 0: return None
        slope = (3 * x1*x1 * pow(2*y1, -1, P)) % P
    else:
        slope = ((y2-y1) * pow((x2-x1) % P, -1, P)) % P
    x3 = (slope*slope - x1-x2) % P
    return x3, (slope*(x1-x3) - y1) % P


def ec_mul(k, point=G):
    result = None
    while k:
        if k & 1:
            result = ec_add(result, point)
        point = ec_add(point, point)
        k >>= 1
    return result


def sqrt_mod_prime(a, p):
    """Tonelli-Shanks square root modulo an odd prime; None if nonsquare."""
    a %= p
    if a == 0: return 0
    if pow(a, (p-1)//2, p) != 1: return None
    if p % 4 == 3: return pow(a, (p+1)//4, p)
    q, s = p-1, 0
    while q % 2 == 0:
        s += 1
        q //= 2
    z = 2
    while pow(z, (p-1)//2, p) != p-1:
        z += 1
    m, c = s, pow(z, q, p)
    t, r = pow(a, q, p), pow(a, (q+1)//2, p)
    while t != 1:
        i, t2 = 0, t
        while t2 != 1:
            t2 = (t2 * t2) % p
            i += 1
        if i == m:
            return None
        b = pow(c, 1 << (m-i-1), p)
        r = r*b % p
        t = t*b*b % p
        c = b*b % p
        m = i
    return r


def recover_d(signatures, public_point):
    (r0, s0, z0), (r1, s1, z1), (r2, s2, z2) = signatures
    # (k1)^2 == (k0)*(k2) with ki = (zi + ri*d) / si mod n
    # s0*s2*(z1+r1*d)^2 - s1^2*(z0+r0*d)*(z2+r2*d) == 0 mod n
    v, w = s0*s2 % N, s1*s1 % N
    a = (v*r1*r1 - w*r0*r2) % N
    b = (2*v*z1*r1 - w*(z0*r2 + z2*r0)) % N
    c = (v*z1*z1 - w*z0*z2) % N
    if a == 0:
        if b == 0: raise ValueError('degenerate polynomial; reconnect and retry')
        roots = [(-c * pow(b, -1, N)) % N]
    else:
        disc = (b*b - 4*a*c) % N
        square_root = sqrt_mod_prime(disc, N)
        if square_root is None: raise ValueError('discriminant is not a square')
        inv_2a = pow(2*a % N, -1, N)
        roots = [((-b + e*square_root)*inv_2a) % N for e in (1, -1)]
    for d in roots:
        if ec_mul(d) == public_point:
            return d
    raise ValueError('no private key matches the printed public key')


def generate_ticket(d):
    secret = d.to_bytes(32, 'big')
    k_enc = hashlib.sha256(secret + b':yalla_enc').digest()
    k_mac = hashlib.sha256(secret + b':yalla_mac').digest()
    iv = os.urandom(16)
    plaintext = b'grant=root_admin;scope=all;action=claim_flag'
    # OpenSSL's full 128-bit CTR IV agrees with PyCryptodome's nonce=iv[:8],
    # initial_value=iv[8:] for a message this short.
    result = subprocess.run(['openssl', 'enc', '-aes-256-ctr', '-nosalt',
                             '-K', k_enc.hex(), '-iv', iv.hex()],
                            input=plaintext, stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE, check=True)
    ciphertext = result.stdout
    tag = hmac.new(k_mac, iv + ciphertext, hashlib.sha256).digest()
    return (iv + ciphertext + tag).hex()


def read_until(sock, marker):
    out = b''
    while marker not in out:
        chunk = sock.recv(4096)
        if not chunk: raise ConnectionError('server disconnected: ' + out.decode(errors='replace'))
        out += chunk
    return out.decode(errors='replace')


def main():
    host = sys.argv[1] if len(sys.argv) > 1 else 'vps3.ctf.bracken.sh'
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 30029
    with socket.create_connection((host, port), timeout=20) as s:
        s.settimeout(30)
        banner = read_until(s, '\n> '.encode())
        match = re.search(r'Enclave Public Key\s*:\s*\((0x[0-9a-f]+),\s*(0x[0-9a-f]+)\)', banner)
        if not match: raise ValueError('could not parse public key from banner:\n'+banner)
        pub = (int(match.group(1), 16), int(match.group(2), 16))
        print('[+] Public key received')
        signatures = []
        for i in range(3):
            s.sendall(b'1\n')
            read_until(s, b'Enter session logout reason/text: ')
            s.sendall(f'logout_{i}\n'.encode())
            response = read_until(s, b'\n> ')
            vals = []
            for key in ('r', 's', 'z'):
                found = re.search(rf'(?m)^{key}: (0x[0-9a-f]+)$', response)
                if not found:
                    raise ValueError(f'missing {key} in server reply:\n{response}')
                vals.append(int(found.group(1), 16))
            signatures.append(tuple(vals))
            print(f'[+] Obtained signature {i+1}/3')
        d = recover_d(signatures, pub)
        print(f'[+] RECOVERED PRIVATE KEY: {d:064x}')
        ticket = generate_ticket(d)
        s.sendall(b'2\n')
        read_until(s, b'Enter Admin Ticket (hex): ')
        s.sendall(ticket.encode() + b'\n')
        output = b''
        while True:
            try:
                chunk = s.recv(4096)
            except socket.timeout:
                break
            if not chunk: break
            output += chunk
        print(output.decode(errors='replace'))
        flag = re.search(rb'OVERPASS\{[^}\n]+\}', output)
        if flag:
            print('[FLAG]', flag.group().decode())
        else:
            print('[!] No matching FLAG displayed; inspect server response above.')


if __name__ == '__main__':
    main()
```

## Appendix B — Source file

The analysis is based on the provided `server.py`, including its `YallaSession.sign_logout_message`, `verify_ticket`, and `issue_root_ticket` functions.
