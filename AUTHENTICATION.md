# Loom Care sign-in

The site remains a static Vite build with five physical HTML pages. Firebase's browser SDK loads on `/join/` only; it does not introduce server rendering, server routing, or a custom application server.

## Current implementation

- Existing Firebase project: `loom-care`; web app: `loomcare`.
- Public browser configuration is recorded in `lib/firebase-auth.ts`. No service-account credentials, OAuth client secrets, or analytics SDK are included.
- Google popup sign-in **or** email-and-password accounts (Firebase Authentication). Enable both providers in the Firebase console (Authentication → Sign-in method).
- If someone tries to register an email that already exists, they are moved to sign-in. Password reset is offered only for email/password accounts, not Google-only accounts.
- Public pages remain public. Waitlist fields require a signed-in Firebase account and a configured receiver. Signing in never submits consent automatically.
- Each submission obtains a current Firebase ID token using the SDK and sends it in the HTTPS POST body, not a URL. The receiver independently validates it before any spreadsheet access. Never store or log the token.
- Support contact supplied by owner: `loomcaree@gmail.com`.

## Owner setup and remaining activation

1. Enable **Google** and **Email/Password** in Firebase Authentication. Confirm provider support email is `loomcaree@gmail.com`; it is a Firebase console setting, not set by website JavaScript.
2. Test sign-in on `/join/` using an owner-controlled Google account **and** an email/password account. Authorize `127.0.0.1`/`localhost` for local development and `loom-care.web.app` for production. A popup must be allowed; use an external Safari/Chrome browser if the embedded browser is rejected by Google.
3. Paste `integrations/google-sheets/Code.gs` into Apps Script and deploy a new web-app version. The `/exec` URL is already in `.env.production`.
4. Confirm successful signup writes exactly one row, repeat signup deduplicates, and unsigned/invalid requests cannot write. Confirm readable cross-origin acknowledgements on the production origin. The automated tests use mocked Firebase/Apps Script responses, not a live account.
5. Deploy the tested static output through Firebase Hosting. Do not add SPA rewrites or a custom server.

No Firestore database is created by authentication. Firebase stores account identities; the separately connected Google Sheet stores waitlist entries. Privacy/terms drafts still require owner review and a retention decision before opening signups publicly.
