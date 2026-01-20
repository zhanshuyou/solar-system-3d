import { test, expect } from '@playwright/test';

test('analyze center pixel color', async ({ page }) => {
  test.setTimeout(60000); // 60s timeout
  console.log('Navigating...');
  try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  } catch (e) {
      console.log('Navigation error/timeout, but checking canvas anyway');
  }

  console.log('Waiting for canvas...');
  await page.waitForSelector('canvas', { state: 'attached' });
  
  console.log('Waiting for render (5s)...');
  await page.waitForTimeout(5000); 

  const color = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return 'No Canvas';
    
    // We need to ensure we are reading from the webgl context
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return 'No WebGL';
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Read pixel at center (Sun/Planet)
    const pixels = new Uint8Array(4);
    // Use drawingBufferWidth/Height to be safe
    const x = Math.floor(gl.drawingBufferWidth / 2);
    const y = Math.floor(gl.drawingBufferHeight / 2);
    
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    
    return `R:${pixels[0]}, G:${pixels[1]}, B:${pixels[2]}, A:${pixels[3]}`;
  });

  console.log(`Center Pixel Color: ${color}`);
});
