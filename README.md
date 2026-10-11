# Priyank Wadiwala — Portfolio

React + TypeScript + Vite + Tailwind v4. 3D with Three.js (React Three Fiber), scroll motion with GSAP + ScrollTrigger (smooth scroll via Lenis), UI sounds synthesized with the Web Audio API (no audio files).

```bash
npm install
npm run dev       # local dev
npm run build     # production build in dist/
npm run preview   # serve dist/ locally
```

## Edit content
All copy lives in `src/data/profile.ts` (contact details, about text, skills, experience, projects, education).
Colours and fonts are tokens at the top of `src/index.css`.

## Deploy
Step-by-step free hosting guide (Vercel, Netlify, Cloudflare Pages, GitHub Pages): see [DEPLOY.md](DEPLOY.md).

## Before you deploy
- `public/Priyank_Wadiwala_Resume.pdf` is the résumé the site serves. Replace it if you update your résumé.
- Set absolute URLs for `og:image` / `twitter:image` in `index.html` once you have a domain, and regenerate `public/og.png` (it still shows the old photo and font).
- No project has a public repo or live demo link, so none are shown. Add a `links` field and render it in `src/sections/Projects.tsx` when you have them.

## Architecture notes
- One animation system per job: GSAP drives scroll reveals and the 3D "pose" the orb moves between; R3F only renders. No Framer Motion.
- `src/lib/stage.ts` is the shared state the 3D scene reads each frame.
- Three.js is a separate lazy chunk. If WebGL is missing or the context is lost, a CSS fallback renders instead.
- `prefers-reduced-motion`: no smooth scroll, no entrance animation, no cursor effects; the 3D frame is rendered on demand.
- Sound is OFF by default; the AudioContext is created only when the visitor clicks the toggle.
