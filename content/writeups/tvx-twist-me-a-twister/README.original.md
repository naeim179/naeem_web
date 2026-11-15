# TwistMeATwister — Reverse Engineering Writeup

**Category:** Reverse Engineering  
**Challenge:** TwistMeATwister.exe  
**Platform:** Windows .NET / Mono (PE32, Intel 80386, console application)  
**Tools:** `file`, `monodis`, `grep`, Python 3, optional Mono runtime  
**Technique:** Static .NET IL analysis, index permutation, rotate-right, and XOR  
**SHA-256:** `3b624579593b6284ce6e9c64fda59ea608a34b577df028d66b47f325fa54a966`

## 1. Objective

Recover the correct input accepted by the .NET console executable. Instead of guessing inputs or brute forcing, we will reconstruct the flag-generation algorithm from the executable's intermediate language (IL).

## 2. Initial reconnaissance

```bash
file TwistMeATwister.exe
```

Output:

```text
TwistMeATwister.exe: PE32 executable for MS Windows 4.00 (console), Intel i386 Mono/.Net assembly, 3 sections
```

The file is a managed .NET assembly. That is useful because .NET IL can often be disassembled into higher-level operations with `monodis`, rather than starting directly from x86 machine code.

On Kali, install the tool if needed:

```bash
sudo apt update
sudo apt install mono-utils
```

> On the Kali setup used here, the package manager selected `mono-devel` instead, which supplied `monodis`.

Disassemble the executable into a text file:

```bash
monodis TwistMeATwister.exe > twist.il
grep -nE 'Main|Reveal|\.method' twist.il
```

The class `Program` includes four methods of interest:

- `Ror(byte value, int count)`
- `Reveal()`
- `Main()`
- `.cctor()` (the static class initializer)

## 3. Understanding `Main()`

Relevant IL:

```il
IL_0001: call string class Program::Reveal()
IL_0006: stloc.0
IL_0007: ldstr "flag> "
IL_000c: call void class [mscorlib]System.Console::Write(string)
IL_0012: call string class [mscorlib]System.Console::ReadLine()
IL_0023: call bool string::op_Equality(string, string)
IL_002a: ldstr "rejected"
IL_0031: ldstr "accepted"
```

`Main()` calls `Reveal()` to generate a secret string, asks the user to enter a flag, and compares the entered string against the generated secret using exact string equality. The comparison chooses either `accepted` or `rejected`.

Therefore, the goal is to understand and reproduce `Reveal()`.

## 4. Finding the encoded bytes

The static constructor `.cctor()` creates the byte array used by `Reveal()`:

```il
IL_0000: ldc.i4.s 0x28
IL_0002: newarr [mscorlib]System.Byte
...
IL_000d: call void class [mscorlib]System.Runtime.CompilerServices.RuntimeHelpers::InitializeArray(...)
IL_0012: stsfld unsigned int8[] Program::data
```

`0x28` is decimal **40**, so the array contains 40 bytes. The disassembly shows its data at the end:

```text
.data D_00002130 = bytearray (
 A2 D8 09 C0 4A B4 38 47 8F D5 E7 16 E6 7F BC DB
 02 55 98 ED 4C E5 E0 B6 88 66 B0 A0 43 40 EB 2B
 46 DF 5E BD FA CD 5B 12) // size: 40
```

These are encoded bytes, not plaintext ASCII.

## 5. Recovering the transformation

The `Reveal()` method loops over an output array of the same length as `data`. Reading the IL produces this equivalent pseudocode:

```python
for i in range(len(data)):
    j = (i * 7 + 3) % len(data)
    rotated = ROR8(data[j], (j % 5) + 1)
    key = (0x37 + j * 0x0B) & 0xFF
    output[i] = rotated ^ key
return output.decode('ascii')
```

It consists of three important operations:

**A. Index permutation:**

```python
j = (i * 7 + 3) % 40
```

Instead of reading the bytes sequentially, the program selects a new source index `j` for every output index `i`. Since 7 is coprime with 40, this visits all 40 positions exactly once.

**B. Rotate right (ROR):**

```python
rotation = (j % 5) + 1
rotated = ROR8(data[j], rotation)
```

A rotate-right moves bits that leave the right edge back to the left. Unlike a logical shift, no bits are discarded. The rotation count is always between 1 and 5.

**C. XOR with a position-dependent key:**

```python
key = (0x37 + j * 0x0B) & 0xFF
output_byte = rotated ^ key
```

The `& 0xFF` makes the key one byte wide, matching the IL's `conv.u1` instruction. XOR is applied after rotation.

## 6. Manual calculation: the first flag character

For the first output byte, `i = 0`:

```text
j = (0 * 7 + 3) % 40 = 3
data[3] = 0xC0
rotation = (3 % 5) + 1 = 4
ROR8(0xC0, 4) = 0x0C
key = (0x37 + 3 * 0x0B) & 0xFF = 0x58
output[0] = 0x0C XOR 0x58 = 0x54 = 'T'
```

Thus the first character is `T`. We can apply the same algorithm to all 40 bytes programmatically.

## 7. Full Python solver

Save as `solve.py`:

```python
data = bytes.fromhex("""
A2 D8 09 C0 4A B4 38 47 8F D5 E7 16 E6 7F BC DB
02 55 98 ED 4C E5 E0 B6 88 66 B0 A0 43 40 EB 2B
46 DF 5E BD FA CD 5B 12
""")


def ror8(value, count):
    return ((value >> count) | (value << (8 - count))) & 0xFF


result = bytearray(len(data))

for i in range(len(data)):
    j = (i * 7 + 3) % len(data)
    rotated = ror8(data[j], (j % 5) + 1)
    key = (0x37 + j * 0x0B) & 0xFF
    result[i] = rotated ^ key

print("Recovered Flag:", result.decode("ascii"))
```

Run it:

```bash
python3 solve.py
```

Solver output:

```text
Recovered Flag: TVX{Fl4ggy_fl4g_fl4g_tw15ty_tw15t_tw15t}
```

The 40-byte result is ASCII text formatted like a CTF flag.

## 8. Validate with the original executable

If you are running the challenge in an isolated CTF environment with Mono installed, submit the recovered input to the original program:

```bash
printf '%s\n' 'TVX{Fl4ggy_fl4g_fl4g_tw15ty_tw15t_tw15t}' | mono TwistMeATwister.exe
```

Expected output:

```text
flag> accepted
```

**Verification status:** The Python solver's output has been independently reproduced from the IL algorithm. Execution of the original `.exe` has *not* been observed in this writeup; the `accepted` line is the expected result to confirm in the challenge environment.

## 9. Flag

```text
TVX{Fl4ggy_fl4g_fl4g_tw15ty_tw15t_tw15t}
```

## 10. Key lessons

1. Use `file` before choosing a reverse-engineering workflow. A managed .NET assembly can be analyzed effectively with `monodis`.
2. Work from the entry point (`Main`) to find the function responsible for validating or generating the required input.
3. Look for data arrays in static initializers such as `.cctor()`.
4. Translate IL instructions (`mul`, `add`, `rem`, `call`, `xor`, `conv.u1`) into clear pseudocode.
5. Understand bit rotations and byte-sized arithmetic before implementing a decoder.
6. Confirm a calculated flag against the challenge program when possible. Static reconstruction and runtime validation are distinct steps.

**Conclusion:** This challenge is solved through deterministic static analysis of the flag-recovery routine, using an index permutation followed by a byte rotate-right and XOR. No brute force is necessary.
