#!/usr/bin/env python3
"""CTF solution for Ending.exe; Python 3, standard library only.

Usage:
    python3 Ending_solve.py Ending.exe
"""

import argparse
import base64
import gzip
from pathlib import Path


def unpack(filename: Path) -> bytes:
    """Reproduce Program.Unpack(): UTF-16 Base64 -> gzip -> ROR/XOR."""
    raw = filename.read_bytes()
    marker = "H4sIA".encode("utf-16le")
    start = raw.find(marker)
    if start < 0:
        raise ValueError("Cannot find the embedded Base64/GZip string")

    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    chars = []
    for offset in range(start, len(raw) - 1, 2):
        pair = raw[offset:offset + 2]
        if pair[1] != 0 or chr(pair[0]) not in alphabet:
            break
        chars.append(chr(pair[0]))

    compressed = base64.b64decode("".join(chars), validate=True)
    encoded = gzip.decompress(compressed)
    decoded = bytearray()
    for i, byte in enumerate(encoded):
        count = i % 5 + 1
        rotated = ((byte >> count) | (byte << (8 - count))) & 0xFF
        decoded.append(rotated ^ ((199 + 91 * i) & 0xFF))
    return bytes(decoded)


def run_vm(program: bytes) -> tuple[str, int]:
    """Execute the .NET challenge's 16-bit VM (all 15 supported opcodes)."""
    registers = [0] * 4                    # UInt16[4]
    memory = [0] * 128                    # UInt16[128]
    output = bytearray()                  # Byte[31]
    pc = 0

    def u8() -> int:
        nonlocal pc
        value = program[pc]
        pc += 1
        return value

    def u16() -> int:
        return u8() | (u8() << 8)

    def signed_byte() -> int:
        value = u8()
        return value - 256 if value >= 128 else value

    for steps in range(1, 100001):
        if pc < 0 or pc >= len(program):
            raise ValueError(f"VM PC out of bounds: 0x{pc:x}")
        opcode = u8()

        if opcode == 0xFF:                  # HALT
            return output.decode("ascii"), steps
        elif opcode == 0x10:                # MOVI reg, imm16
            r = u8()
            registers[r] = u16()
        elif opcode == 0x11:                # XORI reg, imm16
            r = u8()
            registers[r] ^= u16()
        elif opcode == 0x12:                # ADDI reg, imm16
            r = u8()
            registers[r] = (registers[r] + u16()) & 0xFFFF
        elif opcode == 0x13:                # ROL reg, immediate
            r, n = u8(), u8()
            value = registers[r]
            registers[r] = ((value << (n & 31)) |
                            (value >> ((16 - n) & 31))) & 0xFFFF
        elif opcode == 0x14:                # LOAD reg, memory[imm8]
            r, addr = u8(), u8()
            registers[r] = memory[addr]
        elif opcode == 0x15:                # STORE memory[imm8], reg
            addr, r = u8(), u8()
            memory[addr] = registers[r]
        elif opcode == 0x16:                # XOR reg, reg
            r, src = u8(), u8()
            registers[r] ^= registers[src]
        elif opcode == 0x17:                # ADD reg, reg
            r, src = u8(), u8()
            registers[r] = (registers[r] + registers[src]) & 0xFFFF
        elif opcode == 0x18:                # SUB reg, reg
            r, src = u8(), u8()
            registers[r] = (registers[r] - registers[src]) & 0xFFFF
        elif opcode == 0x19:                # NOT reg
            r = u8()
            registers[r] = (~registers[r]) & 0xFFFF
        elif opcode == 0x1A:                # LOOKUP reg, memory[reg]
            r, src = u8(), u8()
            registers[r] = memory[registers[src]]
        elif opcode == 0x30:                # JNZ reg, signed offset
            r, displacement = u8(), signed_byte()
            if registers[r] != 0:
                pc += displacement
        elif opcode == 0x31:                # JMP signed offset
            pc += signed_byte()
        elif opcode == 0x40:                # EMIT low byte of reg
            r = u8()
            output.append(registers[r] & 0xFF)
        else:
            raise ValueError(f"Unknown VM opcode 0x{opcode:02x} at 0x{pc-1:x}")

    raise ValueError("VM did not halt within 100,000 instructions")


def direct_recovery(program: bytes) -> str:
    """Independently verify output using the simplified decoded VM loop."""
    memory = [0] * 128
    pc = 0
    # Initial 124 MOVI/STORE pairs create four 31-word lookup tables.
    for _ in range(124):
        assert program[pc:pc + 2] == b"\x10\x02"
        word = program[pc + 2] | (program[pc + 3] << 8)
        assert program[pc + 4] == 0x15 and program[pc + 6] == 2
        memory[program[pc + 5]] = word
        pc += 7
    assert pc == 0x364

    def rol16(value: int, n: int) -> int:
        return ((value << n) | (value >> (16 - n))) & 0xFFFF

    state = 75
    chars = []
    for i in range(31):
        value = rol16(memory[i] ^ memory[64 + i], 5)
        value = ((value - memory[32 + i]) & 0xFFFF) ^ state
        chars.append(value & 0xFF)
        state = rol16(state ^ memory[96 + i], 3)
    return bytes(chars).decode("ascii")


def main() -> None:
    parser = argparse.ArgumentParser(description="Solve Ending.exe reverse challenge")
    parser.add_argument("exe", nargs="?", type=Path,
                        default=Path(__file__).with_name("Ending.exe"))
    args = parser.parse_args()

    bytecode = unpack(args.exe)
    flag, steps = run_vm(bytecode)
    assert direct_recovery(bytecode) == flag, "Independent verification failed"
    print(f"Decoded bytecode: {len(bytecode)} bytes")
    print(f"Executed VM instructions: {steps}")
    print(f"Recovered Flag: {flag}")
    print("Independent verification: OK")


if __name__ == "__main__":
    main()
