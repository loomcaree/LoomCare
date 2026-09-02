# Loom Care — static site

This is a browser-only React/Vite site. npm run build creates dist/index.html, dist/about/index.html, dist/privacy/index.html, and dist/terms/index.html plus shared CSS, JavaScript, and images. Each address has its own physical HTML entry. No Next.js, SSR, API endpoints, database, authentication, Cloud Functions, or App Hosting backend is used. JavaScript is required to display the pages. There is no application router; navigation uses ordinary links and page anchors.

## Firebase Hosting

Run these commands from the folder containing package.json and firebase.json:

```sh
npm ci
npm run deploy:firebase
```

Firebase uses the **dist** public directory. The predeploy hook builds the site and checks all four HTML pages and their assets before uploading. If running firebase init hosting again, choose dist, do not overwrite index.html, and do not configure an SPA rewrite: the pages are physical HTML files, not client-side routes. The legacy /join address redirects to /#contact. Plain Firebase Hosting is sufficient; App Hosting and a Blaze upgrade are not needed for this static architecture (normal Firebase quotas still apply).

The selected project is loom-care in .firebaserc. Verify that this is your intended project before deploying. Sign in with firebase login if necessary. Do not share login tokens or commit .env.local.

## Vercel

Import the repository root. Framework: Vite. Build: npm run build. Output: dist. The included vercel.json specifies these settings. Remove old Next.js or dist/client overrides in the dashboard.

## Local preview

```sh
npm ci
npm run dev
```

For a production preview, run npm run build followed by npm start. Upload the **entire contents of dist**, not only index.html. The source index.html references TypeScript and is a development entry; deploy the built dist/index.html instead.

## Intentional functionality changes

The story animations remain browser-side. The roadmap and invitation sections remain removed. Header navigation links to Home, About Us, Our Care, and Contact. Shared footer links include Privacy Policy and Terms & Conditions. A short company introduction links to the full About Us page.

The single-icon theme button shows a moon in light mode and a sun in dark mode. Its background opacity is 18% (30% on hover) in light mode and 8% (18% on hover) in dark mode; the icon remains readable. At widths of 900px and below the button is only visible inside the hamburger panel. Every fresh page load starts in light mode; the preference is not persisted.

Google sign-in and the registration page/server endpoint remain removed. There are no account, purchase, or waitlist forms. No Firebase or webhook environment variables are bundled or required. Firebase Hosting still processes web requests, and fonts use the existing Geist families via Google Fonts with local system fallbacks. The privacy draft describes these third-party requests rather than claiming there is no data processing at all.

Privacy and Terms content is visibly marked as draft pending confirmation of legal company identity, country, the existing hello@loom.care inbox, retention arrangements, and legal review. Do not treat these drafts as finalized legal documents.

Removed server and registration source files are recoverable from Git history. Local ignored build artifacts from older Next.js builds are not part of the Firebase upload.
