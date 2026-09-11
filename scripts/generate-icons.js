import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

const bgColor = '#EADBD9'; // The exact uploaded dusty rose / warm blush background color
const mainColor = '#4A2810'; // Rich dark cocoa brand color
const starColor = '#5C3317'; // Rich star accent color

const LOGO_PATHS = {
  b: "M60.86 80L40.98 80L40.98 78.75L60.18 78.75Q62.94 78.75 65.27 77.30Q67.61 75.84 69.02 73.10Q70.42 70.37 70.42 66.56Q70.42 62.75 69.02 60.42Q67.61 58.08 65.27 57.02Q62.94 55.97 60.18 55.97L52.50 55.97L52.50 55.17L60.86 55.17Q65.37 55.17 69.14 56.29Q72.92 57.41 75.19 59.90Q77.46 62.40 77.46 66.56Q77.46 73.76 73.03 76.88Q68.60 80 60.86 80M52.86 79.52L46.74 79.52L46.74 32.48L52.86 32.48L52.86 79.52M59.54 55.55L52.50 55.55L52.50 54.72L59.54 54.72Q61.98 54.72 64.18 53.76Q66.39 52.80 67.78 50.56Q69.18 48.32 69.18 44.51Q69.18 40.70 67.78 38.21Q66.39 35.71 64.18 34.48Q61.98 33.25 59.54 33.25L40.98 33.25L40.98 32L59.54 32Q66.81 32 71.18 34.80Q75.54 37.60 75.54 43.84Q75.54 50.05 71.42 52.80Q67.29 55.55 59.54 55.55",
  o: "M148.03 80.64Q143.17 80.64 139.36 78.74Q135.55 76.83 132.91 73.44Q130.27 70.05 128.91 65.58Q127.55 61.12 127.55 56Q127.55 50.88 129.01 46.42Q130.46 41.95 133.15 38.56Q135.84 35.17 139.62 33.26Q143.39 31.36 148.03 31.36Q152.67 31.36 156.43 33.26Q160.19 35.17 162.90 38.56Q165.60 41.95 167.04 46.42Q168.48 50.88 168.48 56Q168.48 61.12 167.12 65.58Q165.76 70.05 163.14 73.44Q160.51 76.83 156.70 78.74Q152.90 80.64 148.03 80.64M148.03 79.49Q152.22 79.49 154.80 77.49Q157.38 75.49 158.77 72.11Q160.16 68.74 160.66 64.54Q161.15 60.35 161.15 56Q161.15 51.65 160.56 47.46Q159.97 43.26 158.53 39.89Q157.09 36.51 154.53 34.51Q151.97 32.51 148.03 32.51Q144.10 32.51 141.54 34.51Q138.98 36.51 137.52 39.89Q136.06 43.26 135.47 47.46Q134.88 51.65 134.88 56Q134.88 60.35 135.39 64.54Q135.90 68.74 137.28 72.11Q138.66 75.49 141.26 77.49Q143.87 79.49 148.03 79.49",
  k: "M178.02 66.11L176.19 66.11L200.58 33.25L193.66 33.25L193.66 32L209.02 32L209.02 33.25L202.40 33.25L178.02 66.11M188.22 80L169.98 80L169.98 78.75L175.74 78.75L175.74 20.25L169.98 20.25L169.98 19L188.22 19L188.22 20.25L181.86 20.25L181.86 78.75L188.22 78.75L188.22 80M211.90 80L192.06 80L192.06 78.75L198.53 78.75L185.06 54.85L189.02 49.89L206.18 78.75L211.90 78.75",
  s: "M231.84 80.93Q227.71 80.93 224.70 79.65Q221.70 78.37 219.68 76.13L216.70 80.64L215.62 80.64L215.62 67.49L216.86 67.49Q217.38 70.11 218.50 72.32Q219.62 74.53 221.39 76.16Q223.17 77.79 225.62 78.70Q228.06 79.62 231.26 79.62Q234.66 79.62 237.14 78.46Q239.62 77.31 240.96 75.12Q242.30 72.93 242.30 69.76Q242.30 66.94 240.93 65.01Q239.55 63.07 237.26 61.65Q234.98 60.22 232.26 59.02Q229.54 57.82 226.82 56.51Q224.10 55.20 221.81 53.46Q219.52 51.71 218.14 49.23Q216.77 46.75 216.77 43.20Q216.77 39.65 218.56 36.99Q220.35 34.34 223.38 32.85Q226.40 31.36 230.05 31.36Q233.22 31.36 235.87 32.37Q238.53 33.38 240.48 35.42L243.46 31.36L244.51 31.36L244.51 44.51L243.30 44.51Q242.66 40.51 240.90 37.90Q239.14 35.30 236.51 34.03Q233.89 32.77 230.66 32.77Q226.08 32.77 223.73 34.93Q221.38 37.09 221.38 40.64Q221.38 43.17 222.74 44.93Q224.10 46.69 226.34 48.02Q228.58 49.34 231.26 50.53Q233.95 51.71 236.64 53.07Q239.33 54.43 241.57 56.29Q243.81 58.14 245.17 60.78Q246.53 63.42 246.53 67.20Q246.53 71.36 244.74 74.45Q242.94 77.54 239.65 79.23Q236.35 80.93 231.84 80.93",
  e: "M129.72 132L102.55 132L102.55 131.03L107.05 131.03L107.05 95.47L102.55 95.47L102.55 94.50L129.22 94.50L129.22 104.75L128.25 104.75Q128.25 102.08 127.49 99.97Q126.72 97.88 124.99 96.67Q123.25 95.47 120.33 95.47L111.83 95.47L111.83 131.03L119.80 131.03Q123.22 131.03 125.17 129.78Q127.13 128.53 127.94 126.22Q128.75 123.92 128.75 120.75L129.72 120.75L129.72 132M120.72 118.08L119.75 118.08Q119.75 116.40 119.11 115.30Q118.47 114.20 117.35 113.65Q116.22 113.10 114.80 113.10L110.63 113.10L110.63 112.13L114.80 112.13Q116.22 112.13 117.35 111.63Q118.47 111.13 119.11 110.08Q119.75 109.03 119.75 107.35L120.72 107.35",
  m: "M162 132.50L160.78 132.50L146.88 94.50L151.68 94.50L163.25 125.78L174.07 94.50L175.13 94.50L162 132.50M142.55 94.50L147.38 94.50L147.38 131.03L151.07 131.03L151.07 132L142.80 132L142.80 131.03L146.35 131.03L146.35 95.47L142.55 95.47L142.55 94.50M174.85 94.50L183.10 94.50L183.10 95.47L179.60 95.47L179.60 131.03L183.10 131.03L183.10 132L170.82 132L170.82 131.03L174.85 131.03"
};

function generateSvg({ width = 512, height = 512, scale = 1.35, maskable = false } = {}) {
  // Center the 286x136 logo inside width x height
  const logoW = 286 * scale;
  const logoH = 136 * scale;
  const offsetX = (width - logoW) / 2;
  const offsetY = (height - logoH) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}" />
  <g transform="translate(${offsetX.toFixed(2)}, ${offsetY.toFixed(2)}) scale(${scale})">
    <!-- Sparkle Stars above K and S -->
    <g fill="${starColor}" transform="rotate(8, 208, 18)">
      <path d="M 208,6 Q 208,18 220,18 Q 208,18 208,30 Q 208,18 196,18 Q 208,18 208,6 Z" />
    </g>
    <g fill="${starColor}" transform="rotate(8, 228, 29)">
      <path d="M 228,21 Q 228,29 236,29 Q 228,29 228,37 Q 228,29 220,29 Q 228,29 228,21 Z" />
    </g>

    <!-- Letter B -->
    <path d="${LOGO_PATHS.b}" fill="${mainColor}" />
    <!-- Horizontal Underline specifically beneath B -->
    <rect x="39" y="84" width="40" height="2.2" rx="0.5" fill="${mainColor}" />

    <!-- First O: with the iconic white square/box inside -->
    <g fill="${mainColor}">
      <path d="${LOGO_PATHS.o}" transform="translate(-45.53, 0)" />
    </g>
    <!-- White square inside the first O matching official brand logo -->
    <rect x="94.5" y="40" width="16" height="32" rx="1.8" fill="#FFFFFF" stroke="${mainColor}" stroke-width="1.8" />

    <!-- Second O -->
    <path d="${LOGO_PATHS.o}" fill="${mainColor}" />

    <!-- Letter K (with custom tall vertical stem and Didone top serif) -->
    <path d="${LOGO_PATHS.k}" fill="${mainColor}" />

    <!-- Letter S -->
    <path d="${LOGO_PATHS.s}" fill="${mainColor}" />

    <!-- EM (Centered horizontally beneath Books) -->
    <path d="${LOGO_PATHS.e}" fill="${mainColor}" />
    <path d="${LOGO_PATHS.m}" fill="${mainColor}" />
  </g>
</svg>`;
}

function generateHeaderBannerSvg(width = 800, height = 320) {
  // Wide banner layout for header / modals
  const scale = 1.9;
  const logoW = 286 * scale;
  const logoH = 136 * scale;
  const offsetX = (width - logoW) / 2;
  const offsetY = (height - logoH) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}" />
  <!-- Subtle decorative frame border -->
  <rect x="12" y="12" width="${width - 24}" height="${height - 24}" rx="16" fill="none" stroke="#DAC5C2" stroke-width="1.5" stroke-dasharray="6 4" />
  <g transform="translate(${offsetX.toFixed(2)}, ${offsetY.toFixed(2)}) scale(${scale})">
    <!-- Sparkle Stars -->
    <g fill="${starColor}" transform="rotate(8, 208, 18)">
      <path d="M 208,6 Q 208,18 220,18 Q 208,18 208,30 Q 208,18 196,18 Q 208,18 208,6 Z" />
    </g>
    <g fill="${starColor}" transform="rotate(8, 228, 29)">
      <path d="M 228,21 Q 228,29 236,29 Q 228,29 228,37 Q 228,29 220,29 Q 228,29 228,21 Z" />
    </g>

    <!-- Letter B -->
    <path d="${LOGO_PATHS.b}" fill="${mainColor}" />
    <rect x="39" y="84" width="40" height="2.2" rx="0.5" fill="${mainColor}" />

    <!-- First O: with the iconic white square/box inside -->
    <g fill="${mainColor}">
      <path d="${LOGO_PATHS.o}" transform="translate(-45.53, 0)" />
    </g>
    <rect x="94.5" y="40" width="16" height="32" rx="1.8" fill="#FFFFFF" stroke="${mainColor}" stroke-width="1.8" />

    <!-- Second O -->
    <path d="${LOGO_PATHS.o}" fill="${mainColor}" />

    <!-- Letter K -->
    <path d="${LOGO_PATHS.k}" fill="${mainColor}" />

    <!-- Letter S -->
    <path d="${LOGO_PATHS.s}" fill="${mainColor}" />

    <!-- EM -->
    <path d="${LOGO_PATHS.e}" fill="${mainColor}" />
    <path d="${LOGO_PATHS.m}" fill="${mainColor}" />
  </g>
</svg>`;
}

function renderPng(svgStr, outPath, width, height) {
  const resvg = new Resvg(svgStr, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`Saved ${outPath} (${width}x${height}, ${pngBuffer.length} bytes)`);
}

async function main() {
  console.log('Generating Books EM PWA icons and logos with white square in O and background', bgColor);

  const targets = [
    // Standard square 512x512
    { svg: generateSvg({ width: 512, height: 512, scale: 1.38 }), file: 'pwa-512x512.png', w: 512, h: 512 },
    // Maskable 512x512 with safe padding
    { svg: generateSvg({ width: 512, height: 512, scale: 1.15, maskable: true }), file: 'pwa-maskable-512x512.png', w: 512, h: 512 },
    // 192x192
    { svg: generateSvg({ width: 192, height: 192, scale: 0.52 }), file: 'pwa-192x192.png', w: 192, h: 192 },
    // Apple touch icon 180x180
    { svg: generateSvg({ width: 180, height: 180, scale: 0.49 }), file: 'apple-touch-icon.png', w: 180, h: 180 },
    // books-em-logo.png
    { svg: generateHeaderBannerSvg(800, 320), file: 'books-em-logo.png', w: 800, h: 320 },
    // books-em-logo.jpg (also saved as png-in-jpg format or converted)
    { svg: generateHeaderBannerSvg(800, 320), file: 'books-em-logo.jpg', w: 800, h: 320 },
  ];

  const publicDir = path.resolve('public');
  const distDir = path.resolve('dist');

  // Also save pure vector SVG as icon.svg
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), generateSvg({ width: 512, height: 512, scale: 1.38 }));
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'icon.svg'), generateSvg({ width: 512, height: 512, scale: 1.38 }));
  }

  for (const t of targets) {
    const pubPath = path.join(publicDir, t.file);
    renderPng(t.svg, pubPath, t.w, t.h);

    if (fs.existsSync(distDir)) {
      const distPath = path.join(distDir, t.file);
      renderPng(t.svg, distPath, t.w, t.h);
    }
  }

  console.log('All icons generated successfully!');
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
