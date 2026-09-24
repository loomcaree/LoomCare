# Loom Care — static site

This is a browser-only React/Vite site. npm run build creates five HTML entries: home, /about/, /privacy/, /terms/, and /join/, plus shared CSS, JavaScript, and images. Each address has its own physical HTML entry. No Next.js, SSR, server routing, authentication, Cloud Functions, or App Hosting backend is used. The optional waitlist receiver runs separately in Google Apps Script and appends registrations to Google Sheets. JavaScript is required to display the pages. Navigation uses ordinary links and page anchors.

## Firebase Hosting

Run these commands from the folder containing package.json and firebase.json:

```sh
npm ci
npm run deploy:firebase
```

Firebase uses the **dist** public directory. The predeploy hook builds the site and checks all five HTML pages and their assets before uploading. If running firebase init hosting again, choose dist, do not overwrite index.html, and do not configure an SPA rewrite: the pages are physical HTML files, not client-side routes. Hosting serves the physical /join/index.html entry; do not add a /join → /join/ redirect, since Firebase can match both forms and create a redirect loop. Plain Firebase Hosting is sufficient; App Hosting and a Blaze upgrade are not needed for this static architecture (normal Firebase quotas still apply).

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

On the home page, ArrowDown and ArrowUp move to the next/previous section’s top edge. Each story section is at least one viewport tall, while taller content remains scrollable and the deep unboxing track is preserved. The footer keeps its original compact size: the final ArrowDown destination is the document bottom, not a full-screen footer. ArrowUp from there returns to the company section. Distinct rapid taps advance one section each; held-key repeats do not skip multiple chapters. Inputs, links, buttons, draggable loops, menus, and modified key combinations keep their normal behavior. Wheel/touch/pointer input interrupts the transition. Reduced-motion preferences use an immediate jump. Run `node scripts/test-section-navigation.mjs` for the navigation unit checks.

Dark mode uses charcoal/black neutral surfaces and near-white text, including the box, pendant, cards, form, and footer. The light-mode palette is preserved. Brand accent colors, status indicators, and the family photo are not globally inverted; white text over imagery and blue buttons remains light for contrast.

The single-icon theme button has no background or border. Its 17px icon is rendered at 30% opacity, with a larger invisible 44px touch target and a visible keyboard focus ring. The header is 58px high on desktop and 54px on mobile, with a translucent 12–30% background. At widths of 900px and below, both the theme control and the Join Waitlist action move inside the hamburger panel. Every fresh page load starts in light mode; the preference is not persisted.

Google sign-in remains removed. The restored waitlist page collects name, email, optional city, and explicit email-updates consent. It is disabled until the public VITE_WAITLIST_ENDPOINT is configured. No private credentials belong in this variable. Follow integrations/google-sheets/README.md to deploy the receiver, then verify one real test signup and duplicate handling before opening the list. The app never treats an opaque response, HTTP success alone, or a local save as registration success. The privacy draft reflects whether the endpoint is configured. Firebase Hosting and Google Fonts still handle web requests as described there.

Privacy and Terms content is visibly marked as draft pending confirmation of legal company identity, country, the existing hello@loom.care inbox, retention arrangements, and legal review. Do not treat these drafts as finalized legal documents.

Removed server and registration source files are recoverable from Git history. Local ignored build artifacts from older Next.js builds are not part of the Firebase upload.
