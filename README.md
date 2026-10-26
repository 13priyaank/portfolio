# Priyank Wadiwala — Portfolio

React + TypeScript + Vite. The portfolio is a road trip: a low-poly car (modelled in code with three.js) drives a winding desert road as you scroll, passing an exit sign for each section while the sky goes from morning to night. GSAP + ScrollTrigger + Lenis handle the scroll choreography, and every sound (engine, wind, horn, chimes) is synthesised live with the Web Audio API.

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
- `src/three/world.ts`: the road curve, desert terrain height, and the time-of-day palette (morning, noon, golden hour, sunset, night).
- `src/three/car.ts`: the car, built from shaped boxes and cylinders. `signs.ts` paints the highway signs onto canvas textures.
- `src/three/RoadTrip.ts`: the scene. Scroll position moves the car along the road; each section has its own camera shot; headlights, stars and sign glow come on at night. Click the open road to honk. Loaded as its own chunk.
- `src/three/stage.ts`: shared state. `App.tsx` writes scroll progress and where each section starts; the scene writes back speed and odometer for the dashboard.
- `src/lib/sound.ts`: engine note that follows scroll speed, wind, starter motor, horn, indicator ticks on hover, a chime when you pass an exit. Off until the visitor presses "Start engine" (browsers require a click before audio).
- `src/components/Dashboard.tsx`: speedometer, odometer, next exit and trip strip, updated straight from the animation frame.
- `prefers-reduced-motion`: no smooth scroll and no card animations; the car still follows the scroll.
