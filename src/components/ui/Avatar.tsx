import React, { useState, useEffect } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
  alt?: string;
}

const PALETTES = [
  'bg-indigo-600 text-white',
  'bg-emerald-600 text-white',
  'bg-sky-600 text-white',
  'bg-amber-600 text-white',
  'bg-rose-600 text-white',
  'bg-slate-700 text-white',
];

function getInitials(name: string): string {
  const parts = (name || 'PE').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
}

function getPalette(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

export function Avatar({ src, name, className = 'w-10 h-10 rounded-xl', alt }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        aria-label={alt || name}
        className={`inline-flex items-center justify-center font-display font-bold select-none shrink-0 ${getPalette(name)} ${className}`}
      >
        <span className="text-[0.75em] tracking-tight">{getInitials(name)}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || name}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`object-cover shrink-0 ${className}`}
    />
  );
}
