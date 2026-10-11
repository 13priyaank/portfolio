# Deploying the portfolio for free

This site is a static Vite + React app. `npm run build` turns it into plain files in `dist/`, and any static host can serve that folder. All the options below are free and need no server.

**Recommended: Vercel or Netlify** (easiest, no config). Cloudflare Pages and GitHub Pages also work.

---

## 1. Before you deploy (one-time checks)

1. **Install Node.js** (v20 or newer): <https://nodejs.org>. Check with:
   ```bash
   node --version
   npm --version
   ```
2. **Install dependencies** (from the `portfolio` folder):
   ```bash
   npm install
   ```
3. **Run it locally** and click around:
   ```bash
   npm run dev
   ```
   Open the URL it prints (usually <http://localhost:5173>).
4. **Check the content** in `src/data/profile.ts` (name, email, phone, experience, projects). Check that `public/Priyank_Wadiwala_Resume.pdf` is the résumé you want people to download.
5. **Make a production build** and preview exactly what will go live:
   ```bash
   npm run build
   npm run preview
   ```
   `npm run build` runs a TypeScript check first. If it prints errors, fix them before deploying. Preview opens at <http://localhost:4173>.

You'll know it worked when `dist/` contains `index.html`, an `assets/` folder, `images/` and the résumé PDF.

---

## 2. Put the code on GitHub

Vercel, Netlify, Cloudflare and GitHub Pages all deploy from a GitHub repo, and every `git push` then re-deploys automatically.

1. Create a free account at <https://github.com> and click **New repository**. Name it, for example, `portfolio`. Leave it empty (no README or .gitignore).
2. In the `portfolio` folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/portfolio.git
   git push -u origin main
   ```
   `node_modules` is already in `.gitignore`, so it won't be uploaded. The `dist/` folder will be uploaded unless you add `dist` to `.gitignore`. That's harmless, but the hosts rebuild it anyway.

---

## 3A. Vercel (recommended)

1. Go to <https://vercel.com> and sign up with GitHub (free "Hobby" plan).
2. Click **Add New → Project** and import your `portfolio` repo.
3. Vercel detects Vite automatically. Confirm these settings:
   | Setting | Value |
   |---|---|
   | Framework Preset | Vite |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm install` |
4. Click **Deploy**. After about a minute you get a live URL like `https://portfolio-yourname.vercel.app`.

Every push to `main` re-deploys automatically.

## 3B. Netlify

1. Go to <https://www.netlify.com> and sign up with GitHub.
2. Click **Add new site → Import an existing project**, choose GitHub, and pick your repo.
3. Settings:
   | Setting | Value |
   |---|---|
   | Build command | `npm run build` |
   | Publish directory | `dist` |
4. Click **Deploy**. You get a URL like `https://yourname.netlify.app`. You can change the name under **Site configuration → Change site name**.

**No-Git alternative:** run `npm run build`, then drag the `dist` folder onto <https://app.netlify.com/drop>. It's live in seconds, but you must repeat it for every update.

## 3C. Cloudflare Pages

1. Go to <https://pages.cloudflare.com> and sign up (free).
2. Click **Create a project → Connect to Git** and pick your repo.
3. Build command `npm run build`, output directory `dist`.
4. Deploy. You get `https://<project>.pages.dev`.

## 3D. GitHub Pages (needs one small extra step)

GitHub Pages serves the site from `https://<username>.github.io/<repo>/`, so the site needs to know that sub-path.

1. In `vite.config.ts`, add a `base` matching your repo name:
   ```ts
   export default defineConfig({
     base: '/portfolio/',   // your repo name, with slashes
     plugins: [react(), tailwindcss()],
     // ...rest unchanged
   })
   ```
   Skip this if your repo is named `<username>.github.io`. In that case leave `base` out.
2. Open `index.html` and `src/data/profile.ts`. They use root-relative paths such as `/images/...`, `/og.png` and `/Priyank_Wadiwala_Resume.pdf`. Vite rewrites the ones in `index.html`, but the ones in `profile.ts` and the components (`/images/...`, the résumé link) will not pick up `base`. Prefix them with `import.meta.env.BASE_URL`, or use Vercel, Netlify or Cloudflare instead.
3. Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   permissions:
     contents: read
     pages: write
     id-token: write
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 22, cache: npm }
         - run: npm ci
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with: { path: dist }
     deploy:
       needs: build
       runs-on: ubuntu-latest
       environment: { name: github-pages, url: '${{ steps.deployment.outputs.page_url }}' }
       steps:
         - id: deployment
           uses: actions/deploy-pages@v4
   ```
4. In the repo on GitHub, go to **Settings → Pages → Source** and choose **GitHub Actions**. Push to `main` and the site goes live at `https://<username>.github.io/<repo>/`.

---

## 4. After it's live

1. **Fix the social-share links.** In `index.html`, change `og:image`, `twitter:image` and the JSON-LD `image` from relative paths (`/og.png`) to absolute URLs (`https://your-site.vercel.app/og.png`). Without this, LinkedIn and WhatsApp previews may show no image. Commit and push.
2. **Refresh the share image.** `public/og.png` is the 1200×630 card used for link previews. It still shows the old photo and the old serif font, so it needs regenerating to match the new look.
3. **Test the checklist:**
   - Open the URL on your phone and on desktop.
   - Click the résumé download.
   - Check the email, LinkedIn and GitHub links.
   - Paste the link into LinkedIn or WhatsApp and look at the preview.
4. **Custom domain (optional, not free).** All hosts above let you attach a domain you buy (about ₹700–1000/year) under their **Domains** settings. They give you the DNS records to add and provide HTTPS for free.

---

## 5. Updating the site later

```bash
# edit files, then:
npm run build          # make sure it still builds
git add .
git commit -m "Update résumé / projects"
git push
```

The host rebuilds and publishes automatically within about a minute.

## Troubleshooting

| Problem | Fix |
|---|---|
| Build fails on the host but works locally | Check the host's Node version is 20 or newer (set `NODE_VERSION=22` in Netlify or Vercel environment settings). |
| Blank page on GitHub Pages | The `base` in `vite.config.ts` doesn't match the repo name. |
| Images or résumé 404 on GitHub Pages | Root-relative paths ignore `base`. See step 3D.2. |
| Résumé shows the old version | Hard-refresh (Ctrl+Shift+R). Browsers cache PDFs. |
| 3D orb missing | The site falls back to a CSS orb if WebGL is unavailable. Try another browser or enable hardware acceleration. |
| `npm run build` shows a chunk-size warning | It's only a warning. The 3D library is large by nature, and the site still deploys fine. |
