export const profile = {
  name: "Naim Althabatah",
  email: "naim.althabata@gmail.com",
  github: "https://github.com/naeim179",
  linkedin: "https://www.linkedin.com/in/naim-althabatah-427331316",
  tryhackme: "https://tryhackme.com/p/NK179",
  resume: "/Naim-Althabatah-CV.docx",
};
export const projects = [
  {
    slug: "educational-platform",
    number: "01",
    category: "Development",
    title: "A connected learning experience.",
    name: "Your Way Academy",
    kind: "CLIENT PROJECT · 2026",
    summary:
      "Full-stack work on an educational platform, bringing learning workflows, backend services, cloud deployment, and payments together.",
    stack: ["Next.js", "TypeScript", "Supabase", "Cloudflare", "PayTabs"],
    repository: "https://github.com/naeim179/edc_website",
    visual: "platform",
    role: "Freelance full-stack developer",
    context: "Independent client project · Approximately 4–5 months",
    overview:
      "Contributed across full-stack development and the integration of external services for a client educational website. The work connected the application’s learning workflows with backend, cloud, and payment services.",
    work: [
      "Integrated Supabase for backend services and application data.",
      "Connected Cloudflare and PayTabs within the application workflow.",
      "Used GitHub for source control and coordinated service integration.",
      "Troubleshot configuration and integration issues across the platform.",
    ],
    scope:
      "This case study describes my contribution to the project. It does not publish client data, payment credentials, or internal configuration.",
  },
  {
    slug: "qrshield",
    number: "02",
    category: "Development",
    title: "Scan the code. Understand the risk.",
    name: "QRShield",
    kind: "SECURITY APPLICATION",
    summary:
      "A QR payload analysis tool that turns decoded content into risk explanations and practical safety recommendations.",
    stack: ["Python", "FastAPI", "QR analysis", "Risk scoring"],
    repository: "https://github.com/naeim179/qrshilde",
    visual: "qr",
    role: "Backend development & security analysis",
    context: "Personal security project",
    overview:
      "Built a FastAPI backend to decode QR codes, analyze their payloads, calculate threat scores, and return structured results. The emphasis is on explanations that help people understand a potential risk.",
    work: [
      "Handled URLs, SMS, Wi-Fi, vCard, calendar events, deep links, and plain text.",
      "Implemented rule-based risk explanations and recommended safety actions.",
      "Returned structured analysis results through a FastAPI backend.",
    ],
    scope:
      "Risk scores support informed decisions; they are not a guarantee that a QR payload is safe.",
  },
  {
    slug: "attack-defense-lab",
    number: "03",
    category: "Security",
    title: "From attack traces to detection.",
    name: "Attack & Defense Lab",
    kind: "BLUE TEAM · CONTROLLED LAB",
    summary:
      "A multi-VM lab connecting web attack simulation, Wazuh monitoring, investigation timelines, and mitigation testing.",
    stack: ["Wazuh", "Linux", "Apache", "Detection rules"],
    repository: null,
    visual: "security",
    role: "Security lab setup, investigation & detection",
    context: "Hands-on cybersecurity training",
    overview:
      "A controlled multi-VM environment for simulating web attacks and examining their traces. Apache logs, Bash history, and Wazuh alerts provided evidence for reconstruction and basic detection rules.",
    work: [
      "Simulated web attacks and documented attack paths and affected logs.",
      "Correlated Apache logs, Bash history, and Wazuh alerts into timelines.",
      "Created and tested basic rules for SQL injection, XSS, command injection, and suspicious uploads.",
      "Retested mitigations and tracked lab changes with Git.",
    ],
    scope:
      "All attack simulation described here took place in controlled training environments.",
  },
] as const;
export const certifications = [
  {
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    type: "Certification",
    detail: "Issued 19 Sep 2026 · Valid through 19 Sep 2029",
    url: "https://aws.amazon.com/verification",
    verification: "7dccaac84c84484ba8c294482a49a67e",
  },
  {
    title: "Certified Associate Penetration Tester",
    issuer: "Hackviser",
    type: "Certification",
    detail: "CAPT · HV-CAPT-2GIXVBEF",
    url: "https://hackviser.com/verify?id=HV-CAPT-2GIXVBEF",
  },
  {
    title: "Masar Cybersecurity Field Training",
    issuer: "NCSCJO / Skidz Training",
    type: "Training",
    detail: "200 hours · 8 weeks",
    url: "https://drive.google.com/file/d/1kRd4mgYGfLSq2gddmS3BSlszwlKTETZP/view",
  },
  {
    title: "Cyber Warriors Training Programs",
    issuer: "National Cyber Security Center of Jordan",
    type: "Training",
    detail: "CTF & cybersecurity practice",
    url: "https://drive.google.com/file/d/1n8emdJynTSVEKCCGY8YEVg8_ZEwEMQQm/view",
  },
  {
    title: "Red Hat System Administration I",
    issuer: "Red Hat",
    type: "Training",
    detail: "RH124",
    url: "https://www.credly.com/badges/93acee47-45fa-4f5c-b94d-0f1c43bf79c5/public_url",
  },
  {
    title: "Red Hat System Administration II",
    issuer: "Red Hat",
    type: "Training",
    detail: "RH134",
    url: "https://drive.google.com/file/d/134mNRoBFwQjS2VpyUK-OPZ5AOqwlwAbA/view",
  },
  {
    title: "CCNA Training",
    issuer: "The Hope International Company",
    type: "Training",
    detail: "60 hours",
    url: "https://www.credly.com/badges/810f66c1-a5da-400e-b725-7736f80beca0/public_url",
  },
  {
    title: "Certified Ethical Hacker Training",
    issuer: "The Hope International Company",
    type: "Training",
    detail: "40 hours · CEH training",
    url: "https://drive.google.com/file/d/1JeEZA8bE3CeLpFEurVLUxP-_V_QY7Fs9/view",
  },
] as const;
export const skillGroups = [
  {
    number: "01",
    title: "Build & integrate",
    text: "From application workflows to the services behind them.",
    skills: [
      "Next.js",
      "TypeScript",
      "Full-stack development",
      "Supabase",
      "Cloudflare",
      "PayTabs",
      "Git / GitHub",
    ],
  },
  {
    number: "02",
    title: "Investigate & defend",
    text: "Follow the evidence. Understand the signal.",
    skills: [
      "Wazuh SIEM",
      "Log analysis",
      "Alert triage",
      "IOC identification",
      "Incident response fundamentals",
      "Detection logic",
      "Wireshark / TShark",
    ],
  },
  {
    number: "03",
    title: "Test & explore",
    text: "A practical foundation built through labs and challenges.",
    skills: [
      "Python",
      "Linux / Kali",
      "Burp Suite",
      "Nmap",
      "OWASP Top 10",
      "Bash · basic",
      "PHP · basic",
      "Ghidra / GDB · foundational",
      "AWS fundamentals",
    ],
  },
];
