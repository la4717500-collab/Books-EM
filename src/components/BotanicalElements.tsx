import React from 'react';

/**
 * Botanical branches and brand elements matching the Books EM aesthetic banner.
 */

interface BranchProps {
  className?: string;
  color?: string;
}

/**
 * Top-left botanical branch cascading downward and to the right,
 * directly matching the branches in the user's store banner.
 */
export const BotanicalBranchTopLeft: React.FC<BranchProps> = ({
  className = 'w-36 h-36',
  color = '#5C3218',
}) => {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Main curved branch stem */}
      <path
        d="M-5 -5 C25 20, 65 50, 125 110"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Secondary side twigs */}
      <path
        d="M35 30 C50 15, 75 18, 90 22"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M60 52 C75 42, 100 48, 115 56"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M85 76 C105 70, 128 78, 142 90"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M48 68 C35 88, 38 112, 45 128"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Stylized oval leaves */}
      {/* Leaf 1 - top twig tip */}
      <path
        d="M90 22 C98 12, 115 14, 118 24 C112 32, 98 30, 90 22 Z"
        fill={color}
      />
      {/* Leaf 2 - top twig side */}
      <path
        d="M72 17 C78 7, 92 8, 95 16 C90 22, 78 22, 72 17 Z"
        fill={color}
      />
      {/* Leaf 3 - second twig tip */}
      <path
        d="M115 56 C126 50, 140 55, 142 66 C134 72, 120 68, 115 56 Z"
        fill={color}
      />
      {/* Leaf 4 - second twig side */}
      <path
        d="M96 46 C104 38, 118 42, 119 50 C112 56, 102 54, 96 46 Z"
        fill={color}
      />
      {/* Leaf 5 - main stem terminal leaf */}
      <path
        d="M125 110 C138 116, 154 126, 155 138 C144 140, 130 130, 125 110 Z"
        fill={color}
      />
      {/* Leaf 6 - third twig */}
      <path
        d="M142 90 C154 88, 165 96, 164 107 C152 110, 142 102, 142 90 Z"
        fill={color}
      />
      {/* Leaf 7 - lower drooping twig tip */}
      <path
        d="M45 128 C42 142, 50 155, 60 154 C64 142, 54 132, 45 128 Z"
        fill={color}
      />
      {/* Leaf 8 - lower drooping twig side */}
      <path
        d="M38 98 C30 108, 32 120, 40 122 C46 115, 45 104, 38 98 Z"
        fill={color}
      />
      {/* Leaf 9 - mid leaf */}
      <path
        d="M72 75 C65 88, 68 100, 78 101 C84 94, 82 82, 72 75 Z"
        fill={color}
      />
    </svg>
  );
};

/**
 * Bottom-left botanical branch sprouting upward,
 * matching the lower left branch seen in the user's banner.
 */
export const BotanicalBranchBottomLeft: React.FC<BranchProps> = ({
  className = 'w-32 h-36',
  color = '#5C3218',
}) => {
  return (
    <svg
      viewBox="0 0 140 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Curved main stem reaching upwards */}
      <path
        d="M-5 165 C20 140, 50 105, 85 45"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Side twig left */}
      <path
        d="M32 128 C20 115, 18 92, 22 75"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Side twig right */}
      <path
        d="M58 92 C74 85, 96 88, 110 96"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Leaves */}
      {/* Top tip leaf */}
      <path
        d="M85 45 C92 30, 106 25, 114 34 C112 46, 98 54, 85 45 Z"
        fill={color}
      />
      {/* Leaf near top left */}
      <path
        d="M75 58 C62 48, 64 34, 74 32 C82 38, 82 50, 75 58 Z"
        fill={color}
      />
      {/* Left twig tip leaf */}
      <path
        d="M22 75 C15 62, 22 48, 32 50 C36 60, 32 72, 22 75 Z"
        fill={color}
      />
      {/* Left twig mid leaf */}
      <path
        d="M26 100 C15 95, 16 82, 25 80 C32 86, 33 96, 26 100 Z"
        fill={color}
      />
      {/* Right twig tip leaf */}
      <path
        d="M110 96 C124 96, 134 105, 132 116 C120 120, 110 110, 110 96 Z"
        fill={color}
      />
      {/* Right twig mid leaf */}
      <path
        d="M88 88 C98 78, 110 82, 112 90 C104 98, 94 95, 88 88 Z"
        fill={color}
      />
    </svg>
  );
};

/**
 * Horizontal botanical branch garland for section headers or cards.
 */
export const BotanicalSprig: React.FC<BranchProps & { flip?: boolean }> = ({
  className = 'w-24 h-8',
  color = '#5C3218',
  flip = false,
}) => {
  return (
    <svg
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${flip ? 'scale-x-[-1]' : ''}`}
      aria-hidden="true"
    >
      <path
        d="M5 28 C35 24, 75 16, 115 12"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M115 12 C120 6, 126 8, 125 14 C120 18, 114 16, 115 12 Z"
        fill={color}
      />
      <path
        d="M95 15 C98 8, 107 9, 108 15 C103 19, 96 18, 95 15 Z"
        fill={color}
      />
      <path
        d="M75 18 C78 10, 88 11, 89 18 C83 23, 76 21, 75 18 Z"
        fill={color}
      />
      <path
        d="M55 21 C57 14, 66 15, 67 22 C61 26, 56 24, 55 21 Z"
        fill={color}
      />
      <path
        d="M35 24 C36 17, 44 19, 45 25 C40 29, 36 27, 35 24 Z"
        fill={color}
      />
      <path
        d="M85 19 C86 26, 94 28, 96 23 C94 18, 86 17, 85 19 Z"
        fill={color}
      />
      <path
        d="M65 22 C65 29, 73 31, 75 25 C72 20, 65 20, 65 22 Z"
        fill={color}
      />
    </svg>
  );
};

/**
 * Elegant botanical line divider with center leaf cluster.
 */
export const BotanicalDivider: React.FC<BranchProps> = ({
  className = 'w-full max-w-md mx-auto my-6',
  color = '#8C5E3C',
}) => {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#CBB4A1] to-[#8C5E3C]" />
      <div className="flex items-center gap-1.5 text-[#5C3218]">
        <span className="text-[10px]">✦</span>
        <svg viewBox="0 0 32 20" fill="currentColor" className="w-6 h-4 text-[#5C3218]">
          <path d="M16 10 C12 4, 6 6, 4 10 C8 12, 14 12, 16 10 Z" />
          <path d="M16 10 C20 4, 26 6, 28 10 C24 12, 18 12, 16 10 Z" />
          <circle cx="16" cy="10" r="1.8" />
        </svg>
        <span className="text-[10px]">✦</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#CBB4A1] to-[#8C5E3C]" />
    </div>
  );
};

/**
 * Little sparkle stars as seen around the "BOOKS" logo in the banner.
 */
export const SparkleStars: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-[#8C5E3C]' }) => {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <span className="text-xs select-none">✦</span>
      <span className="text-[9px] -mt-1 select-none">✧</span>
    </div>
  );
};

/**
 * EXACT BOOKS EM LOGO GLYPH:
 * Stylized Smartphone & O-crescents glyph as seen in the official Books EM logo:
 * - Left crescent arc of the O
 * - Smartphone in the center with rounded corners & screen outline
 * - Right crescent arc of the O
 */
export const PhoneGlyph: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-5 h-7',
  color = 'currentColor',
}) => {
  return (
    <svg
      viewBox="0 0 32 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Left crescent arc of O */}
      <path
        d="M 8.5 2.5 C 1.8 11, 1.8 29, 8.5 37.5 C 5.2 28, 5.2 12, 8.5 2.5 Z"
        fill={color}
      />
      {/* Smartphone body */}
      <rect
        x="9.5"
        y="2.5"
        width="13"
        height="35"
        rx="2.5"
        stroke={color}
        strokeWidth="1.6"
        fill="none"
      />
      {/* Smartphone inner screen */}
      <rect
        x="11.5"
        y="6"
        width="9"
        height="28"
        rx="1"
        stroke={color}
        strokeWidth="0.85"
        fill="none"
        opacity="0.85"
      />
      {/* Right crescent arc of O */}
      <path
        d="M 23.5 2.5 C 30.2 11, 30.2 29, 23.5 37.5 C 26.8 28, 26.8 12, 23.5 2.5 Z"
        fill={color}
      />
    </svg>
  );
};

/**
 * Two 4-point sparkle stars positioned above the "ks" in Books EM logo:
 * - One larger 4-point flare star
 * - One smaller 4-point flare star to the right and slightly lower
 */
export const LogoSparkleStars: React.FC<{ className?: string; color?: string }> = ({
  className = '',
  color = 'currentColor',
}) => {
  return (
    <div className={`inline-flex items-start gap-1 pointer-events-none select-none ${className}`}>
      {/* Large 4-point flare star */}
      <svg viewBox="-8 -8 16 16" className="w-3.5 h-3.5 fill-current" style={{ color }}>
        <path d="M 0,-7.5 Q 0,0 7.5,0 Q 0,0 0,7.5 Q 0,0 -7.5,0 Q 0,0 0,-7.5 Z" />
      </svg>
      {/* Small 4-point flare star */}
      <svg viewBox="-8 -8 16 16" className="w-2.5 h-2.5 fill-current mt-1" style={{ color }}>
        <path d="M 0,-5 Q 0,0 5,0 Q 0,0 0,5 Q 0,0 -5,0 Q 0,0 0,-5 Z" />
      </svg>
    </div>
  );
};

/**
 * EXACT VECTOR PATHS FOR BOOKS EM LOGO
 * Extracted from Bodoni Moda Didone typography with custom extended ascender on 'K',
 * centered 'EM', and precise optical tracking matching official brand imagery.
 */
const LOGO_PATHS = {
  b: "M60.86 80L40.98 80L40.98 78.75L60.18 78.75Q62.94 78.75 65.27 77.30Q67.61 75.84 69.02 73.10Q70.42 70.37 70.42 66.56Q70.42 62.75 69.02 60.42Q67.61 58.08 65.27 57.02Q62.94 55.97 60.18 55.97L52.50 55.97L52.50 55.17L60.86 55.17Q65.37 55.17 69.14 56.29Q72.92 57.41 75.19 59.90Q77.46 62.40 77.46 66.56Q77.46 73.76 73.03 76.88Q68.60 80 60.86 80M52.86 79.52L46.74 79.52L46.74 32.48L52.86 32.48L52.86 79.52M59.54 55.55L52.50 55.55L52.50 54.72L59.54 54.72Q61.98 54.72 64.18 53.76Q66.39 52.80 67.78 50.56Q69.18 48.32 69.18 44.51Q69.18 40.70 67.78 38.21Q66.39 35.71 64.18 34.48Q61.98 33.25 59.54 33.25L40.98 33.25L40.98 32L59.54 32Q66.81 32 71.18 34.80Q75.54 37.60 75.54 43.84Q75.54 50.05 71.42 52.80Q67.29 55.55 59.54 55.55",
  o: "M148.03 80.64Q143.17 80.64 139.36 78.74Q135.55 76.83 132.91 73.44Q130.27 70.05 128.91 65.58Q127.55 61.12 127.55 56Q127.55 50.88 129.01 46.42Q130.46 41.95 133.15 38.56Q135.84 35.17 139.62 33.26Q143.39 31.36 148.03 31.36Q152.67 31.36 156.43 33.26Q160.19 35.17 162.90 38.56Q165.60 41.95 167.04 46.42Q168.48 50.88 168.48 56Q168.48 61.12 167.12 65.58Q165.76 70.05 163.14 73.44Q160.51 76.83 156.70 78.74Q152.90 80.64 148.03 80.64M148.03 79.49Q152.22 79.49 154.80 77.49Q157.38 75.49 158.77 72.11Q160.16 68.74 160.66 64.54Q161.15 60.35 161.15 56Q161.15 51.65 160.56 47.46Q159.97 43.26 158.53 39.89Q157.09 36.51 154.53 34.51Q151.97 32.51 148.03 32.51Q144.10 32.51 141.54 34.51Q138.98 36.51 137.52 39.89Q136.06 43.26 135.47 47.46Q134.88 51.65 134.88 56Q134.88 60.35 135.39 64.54Q135.90 68.74 137.28 72.11Q138.66 75.49 141.26 77.49Q143.87 79.49 148.03 79.49",
  k: "M178.02 66.11L176.19 66.11L200.58 33.25L193.66 33.25L193.66 32L209.02 32L209.02 33.25L202.40 33.25L178.02 66.11M188.22 80L169.98 80L169.98 78.75L175.74 78.75L175.74 20.25L169.98 20.25L169.98 19L188.22 19L188.22 20.25L181.86 20.25L181.86 78.75L188.22 78.75L188.22 80M211.90 80L192.06 80L192.06 78.75L198.53 78.75L185.06 54.85L189.02 49.89L206.18 78.75L211.90 78.75",
  s: "M231.84 80.93Q227.71 80.93 224.70 79.65Q221.70 78.37 219.68 76.13L216.70 80.64L215.62 80.64L215.62 67.49L216.86 67.49Q217.38 70.11 218.50 72.32Q219.62 74.53 221.39 76.16Q223.17 77.79 225.62 78.70Q228.06 79.62 231.26 79.62Q234.66 79.62 237.14 78.46Q239.62 77.31 240.96 75.12Q242.30 72.93 242.30 69.76Q242.30 66.94 240.93 65.01Q239.55 63.07 237.26 61.65Q234.98 60.22 232.26 59.02Q229.54 57.82 226.82 56.51Q224.10 55.20 221.81 53.46Q219.52 51.71 218.14 49.23Q216.77 46.75 216.77 43.20Q216.77 39.65 218.56 36.99Q220.35 34.34 223.38 32.85Q226.40 31.36 230.05 31.36Q233.22 31.36 235.87 32.37Q238.53 33.38 240.48 35.42L243.46 31.36L244.51 31.36L244.51 44.51L243.30 44.51Q242.66 40.51 240.90 37.90Q239.14 35.30 236.51 34.03Q233.89 32.77 230.66 32.77Q226.08 32.77 223.73 34.93Q221.38 37.09 221.38 40.64Q221.38 43.17 222.74 44.93Q224.10 46.69 226.34 48.02Q228.58 49.34 231.26 50.53Q233.95 51.71 236.64 53.07Q239.33 54.43 241.57 56.29Q243.81 58.14 245.17 60.78Q246.53 63.42 246.53 67.20Q246.53 71.36 244.74 74.45Q242.94 77.54 239.65 79.23Q236.35 80.93 231.84 80.93",
  e: "M129.72 132L102.55 132L102.55 131.03L107.05 131.03L107.05 95.47L102.55 95.47L102.55 94.50L129.22 94.50L129.22 104.75L128.25 104.75Q128.25 102.08 127.49 99.97Q126.72 97.88 124.99 96.67Q123.25 95.47 120.33 95.47L111.83 95.47L111.83 131.03L119.80 131.03Q123.22 131.03 125.17 129.78Q127.13 128.53 127.94 126.22Q128.75 123.92 128.75 120.75L129.72 120.75L129.72 132M120.72 118.08L119.75 118.08Q119.75 116.40 119.11 115.30Q118.47 114.20 117.35 113.65Q116.22 113.10 114.80 113.10L110.63 113.10L110.63 112.13L114.80 112.13Q116.22 112.13 117.35 111.63Q118.47 111.13 119.11 110.08Q119.75 109.03 119.75 107.35L120.72 107.35",
  m: "M162 132.50L160.78 132.50L146.88 94.50L151.68 94.50L163.25 125.78L174.07 94.50L175.13 94.50L162 132.50M142.55 94.50L147.38 94.50L147.38 131.03L151.07 131.03L151.07 132L142.80 132L142.80 131.03L146.35 131.03L146.35 95.47L142.55 95.47L142.55 94.50M174.85 94.50L183.10 94.50L183.10 95.47L179.60 95.47L179.60 131.03L183.10 131.03L183.10 132L170.82 132L170.82 131.03L174.85 131.03",
};

/**
 * EXACT BOOKS EM BRAND LOGO
 * Faithfully recreating the exact design provided by the user:
 * - "B" (Didone serif with horizontal underline specifically beneath B)
 * - Stylized smartphone flanked by O-crescents
 * - "O" (Didone serif cap)
 * - "K" (Didone serif with tall ascender stem extending above cap height)
 * - "S" (Didone serif cap)
 * - Two 4-point sparkle flare stars tilted at 8° above K and S
 * - "EM" centered underneath in Didone serif caps
 * - "L I B R E R Í A   V I R T U A L" tracked with geometric elegance
 * - Optional script slogan for hero sections
 */
interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
  showSlogan?: boolean;
  subtitleText?: string;
  className?: string;
  theme?: 'dark' | 'light';
}

export const BooksEmLogo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = false,
  showSlogan = false,
  subtitleText = '',
  className = '',
  theme = 'light',
}) => {
  const mainColor = theme === 'dark' ? '#FAF7F2' : '#4A2810';
  const starColor = theme === 'dark' ? '#FAF7F2' : '#5C3317';
  const subColor = theme === 'dark' ? '#E2D2C0' : '#2D1B0E';

  // Size classes for the scalable vector logo (sm enlarged for clear prominence in top-left)
  const sizeClasses = {
    sm: 'h-13 sm:h-15 w-auto max-w-[210px]',
    md: 'h-18 sm:h-22 w-auto max-w-[270px]',
    lg: 'h-26 sm:h-30 w-auto max-w-[340px]',
    hero: 'w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px] h-auto',
  };

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox={showSubtitle ? '0 0 286 170' : '0 0 286 136'}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]} transition-transform duration-200 group-hover:scale-[1.02]`}
        aria-label="Books EM"
      >
        {/* Sparkle Stars above K and S */}
        <g fill={starColor} transform="rotate(8, 208, 18)">
          {/* Large 4-point concave star */}
          <path d="M 208,6 Q 208,18 220,18 Q 208,18 208,30 Q 208,18 196,18 Q 208,18 208,6 Z" />
        </g>
        <g fill={starColor} transform="rotate(8, 228, 29)">
          {/* Small 4-point concave star */}
          <path d="M 228,21 Q 228,29 236,29 Q 228,29 228,37 Q 228,29 220,29 Q 228,29 228,21 Z" />
        </g>

        {/* Letter B */}
        <path d={LOGO_PATHS.b} fill={mainColor} />
        {/* Horizontal Underline ONLY directly below B */}
        <rect x="39" y="84" width="40" height="2.2" rx="0.5" fill={mainColor} />

        {/* First O: The Didone letter O with the iconic white square/box inside */}
        <g fill={mainColor}>
          <path d={LOGO_PATHS.o} transform="translate(-45.53, 0)" />
        </g>
        {/* White square inside the first O matching official brand logo */}
        <rect
          x="94.5"
          y="40"
          width="16"
          height="32"
          fill="#FFFFFF"
          stroke={mainColor}
          strokeWidth="1.6"
        />

        {/* Second O */}
        <path d={LOGO_PATHS.o} fill={mainColor} />

        {/* Letter K (with custom tall vertical stem and Didone top serif) */}
        <path d={LOGO_PATHS.k} fill={mainColor} />

        {/* Letter S */}
        <path d={LOGO_PATHS.s} fill={mainColor} />

        {/* EM (Centered horizontally beneath Books) */}
        <path d={LOGO_PATHS.e} fill={mainColor} />
        <path d={LOGO_PATHS.m} fill={mainColor} />

        {/* Subtitle (Omitted by default as requested to leave purely the clean brand logo) */}
        {showSubtitle && subtitleText && (
          <text
            x="143"
            y="158"
            textAnchor="middle"
            fill={subColor}
            style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '9.8px',
              fontWeight: 600,
              letterSpacing: '0.38em',
            }}
          >
            {subtitleText}
          </text>
        )}
      </svg>

      {/* Optional Script Slogan for Hero presentation */}
      {showSlogan && (
        <p className={`font-script text-xl sm:text-2xl lg:text-3xl mt-2 sm:mt-3 text-center ${theme === 'dark' ? 'text-[#E2D2C0]' : 'text-[#5C3218]'}`}>
          Tus historias favoritas, a un clic de distancia
        </p>
      )}
    </div>
  );
};
