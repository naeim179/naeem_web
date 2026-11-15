# Recycler

## Challenge overview

| Field | Detail |
| --- | --- |
| Competition | MetaCTF |
| Category | Binary exploitation / Pwn |
| Points recorded in the supplied writeup | 152 |
| Vulnerability | Use-after-free and heap metadata corruption |

The challenge exposes a custom heap allocator with commands to allocate, free, read, and edit memory slots. The supplied analysis identifies a use-after-free: freed slots remain accessible through the read and edit commands. This provides a way to modify allocator metadata and create overlapping allocations.

## Heap manipulation

The original solve describes this sequence:

1. Allocate three chunks with sizes `0x20`, `0x400`, and `0x360`.
2. Free slots 0 and 1, then allocate a new `0x40` chunk.
3. Use the dangling pointer in slot 1 to read and modify freed heap metadata.
4. Overwrite the free chunk’s capacity field at offset `0x48` with `0x800`, while preserving the authentication data.
5. Allocate chunks of sizes `0x400` and `0x3f0` to create an overlapping allocation.
6. Read slot 3 to leak encrypted flag data from the vault at offset `0x810`.

## Recover the encryption state

The leaked flag is encrypted by XORing it with a 64-bit linear congruential generator (LCG) keystream. The known eight-byte prefix `MetaCTF{` lets the original solve recover the initial state:

```python
state = int.from_bytes(
    bytes(a ^ b for a, b in zip(ciphertext[:8], b"MetaCTF{")),
    "little"
)
```

The writeup records this state-update expression:

```python
state = (
    state * 0x5851F42D4C957F2D
    + 0x14057B7EF767814F
) & 0xFFFFFFFFFFFFFFFF
```

Regenerating the keystream and XORing it with the leaked ciphertext reveals the flag. These snippets are excerpts from the supplied notes, not a complete standalone decryption program.

## Recorded execution and result

The source writeup records:

```bash
python3 recycler_solve.py
```

```text
[+] FLAG: MetaCTF{r3cycl3d_pr0v3n4nc3_uk6q1x6o}
```

## Lessons learned

The solve combines a memory-lifetime error with corruption of allocator metadata, overlapping allocations, and a known-plaintext attack against an LCG-based keystream. The heap primitive provides the encrypted data; the predictable flag prefix provides the route to recovering its plaintext.

## Source and reproduction scope

The original `recycle.docx` is preserved in this casefile folder. The challenge binary, leaked ciphertext, and `recycler_solve.py` were not included in the upload. The recorded command and flag are retained as reported evidence; the complete exploit has not been newly executed or reconstructed for publication.
