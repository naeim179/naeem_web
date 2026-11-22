import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth, signIn, signOut, studioConfigured } from "@/auth";
import StudioEditor from "./studio-editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Private studio", robots: { index: false, follow: false, noarchive: true } };

export default async function StudioPage() {
  if (!studioConfigured) notFound();
  const session = await auth();
  if (!session) return (
    <div className="wrap studio-shell">
      <p className="eyebrow">PRIVATE STUDIO</p>
      <h1>Owner sign in</h1>
      <p>Use the authorized GitHub account to continue.</p>
      <form action={async () => { "use server"; await signIn("github", { redirectTo: "/studio" }); }}>
        <button className="studio-button" type="submit">Continue with GitHub</button>
      </form>
    </div>
  );
  if (session.user?.id !== "130230895") notFound();
  return (
    <div className="wrap studio-shell">
      <div className="studio-topline"><span className="eyebrow">PRIVATE STUDIO</span>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button type="submit">Sign out</button></form>
      </div>
      <h1>Publish a writeup</h1>
      <p>Add a readable casefile to the portfolio. Review your draft before creating a publishing request.</p>
      <StudioEditor />
    </div>
  );
}
