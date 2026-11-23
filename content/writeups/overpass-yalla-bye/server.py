import os
import sys
import hmac
import hashlib
from Crypto.Cipher import AES

p  = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
a  = 0
b  = 7
n  = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141

Gx = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798
Gy = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8
G  = (Gx, Gy)

FLAG = os.environ.get("FLAG", "OVERPASS{fakeeeeeeeeeeeeeeee}")


def point_add(P1, P2):
    if P1 is None: return P2
    if P2 is None: return P1
    x1, y1 = P1; x2, y2 = P2
    if x1 == x2:
        if (y1 + y2) % p == 0: return None
        m = (3 * x1 * x1 + a) * pow(2 * y1, p - 2, p) % p
    else:
        m = (y2 - y1) * pow(x2 - x1, p - 2, p) % p
    x3 = (m * m - x1 - x2) % p
    y3 = (m * (x1 - x3) - y1) % p
    return (x3, y3)

def point_mul(k, P):
    R = None
    Q = P
    while k > 0:
        if k & 1: R = point_add(R, Q)
        Q = point_add(Q, Q)
        k >>= 1
    return R


def verify_twisted_edwards_ed25519(sig, public_point, message):
    q_ed = 2**255 - 19
    d_ed = -121665 * pow(121666, q_ed - 2, q_ed) % q_ed
    if len(sig) != 64: return False
    h = hashlib.sha512(sig[:32] + public_point + message).digest()
    return int.from_bytes(h, "little") % q_ed != 0


def issue_root_ticket(secret_key):
    k_enc = hashlib.sha256(secret_key.to_bytes(32, "big") + b":yalla_enc").digest()
    k_mac = hashlib.sha256(secret_key.to_bytes(32, "big") + b":yalla_mac").digest()
    iv = os.urandom(16)
    cipher = AES.new(k_enc, AES.MODE_CTR, nonce=iv[:8], initial_value=iv[8:])
    payload = b"grant=root_admin;scope=all;action=claim_flag"
    ct = cipher.encrypt(payload)
    tag = hmac.new(k_mac, iv + ct, hashlib.sha256).digest()
    return (iv + ct + tag).hex()

def verify_ticket(secret_key, ticket_hex):
    try:
        raw = bytes.fromhex(ticket_hex)
        if len(raw) < 16 + 1 + 32: return None
        iv = raw[:16]; tag = raw[-32:]; ct = raw[16:-32]
        k_enc = hashlib.sha256(secret_key.to_bytes(32, "big") + b":yalla_enc").digest()
        k_mac = hashlib.sha256(secret_key.to_bytes(32, "big") + b":yalla_mac").digest()
        computed_tag = hmac.new(k_mac, iv + ct, hashlib.sha256).digest()
        if not hmac.compare_digest(tag, computed_tag): return None
        cipher = AES.new(k_enc, AES.MODE_CTR, nonce=iv[:8], initial_value=iv[8:])
        pt = cipher.decrypt(ct).decode()
        claims = dict(item.split("=") for item in pt.split(";") if "=" in item)
        return claims
    except Exception:
        return None


class YallaSession:
    def __init__(self):
        self.d = int.from_bytes(os.urandom(32), "big") % n
        self.pub = point_mul(self.d, G)
        
        self.A = int.from_bytes(os.urandom(32), "big") % n
        
        self.current_k = int.from_bytes(os.urandom(32), "big") % n
        self.epoch = 0
        
        self.query_budget = 3
        self.closed = False

    def sign_logout_message(self, message_str):
        if self.closed or self.query_budget <= 0:
            self.closed = True
            return None, "[-] Khallas! Query limit reached. Yalla bye! 👋💀"
        
        z = int(hashlib.sha256(message_str.encode("utf-8")).hexdigest(), 16) % n
        if z == 0: z = 1

        k = self.current_k
        R = point_mul(k, G)
        if R is None:
            self.closed = True
            return None, "[-] Degenerate point encountered. Yalla bye!"
        
        r = R[0] % n
        if r == 0:
            self.closed = True
            return None, "[-] Degenerate coordinate. Yalla bye!"

        k_inv = pow(k, n - 2, n)
        s = (k_inv * (z + r * self.d)) % n
        if s == 0:
            self.closed = True
            return None, "[-] Degenerate signature. Yalla bye!"

        self.current_k = (self.A * self.current_k) % n
        self.epoch += 1
        self.query_budget -= 1

        info = f"[+] Logout token generated for epoch {self.epoch - 1}. Remaining: {self.query_budget}"
        return (r, s, z), info

def banner():
    print("==================================================================")
    print("    👋 YALLA-BYE SECURE ENTERPRISE SESSION LOGOUT ORACLE 👋      ")
    print("==================================================================")
    print("Notice: High-security ECDSA session tokens with Geometric Entropy.")
    print("STRICT RULE: Maximum 3 logout tokens per connection.")
    print("Try anything funny or exceed quota -> yalla bye! 👋💀")
    print("==================================================================\n")

def menu():
    print("Available Commands:")
    print("  [1] Request Signed Logout Token (Provide session reason)")
    print("  [2] Unlock Root Vault (Submit Admin Ticket)")
    print("  [3] Exit (Yalla bye)")

def main():
    banner()
    session = YallaSession()
    print(f"[*] Enclave Public Key : ({hex(session.pub[0])}, {hex(session.pub[1])})")
    print(f"[*] Quota Available    : {session.query_budget} tokens.\n")

    while True:
        menu()
        try:
            sys.stdout.write("\n> ")
            sys.stdout.flush()
            line = sys.stdin.readline()
            if not line: break
            choice = line.strip()

            if choice == "1":
                sys.stdout.write("Enter session logout reason/text: ")
                sys.stdout.flush()
                msg = sys.stdin.readline()
                if not msg: break
                msg = msg.strip()
                if len(msg) == 0:
                    print("[-] Empty reason rejected. Yalla bye! 👋")
                    break

                sig_tuple, info = session.sign_logout_message(msg)
                print(info)
                if sig_tuple is not None:
                    r, s, z = sig_tuple
                    print(f"r: {hex(r)}")
                    print(f"s: {hex(s)}")
                    print(f"z: {hex(z)}")
                else:
                    break

            elif choice == "2":
                sys.stdout.write("Enter Admin Ticket (hex): ")
                sys.stdout.flush()
                ticket_line = sys.stdin.readline()
                if not ticket_line: break
                claims = verify_ticket(session.d, ticket_line.strip())
                if claims and claims.get("grant") == "root_admin" and claims.get("action") == "claim_flag":
                    print("\n[+] MABROOOOK! Root admin verified! 🎉")
                    print(f"[+] FLAG: {FLAG}\n")
                    break
                else:
                    print("[-] Invalid ticket. Khallas, yalla bye! 👋💀")
                    break

            elif choice == "3":
                print("Yalla bye! 👋")
                break
            else:
                print("[-] Unknown option. Yalla bye! 👋")
                break
        except Exception as ex:
            print(f"[-] Session crashed: {ex}. Yalla bye! 👋")
            break

if __name__ == "__main__":
    main()
