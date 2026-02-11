# Holding page (Coming Soon)

This folder is the **static “coming soon” page** for letsrendez.app.

**For Vercel to show this page (not the full app):**

1. Vercel → your project → **Settings** → **General**
2. **Root Directory** → click **Edit** → enter **`landing`**
3. **Save** → go to **Deployments** → redeploy the latest (or push a new commit)

If Root Directory is empty, Vercel builds the whole repo (Expo app with login). With Root Directory = **landing**, it serves only this folder.
