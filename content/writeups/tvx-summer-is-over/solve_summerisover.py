#!/usr/bin/env python3
"""Static solver for the SummerIsOver.exe reverse engineering challenge.

Pure Python 3; no external packages or Windows execution required.
The byte arrays were extracted from the .NET static constructor / FieldRVA data.
"""
from pathlib import Path
import sys

BLOB = bytes.fromhex(
    "e9 93 92 aa 94 e4 f1 b4 46 8f 04 10 9d 54 a3 59 "
    "4e 39 8a 3e 77 39 63 fa 02 fb"
)
SCHEDULE = bytes.fromhex("6d 12 a9 40 f3 27 88 5b")


def ror8(value: int, count: int) -> int:
    """Rotate a byte right by count bits, preserving 8-bit arithmetic."""
    count %= 8
    return ((value >> count) | (value << (8 - count))) & 0xFF


def reveal(blob: bytes = BLOB, schedule: bytes = SCHEDULE) -> tuple[bytes, str]:
    """Translate Program.Reveal() into Python, in the same step order."""
    if not blob or not schedule:
        raise ValueError("Both arrays must be non-empty")

    intermediate = bytearray(len(blob))
    for i in range(len(blob)):
        j = (5 * i + 1) % len(blob)
        value = blob[j]
        value ^= (51 + 11 * i) & 0xFF
        value ^= schedule[i % len(schedule)]
        value = (value - ((3 * i * i + 25) & 0xFF)) & 0xFF
        value = ror8(value, (i % 5) + 1)
        intermediate[i] = value ^ ((33 + 7 * i) & 0xFF)

    # The second loop reverses each 4-byte block. The last block
    # contains only 2 bytes (26 mod 4), so it reverses only those 2.
    output = bytearray(len(intermediate))
    for i, value in enumerate(intermediate):
        base = (i // 4) * 4
        block_len = min(4, len(intermediate) - base)
        destination = base + block_len - 1 - (i - base)
        output[destination] = value

    return bytes(intermediate), output.decode("ascii")


def verify_extracted_data(filename: str) -> None:
    """Optionally cross-check the hardcoded bytes against the challenge binary."""
    original = Path(filename).read_bytes()
    # Known file offsets in THIS specific PE file; not general-purpose PE parsing.
    assert original[0x3B8:0x3B8 + len(BLOB)] == BLOB, "blob mismatch"
    assert original[0x3D8:0x3D8 + len(SCHEDULE)] == SCHEDULE, "schedule mismatch"
    print("Embedded arrays verified against", filename)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        verify_extracted_data(sys.argv[1])
    scrambled, flag = reveal()
    print("Intermediate (before 4-byte reversal):", scrambled.decode("ascii"))
    print("Flag:", flag)
