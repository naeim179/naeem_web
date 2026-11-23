#!/usr/bin/env python3

import os
import time
import hashlib
import secrets
import socketserver
from Crypto.Cipher import AES

P = int(
    "f7896205f74e4db0e3e6ef39155d275a8cb7b2f98f63bade1ec62dbc8c022b25"
    "c45508531cce2e942751f4e62ca3c06c8affbf1f572e29be1953bfb3cbf2b204"
    "e52603b253e5cfb330608a45d2261169b19991ec734ed93ead3ab74e24320908"
    "053537682f3d930d21821bc112ba92fd6c9fe9d9f34d4ccf793daacc90c766ee"
    "15dea6aeab29cb61c9007e2b77f9db88b6d34ac0743a7c0c5480a85b63c6d68d8"
    "7bc02fea6d10bc08c281a470f74fb68fc4fd23bf8865ce9631c62bc8dd4d3e16e"
    "e593d2913a1fa7d72ab2fbe1a5ca2952fb10a918cbc7cbf1c8bb3d3ec020c05d9"
    "c728112f25d156c0b446fd361e37620b0bbd4a89a002de073cb34b3531bd9", 16)
g = 24367588261890509147934158922230774607996257281375448070349921869514987568364161324871298226805894685463053434457827992302389290679866725286632439106377209635251824103161923609849789252711814614759009754369752708326678833129917005636647446859256782214422550774017460506722303182926482528643863786088539750521219134081112858382624358629671555854169564456418022489798298314926796904660874668599221749983402520754233269045558711905862989072460947709181120645824951302557321591536810417438962646448932575288521416136441953848551480471688637894688835500755854498566904544954654985178866733569318937079264465231325200296529
p = 2 ** 256 - 189

LEAK_BITS = 6
MAX_SIGN = int(os.environ.get("PARALLAX_MAX_SIGN", "110"))
MAX_PROVE = 6
IDLE, TOTAL = 900, 7200

FLAG = os.environ.get("FLAG", "flag{redacted}").encode()


def be(n, ln=32):
    return n.to_bytes(ln, "big")


def chal(tag, t, msg):
    """SHA256(tag || t || msg) mod p, with t encoded as 256 big-endian octets."""
    return int.from_bytes(hashlib.sha256(tag + be(t, 256) + msg).digest(), "big") % p


class Beacon:
    def __init__(self):
        self.x = secrets.randbelow(p - 1) + 1
        self.y = secrets.randbelow(p - 1) + 1
        self.X, self.Y = pow(g, self.x, P), pow(g, self.y, P)
        self.signs = self.proves = 0
        self.unlock_msg = None

    def sign(self, msg):
        """Dual report under ONE commitment: full range response, quantised doppler response."""
        self.signs += 1
        k = secrets.randbelow(p - 1) + 1
        t = pow(g, k, P)
        s1 = (k + chal(b"range", t, msg) * self.x) % p
        s2 = (k + chal(b"doppler", t, msg) * self.y) % p
        return t, s1, s2 >> (256 - LEAK_BITS)

    def unlock(self):
        self.unlock_msg = secrets.token_bytes(16)
        return self.unlock_msg.hex()

    def prove(self, t, s1, s2):
        if self.unlock_msg is None or self.proves >= MAX_PROVE:
            return "ERR"
        self.proves += 1
        msg, self.unlock_msg = self.unlock_msg, None
        ok = (0 < t < P and 0 <= s1 < p and 0 <= s2 < p
              and pow(g, s1, P) == t * pow(self.X, chal(b"range", t, msg), P) % P
              and pow(g, s2, P) == t * pow(self.Y, chal(b"doppler", t, msg), P) % P)
        if not ok:
            time.sleep(1 + 0.5 * self.proves)
            return "ERR"
        key = hashlib.sha256(be(self.y) + be(self.x)).digest()[::-1]
        nonce = hashlib.sha256(be(self.x * self.y % p)).digest()[:12]
        ct, tag = AES.new(key, AES.MODE_GCM, nonce=nonce).encrypt_and_digest(FLAG)
        return "SEAL %s %s" % (ct.hex(), tag.hex())


def num(tok):
    return int(tok, 16) if tok.lower().startswith("0x") else int(tok)


class Handler(socketserver.StreamRequestHandler):
    def handle(self):
        self.request.settimeout(IDLE)
        end = time.time() + TOTAL
        b = Beacon()
        w = self.wfile
        bad = "  ! bad input"
        prompt = "  > "
        try:
            w.write(("P = %s\ng = %d\np = %s\nX = %s\nY = %s\nMAX_SIGN = %d\n"
                     % (hex(P), g, hex(p), hex(b.X), hex(b.Y), MAX_SIGN)).encode())
            w.write(prompt.encode())
            while time.time() < end:
                line = self.rfile.readline(4096)
                if not line:
                    return
                t = line.decode("latin1").split()
                if not t:
                    w.write(prompt.encode())
                    continue
                cmd = t[0].upper()
                try:
                    if cmd == "SIGN" and len(t) == 2:
                        if b.signs >= MAX_SIGN:
                            r = bad
                        else:
                            tt, s1, z = b.sign(bytes.fromhex(t[1]))
                            r = "SIG %s %s %d" % (hex(tt), hex(s1), z)
                    elif cmd == "UNLOCK":
                        r = "MSG " + b.unlock()
                    elif cmd == "PROVE" and len(t) == 4:
                        r = b.prove(num(t[1]), num(t[2]), num(t[3]))
                        r = bad if r == "ERR" else r
                    elif cmd == "HELP":
                        r = "SIGN <hex> | UNLOCK | PROVE <t> <s> <s> | HELP | QUIT"
                    elif cmd == "QUIT":
                        w.write(b"bye\n")
                        return
                    else:
                        r = bad
                except ValueError:
                    r = bad
                w.write((r + "\n" + prompt).encode())
        except OSError:
            pass


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    Server(("0.0.0.0", int(os.environ.get("PORT", "1337"))), Handler).serve_forever()
