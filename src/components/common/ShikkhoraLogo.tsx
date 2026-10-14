import React from 'react';

export type LogoVariant = 'full' | 'symbol' | 'horizontal' | 'icon';
export type LogoTheme = 'dark' | 'light' | 'mono';

interface ShikkhoraLogoProps {
  variant?: LogoVariant;
  theme?: LogoTheme;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const ShikkhoraLogo: React.FC<ShikkhoraLogoProps> = ({
  variant = 'horizontal',
  theme = 'dark',
  size = 'md',
  className = '',
  showTagline = true,
}) => {
  // Size calculations
  const symbolSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    xs: { title: 'text-sm', tag: 'text-[9px]' },
    sm: { title: 'text-base', tag: 'text-[10px]' },
    md: { title: 'text-xl', tag: 'text-[11px]' },
    lg: { title: 'text-3xl', tag: 'text-sm' },
    xl: { title: 'text-4xl', tag: 'text-base' },
  };

  // Color configurations based on theme
  const colors = {
    dark: {
      bookBase: '#0284C7', // Sky 600
      bookRight: '#0D9488', // Teal 600
      glow: '#10B981', // Emerald 500
      spark: '#F59E0B', // Amber 500
      sunBeam: '#38BDF8', // Sky 400
      textPrimary: 'text-white',
      textSecondary: 'text-emerald-400',
      tagline: 'text-slate-400',
    },
    light: {
      bookBase: '#0369A1',
      bookRight: '#0F766E',
      glow: '#059669',
      spark: '#D97706',
      sunBeam: '#0284C7',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-teal-700',
      tagline: 'text-slate-600',
    },
    mono: {
      bookBase: 'currentColor',
      bookRight: 'currentColor',
      glow: 'currentColor',
      spark: 'currentColor',
      sunBeam: 'currentColor',
      textPrimary: 'text-current',
      textSecondary: 'text-current opacity-80',
      tagline: 'text-current opacity-60',
    },
  }[theme];

  // The Original Shikkhora Brand Symbol
  // Represents: An open illuminated book transitioning into an ascending path of growth and knowledge beacon
  const BrandSymbol = (
    <svg
      className={`${symbolSizes[size]} transition-transform duration-300 group-hover:scale-105`}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Shikkhora Emblem"
    >
      <defs>
        <linearGradient id="shikkhoraGradientLeft" x1="6" y1="52" x2="32" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id="shikkhoraGradientRight" x1="32" y1="24" x2="58" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
        <linearGradient id="shikkhoraSunRay" x1="32" y1="36" x2="32" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
      </defs>

      {/* Background Knowledge Aura (Subtle Soft Arc) */}
      <circle cx="32" cy="30" r="26" fill={theme === 'mono' ? 'none' : 'rgba(16, 185, 129, 0.08)'} />

      {/* Ascending Knowledge Beam / Spire of Discovery */}
      <path
        d="M32 8L35.5 22L32 32L28.5 22L32 8Z"
        fill={theme === 'mono' ? 'currentColor' : 'url(#shikkhoraSunRay)'}
      />
      <circle cx="32" cy="7" r="3" fill={theme === 'mono' ? 'currentColor' : '#F59E0B'} />

      {/* Left Wing / Open Book Page of Inquiry */}
      <path
        d="M32 34C24 30 14 31 7 35C6.5 41 6.5 47 7 53C14 49 24 48 32 52V34Z"
        fill={theme === 'mono' ? 'currentColor' : 'url(#shikkhoraGradientLeft)'}
        opacity={theme === 'mono' ? 0.85 : 1}
      />

      {/* Right Wing / Open Book Page of Growth */}
      <path
        d="M32 34C40 30 50 31 57 35C57.5 41 57.5 47 57 53C50 49 40 48 32 52V34Z"
        fill={theme === 'mono' ? 'currentColor' : 'url(#shikkhoraGradientRight)'}
        opacity={theme === 'mono' ? 0.95 : 1}
      />

      {/* Ascending Path (Step Pyramid Ribs of Progress) */}
      <path
        d="M32 34L26 44H38L32 34Z"
        fill="#FFFFFF"
        fillOpacity="0.25"
      />
      <path
        d="M32 44L22 53H42L32 44Z"
        fill="#FFFFFF"
        fillOpacity="0.15"
      />

      {/* Central Keystone of Academic Excellence */}
      <polygon
        points="32,26 35,32 32,38 29,32"
        fill="#FFFFFF"
      />
    </svg>
  );

  if (variant === 'symbol' || variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {BrandSymbol}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {BrandSymbol}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline tracking-tight">
          <span className={`font-bold font-sans ${textSizes[size].title} ${colors.textPrimary}`}>
            Shikkhora
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5 mb-0.5" />
        </div>
        {showTagline && (
          <span className={`font-medium tracking-wide mt-1 uppercase ${textSizes[size].tag} ${colors.tagline}`}>
            Learn Better. Grow Further.
          </span>
        )}
      </div>
    </div>
  );
};
