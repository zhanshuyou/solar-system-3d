import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.join(__dirname, 'public/textures');

test('bake textures', async ({ page }) => {
  test.setTimeout(120000);
  
  // Define planet styles
  const planets = [
    { name: 'mercury', color1: '#8c8c8c', color2: '#5e5e5e', type: 'rocky' },
    { name: 'venus', color1: '#e3bb76', color2: '#c29c5e', type: 'cloudy' },
    { name: 'earth', color1: '#1a4485', color2: '#2f6a32', type: 'earth' },
    { name: 'mars', color1: '#dd4c3a', color2: '#8c3126', type: 'rocky' },
    { name: 'jupiter', color1: '#d9a066', color2: '#a67d52', type: 'banded' },
    { name: 'saturn', color1: '#ead6b8', color2: '#c9b392', type: 'banded' },
    { name: 'uranus', color1: '#d1f2f8', color2: '#93dbe8', type: 'cloudy' },
    { name: 'neptune', color1: '#4b70dd', color2: '#2a4596', type: 'cloudy' },
    { name: 'sun', color1: '#fdb813', color2: '#f05e23', type: 'star' }
  ];

  for (const p of planets) {
      console.log(`Generating texture for ${p.name}...`);
      
      const dataUrl = await page.evaluate(async (planet) => {
          const size = 1024;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return null;

          // Fill Background
          ctx.fillStyle = planet.color1;
          ctx.fillRect(0, 0, size, size);

          // Noise Helper
          function noise(x, y) {
              const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
              return s - Math.floor(s);
          }

          if (planet.type === 'rocky') {
              // Simple noise craters
              for (let i = 0; i < 5000; i++) {
                  const x = Math.random() * size;
                  const y = Math.random() * size;
                  const r = Math.random() * 5 + 1;
                  ctx.fillStyle = Math.random() > 0.5 ? planet.color2 : '#00000022';
                  ctx.beginPath();
                  ctx.arc(x, y, r, 0, Math.PI * 2);
                  ctx.fill();
              }
          } else if (planet.type === 'banded') {
              // Horizontal bands
              for (let y = 0; y < size; y++) {
                   const n = Math.sin(y * 0.05) * 0.5 + 0.5; // Sine waves
                   const noiseVal = Math.random() * 0.2;
                   if (n + noiseVal > 0.5) {
                       ctx.fillStyle = planet.color2 + '44'; // Hex with alpha
                       ctx.fillRect(0, y, size, 1);
                   }
              }
              // Storms (Jupiter)
              if (planet.name === 'jupiter') {
                   ctx.fillStyle = '#8c3126';
                   ctx.beginPath();
                   ctx.ellipse(size * 0.7, size * 0.6, 60, 40, 0, 0, Math.PI * 2);
                   ctx.fill();
              }
          } else if (planet.type === 'cloudy') {
              // Cloud patches
               for (let i = 0; i < 500; i++) {
                  const x = Math.random() * size;
                  const y = Math.random() * size;
                  const w = Math.random() * 100 + 50;
                  const h = Math.random() * 30 + 20;
                  ctx.fillStyle = planet.color2 + '33';
                  ctx.fillRect(x, y, w, h);
               }
          } else if (planet.type === 'earth') {
              // Continents (approximated by green blobs)
               ctx.fillStyle = planet.color2;
               for (let i = 0; i < 30; i++) {
                  const x = Math.random() * size;
                  const y = Math.random() * size;
                  const r = Math.random() * 100 + 50;
                  ctx.beginPath();
                  ctx.arc(x, y, r, 0, Math.PI * 2);
                  ctx.fill();
               }
               // Clouds
               ctx.fillStyle = '#ffffff44';
               for (let i = 0; i < 200; i++) {
                   const x = Math.random() * size;
                   const y = Math.random() * size;
                   ctx.fillRect(x, y, 60, 20);
               }
          } else if (planet.type === 'star') {
              // Sun Surface
               for (let i = 0; i < 10000; i++) {
                   const x = Math.random() * size;
                   const y = Math.random() * size;
                   ctx.fillStyle = Math.random() > 0.5 ? planet.color2 : '#ffffff22';
                   ctx.fillRect(x, y, 4, 4);
               }
          }
          
          // Equirectangular distortion check? 
          // Not needed for simple procedural art, it maps fine enough for a toy model.

          return canvas.toDataURL('image/jpeg', 0.9);
      }, p);

      if (dataUrl) {
          const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');
          fs.writeFileSync(path.join(OUT_DIR, `2k_${p.name}.jpg`), buffer);
      }
  }
  
  // Saturn Ring (PNG)
  console.log('Generating Saturn Ring...');
  const ringDataUrl = await page.evaluate(async () => {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      const cx = size / 2;
      const cy = size / 2;
      
      // Draw concentric circles
      for (let r = 200; r < 500; r+=2) {
          const alpha = (Math.sin(r * 0.1) * 0.5 + 0.5).toFixed(2);
          ctx.strokeStyle = `rgba(200, 180, 150, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
      }
      
      return canvas.toDataURL('image/png');
  });
  
  if (ringDataUrl) {
      const buffer = Buffer.from(ringDataUrl.split(',')[1], 'base64');
      fs.writeFileSync(path.join(OUT_DIR, `2k_saturn_ring_alpha.png`), buffer);
  }
});
