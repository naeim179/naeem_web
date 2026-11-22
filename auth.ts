import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const studioConfigured = Boolean(
  process.env.AUTH_SECRET && process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET && process.env.STUDIO_GITHUB_TOKEN,
);
const ownerId = "130230895";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  providers: studioConfigured
    ? [GitHub({
        authorization: { params: { scope: "read:user" } },
      })]
    : [],
  callbacks: {
    signIn({ account, profile }) {
      return account?.provider === "github" && String(profile?.id) === ownerId;
    },
    jwt({ token, account, profile }) {
      if (account?.provider === "github" && String(profile?.id) === ownerId) {
        token.ownerId = ownerId;
      }
      return token;
    },
    session({ session, token }) {
      if (token.ownerId === ownerId) session.user.id = ownerId;
      return session;
    },
  },
});
