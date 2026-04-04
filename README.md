# Naman Sharma — Cinematic Portfolio

An immersive, scroll-driven portfolio experience built with React, Three.js, Framer Motion, and GSAP. The interface is designed to feel like navigating a cinematic world rather than reading a traditional résumé — each section is a distinct "scene" with its own visual identity and narrative beat.

---

## Features

- **Scroll-driven camera** — scrolling moves through a live 3D scene rendered with Three.js
- **Cinematic cursor** — custom magnetic cursor that responds to interactive elements and the current scene phase
- **Framer Motion reveal animations** — every content block enters with a smooth, spring-driven transition
- **GSAP hero sequence** — the opening panel animates in with a precisely timed staggered timeline
- **Expandable mission cards** — project cards reveal problem / approach / impact detail inline with animated height transitions
- **Responsive & accessible** — compact layout for touch / small screens, full support for `prefers-reduced-motion`
- **Journey navigation** — fixed side-nav lets visitors jump between the six sections

---

## Sections

| # | ID | Label |
|---|-----|-------|
| 01 | `intro` | Arrival — hero landing with identity statement |
| 02 | `about` | Journey — story beats and core philosophy |
| 03 | `skills` | Systems — skill clusters (Languages, Frameworks, ML/AI, Systems) |
| 04 | `projects` | Missions — three project deep-dives (Brain Tumor Detection, DivNey, Thinkistry) |
| 05 | `experience` | Impact — timeline of key experiences |
| 06 | `contact` | Transmission — links and contact details |

---

## Tech Stack

| Concern | Library / Tool |
|---------|----------------|
| UI framework | [React 19](https://react.dev/) |
| 3D rendering | [Three.js](https://threejs.org/) |
| Animation (declarative) | [Framer Motion](https://www.framer.com/motion/) |
| Animation (imperative) | [GSAP](https://gsap.com/) |
| Build tool | [Vite](https://vitejs.dev/) |
| Fonts | Manrope, Space Grotesk (Google Fonts) |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

The app is served at `http://localhost:5173` by default.

### Build for production

```bash
npm run build
```

Output is written to `dist/`.

### Preview the production build

```bash
npm run preview
```

---

## Project Structure

```
Portfolio/
├── index.html              # HTML shell
├── vite.config.js          # Vite configuration
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Root component — layout, sections, state
│   ├── styles.css          # Global styles and design tokens
│   ├── components/
│   │   ├── SceneCanvas.jsx # Three.js 3D background (lazy-loaded)
│   │   └── CinematicCursor.jsx  # Custom cursor overlay
│   └── data/
│       └── content.js      # All site content (sections, projects, skills, timeline, contacts)
```

---

## Customisation

All visible content lives in **`src/data/content.js`**. Update the exported arrays to change sections, projects, skill clusters, timeline entries, and contact links without touching any component code.
