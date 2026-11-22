# Shibboleth

## Publication verification

The supplied ELF is 1,080 bytes and its SHA-256 matches the source report. Reading it as data independently reproduced all 20 VM comparisons, the recovered key, and the decrypted reply. The binary was not executed during publication; the local network run and challenge-platform acceptance below are the author’s reported observations.

| Field | Detail |
| --- | --- |
| Event | OVERPASS 2026 — Qualifiers |
| Category | Reverse Engineering |
| Reported points | 304 |
| Target | `shibboleth` — static, stripped x86-64 ELF |
| Analysis date | 20 November 2026 |

## Executive summary

The binary opens a TCP socket to 127.0.0.1:4455, sends HELO\n, and waits for an AUTH request. It requires at least 25 bytes: the ASCII prefix AUTH followed by a 20-byte secret. Instead of directly comparing that secret, it interprets a compact instruction stream to transform and validate each byte.

Reversing the per-byte transformation reveals the exact 20-byte input. On the successful path, the program XORs that input with 20 encrypted bytes stored in .data and transmits the decoded text. A local loopback test reproduced the expected response, and the extracted flag was accepted by the CTF platform.

| **Accepted flag:** n0t_pr0n0unc3d_r1ght |
|-----------------------------------------|

<table>
<colgroup>
<col style="width: 32%" />
<col style="width: 67%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Recovered 20-byte secret</strong></th>
<th>$p34k_fr13nd_&amp;_3nt3r</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Expected reply</strong></td>
<td>n0t_pr0n0unc3d_r1ght\n</td>
</tr>
<tr class="even">
<td><strong>SHA-256</strong></td>
<td>661b8e1da53a7a4b378bad3c28ac8ad<br />
da7e73453e817d1d04e2a90f766d26d67</td>
</tr>
</tbody>
</table>

Scope: This write-up uses the provided terminal captures, disassembly, and section dump. The solver was also checked against the supplied .data bytes. Dynamic behavior was confirmed by the successful local test shown later in the report.

## 1 Initial triage and reasoning

The first question was not “Which password should I guess?” but “What kind of executable is this, and where does it keep its validation logic?” Static triage gave the minimum information needed to choose an analysis method.


```text
$ file shibboleth
shibboleth: ELF 64-bit LSB executable, x86-64, statically linked, stripped
$ ls -lah shibboleth
-rwxrwx--- 1 naim naim 1.1K Nov 20 02:39 shibboleth
$ strings -a -t x ./shibboleth
224 HELO
229 AUTH s0_cl0s3
237 J@Gk
2da .shstrtab
2e4 .text
2ea .data
2f0 .bss
```


**Interpretation.** This is an unusually small, non-dynamically linked Linux executable. It was likely built close to the syscall interface; no libc call graph is needed to explain the observed behavior. Stripping hides function names, not machine instructions. The protocol-looking strings HELO and AUTH suggest network-oriented behavior, but the string s0_cl0s3 should not be assumed to be the required secret.


```text
$ readelf -h ./shibboleth
Entry point address: 0x400080
Number of program headers: 1
$ readelf -l ./shibboleth
LOAD Offset 0x80 VirtAddr 0x400080 FileSiz 0x259
MemSiz 0x368 Flags RWE Align 0x10
```


The RWE mapping allows reading, writing, and executing in the same load segment. This makes writable embedded data straightforward; it does not by itself prove self-modifying code. Here, the important clue is the small direct-syscall routine and adjacent embedded data.

### Section map and key addresses

| **Address / offset** | **Purpose**                                         |
|----------------------|-----------------------------------------------------|
| 0x400080 / 0x080     | ELF entry point; first executable instruction       |
| 0x400214 / 0x214     | sockaddr_in for 127.0.0.1:4455                      |
| 0x400224 / 0x224     | HELO\n bytes sent to peer                           |
| 0x400229 / 0x229     | AUTH prefix; also beginning of visible decoy text   |
| 0x40022E / 0x22E     | 9-byte failure response: s0_cl0s3\n                 |
| 0x400237 / 0x237     | 20 encrypted success-response bytes                 |
| 0x40024C / 0x24C     | Start of 141-byte VM bytecode stream                |
| 0x4002DC             | Saved socket file descriptor (.bss)                 |
| 0x4002E4             | Receive buffer (.bss); candidate begins at 0x4002E9 |

For this ELF load layout, the relevant virtual addresses map to file offsets by subtracting 0x400000. This simple mapping makes an offline Python solver possible.

## 2 Reconstructing the network protocol

The start of the entry-point assembly is a sequence of Linux x86-64 system calls. The syscall number is supplied in RAX, while the first three arguments are passed in RDI, RSI, and RDX.


```text
0x400080 mov eax,0x29 ; sys_socket (41)
0x400085 mov edi,0x2 ; AF_INET
0x40008A mov esi,0x1 ; SOCK_STREAM
0x40008F xor rdx,rdx ; protocol 0
0x400092 syscall
...
0x4000A7 mov eax,0x2a ; sys_connect (42)
0x4000AC lea rsi,[rip+...] ; sockaddr_in at 0x400214
0x4000B3 mov edx,0x10 ; sockaddr length: 16
0x4000B8 syscall
```


The sockaddr_in begins with the bytes 02 00 11 67 7f 00 00 01. In little-endian memory, 02 00 is AF_INET; the port is network-order 0x1167 (= 4455); 7f 00 00 01 is 127.0.0.1. The target therefore connects to a listener on its own loopback interface—not to an outside host.


```text
0x4000C3 mov eax,1 ; sys_write
0x4000CF lea rsi,[0x400224] ; "HELO\n"
0x4000D6 mov edx,5
0x4000DB syscall
0x4000DD mov eax,0 ; sys_read
0x4000E9 lea rsi,[0x4002E4] ; receive buffer
0x4000F0 mov edx,0x100 ; read up to 256 bytes
0x4000F5 syscall
0x400103 cmp r15,0x19 ; require at least 25 bytes
0x400107 jl 0x4001E1 ; else failure
```


The next loop compares the first five input bytes against the literal AUTH (including one trailing space). A successful prefix leaves RSI pointing at offset +5, which is saved in R14 as the start of the 20-byte candidate.


```text
0x400114 lea rdi,[0x400229] ; compare with "AUTH "
0x40011B mov ecx,5
0x400120 mov al,[rsi]
0x400122 cmp al,[rdi]
0x400124 jne 0x4001E1
...
0x400143 mov r14,rsi ; candidate begins at byte 6
```


| **Protocol layout:** HELO\n (binary to server) → AUTH \<20-byte secret\> (server to binary) → decrypted response |
|------------------------------------------------------------------------------------------------------------------|

## 3 Identifying the custom bytecode VM

After checking the prefix, the program does not call strcmp on the secret. Instead, it sets R12 to 0x40024C (the instruction pointer for embedded bytecode) and R13 to 0x4002D9 (the bytecode end boundary). A dispatch loop reads one opcode at a time and branches based on opcodes 0x01–0x06, terminating at 0xFF.


```text
0x400135 lea r12,[0x40024C] ; bytecode pointer
0x40013C lea r13,[0x4002D9] ; bytecode end
0x400143 mov r14,rsi ; current candidate byte
0x400146 xor eax,eax ; clear accumulator
0x40014D movzx rbx,byte [r12] ; fetch opcode
0x400152 inc r12
0x400155 cmp bl,0xff ; 0xFF marks finish
0x40015A cmp bl,0x01 ; dispatch opcodes ...
```


| **Opcode** | **Instruction** | **Relevant effect**                                  |
|------------|-----------------|------------------------------------------------------|
| 0x01       | LOAD            | AL = candidate\[current_index\]                      |
| 0x02       | MUL             | AL = (AL × 0x9D) mod 256                             |
| 0x03       | XOR             | AL = AL XOR 0x5A                                     |
| 0x04       | ROL             | AL = ROL8(AL, 3)                                     |
| 0x05       | CMP next byte   | Reject unless AL equals the following immediate byte |
| 0x06       | ADVANCE         | Move to next input byte (R14++)                      |
| 0xFF       | HALT            | End interpretation; continue to success path         |

Opcode 0x02 uses the x86 MUL BL instruction. It computes a 16-bit product in AX; the subsequent XOR and rotation operate on AL, so only the low eight bits influence the comparison. Opcodes 0x05 and 0x06 either validate a transformed byte or advance the candidate pointer.

### The repeating 7-byte verification pattern


```text
01 02 03 04 05 72 06 ; candidate byte 0
01 02 03 04 05 57 06 ; candidate byte 1
01 02 03 04 05 E8 06 ; candidate byte 2
01 02 03 04 05 F5 06 ; candidate byte 3
... ; 20 such records
01 02 03 04 05 85 06 ; candidate byte 19
FF ; end of bytecode
```


The VM occupies 0x40024C through 0x4002D8, inclusive: 20 × 7 verification bytes plus one 0xFF terminator, for 141 bytes total. The embedded comparison values are exactly:


```text
72 57 E8 F5 2E C8 A6 85 BA E8
61 70 C8 A0 C8 E8 61 F3 E8 85
```


## 4 Reversing the secret-check transformation

For each candidate character x, the VM computes the following eight-bit transformation before comparing it with a hard-coded target t:

**t = ROL8( ((x × 0x9D) mod 256) XOR 0x5A, 3 )**

Each operation is reversible: reverse rotation with ROR8 by 3, reverse XOR by XORing 0x5A again, then reverse multiplication modulo 256. Since 0x9D is odd, its modular inverse exists; 0xB5 is that inverse, because (0x9D × 0xB5) mod 256 = 1.

**x = ((ROR8(t, 3) XOR 0x5A) × 0xB5) mod 256**

### Worked example: the first secret character

| **Operation**         | **Value** |
|-----------------------|-----------|
| Comparison target t   | 0x72      |
| ROR8(0x72, 3)         | 0x4E      |
| 0x4E XOR 0x5A         | 0x14      |
| (0x14 × 0xB5) mod 256 | 0x24      |
| ASCII 0x24            | “\$”      |

Applying this inverse to all 20 comparison bytes yields the exact secret below. Re-applying the original forward transformation to each recovered byte reproduces all 20 comparison targets, providing a static consistency check.

| **Recovered authentication key:** \$p34k_fr13nd\_&\_3nt3r |
|-----------------------------------------------------------|

## 5 Decrypting the successful response

On the success path, the binary XORs 20 bytes of the in-memory encrypted response at 0x400237 with the 20 input bytes beginning at 0x4002E9. The decrypted bytes are written back into the writable .data area and sent across the same TCP connection. A 21-byte write includes the trailing newline already present in .data.


```text
0x4001A1 lea rdi,[0x400237] ; encrypted response
0x4001A8 lea rsi,[0x4002E9] ; 20-byte candidate
0x4001AF mov ecx,0x14 ; 20 bytes
0x4001B4 mov al,[rdi]
0x4001B6 xor al,[rsi]
0x4001B8 mov [rdi],al
...
0x4001D8 mov edx,0x15 ; write 21 bytes
0x4001DD syscall
```



```text
Ciphertext @ 0x237: 4a 40 47 6b 1b 2d 56 1c 01 46 00 07 6c 42 00 41 5f 13 5b 06
Recovered key: $p34k_fr13nd_&_3nt3r
Plaintext: n0t_pr0n0unc3d_r1ght
Socket reply: n0t_pr0n0unc3d_r1ght\n
```


## 6 Offline solver (reproducible)

This solver reads the original ELF as data, extracts the 20 VM comparison bytes from their fixed file offsets, reverses the transformation, validates the result with the forward transformation, and then decrypts the success response. It never needs to execute the unknown binary.


```python
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
```


### Expected solver output


```text
$ python3 shibboleth_solve.py ./shibboleth
Expected check bytes: 72 57 e8 f5 2e c8 a6 85 ba e8 61 70 c8 a0 c8 e8 61 f3 e8 85
Recovered password : $p34k_fr13nd_&_3nt3r
Decrypted response : n0t_pr0n0unc3d_r1ght
Wire response : b'n0t_pr0n0unc3d_r1ght\n'
```


## 7 Dynamic confirmation on localhost

The network endpoint is 127.0.0.1:4455, so the test needs a local listener. The listener receives the binary’s initial five bytes, replies with the AUTH prefix and derived 20-byte secret, then reads the decrypted success text. Run the executable only in an isolated lab environment.

### Terminal A — local Python server


```bash
python3 - <<'PY'
import socket

with socket.socket() as s:
    s.bind(("127.0.0.1", 4455))
    s.listen(1)
    print("Waiting for connection...")
    conn, addr = s.accept()
    with conn:
        print("Received:", conn.recv(5))
        conn.sendall(b"AUTH $p34k_fr13nd_&_3nt3r")
        print("Response:", conn.recv(128))
PY
```


### Terminal B — run the challenge

| \$ ./shibboleth |
|-----------------|

### Observed output (user-provided local execution)


```text
Waiting for connection...
Received: b'HELO\n'
Response: b'n0t_pr0n0unc3d_r1ght\n'
```


The local execution matched both the predicted greeting and the 21-byte success response. The challenge platform then reported the submission as solved. A trailing NameError: name PY is not defined in the user’s helper script was unrelated to the binary: it occurred because the Bash here-document closing marker had been pasted into a .py file as a standalone Python statement, after the successful exchange had already completed.

## 8 Why “patch the JNE” does not solve the full problem

At address 0x400198, the VM branches to failure if a transformed byte does not match its expected value. Replacing a conditional branch with NOPs can bypass a single check, and changing all required checks could force the program onto the success path. However, the success path still XOR-decrypts the embedded bytes with the supplied candidate. The validation bypass does not conjure the correct decryption key.


```text
0x400196 cmp al,bl
0x400198 jne 0x4001E1 ; failed byte -> fail path
Success still computes:
plaintext[i] = encrypted[i] XOR candidate[i]
```


This challenge intentionally separates “passing a branch” from “recovering the right secret.” Static inversion is the cleaner solution because it provides the real key, matches all 20 comparisons, and reconstructs the intended plaintext without modifying the executable.

## 9 Conclusions and lessons learned

1.  Begin with file identification, size, strings, entry point, and segment layout before opening a heavyweight decompiler.

2.  Interpret syscall numbers and register arguments to identify actual behavior. Here, the executable is a TCP client, not an interactive stdin password prompt.

3.  Treat suspicious readable strings as clues, not ground truth. The apparent s0_cl0s3 string is the failure response, not the accepted 20-byte secret.

4.  When a program dispatches a small set of numeric opcodes, reconstruct its virtual instruction set and locate the embedded bytecode.

5.  Reverse bijective byte transformations in the opposite order. Verify your recovered input by applying the original forward operations.

6.  Inspect post-validation behavior before choosing a patching strategy. Input-dependent decryption means “always succeed” does not equal “recover plaintext.”

7.  Use a loopback listener to validate network challenges safely and confirm that the derived result agrees with actual execution.

| **Final result:** Accepted flag — n0t_pr0n0unc3d_r1ght |
|--------------------------------------------------------|

## Command reference


```text
file ./shibboleth
sha256sum ./shibboleth
strings -a -t x ./shibboleth
readelf -h ./shibboleth
readelf -l ./shibboleth
readelf -SW ./shibboleth
objdump -d -M intel ./shibboleth
objdump -s -j .data ./shibboleth
python3 shibboleth_solve.py ./shibboleth
```



## Source files and verification

- [Original Word writeup](Shibboleth_Full_Reverse_Engineering_Writeup.docx)
- [Original challenge ELF](shibboleth)
- [Offline solver reconstructed from the document](shibboleth_solve.py)
- [Publication verification record](verification.json)

The reading edition restores code blocks and Python indentation from the Word layout. The downloadable solver is a reconstructed, independently checked version of the embedded offline algorithm; it was not supplied as a separate Python upload. No requests were sent to competition infrastructure and no new challenge-platform submission was made.
