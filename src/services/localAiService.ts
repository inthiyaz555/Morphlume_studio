/**
 * Local AI Service
 * Implements image transformation and processing locally using Canvas API and algorithms.
 * This provides unlimited, free, and private processing.
 */

export async function localToonify(base64Image: string, styleId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 0. Pre-processing: Smoothing (Simple Box Blur to reduce noise for better posterization)
      const smoothData = new Uint8ClampedArray(data);
      const radius = 1;
      for (let y = radius; y < canvas.height - radius; y++) {
        for (let x = radius; x < canvas.width - radius; x++) {
          let r = 0, g = 0, b = 0;
          let count = 0;
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const ni = ((y + dy) * canvas.width + (x + dx)) * 4;
              r += smoothData[ni];
              g += smoothData[ni + 1];
              b += smoothData[ni + 2];
              count++;
            }
          }
          const i = (y * canvas.width + x) * 4;
          data[i] = r / count;
          data[i + 1] = g / count;
          data[i + 2] = b / count;
        }
      }

      // Style Parameters
      let posterizeLevels = 6;
      let edgeThreshold = 40;
      let edgeThickness = 1;
      let saturationBoost = 0.2;
      let showEdges = true;
      let isGrayscale = false;
      let isNeon = false;
      let isPixelated = false;
      let pixelSize = 8;
      let colorShift: [number, number, number] = [0, 0, 0]; // R, G, B boost

      switch (styleId) {
        case 'bold-comic':
          posterizeLevels = 3;
          edgeThreshold = 30;
          edgeThickness = 2;
          saturationBoost = 0.4;
          break;
        case 'pencil-sketch':
          isGrayscale = true;
          edgeThreshold = 20;
          posterizeLevels = 255;
          saturationBoost = 0;
          break;
        case 'soft-pastel':
          showEdges = false;
          posterizeLevels = 8;
          saturationBoost = -0.1;
          break;
        case 'neon-pop':
          isNeon = true;
          posterizeLevels = 4;
          saturationBoost = 0.8;
          edgeThreshold = 50;
          break;
        case 'retro-8bit':
          isPixelated = true;
          pixelSize = 10;
          posterizeLevels = 4;
          saturationBoost = 0.3;
          break;
        case 'ink-wash':
          isGrayscale = true;
          edgeThreshold = 60;
          posterizeLevels = 4;
          saturationBoost = 0;
          break;
        case 'pop-art':
          posterizeLevels = 2;
          saturationBoost = 1.0;
          edgeThreshold = 100;
          break;
        case 'vaporwave':
          saturationBoost = 0.6;
          colorShift = [40, -20, 60]; // Pinkish/Purple tint
          posterizeLevels = 10;
          break;
        case 'charcoal':
          isGrayscale = true;
          edgeThreshold = 15;
          posterizeLevels = 3;
          saturationBoost = 0;
          break;
        case 'animegan':
          posterizeLevels = 10;
          edgeThreshold = 30;
          saturationBoost = 0.6;
          // AnimeGAN often has a slight warm/cinematic tint
          colorShift = [10, 5, -5];
          break;
        case 'anime-style':
          posterizeLevels = 8;
          edgeThreshold = 35;
          saturationBoost = 0.5;
          break;
        case '3d-render':
          posterizeLevels = 12;
          showEdges = false;
          saturationBoost = 0.3;
          break;
        case 'cyberpunk':
          isNeon = true;
          saturationBoost = 0.9;
          colorShift = [20, -30, 50];
          edgeThreshold = 40;
          break;
        case 'oil-painting':
          posterizeLevels = 4;
          showEdges = false;
          saturationBoost = 0.1;
          break;
        case 'watercolor':
          posterizeLevels = 10;
          showEdges = false;
          saturationBoost = -0.2;
          break;
        case 'claymation':
          posterizeLevels = 5;
          edgeThreshold = 60;
          saturationBoost = 0.4;
          break;
        case 'graffiti':
          posterizeLevels = 3;
          edgeThreshold = 20;
          edgeThickness = 3;
          saturationBoost = 0.7;
          break;
        case 'manga-style':
          isGrayscale = true;
          posterizeLevels = 2;
          edgeThreshold = 30;
          break;
        case 'superhero-comic':
          posterizeLevels = 4;
          edgeThreshold = 20;
          saturationBoost = 0.8;
          break;
        case 'disney-classic':
          posterizeLevels = 10;
          showEdges = true;
          edgeThreshold = 80;
          saturationBoost = 0.2;
          break;
        case 'pixel-cartoon':
          isPixelated = true;
          pixelSize = 6;
          posterizeLevels = 5;
          saturationBoost = 0.5;
          break;
        case 'classic-toon':
        default:
          posterizeLevels = 6;
          edgeThreshold = 40;
          saturationBoost = 0.2;
          break;
      }

      // 0. Pixelation (Optional)
      if (isPixelated) {
        for (let y = 0; y < canvas.height; y += pixelSize) {
          for (let x = 0; x < canvas.width; x += pixelSize) {
            const i = (y * canvas.width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            for (let py = 0; py < pixelSize && y + py < canvas.height; py++) {
              for (let px = 0; px < pixelSize && x + px < canvas.width; px++) {
                const pi = ((y + py) * canvas.width + (x + px)) * 4;
                data[pi] = r;
                data[pi + 1] = g;
                data[pi + 2] = b;
                data[pi + 3] = a;
              }
            }
          }
        }
      }

      // 1. Color Processing
      const step = 255 / (posterizeLevels - 1);

      for (let i = 0; i < data.length; i += 4) {
        if (isGrayscale) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = data[i + 1] = data[i + 2] = avg;
          
          // Posterize grayscale for charcoal/ink
          if (posterizeLevels < 255) {
            data[i] = data[i + 1] = data[i + 2] = Math.round(avg / step) * step;
          }
        } else {
          // Color Shift
          data[i] = Math.max(0, Math.min(255, data[i] + colorShift[0]));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + colorShift[1]));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + colorShift[2]));

          // Posterize
          data[i] = Math.round(data[i] / step) * step;
          data[i + 1] = Math.round(data[i + 1] / step) * step;
          data[i + 2] = Math.round(data[i + 2] / step) * step;

          // Saturation
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const avg = (r + g + b) / 3;
          data[i] = Math.max(0, Math.min(255, r + (r - avg) * saturationBoost));
          data[i + 1] = Math.max(0, Math.min(255, g + (g - avg) * saturationBoost));
          data[i + 2] = Math.max(0, Math.min(255, b + (b - avg) * saturationBoost));
        }
      }

      // 2. Edge Detection
      if (showEdges || isNeon) {
        const grayData = new Uint8ClampedArray(data.length / 4);
        for (let i = 0; i < data.length; i += 4) {
          grayData[i / 4] = (data[i] + data[i + 1] + data[i + 2]) / 3;
        }

        const edges = new Uint8ClampedArray(grayData.length);
        const w = canvas.width;
        const h = canvas.height;

        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            const gx = -grayData[idx - w - 1] + grayData[idx - w + 1] 
                       -2 * grayData[idx - 1] + 2 * grayData[idx + 1]
                       -grayData[idx + w - 1] + grayData[idx + w + 1];
            const gy = -grayData[idx - w - 1] - 2 * grayData[idx - w] - grayData[idx - w + 1]
                       +grayData[idx + w - 1] + 2 * grayData[idx + w] + grayData[idx + w + 1];
            const mag = Math.sqrt(gx * gx + gy * gy);
            edges[idx] = mag > edgeThreshold ? 0 : 255;
          }
        }

        // Apply Edges
        for (let i = 0; i < data.length; i += 4) {
          const edgeVal = edges[i / 4];
          if (edgeVal === 0) {
            if (isNeon) {
              // Glowing edges
              data[i] = Math.min(255, data[i] + 100);
              data[i + 1] = Math.min(255, data[i + 1] + 100);
              data[i + 2] = Math.min(255, data[i + 2] + 100);
            } else if (isGrayscale) {
              data[i] = data[i + 1] = data[i + 2] = 0;
            } else {
              data[i] = data[i + 1] = data[i + 2] = 0;
            }
          } else if (isGrayscale && styleId === 'pencil-sketch') {
            data[i] = data[i + 1] = data[i + 2] = 255; // White background for sketch
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = base64Image;
  });
}

export async function localRemoveBackground(base64Image: string): Promise<string> {
  // Local background removal using a simple color-distance algorithm 
  // (Assuming the background is relatively uniform or using a basic saliency heuristic)
  // For a "Real" AI local model, we'd use Transformers.js, but for speed we'll use a smart contouring approach.
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("No context"));
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Simple "Green Screen" or "Corner Sample" background removal
      // Sample the corners to guess background color
      const corners = [
        [data[0], data[1], data[2]],
        [data[(canvas.width - 1) * 4], data[(canvas.width - 1) * 4 + 1], data[(canvas.width - 1) * 4 + 2]],
      ];
      const bgR = (corners[0][0] + corners[1][0]) / 2;
      const bgG = (corners[0][1] + corners[1][1]) / 2;
      const bgB = (corners[0][2] + corners[1][2]) / 2;
      
      const threshold = 50;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const dist = Math.sqrt(
          Math.pow(r - bgR, 2) + 
          Math.pow(g - bgG, 2) + 
          Math.pow(b - bgB, 2)
        );
        
        if (dist < threshold) {
          data[i + 3] = 0; // Make transparent
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = base64Image;
  });
}
