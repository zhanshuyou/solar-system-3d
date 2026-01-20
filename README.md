# Solar System 3D

An interactive 3D experience of the solar system built with modern web technologies.

## Overview

This project renders a scientifically inspired (though artistically stylized) representation of our solar system. Users can explore planets, view their orbits, and focus on specific celestial bodies to learn more.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **3D Engine:** [Babylon.js 8.x](https://www.babylonjs.com/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Testing:** [Playwright](https://playwright.dev/)

## Features

- 🌌 **Interactive 3D Scene:** Pan, zoom, and rotate freely around the solar system.
- 🪐 **Real-time Orbits:** Planets orbit the Sun and rotate on their axes with relative speeds.
- 🔭 **Focus Mode:** Click on any planet or use the UI menu to smooth-zoom and focus on a specific target.
- 🎨 **PBR Materials:** Physically Based Rendering for realistic lighting and surface textures.
- 📱 **Responsive Design:** Seamless experience across different screen sizes.

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd solar-system-3d
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: React components, including the 3D Scene wrapper.
- `lib/`: Core game logic, planet data, and Babylon.js scene setup.
- `public/textures/`: Assets for planetary surfaces.

## License

This project is open source and available under the [MIT License](LICENSE).