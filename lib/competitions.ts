import overpass from "@/content/competitions/overpass-2026.json";

export const overpassResult = overpass;

// Finals placement and scores confirmed by the owner and supplied team scoreboard.
export const metaCtfResult = {
  name: "MetaCTF",
  institution: "Princess Sumaya University for Technology",
  stage: "Finals",
  qualification: "Finalist",
  teamRank: 22,
  teamPoints: 1102,
  personalPoints: 752,
  scoreboardName: "Naim Althabata",
  evidence:
    "Owner-supplied team scoreboard screenshot; finals stage confirmed by the owner.",
};

// Final result confirmed by the owner; scores and captain role are visible in the supplied team screenshot.
export const tvxCtfResult = {
  name: "TVX CTF",
  team: "IV LEGION",
  stage: "Final result",
  teamRank: 31,
  teamPoints: 2110,
  role: "Captain",
  scoreboardName: "Naim Althabata",
  evidence: "/writeup-files/tvx-ending/evidence/team-scoreboard.png",
  certificate: {
    title: "Certificate of Achievement",
    issuer: "Tech Visions Team",
    issuedOn: "2026-11-13",
    pdf: "/certificates/tvx-ctf-2026-naim-althabata.pdf",
    preview: "/certificates/tvx-ctf-2026-naim-althabata.jpg",
    width: 1600,
    height: 1133,
  },
};
