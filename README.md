# Priyank Wadiwala — Portfolio

React + TypeScript + Vite with one hand-written stylesheet. No animation or 3D libraries: motion is plain CSS plus a small IntersectionObserver hook, so the page stays fast on phones.

```bash
npm install
npm run dev       # local dev
npm run build     # production build in dist/
npm run preview   # serve dist/ locally
```

## Edit content
All copy lives in `src/data/profile.ts` (contact details, about text, skills, experience, projects, education).
Colours and fonts are tokens at the top of `src/styles.css` (light and dark).

## Deploy
Step-by-step free hosting guide (Vercel, Netlify, Cloudflare Pages, GitHub Pages): see [DEPLOY.md](DEPLOY.md).

## Before you deploy
- `public/Priyank_Wadiwala_Resume.pdf` is the résumé the site serves. Replace it if you update your résumé.
- Set absolute URLs for `og:image` / `twitter:image` in `index.html` once you have a domain, and regenerate `public/og.png` (it still shows the old photo and font).
- No project has a public repo or live demo link, so none are shown. Add a `links` field and render it in `src/sections/Projects.tsx` when you have them.

## Design notes
- Paper-white "spec sheet" look: Bricolage Grotesque for display, Geist for body, Geist Mono for labels.
- One accent, a highlighter green (`--hl`), only ever used as a fill behind dark text.
- Mobile-first CSS. Breakpoints at 700px (hero), 760px / 860px / 900px (section layouts). Checked at 320px, 375px, 768px and 1366px.
- `prefers-reduced-motion` turns off every animation; `prefers-color-scheme: dark` swaps the tokens.
