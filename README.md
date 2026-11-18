# Stash

Personal monthly budget app. Split your salary into envelopes (savings goal, fixed contributions, categories), log quick expenses and see what is left. Mobile first, installable as a PWA, no backend: everything is stored on the device.

## Run

```bash
npm install
npm run dev      # development server
npm test         # unit tests (budget calculations)
npm run build    # production build with service worker
npm run preview  # serve the production build locally
```

## Icons

The source logo is `public/icon.svg` (square, solid background). To regenerate the PNG icons (192, 512, maskable, apple-touch-icon):

```bash
npx pwa-assets-generator
```

## Deploy

Push to a repository connected to Vercel or Netlify (build command `npm run build`, output `dist`). `vercel.json` already rewrites all routes to `index.html`. HTTPS is required for the PWA.

## Install on iPhone

Open the deployed URL in Safari, tap Share, then "Add to Home Screen". Always use the installed app: it does not share data with Safari. Use Settings > Export/Import to move data.
