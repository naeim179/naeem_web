import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Naim | Cybersecurity Analyst Portfolio",
  description:
    "Cybersecurity portfolio focused on SOC operations, SIEM monitoring, incident response, threat analysis, and security research.",
  keywords: [
    "Cybersecurity",
    "SOC Analyst",
    "SIEM",
    "Splunk",
    "Wazuh",
    "Incident Response",
    "Threat Detection",
  ],
  authors: [{ name: "Naim" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}