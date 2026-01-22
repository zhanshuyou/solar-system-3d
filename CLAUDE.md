# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Build for production
npm run lint     # Run ESLint

# Run Playwright tests (requires dev server running)
npx playwright test test-render.spec.ts
```

## Architecture

This is a Next.js 16 (App Router) application using Babylon.js for 3D rendering of an interactive solar system.

### Core Pattern: React-Babylon.js Bridge

The project uses a `SceneComponent` pattern to integrate Babylon.js with React:

1. **`components/SceneComponent.tsx`** - Reusable wrapper that manages the Babylon.js `Engine` and `Scene` lifecycle, canvas resizing, and render loop. React handles DOM; Babylon.js handles WebGL rendering internally.

2. **`app/page.tsx`** - Main entry point. Sets up the `ArcRotateCamera`, initializes the solar system via `createSolarSystem()`, and manages selection state. Selection changes trigger camera movement and mesh visibility updates via `useEffect`.

3. **`lib/solarSystem.ts`** - Core 3D logic. Creates all meshes (Sun, planets, Saturn's rings, starfield), sets up PBR materials, orbital trails, lighting, shadows, and the animation loop via `scene.onBeforeRenderObservable`.

4. **`lib/planetData.ts`** - Configuration data for planets (radius, distance, orbital period, rotation speed, texture URLs).

### Key Implementation Details

- Planets orbit the Sun using angle-based position updates in the render loop
- Camera targeting uses `camera.setTarget(mesh)` for smooth focus transitions
- Mesh visibility controlled via `mesh.setEnabled()` and `mesh.isVisible` when focusing on planets
- Saturn's rings are a child mesh of Saturn, using alpha texture for the ring hole
- Starfield uses `SolidParticleSystem` with 3000 sphere particles
- PBR materials for planets, StandardMaterial for Sun (emissive) and rings

### Texture Assets

Planet textures are in `public/textures/` with naming convention `2k_<planet>.jpg`.
