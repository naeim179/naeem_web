// Extra MyLibrary data file
// Loaded after writeups.js and before app.js.
// Adds the TryHackMe Operation SandLock cabinet without touching the original writeups.js.

(function () {
  if (!Array.isArray(window.WRITEUP_LIBRARY)) {
    window.WRITEUP_LIBRARY = [];
  }

  const alreadyExists = window.WRITEUP_LIBRARY.some((collection) => collection.id === "tryhackme");
  if (alreadyExists) return;

  window.WRITEUP_LIBRARY.push({
    "id": "tryhackme",
    "name": "TryHackMe Writeups",
    "shortName": "TryHackMe",
    "icon": "",
    "accent": "rgba(255, 122, 92, 0.78)",
    "accentSoft": "rgba(255, 122, 92, 0.26)",
    "description": "A standalone TryHackMe cabinet containing Operation SandLock, a chained crypto, reverse engineering, forensics, and hash-cracking casefile.",
    "tags": [
      "Crypto",
      "Reverse",
      "Forensics"
    ],
    "writeups": [
      {
        "title": "Operation SandLock",
        "ctf": "TryHackMe",
        "points": "",
        "solves": "",
        "solveTime": "Documented",
        "tags": "Crypto, Reverse Engineering, Forensics, CyberChef, Ghidra, Hashcat",
        "skills": "CyberChef Decoding · Ghidra Reversing · XOR Analysis · JPEG Header Repair · Hashcat Cracking",
        "date": "2026-06-24",
        "difficulty": "CTF-style challenge",
        "summary": "Solved the Operation SandLock room by chaining an encrypted note, XOR-protected gatekeeper binary, locked archive, repaired JPEG evidence, MD5 cracking, and final vault extraction.",
        "url": "./tryhackme/operation-sandlock.html",
        "category": "Forensics"
      }
    ]
  });
})();
