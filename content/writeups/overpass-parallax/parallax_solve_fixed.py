#!/usr/bin/env python3
"""Overpass CTF / Parallax -- shared-nonce, truncated-response lattice exploit.

Dependencies: fpylll, cysignals, pycryptodome.
Run: python3 parallax_solve.py --host vps3.ctf.bracken.sh --port 30012
"""

import argparse
import hashlib
import multiprocessing as mp
import socket
import sys

try:
    from Cryptodome.Cipher import AES  # Kali/Debian: python3-pycryptodome
except ImportError:
    from Crypto.Cipher import AES  # pip: pycryptodome
from fpylll import BKZ, IntegerMatrix, LLL

LEAK_BITS = 6
W = 1 << (256 - LEAK_BITS)
# The deployed Overpass instance uses a UTF-8 right-angle quote (U+203A),
# unlike the plain-ASCII prompt in the distributed source.
PROMPTS = ("  › ".encode("utf-8"), b"  > ")


class Peer:
    def __init__(self, sock):
        self.sock = sock
        self.buffer = b""

    def read_response(self):
        while True:
            # Both the deployed UTF-8 prompt and the source's ASCII prompt.
            matches = [(self.buffer.find(marker), marker)
                       for marker in PROMPTS if marker in self.buffer]
            if matches:
                pos, marker = min(matches, key=lambda x: x[0])
                result = self.buffer[:pos]
                self.buffer = self.buffer[pos + len(marker):]
                return result.decode("utf-8", errors="replace").strip()
            chunk = self.sock.recv(8192)
            if not chunk:
                raise ConnectionError("The challenge server closed the connection")
            self.buffer += chunk

    def query(self, command):
        self.sock.sendall(command.encode("ascii") + b"\n")
        return self.read_response()


def keepalive(fd, stop):
    """Separate process avoids losing the session during long BKZ calls.

    The parent performs no socket I/O until this process has exited.
    Only intended for POSIX/fork systems such as Kali Linux.
    """
    sock = socket.socket(fileno=fd)
    sock.settimeout(30)
    peer = Peer(sock)
    try:
        while not stop.wait(45):
            peer.query("HELP")
    except (OSError, ConnectionError) as exc:
        print(f"[keepalive] {exc}", file=sys.stderr, flush=True)
    finally:
        sock.close()


def h(tag, t, msg, p):
    return int.from_bytes(
        hashlib.sha256(tag + t.to_bytes(256, "big") + msg).digest(),
        "big",
    ) % p


def make_lattice(sig, p):
    """An (n+1)-dimensional Kannan embedding of the modular CVP.

    L = { (a_i*x - b_i*y) mod p : x,y in Z/pZ } + p*Z^n.
    A row-HNF-style basis avoids two redundant p-sized key coordinates.
    """
    n = len(sig)
    a = [item[0] for item in sig]
    b = [-item[1] for item in sig]
    z = [item[3] for item in sig]
    target = [item[2] - (item[3] * W + W // 2) for item in sig]

    determinant = (a[0] * b[1] - a[1] * b[0]) % p
    inv_det = pow(determinant, -1, p)

    mat = IntegerMatrix(n + 1, n + 1)
    for i in range(n):
        mat[0, i] = ((a[i] * b[1] - b[i] * a[1]) * inv_det) % p
        mat[1, i] = ((a[0] * b[i] - a[i] * b[0]) * inv_det) % p
    for i in range(2, n):
        mat[i, i] = p

    # A short row (errors..., T) should appear after strong reduction.
    T = W // 3
    for i in range(n):
        mat[n, i] = -target[i]
    mat[n, n] = T
    return mat, (a, b, z, target, inv_det, T)


def find_key(mat, extra, sig, p, P, g, X, Y, pairs=False):
    a, b, z, target, inv_det, T = extra
    n = len(sig)
    rows = [[int(mat[i, j]) for j in range(n + 1)] for i in range(n + 1)]

    def check(v):
        if v[n] % T:
            return None
        multiplier = v[n] // T
        if not 1 <= abs(multiplier) <= 4:
            return None
        # Every true residual is bounded by W/2, including at MSB boundaries.
        if any(abs(v[j]) > abs(multiplier) * (W // 2) for j in range(n)):
            return None
        inv_multiplier = pow(multiplier, -1, p)
        l0 = ((v[0] + multiplier * target[0]) * inv_multiplier) % p
        l1 = ((v[1] + multiplier * target[1]) * inv_multiplier) % p
        x = ((l0 * b[1] - l1 * b[0]) * inv_det) % p
        y = ((a[0] * l1 - a[1] * l0) * inv_det) % p
        if not all(
            ((item[2] - a[i] * x - b[i] * y) % p) // W == z[i]
            for i, item in enumerate(sig)
        ):
            return None
        if pow(g, x, P) == X and pow(g, y, P) == Y:
            return x, y
        return None

    for row in rows:
        answer = check(row)
        if answer:
            return answer

    if pairs:
        # The desired short vector may be a +/- combination of basis rows.
        for i in range(min(n + 1, 35)):
            for j in range(i + 1, min(n + 1, 35)):
                for s in (-1, 1):
                    v = [rows[i][k] + s * rows[j][k] for k in range(n + 1)]
                    answer = check(v)
                    if answer:
                        return answer
    return None


def recover_key(sig, p, P, g, X, Y, blocks):
    mat, extra = make_lattice(sig, p)
    print(f"[*] LLL on a {mat.nrows} x {mat.ncols} lattice", flush=True)
    LLL.reduction(mat, delta=0.99)
    key = find_key(mat, extra, sig, p, P, g, X, Y, pairs=True)
    if key:
        return key

    for beta in blocks:
        if beta > mat.nrows:
            continue
        print(f"[*] BKZ block size {beta}", flush=True)
        BKZ.reduction(mat, BKZ.Param(block_size=beta, max_loops=4))
        key = find_key(mat, extra, sig, p, P, g, X, Y, pairs=True)
        if key:
            return key
    raise RuntimeError("Lattice reduction did not recover the keys; try larger BKZ blocks")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="vps3.ctf.bracken.sh")
    parser.add_argument("--port", type=int, default=30012)
    parser.add_argument("--count", type=int, default=110)
    parser.add_argument("--blocks", default="25,30,35,40,45,50,55,60,65,70,80")
    args = parser.parse_args()

    sock = socket.create_connection((args.host, args.port), timeout=30)
    sock.settimeout(60)
    peer = Peer(sock)
    banner = peer.read_response()
    # The live service has a decorative banner, HELP text and blank lines.
    expected = {"P", "g", "p", "X", "Y", "MAX_SIGN"}
    params = {}
    for line in banner.splitlines():
        if " = " not in line:
            continue
        name, value = line.strip().split(" = ", 1)
        if name in expected:
            params[name] = value.strip()
    missing = expected.difference(params)
    if missing:
        raise RuntimeError(f"Server banner missing {sorted(missing)}; banner: {banner!r}")
    P = int(params["P"], 0)
    g = int(params["g"], 0)
    p = int(params["p"], 0)
    X = int(params["X"], 0)
    Y = int(params["Y"], 0)
    count = min(args.count, int(params["MAX_SIGN"]))
    print(f"[*] Collecting {count} signatures in this session", flush=True)
    assert count >= 3

    sig = []
    for i in range(count):
        msg = i.to_bytes(4, "big")
        response = peer.query("SIGN " + msg.hex()).split()
        if len(response) != 4 or response[0] != "SIG":
            raise RuntimeError(f"Unexpected SIGN response: {response}")
        t, s1, z = int(response[1], 0), int(response[2], 0), int(response[3])
        a = h(b"range", t, msg, p)
        b = h(b"doppler", t, msg, p)
        sig.append((a, b, s1, z))

    # Only the child sends HELP; the parent performs no network calls during BKZ.
    if peer.buffer:
        raise RuntimeError("Unexpected buffered server output before forking")
    ctx = mp.get_context("fork")
    stop = ctx.Event()
    worker = ctx.Process(target=keepalive, args=(sock.fileno(), stop), daemon=True)
    worker.start()
    try:
        blocks = [int(x) for x in args.blocks.split(",")]
        x, y = recover_key(sig, p, P, g, X, Y, blocks)
    finally:
        stop.set()
        worker.join(timeout=5)
        if worker.is_alive():
            worker.terminate()
            worker.join()

    print("[+] x =", hex(x), flush=True)
    print("[+] y =", hex(y), flush=True)

    challenge = peer.query("UNLOCK").split()
    if len(challenge) != 2 or challenge[0] != "MSG":
        raise RuntimeError(f"Unexpected UNLOCK response: {challenge}")
    msg = bytes.fromhex(challenge[1])

    k = 1  # We know both secrets: a fresh nonce can be chosen arbitrarily.
    t = pow(g, k, P)
    s1 = (k + h(b"range", t, msg, p) * x) % p
    s2 = (k + h(b"doppler", t, msg, p) * y) % p
    response = peer.query(f"PROVE {hex(t)} {hex(s1)} {hex(s2)}").split()
    if len(response) != 3 or response[0] != "SEAL":
        raise RuntimeError(f"PROVE failed: {response}")

    ciphertext, tag = bytes.fromhex(response[1]), bytes.fromhex(response[2])
    key = hashlib.sha256(y.to_bytes(32, "big") + x.to_bytes(32, "big")).digest()[::-1]
    nonce = hashlib.sha256(((x * y) % p).to_bytes(32, "big")).digest()[:12]
    flag = AES.new(key, AES.MODE_GCM, nonce=nonce).decrypt_and_verify(ciphertext, tag)
    print("[+] FLAG:", flag.decode(), flush=True)
    sock.close()


if __name__ == "__main__":
    main()
