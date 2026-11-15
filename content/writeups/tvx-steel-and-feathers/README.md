# SteelAndFeathers — Reverse Engineering CTF Writeup

## Evidence and verification

The supplied solve history lists this challenge as solved for 100 points on 13 November 2026. The original executable and compressed payload are absent, so the complete 1,288-byte recovery and 781-instruction result cannot be rerun from this upload. The first-character bytecode example was checked independently; remaining file metadata and full-run output are retained as reported findings.

**Category:** Reverse Engineering  
**Target:** `SteelAndFeathers.exe`  
**Platform:** Windows / .NET (PE32, Intel i386)  
**Tools:** `file`, `strings`, ILSpy (`ilspycmd`), Python 3

## Flag

```text
TVX{Congratulations_You_Know_Some_ball}
```

## 1. Initial reconnaissance

The first step was to identify the executable:

```bash
file SteelAndFeathers.exe
```

Output:

```text
SteelAndFeathers.exe: PE32 executable for MS Windows 4.00 (console), Intel i386 Mono/.Net assembly, 3 sections
```

The program is a 32-bit Windows .NET executable. Rather than starting with native-assembly analysis in Ghidra, using a .NET decompiler is a more direct way to recover its C# logic.

A quick scan for UTF-16 little-endian strings revealed a long Base64-looking string beginning with `H4sIA`, as well as `flag>`, `accepted`, and `rejected`:

```bash
strings -el SteelAndFeathers.exe | head -60
```

`H4sIA` is a common prefix for GZIP data encoded as Base64; this suggested that the executable contained compressed data.

## 2. Decompile the .NET assembly

We used ILSpy to reconstruct readable C#:

```bash
mkdir -p steel_src
ilspycmd SteelAndFeathers.exe -o steel_src
```

The result was `steel_src/SteelAndFeathers.decompiled.cs`. To locate important functions:

```bash
grep -n -E 'Main\(|Run\(|Unpack\(|Ror\(|ReadLine|accepted|rejected' \
  steel_src/SteelAndFeathers.decompiled.cs | cut -c1-180
```

The four functions of interest were `Main()`, `Run()`, `Unpack()`, and `Ror()`.

### Main(): where the check happens

The important logic was:

```csharp
string expected = Run();
string supplied = Console.ReadLine() ?? string.Empty;
Console.WriteLine((supplied == expected) ? "accepted" : "rejected");
```

This tells us that there is no user-input transformation to reverse: **`Run()` generates the expected flag**, and `Main()` merely compares the typed input against it. Therefore, recovering `Run()`'s output is sufficient to solve the challenge.

## 3. Unpack(): decode and deobfuscate the hidden program

`Run()` first calls `Unpack()`:

```csharp
byte[] array = Unpack();
```

The `Unpack()` function performs three operations:

1. `Convert.FromBase64String(...)` — Base64 decode the embedded string.
2. `GZipStream(..., CompressionMode.Decompress)` — decompress the GZIP bytes.
3. Transform each byte with an 8-bit rotate-right operation and an XOR key dependent on its index.

The final transformation is:

```csharp
array[i] = (byte)(
    Ror(array[i], i % 7 + 1)
    ^ ((uint)(23 + i * 41) & 0xFFu)
);
```

The rotate helper is equivalent to:

```python
def ror8(value, count):
    return ((value >> count) | (value << (8 - count))) & 0xFF
```

In Python, the whole last step becomes:

```python
bytecode = bytes(
    ror8(b, i % 7 + 1) ^ ((23 + i * 41) & 0xFF)
    for i, b in enumerate(gzip.decompress(base64.b64decode(encoded)))
)
```

This recovered **1,288 bytes** of custom virtual-machine bytecode. The first 32 bytes were:

```text
10 41 10 41 20 51 10 15 61 fa 10 b1 20 20 40 05
10 23 30 60 00 61 00 70 61 fa 10 5d 20 40 01 60
```

The result is not ordinary x86 machine code, and it is not the flag as plaintext. It is a program for a small, custom VM embedded in `Run()`.

## 4. Run(): reverse-engineering the virtual machine

The `Run()` function initializes:

```csharp
byte[] memory = new byte[256];
memory[250] = 45; // 0x2D ('-')
Stack<int> stack = new Stack<int>();
List<byte> output = new List<byte>();
```

It then reads opcodes one at a time and processes them in a `switch` statement. We mapped the opcodes as follows:

| Opcode | Name | Meaning |
|:------:|------|---------|
| `0x10` | PUSH | Read the next byte and push it onto the stack. |
| `0x20` | XOR | Pop two values, XOR them, push the 8-bit result. |
| `0x30` | ADD | Pop two values, add them modulo 256, push the result. |
| `0x40` | ROL | Pop a value, rotate it left by the next byte, push the result. |
| `0x51` | DROP | Pop and discard one value. |
| `0x60` | STORE | Pop a value and store it at `memory[next_byte]`. |
| `0x61` | LOAD | Push the value at `memory[next_byte]`. |
| `0x70` | OUTPUT | Pop a byte and append it to the output string. |
| `0xFF` | HALT | Stop the VM and return the ASCII output string. |

The main trick is **virtualization-based obfuscation**: the meaningful flag-building operations are expressed in an invented instruction set, not directly as C# string construction.

### Manually derive the first character

The first six bytecode bytes are:

```text
10 41 10 41 20 51
```

This sequence pushes `0x41` twice, XORs them (giving `0x00`), then discards the result. It has no effect on the generated string and acts as junk/dead instructions.

The next sequence is:

```text
10 15 61 fa 10 b1 20 20 40 05 10 23 30 60 00 61 00 70
```

Starting from `memory[0xFA] = 0x2D`:

1. `PUSH 0x15`, `LOAD 0xFA`, `PUSH 0xB1` — the stack is `[0x15, 0x2D, 0xB1]`.
2. `XOR` — `0x2D ^ 0xB1 = 0x9C`.
3. `XOR` — `0x15 ^ 0x9C = 0x89`.
4. `ROL 5` — rotating `0x89` left by five bits yields `0x31`.
5. `PUSH 0x23`, `ADD` — `0x31 + 0x23 = 0x54`.
6. `STORE 0x00`, `LOAD 0x00`, `OUTPUT` — output `0x54`, which is ASCII **`T`**.

The remaining bytecode repeats the same broad process, using stack operations and memory to generate characters one at a time.

## 5. Automate the recovery in Python

The following solver reads the Base64 string directly from the executable's UTF-16LE data, decodes and decompresses it, undoes the byte obfuscation, and emulates every VM opcode. **It never runs the Windows executable.**

```python
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
```

Run it from the directory containing both the script and executable:

```bash
python3 steel_solver.py SteelAndFeathers.exe
```

Reported output from the original analysis (not rerun for this publication):

```text
VM bytecode: 1288 bytes
Instructions executed: 781
Flag: TVX{Congratulations_You_Know_Some_ball}
```

This matches the logic in `Main()`: typing the exact text returned by `Run()` causes the `accepted` branch.

## 6. Lessons learned

- **Identify the file format first.** A .NET executable is usually easier to inspect with ILSpy than with a native x86 decompiler.
- **Trace the comparison backward.** The flag is not explicitly present in `Main()`; it is constructed in `Run()`.
- **Look for layered encoding.** Here the hidden bytecode went through Base64 decoding, GZIP decompression, ROR, and XOR before it could be interpreted.
- **Recognize a custom VM.** A stack, program counter, opcode switch, and memory array are strong indicators of a bytecode interpreter.
- **Distinguish noise from essential work.** `PUSH 0x41; PUSH 0x41; XOR; DROP` is a harmless distraction.
- **Write a small emulator.** Translating the VM's few opcodes into Python is more reliable than hand-decoding a 1,288-byte program.
- **Validate against the original logic.** The recovered ASCII string is exactly what `Main()` compares to the user's input.

## Final flag

```text
TVX{Congratulations_You_Know_Some_ball}
```


## Source files and solve evidence

[Original Markdown](README.original.md) · [steel_solver.py](steel_solver.py)

![TVX solve history listing Ending, Twist Me a Twister, Summer Is Over, and Steel and Feathers on 13 November 2026](/writeup-files/tvx-ending/evidence/reverse-solves.png)

The date shown in the casefile metadata is the recorded solve date; it does not establish the full event period. The original files are preserved unchanged.
