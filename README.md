# naeem_web — Fixed Portfolio + Writeups

Fixed structure:

```text
naeem_web/
├── index.html
├── wrup/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── writeups.js
│   ├── _template.html
│   ├── writeup-template.css
│   ├── web/
│   ├── reverse/
│   ├── pwn/
│   ├── crypto/
│   ├── forensics/
│   └── misc/
└── writeups/
    └── index.html  # redirect to wrup for old links
```

Behavior:

1. Navbar `Writeups` in the main portfolio scrolls down to the Writeups section.
2. Clicking the MyLibrary card opens `./wrup/index.html`.
3. Inside MyLibrary, `Portfolio` and `Back to Portfolio` return to `../index.html`.
4. Old links to `./writeups/index.html` redirect to `./wrup/index.html`.

To add a writeup, copy `wrup/_template.html` into the right category folder, then add it to `wrup/writeups.js`.


## Professional writeup format added

The MyLibrary system now includes:

- Category cabinets with search and filters.
- Latest writeup cards with CTF name, points, date, and skills.
- A stronger `_template.html` casefile with Overview, Skills, Timeline, Recon, Walkthrough, Evidence, Flag, and Lessons Learned.
- Screenshot placeholder styling through `writeup-template.css`.
- `ADD_WRITEUP.md` with the exact workflow for publishing new writeups.

Use `wrup/_template.html` as the source for every new writeup. Copy it into the matching category folder, then add its metadata to `wrup/writeups.js`.
