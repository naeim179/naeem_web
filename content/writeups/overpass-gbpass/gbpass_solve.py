#!/usr/bin/env python3
"""GBPASS Game Boy ROM: make a separate copy that jumps to its win screen.

Usage: Put this script beside the original gbpass.gb, then run:
    python3 gbpass_unlock.py
    mgba-qt gbpass_unlocked.gb

This is a reverse-engineering bypass, NOT a recovered controller input.
"""
from pathlib import Path

src = Path(__file__).resolve().with_name('gbpass.gb')
out = src.with_name('gbpass_unlocked.gb')

if not src.is_file():
    raise SystemExit(f'Missing file: {src}\nPut this script beside gbpass.gb')
rom = bytearray(src.read_bytes())
if len(rom) != 0x8000 or rom[0x134:0x13A] != b'GBPASS':
    raise SystemExit('Unexpected ROM. Expected 32 KB GBPASS Game Boy ROM. Not patching.')

# At $019C, the input loop calls its VBlank wait function ($0263):
#   019C: CD 63 02    CALL $0263
# After successful 16-press verification, $01D5 jumps to $0218:
#   01D5: 28 41       JR Z, $0218
# Change the first instruction of the input loop into an unconditional
# jump to that same victory branch. Initialization and screen setup have
# already run at this point.
if rom[0x019C:0x019F] != bytes.fromhex('CD 63 02'):
    raise SystemExit('Input loop at $019C does not match expected bytes; refusing to patch.')
if rom[0x01D5:0x01D7] != bytes.fromhex('28 41'):
    raise SystemExit('Success branch at $01D5 does not match expected bytes; refusing to patch.')

rom[0x019C:0x019F] = bytes.fromhex('C3 18 02')  # JP $0218

# Recompute Game Boy ROM global checksum (header bytes $014E-$014F).
checksum = sum(b for i, b in enumerate(rom) if i not in (0x014E, 0x014F)) & 0xFFFF
rom[0x014E:0x0150] = checksum.to_bytes(2, 'big')
out.write_bytes(rom)

# GBPASS encodes screen letters as tile IDs (A=1, B=2, ...).
def decode_tile(value):
    if 1 <= value <= 26:
        return chr(ord('A') + value - 1)
    if 0x1B <= value <= 0x24:
        return str(value - 0x1B)
    if value == 0x27:
        return '_'
    return f'<{value:02X}>'

print(f'Patched ROM created: {out}')
print('Original at $019C: CD 63 02   (CALL $0263)')
print('Patched  at $019C: C3 18 02   (JP $0218)')
print('Win-screen text from ROM:', ''.join(map(decode_tile, rom[0x03FE:0x0410])))
print(f'Now run: mgba-qt "{out}"')
