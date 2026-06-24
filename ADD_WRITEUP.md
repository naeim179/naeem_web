# How to add a new CTF writeup

There is no mandatory CTF writeup format, but this project now uses a professional casefile format:

1. Copy `wrup/_template.html` into the right folder:
   - Web: `wrup/web/challenge-name.html`
   - Pwn: `wrup/pwn/challenge-name.html`
   - Reverse: `wrup/reverse/challenge-name.html`
   - Crypto: `wrup/crypto/challenge-name.html`
   - Forensics: `wrup/forensics/challenge-name.html`
   - Misc: `wrup/misc/challenge-name.html`

2. Keep the CSS link like this inside category folders:

```html
<link rel="stylesheet" href="../writeup-template.css" />
```

3. Edit the page sections:
   - Overview
   - Skills demonstrated
   - Timeline
   - Recon
   - Walkthrough
   - Evidence / screenshots
   - Flag
   - Lessons learned

4. Add the new entry to `wrup/writeups.js`:

```js
{
  title: "Challenge Name",
  ctf: "CTF Name",
  points: "350",
  solveTime: "~30 min",
  tags: "SQLi, Auth, Burp Suite",
  skills: "Enumeration · Burp Suite · Access Control Testing",
  date: "2026-06-24",
  difficulty: "Medium",
  summary: "One clear sentence about the bug and solution path.",
  url: "./web/challenge-name.html"
}
```

5. Put screenshots in `wrup/assets/`, then reference them like:

```html
<img src="../assets/my-screenshot.png" alt="Short useful description" />
```

Important: publish writeups only after the CTF allows public solutions. Redact flags for active/private labs when needed.
