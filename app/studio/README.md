# Private writeup studio

The studio is not linked in public navigation and returns 404 until configured. Its page and publishing API only accept GitHub identity ID `130230895` (`naeim179`), and the page is marked noindex.

Create a GitHub OAuth App under the owner's GitHub Developer settings:

- Homepage URL: `https://naim-workspace.vercel.app`
- Authorization callback URL: `https://naim-workspace.vercel.app/api/auth/callback/github`

Configure these secrets for the Vercel **Production** environment only: `AUTH_SECRET` (random 32+ byte secret), `AUTH_GITHUB_ID` (OAuth client ID), `AUTH_GITHUB_SECRET` (OAuth client secret), and `STUDIO_GITHUB_TOKEN` (fine-grained GitHub personal access token for this repository only, with Contents and Pull requests read/write). Do not commit or share their values. Redeploy production after setting them.

Open `/studio` directly to sign in. GitHub sign-in requests only identity access; the repository-scoped token stays on the server and creates a draft branch and pull request in `naeim179/naeem_web`. The dashboard never returns either token to the browser. Review the draft PR, mark it ready, and merge after checks pass. Vercel then publishes automatically. Each upload is limited to five files of 2 MB, up to 3 MB combined. Add attachment links in the Markdown using their file names. The GitHub PR is the human review point and also keeps a revision history.
