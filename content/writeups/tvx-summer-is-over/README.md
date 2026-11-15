# Summer Is Over — Reverse Engineering

## Evidence and verification

The supplied solve history lists this challenge as solved for 100 points on 13 November 2026. The supplied standalone Python reconstruction was reviewed and run without an executable; it reproduces both the intermediate string and final flag below. Statements about original file offsets, IL inspection, and binary checks are historical findings from the supplied writeup, not a new examination of the executable. No executable was included in this upload.

## Challenge at a glance

| Property | Finding |
|---|---|
| Challenge file | `SummerIsOver.exe` |
| Challenge type | Reverse engineering / Windows .NET executable |
| Platform | PE32 (x86), managed .NET, console application |
| Difficulty | Introductory to intermediate; byte-level obfuscation |
| Input prompt | `flag> ` |
| Correct response | `accepted` |
| Wrong response | `rejected` |

**Recovered flag:**

```text
TVX{4nd_S0_7h3_5un_Sh1n35}
```

**Verification:** The Python solver reconstructs the .NET Intermediate Language (IL) byte transformations and produces the flag above. The two embedded byte arrays were independently checked against the uploaded executable. The original executable was **not executed**, so the final check is based on static analysis rather than a Windows runtime test.

## 1. Identify the executable

Start with file identification instead of immediately running an unknown `.exe`:

```bash
file SummerIsOver.exe
sha256sum SummerIsOver.exe
strings -a SummerIsOver.exe | head -60
strings -el SummerIsOver.exe | head -40
```

The SHA-256 fingerprint of the uploaded executable is:

```text
58672e593c4c216d368750552faddd243a3c98c26e45ac5e70ad365bbe560e62
```

The `file` command identifies a **PE32 .NET/Mono assembly**. It contains a Common Language Runtime (CLR) header, and its import table calls `_CorExeMain` from `mscoree.dll`. The strings contain `Program`, `Ror`, `Reveal`, `Main`, `blob`, `schedule`, `System.Text.Encoding`, `GetString`, and `System.Console`.

This matters because .NET programs primarily contain **IL instructions**, not native x86 code for their actual logic. A decompiler like **ILSpy** or **dnSpyEx** is generally a better starting point than trying to understand the stub using `objdump -d`. You can also inspect the IL and raw data statically, as done here.

The visible user-facing strings are only:

```text
flag> 
rejected
accepted
```

The flag is therefore not present as a simple plaintext string in the executable.

## 2. Locate the important functions

The .NET metadata identifies these methods in the `Program` class:

| Function | Method token | Method RVA | Purpose |
|---|---|---|---|
| `Ror` | `0x06000001` | `0x2050` | Rotate one byte to the right |
| `Reveal` | `0x06000002` | `0x2074` | Construct the secret expected input |
| `Main` | `0x06000003` | `0x216C` | Ask for input and compare it |
| `.cctor` | `0x06000004` | `0x21E0` | Initialize the hidden byte arrays |

`Main` calls `Reveal()` before reading any input. It then compares the resulting string with the input using `System.String.op_Equality`.

An equivalent *readable reconstruction* of `Main` is:

```csharp
static void Main()
{
    string expected = Reveal();
    Console.Write("flag> ");
    string submitted = Console.ReadLine() ?? string.Empty;
    Console.WriteLine(submitted == expected ? "accepted" : "rejected");
}
```

This gives us a direct objective: **reconstruct `Reveal()`**. There is no need to brute-force 26 characters.

## 3. Recover the embedded data

The static constructor `.cctor` allocates two `byte[]` arrays and initializes both via `RuntimeHelpers.InitializeArray`.

The first field (`blob`) has **26 bytes**, stored at RVA `0x21B8`, file offset `0x3B8`:

```text
E9 93 92 AA 94 E4 F1 B4 46 8F 04 10 9D 54 A3 59
4E 39 8A 3E 77 39 63 FA 02 FB
```

The second field (`schedule`) has **8 bytes**, stored at RVA `0x21D8`, file offset `0x3D8`:

```text
6D 12 A9 40 F3 27 88 5B
```

Both arrays are initialized at process startup. The `schedule` array acts as a repeating XOR key. The `blob` array contains the encoded data. Here is a minimal extraction check:

```python
from pathlib import Path
exe = Path("SummerIsOver.exe").read_bytes()
blob = exe[0x3B8 : 0x3B8 + 26]
schedule = exe[0x3D8 : 0x3D8 + 8]
print(blob.hex(" "))
print(schedule.hex(" "))
```

The offsets are specific to this challenge build, not universal offsets for .NET executables.

## 4. Reverse the `Ror` helper

The IL for `Ror(value, count)` implements an 8-bit **rotate right**:

```csharp
static byte Ror(byte value, int count)
{
    return (byte)((value >> count) | (value << (8 - count)));
}
```

The original IL masks the shift operands with `31` (a consequence of .NET integer shift semantics). In `Reveal`, `count` is always from `1` to `5`, so those masks do not affect the result.

A byte rotation is different from a simple right shift: bits falling off the right edge reappear on the left.

```python
def ror8(value, count):
    return ((value >> count) | (value << (8 - count))) & 0xFF
```

**Important:** `& 0xFF` ensures the result stays within one byte. Python integers do not automatically overflow as .NET `byte` values do.

## 5. Reconstruct the first transformation loop

`Reveal()` creates a 26-byte temporary array and, for each `i` from `0` to `25`, performs these operations in order:

```python
j = (5 * i + 1) % 26           # Choose a scrambled source index
v = blob[j]                   # Read encoded byte
v ^= (51 + 11 * i) & 0xFF     # XOR with index-derived key
v ^= schedule[i % 8]          # XOR with repeating 8-byte schedule
v = (v - ((3*i*i + 25) & 0xFF)) & 0xFF  # Subtract index mask
v = ror8(v, (i % 5) + 1)     # Rotate right by 1 to 5 bits
stage1[i] = v ^ ((33 + 7*i) & 0xFF)     # Final XOR
```

Pay attention to the exact order. XOR, subtraction, and rotation cannot be arbitrarily rearranged.

### Worked example: `i = 0`

We can prove the first output byte by hand:

1. Index: `j = (5 * 0 + 1) % 26 = 1`.
2. Read: `blob[1] = 0x93`.
3. First XOR: `0x93 ^ 0x33 = 0xA0`.
4. Schedule XOR: `0xA0 ^ 0x6D = 0xCD`.
5. Subtract: `(0xCD - 0x19) & 0xFF = 0xB4`.
6. Rotate right one bit: `ROR8(0xB4, 1) = 0x5A`.
7. Final XOR: `0x5A ^ 0x21 = 0x7B`, which is `{` in ASCII.

The entire first loop yields:

```text
{XVT_dn47_0S5_3hS_nu3n1h}5
```

Notice that this **still is not the flag**. The braces and words are out of order, so another transformation must occur.

## 6. Reconstruct the second loop: reverse 4-byte blocks

The second loop allocates another byte array and reverses each group of up to four bytes. The final group has only two bytes, and these two are also reversed.

This is the important index calculation from the IL, simplified:

```python
base = (i // 4) * 4
block_len = min(4, 26 - base)
destination = base + block_len - 1 - (i - base)
output[destination] = stage1[i]
```

The output transformation becomes clear in this table:

| Block from stage 1 | After reversal |
|---|---|
| `{XVT` | `TVX{` |
| `_dn4` | `4nd_` |
| `7_0S` | `S0_7` |
| `5_3h` | `h3_5` |
| `S_nu` | `un_S` |
| `3n1h` | `h1n3` |
| `}5` | `5}` |

Joining the reversed blocks gives:

```text
TVX{4nd_S0_7h3_5un_Sh1n35}
```

The last instruction of `Reveal` calls `Encoding.ASCII.GetString(output)`, so the result is exactly the ASCII text above.

## 7. Complete standalone Python solver

The script below reproduces `Reveal()` without executing the Windows program:

```python
BLOB = bytes.fromhex(
    "e9 93 92 aa 94 e4 f1 b4 46 8f 04 10 9d 54 a3 59 "
    "4e 39 8a 3e 77 39 63 fa 02 fb"
)
SCHEDULE = bytes.fromhex("6d 12 a9 40 f3 27 88 5b")

def ror8(value, count):
    return ((value >> count) | (value << (8 - count))) & 0xFF

stage1 = bytearray(len(BLOB))
for i in range(len(BLOB)):
    j = (5 * i + 1) % len(BLOB)
    v = BLOB[j]
    v ^= (51 + 11 * i) & 0xFF
    v ^= SCHEDULE[i % len(SCHEDULE)]
    v = (v - ((3 * i * i + 25) & 0xFF)) & 0xFF
    v = ror8(v, (i % 5) + 1)
    stage1[i] = v ^ ((33 + 7 * i) & 0xFF)

output = bytearray(len(stage1))
for i, value in enumerate(stage1):
    base = (i // 4) * 4
    length = min(4, len(stage1) - base)
    dest = base + length - 1 - (i - base)
    output[dest] = value

print(output.decode("ascii"))
```

Save as `solve.py` and run:

```bash
python3 solve.py
```

Expected output:

```text
TVX{4nd_S0_7h3_5un_Sh1n35}
```

An accompanying file, `solve_summerisover.py`, contains the same algorithm plus an optional check against the original executable's extracted bytes:

```bash
python3 solve_summerisover.py SummerIsOver.exe
```

## 8. How to validate the result

**Static validation performed:**

- The executable's IL calls `Reveal`, then compares the user's input with the resulting string using `String.op_Equality`.
- The four relevant method bodies (`Ror`, `Reveal`, `Main`, `.cctor`) were inspected at their IL method locations.
- The `blob` and `schedule` byte strings were extracted from the executable at their actual file offsets, and the solver's copies matched.
- Running the standalone Python implementation yielded `TVX{4nd_S0_7h3_5un_Sh1n35}`.

**Optional runtime validation (not performed here):** If you want to test it in an isolated Windows VM, run `SummerIsOver.exe`, paste the recovered flag at the `flag>` prompt, and observe whether the program prints `accepted`. Do not run unknown challenge binaries on your everyday host without appropriate isolation.

## 9. Key lessons for the next REV challenge

1. **Recognize the binary type first.** A managed .NET executable is very different from a native Linux ELF or native Windows PE.
2. **Follow the data flow.** Here, `Main -> Reveal -> expected string -> equality test` tells you exactly where the answer comes from.
3. **Inspect static constructors.** `.cctor` often hides crucial encrypted arrays, keys, or runtime-initialized values.
4. **Translate IL into small expressions.** Track `i`, the selected array index, all intermediate arithmetic, and byte truncation.
5. **Watch for second-stage permutations.** The first readable-looking string was deliberately block-reversed.
6. **Validate each stage independently.** The known intermediate string and the first-byte calculation let you catch mistakes before finalizing.
7. **Do not assume the flag is in `strings`.** Obfuscated byte arrays can reconstruct strings only at runtime.

### Final answer

```text
TVX{4nd_S0_7h3_5un_Sh1n35}
```

*This write-up documents a static reverse-engineering solution and a faithful Python reconstruction, not a claim that the Windows executable was run.*


## Source files and solve evidence

[Original Markdown](README.original.md) · [SummerIsOver_Writeup.pdf](SummerIsOver_Writeup.pdf) · [solve_summerisover.py](solve_summerisover.py)

![TVX solve history listing Ending, Twist Me a Twister, Summer Is Over, and Steel and Feathers on 13 November 2026](/writeup-files/tvx-ending/evidence/reverse-solves.png)

The date shown in the casefile metadata is the recorded solve date; it does not establish the full event period. The original files are preserved unchanged.
