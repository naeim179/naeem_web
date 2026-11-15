#!/usr/bin/env python3
"""Recover the SteelAndFeathers CTF flag without executing the Windows binary.

Usage: python3 steel_solver.py SteelAndFeathers.exe
Requires Python 3 standard library only.
"""

import base64
import gzip
import re
import sys
from pathlib import Path


def ror8(value: int, count: int) -> int:
    return ((value >> count) | (value << (8 - count))) & 0xFF


def unpack_from_exe(path: Path) -> bytes:
    data = path.read_bytes()
    # .NET user strings are UTF-16 little-endian. Extract Base64 payload
    # directly from the PE without executing the binary.
    start = data.find("H4sIA".encode("utf-16le"))
    if start == -1:
        raise ValueError("Base64-encoded GZIP string not found")
    text = data[start:].decode("utf-16le", errors="ignore")
    match = re.match(r"([A-Za-z0-9+/]{100,}={0,2})", text)
    if not match:
        raise ValueError("Could not extract Base64 payload")

    compressed = base64.b64decode(match.group(1))
    obfuscated = gzip.decompress(compressed)
    return bytes(
        ror8(byte, i % 7 + 1) ^ ((23 + i * 41) & 0xFF)
        for i, byte in enumerate(obfuscated)
    )


def run_vm(code: bytes) -> tuple[str, int]:
    stack: list[int] = []
    memory = bytearray(256)
    memory[250] = 45  # 0x2D
    output = bytearray()
    pc = 0
    instructions = 0

    while pc < len(code):
        opcode = code[pc]
        pc += 1
        instructions += 1

        if opcode == 0x10:  # PUSH immediate
            stack.append(code[pc])
            pc += 1
        elif opcode == 0x20:  # XOR
            stack.append((stack.pop() ^ stack.pop()) & 0xFF)
        elif opcode == 0x30:  # ADD
            stack.append((stack.pop() + stack.pop()) & 0xFF)
        elif opcode == 0x40:  # ROL immediate
            value = stack.pop()
            count = code[pc]
            pc += 1
            stack.append(((value << count) | (value >> (8 - count))) & 0xFF)
        elif opcode == 0x51:  # DISCARD
            stack.pop()
        elif opcode == 0x60:  # STORE memory[immediate]
            memory[code[pc]] = stack.pop()
            pc += 1
        elif opcode == 0x61:  # LOAD memory[immediate]
            stack.append(memory[code[pc]])
            pc += 1
        elif opcode == 0x70:  # EMIT ASCII byte
            output.append(stack.pop())
        elif opcode == 0xFF:  # HALT
            return output.decode("ascii"), instructions
        else:
            raise ValueError(f"Unknown opcode 0x{opcode:02X} at offset 0x{pc-1:X}")

    raise ValueError("VM program ended without HALT")


def main() -> None:
    executable = Path(sys.argv[1] if len(sys.argv) > 1 else "SteelAndFeathers.exe")
    code = unpack_from_exe(executable)
    flag, instructions = run_vm(code)
    print(f"VM bytecode: {len(code)} bytes")
    print(f"Instructions executed: {instructions}")
    print(f"Flag: {flag}")


if __name__ == "__main__":
    main()
