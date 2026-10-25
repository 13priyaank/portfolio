# Priyank Wadiwala — Portfolio

React + TypeScript + Vite. A raw three.js particle field (20k points, 9k on phones) morphs into a new shape for each section, GSAP + ScrollTrigger drive the scroll choreography with Lenis smooth scroll, and every sound is synthesised live with the Web Audio API (no audio files).

```bash
npm install
npm run dev       # local dev
npm run build     # production build in dist/
npm run preview   # serve dist/ locally
```

## Edit content
All copy lives in `src/data/profile.ts` (contact details, about text, skills, experience, projects, education).
Colours and fonts are tokens at the top of `src/styles.css`.

## Deploy
Step-by-step free hosting guide (Vercel, Netlify, Cloudflare Pages, GitHub Pages): see [DEPLOY.md](DEPLOY.md).

## Before you deploy
- `public/Priyank_Wadiwala_Resume.pdf` is the résumé the site serves. Replace it if you update your résumé.
- Set absolute URLs for `og:image` / `twitter:image` in `index.html` once you have a domain. `public/og.png` is the 1200×630 link-preview card and matches the current design.
- No project has a public repo or live demo link, so none are shown. Add a `links` field and render it in `src/sections/Projects.tsx` when you have them.

## How it fits together
- `src/three/shapes.ts`: the six point clouds (sphere, DNA helix, lattice, torus knot, ringed planet, galaxy), one per section.
- `src/three/ParticleField.ts`: the WebGL scene. A vertex shader blends between shapes with a staggered burst, pushes particles away from the pointer, and plays a shockwave on click. Loaded as its own chunk.
- `src/three/stage.ts`: shared state. `App.tsx` writes the scroll position (summed ScrollTrigger progress) and pointer into it; the scene reads it every frame.
- `src/lib/sound.ts`: ambient pad that changes chord per section, whooshes on morphs, ticks on hover, plucks on click. Off until the visitor chooses "Enter with sound" (browsers require a click before audio).
- Projects are a pinned horizontal gallery on screens 900px and wider; a normal vertical list on phones.
- `prefers-reduced-motion`: no smooth scroll, no pinning, no text animations; the particles still change shape but without drifting.
