#!/usr/bin/env python3
"""Offline reconstruction from the supplied Word writeup; never executes the ELF."""
from pathlib import Path
import sys

path = Path(sys.argv[1] if len(sys.argv) > 1 else "shibboleth")
data = path.read_bytes()
vm = data[0x24C:0x2D9]
assert data[:4] == b"\x7fELF"
assert len(vm) == 141 and vm[-1] == 0xFF
expected = []
for offset in range(0, 140, 7):
    op = vm[offset:offset + 7]
    assert op[:5] == bytes.fromhex("01 02 03 04 05")
    assert op[6] == 0x06
    expected.append(op[5])

def ror8(value, bits):
    return ((value >> bits) | (value << (8 - bits))) & 0xFF

def rol8(value, bits):
    return ((value << bits) | (value >> (8 - bits))) & 0xFF

inv = pow(0x9D, -1, 256)
password = bytes((((ror8(t, 3) ^ 0x5A) * inv) & 0xFF) for t in expected)
for x, target in zip(password, expected):
    assert rol8((((x * 0x9D) & 0xFF) ^ 0x5A), 3) == target
ciphertext = data[0x237:0x24B]
assert len(password) == len(ciphertext) == 20
plaintext = bytes(a ^ b for a, b in zip(ciphertext, password))
print("Expected check bytes:", bytes(expected).hex(" "))
print("Recovered password :", password.decode("ascii"))
print("Decrypted response :", plaintext.decode("ascii"))
print("Wire response      :", repr(plaintext + b"\n"))
