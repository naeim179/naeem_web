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
