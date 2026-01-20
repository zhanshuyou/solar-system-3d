# Solar System 3D

## Overview
It is a modern web application built with **Next.js** and **Babylon.js**, offering an interactive 3D experience of the solar system.

## Tech Stack
*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript
*   **3D Engine:** Babylon.js 8.x (`@babylonjs/core`)
*   **Styling:** Tailwind CSS v4
*   **Testing:** Playwright

## Project Structure (`solar-system-3d/`)

*   **`app/`**: Next.js App Router directory.
    *   `page.tsx`: Main entry point. Manages the 3D scene initialization, camera logic, UI overlay, and user interactions (selection/focus).
    *   `layout.tsx`: Root layout configuration.
    *   `globals.css`: Global styles (Tailwind v4 imports).
*   **`components/`**: React components.
    *   `SceneComponent.tsx`: A reusable wrapper for the Babylon.js `Engine` and `Scene`, handling the render loop and canvas resizing.
*   **`lib/`**: Game logic and data.
    *   `solarSystem.ts`: Core 3D logic. Creates meshes (Sun, Planets, Stars), materials (PBR/Standard), orbits, and handles the animation loop.
    *   `planetData.ts`: Configuration data for planets (radius, distance, speed, textures).
*   **`public/textures/`**: Assets for 3D textures (planets, sun, rings).

## Key Features
*   **Interactive 3D Scene:** Users can pan, zoom, and rotate around the solar system using `ArcRotateCamera`.
*   **Real-time Animation:** Planets orbit the sun and rotate on their axes based on orbital periods.
*   **Focus Mode:** Clicking a planet (in 3D or via the UI list) smoothly moves the camera to focus on it and updates the visibility of other objects to reduce clutter.
*   **PBR Materials:** Uses Physically Based Rendering for realistic planet surfaces.
*   **Visual Effects:** Includes a glow layer for the sun, Saturn's rings with transparency, and a starfield background.

## Getting Started

### Prerequisites
*   Node.js (v20+ recommended)
*   npm / yarn / pnpm / bun

### Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server at `http://localhost:3000`. |
| `npm run build` | Builds the application for production. |
| `npm run start` | Starts the production server. |
| `npm run lint` | Runs ESLint. |

## Development Conventions

*   **Babylon.js in React:** The project uses a `SceneComponent` pattern to bridge React and Babylon.js. React handles the canvas lifecycle, while Babylon.js handles the internal render loop.
*   **State Management:** React state (`useState`) controls the "Active Planet" selection, which triggers side effects in the 3D scene (camera movement, visibility) via `useEffect`.
*   **Responsiveness:** The canvas resizes automatically with the window.
*   **Textures:** High-resolution textures are loaded from the `public/textures/` directory.

## Testing
*   **Playwright:** E2E tests are configured for rendering and texture generation.
*   **Spec files:** 
    *   `test-render.spec.ts`: Tests the 3D scene rendering.
    *   `generate-textures.spec.ts`: Utilities for texture handling.