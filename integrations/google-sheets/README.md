# Connect the Loom Care waitlist

The website posts to the public `/exec` URL in `.env.production`. Rows only appear after this Apps Script is pasted and **redeployed** (Deploy → Manage deployments → Edit → New version). The currently live deployment must include `doGet` and `doPost` from `Code.gs`. Google **and** email/password Firebase ID tokens are accepted. Local-only passwords are not.

The form stays disabled if `VITE_WAITLIST_ENDPOINT` is absent or invalid.

## One-time setup by the sheet owner

1. Create or choose a private Google Sheet. Do not enable public editing or publish its contents to the web.
2. In the sheet, open **Extensions → Apps Script**. Paste the contents of `Code.gs` into the script editor.
3. Open **Project Settings → Script Properties**. Add `SPREADSHEET_ID` with the ID from the sheet URL (between `/d/` and `/edit`). Also add `FIREBASE_WEB_API_KEY`, using the public `apiKey` for the existing `loom-care` web app (Firebase Project Settings → Your apps; also recorded in `lib/firebase-auth.ts`). Never use an admin/service-account key. The key must allow the Identity Toolkit API from Apps Script; if a browser-referrer restriction blocks it, use a separate API-restricted key for this receiver rather than weakening the browser key.
4. Run `setupWaitlist` once and authorize it using the account that owns the sheet. It creates a **Waitlist** tab with fixed column headings. It will not overwrite a tab with different headings.
5. Select **Deploy → New deployment → Web app**. Execute as yourself, with access for **Anyone**. Deploy and authorize when prompted. The public endpoint requires a valid Firebase Google sign-in token before accessing the sheet; "Anyone" permits the HTTP request, not an unauthenticated signup or sheet access. Workspace administrator restrictions may prevent public web apps. When updating an older deployment, use **Manage deployments → Edit → New version** and disable obsolete anonymous receiver deployments.
6. Send the deployed URL ending in `/exec` to the developer. The `/dev` URL is not a public production endpoint.
7. Put that URL in an ignored `.env.local` as `VITE_WAITLIST_ENDPOINT=https://script.google.com/macros/s/DEPLOYMENT_ID/exec`. Rebuild before deploying. This URL is public by design; never put a password, OAuth token, or service-account key in a `VITE_` variable.

## Before enabling real signups

- Confirm the legal company identity, monitored contact email, retention policy, and final privacy/consent wording. The current legal pages are drafts.
- Submit one clearly labeled test entry using an email you control. Verify that exactly one row appears in the private sheet and that the website shows success only after a readable acknowledgement.
- Repeat with the same email and verify no extra row is added. Test network failures and invalid inputs.
- Verify that missing, forged, expired, revoked, disabled-account, wrong-project, and non-Google tokens cannot write rows, and that submitting another person's email is rejected. The receiver validates the exact token using Firebase `accounts:lookup`, then checks project, provider, expiry, UID, account status and revocation time. No JWT decoding alone is trusted. Never log tokens or paste them into chat.
- Test from the actual Firebase origin, including a signed-out browser. Apps Script redirects its response to `script.googleusercontent.com`; the client follows the redirect. Do not switch to `no-cors` or treat an opaque response as success. If your Google account/deployment does not allow a readable response, pause activation and use a verified alternative such as Google Forms or an approved proxy.
- The script includes server validation, text/formula sanitization, locking, email deduplication, a honeypot, and a best-effort 30-request-per-minute global guard. These are not strong bot protection. Add a server-verified CAPTCHA before advertising at scale; Apps Script quotas and the global guard can be exhausted by spam.
- The endpoint has no signup-list read operation. Restrict sheet sharing to authorized staff. Establish an owner process for unsubscribe and deletion requests through the published contact email.

## Stored columns

UTC signup time, name, normalized email, optional city, explicit email-updates consent, consent wording version, and request ID. No health records, passwords, or payment details are requested. Retries and repeat signups with the same email do not append another row.

Source references: [Google Apps Script web apps](https://developers.google.com/apps-script/guides/web), [Content Service redirects](https://developers.google.com/apps-script/guides/content), [Lock Service](https://developers.google.com/apps-script/reference/lock/lock-service), [Firebase account lookup](https://firebase.google.com/docs/reference/rest/auth#section-get-account-info).
