# Ending.exe — Reverse Engineering CTF Write-up

**Category:** Reverse Engineering (Windows / .NET / custom VM)  
**Target:** `Ending.exe`  
**Size:** 10,752 bytes  
**SHA-256:** `16686a047bb948a327139cb1d80fc2a62b8e1f85b551645a4b34073d4fa7f3e2`  
**Result:** Solved — flag recovered by static analysis and Python emulation.

## Flag

```text
TVX{S0me_1nt2r2st1ng_t2xt_h2r2}
```

## 1. Initial reconnaissance

Start with a few static commands on Kali Linux:

```bash
file Ending.exe
sha256sum Ending.exe
strings -a Ending.exe | head -50
strings -e l Ending.exe | head -10
```

The `file` output identifies a **PE32 Windows console executable containing a .NET assembly**. Its .NET metadata references `mscorlib`, `System.IO.Compression.GZipStream`, and `System.Convert.FromBase64String`. The UTF-16LE strings show a long `H4sIA...` Base64 value plus the user-facing strings `flag> `, `rejected`, and `accepted`.

`H4sIA` is a common Base64 prefix for a GZip stream, so the long string is a strong lead. However, simply extracting and decompressing it is not sufficient.

## 2. Understand the .NET methods

Examination of the .NET metadata and Common Intermediate Language (CIL/IL) reveals five methods in class `Program`:

| Method | Role |
|---|---|
| `Ror` | Rotate an 8-bit value right. |
| `Unpack` | Decode Base64/GZip and decrypt the embedded bytecode. |
| `ReadWord` | Read a little-endian 16-bit integer from VM bytecode and advance the instruction pointer by two. |
| `Run` | Interpret the decrypted bytecode in a small custom virtual machine; return the resulting ASCII string. |
| `Main` | Obtain the hidden string from `Run`, read the user's input, and compare the two strings. |

The crucial logic in `Main` is equivalent to:

```csharp
static void Main()
{
    string correct = Run();
    Console.Write("flag> ");
    string input = Console.ReadLine() ?? string.Empty;
    Console.WriteLine(input == correct ? "accepted" : "rejected");
}
```

**Key insight:** The program is not validating the flag with a one-way hash. It **constructs the correct input internally**. If we emulate `Run()`, we obtain the entire flag.

## 3. Unpack the embedded bytecode

`Unpack()` works in three stages:

1. Read the long Base64 string embedded as a .NET user string.
2. Convert Base64 to bytes, and GZip-decompress them.
3. Transform each byte with an 8-bit right rotation followed by XOR.

The per-byte transform, translated from IL, is:

```python
def ror8(x, count):
    return ((x >> count) | (x << (8 - count))) & 0xff

program = bytes(
    ror8(byte, (i % 5) + 1) ^ ((199 + 91 * i) & 0xff)
    for i, byte in enumerate(gzip_decompressed)
)
```

The values `199` (`0xC7`) and `91` (`0x5B`) come from the `Unpack` method's IL and are not guesses.

For this file:

- Base64 text: **1,308 characters**.
- Base64-decoded GZip stream: **981 bytes**.
- Decompressed-and-deobfuscated VM program: **958 bytes** (`0x3BE`).
- Initial decoded bytes:

```hex
10 02 a3 60 15 00 02 10 02 b5 e0 15 01 02 10 02
9a b8 15 02 02 10 02 4e 5a 15 03 02 ...
```

Those bytes are not conventional x86 instructions. They belong to the challenge's own virtual machine.

## 4. Reverse-engineer the custom VM

`Run()` allocates four 16-bit registers, 128 words of VM memory, and 31 bytes for output:

```text
R[0..3]     = UInt16 registers
M[0..127]   = UInt16 memory
output      = Byte[31]
pc          = bytecode instruction pointer
```

Each VM instruction is read from the decoded byte array. The following table summarizes **all defined opcodes** in `Run()`:

| Opcode | Meaning | Description |
|---|---|---|
| `0x10` | `MOVI r, imm16` | Assign a 16-bit little-endian immediate to `R[r]`. |
| `0x11` | `XORI r, imm16` | XOR a register with an immediate. |
| `0x12` | `ADDI r, imm16` | Add an immediate, wrapping to 16 bits. |
| `0x13` | `ROL r, n` | Rotate a 16-bit register left by the encoded count (using the shift logic in IL). |
| `0x14` | `LOAD r, addr` | Load `R[r] = M[addr]`. |
| `0x15` | `STORE addr, r` | Store `M[addr] = R[r]`. |
| `0x16` | `XOR r, s` | `R[r] ^= R[s]`. |
| `0x17` | `ADD r, s` | `R[r] += R[s]`, wrapping to 16 bits. |
| `0x18` | `SUB r, s` | `R[r] -= R[s]`, wrapping to 16 bits. |
| `0x19` | `NOT r` | Bitwise NOT of a 16-bit register. |
| `0x1A` | `LOOKUP r, s` | `R[r] = M[R[s]]`. |
| `0x30` | `JNZ r, rel8` | Branch by a signed byte offset if `R[r] != 0`. |
| `0x31` | `JMP rel8` | Unconditional relative branch by a signed byte offset. |
| `0x40` | `EMIT r` | Append `R[r] & 0xFF` to the output. |
| `0xFF` | `HALT` | Stop interpreting and return ASCII-decoded output. |

Branch displacements are relative to the position **after** the instruction's operands have been consumed. This matters when translating the interpreter to Python.

### Initial instruction sequence

The first decoded VM instructions are:

```text
0x000: MOVI  R2, 0x60A3
0x004: STORE M[0], R2
0x007: MOVI  R2, 0xE0B5
0x00B: STORE M[1], R2
0x00E: MOVI  R2, 0xB89A
0x012: STORE M[2], R2
...
```

There are **124 `MOVI` / `STORE` pairs** in the initialization sequence, filling four disjoint lookup-table regions: `M[0..30]`, `M[32..62]`, `M[64..94]`, and `M[96..126]`. The remaining decoded instructions combine these tables to synthesize the flag.

## 5. Simplify the VM's flag-generation loop

The initialization ends at decoded bytecode address `0x364`. The key loop begins at `0x37A` and emits a character at `0x39D`.

Register `R0` is used as the character index (`0` to `30`); register `R1` starts at decimal `75` (`0x4B`) and evolves between characters. With the VM instructions translated into ordinary Python, the entire core algorithm simplifies to:

```python
def rol16(x, n):
    return ((x << n) | (x >> (16 - n))) & 0xffff

state = 75
flag_bytes = []
for i in range(31):
    x = rol16(memory[i] ^ memory[64 + i], 5)
    x = (x - memory[32 + i]) & 0xffff
    x ^= state
    flag_bytes.append(x & 0xff)
    state = rol16(state ^ memory[96 + i], 3)

flag = bytes(flag_bytes).decode('ascii')
```

This reproduces the hidden string directly, **without having to type or guess any part of the flag**.

### Verify the first character by hand

The first table values are:

```text
M[ 0] = 0x60A3
M[32] = 0x002D
M[64] = 0x00A1
M[96] = 0x0071
state = 0x004B
```

Calculation:

```text
x = ROL16(0x60A3 XOR 0x00A1, 5) = 0x004C
x = (0x004C - 0x002D) & 0xFFFF = 0x001F
x = 0x001F XOR 0x004B = 0x0054
output byte = 0x54 = 'T'
```

Running this for the full 31 iterations produces:

```text
TVX{S0me_1nt2r2st1ng_t2xt_h2r2}
```

## 6. Reproduce the solve on Kali

Place `Ending.exe` and the accompanying `Ending_solve.py` file in the same directory, then run:

```bash
python3 Ending_solve.py Ending.exe
```

Expected output:

```text
Decoded bytecode: 958 bytes
Executed VM instructions: 906
Recovered Flag: TVX{S0me_1nt2r2st1ng_t2xt_h2r2}
Independent verification: OK
```

The solve script requires **Python 3 and only standard-library modules**; no `wine`, `.NET`, `mono`, `dnSpy`, or third-party Python packages are necessary. It includes **both** a complete Python interpreter for the VM and the simplified lookup-table solution, and it checks that the two independently produce the same flag.

## 7. Why this technique works

This challenge has several layers of obfuscation:

- **Encoding:** The real program is hidden in a .NET UTF-16 string as Base64.
- **Compression:** The embedded bytes use GZip.
- **Byte transformation:** A position-dependent 8-bit rotate/XOR prevents the decompressed data from looking immediately readable.
- **Virtualization:** Instead of directly storing the correct string, the program reconstructs it using a private instruction set.
- **Stateful generation:** The flag characters depend on four tables plus an evolving register state.

None of these layers require brute force. Once the decoding transform and the VM are understood, the generated string is fully deterministic.

## Final answer

```text
TVX{S0me_1nt2r2st1ng_t2xt_h2r2}
```

**Takeaway:** For .NET reverse-engineering challenges, first inspect the main input comparison and trace where the expected value is constructed. If you find a custom VM, recovering or emulating its small instruction set is often much easier than solving the entire protected program symbolically.
