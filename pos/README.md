# TOSPOS – Free browser-based POS

Next.js 16 app. Public marketing site in `app/(marketing)` (indexed, can show ads); POS workspace in `app/(app)` (`noindex`, no ads). All business data is stored in the visitor's browser (localStorage).

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Environment variables (set in your host, e.g. Vercel → Settings → Environment Variables)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Your live domain, e.g. `https://tospos.com`. Used for canonicals, sitemap, OG tags. **Required.** |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Address shown on Contact/Privacy/Terms pages. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Token from Search Console's "HTML tag" method. |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-…` ID. Enables the AdSense script on public pages and `/ads.txt`. |
| `NEXT_PUBLIC_GA_ID` | Optional Google Analytics 4 ID (`G-…`). |

Rebuild after changing them (they are baked in at build time).

## Launch checklist

1. Deploy, set the variables above, redeploy.
2. Search Console: add the domain property, verify, submit `https://YOUR-DOMAIN/sitemap.xml`, and request indexing for the homepage.
3. AdSense: apply with the domain, set `NEXT_PUBLIC_ADSENSE_CLIENT`, redeploy, confirm `/ads.txt` shows your publisher line. In AdSense → Privacy & messaging, enable the Google-certified consent message for EEA/UK visitors.
