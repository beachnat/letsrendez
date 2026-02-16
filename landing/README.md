# Coming Soon landing page

This folder is the **static “coming soon” page** shown at your main Vercel URL when you want the public to see that instead of the full app.

## Show this page on Vercel

1. Open [Vercel](https://vercel.com) → your **letsrendez** project → **Settings** → **General**.
2. Find **Root Directory** → click **Edit**.
3. Enter **`landing`** (no leading slash) → **Save**.
4. Go to **Deployments** → open the **⋮** menu on the latest deployment → **Redeploy** (or push a new commit to trigger a deploy).

Your site (e.g. `letsrendez.vercel.app`) will then serve this coming soon page. To show the full app again, clear Root Directory (leave it empty) and redeploy.

## Test locally

From the project root:

```bash
npm run landing
```

Then open **http://localhost:5001** in your browser.

## Preview in the app

When running the full app locally (`npm start` or `npm run web`), sign out so you see the main landing screen, then tap **“Preview coming soon page”** to see the same content inside the app. That way you keep testing the real login flow locally while the public Vercel site shows coming soon.
