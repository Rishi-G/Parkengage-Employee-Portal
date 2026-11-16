import React from 'react';

interface ParkEngageLogoProps {
  className?: string;
  showSubtitle?: boolean;
  dark?: boolean;
  height?: number | string;
}

export function ParkEngageLogo({
  className = '',
  showSubtitle = false,
  dark = false,
}: ParkEngageLogoProps) {
  const isLarge = /\bh-(10|11|12|14|16)\b/.test(className);
  const outerClasses = className.replace(/\bh-\w+(-\d+)?\b/g, '').trim();

  return (
    <div className={`inline-flex flex-col justify-center select-none text-left ${outerClasses}`}>
      <div className="inline-flex items-center gap-2.5 leading-none">
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isLarge ? 'w-10 h-10 shrink-0' : 'w-8 h-8 shrink-0'}
          aria-hidden="true"
        >
          <rect width="36" height="36" rx="10" fill={dark ? '#4F46E5' : '#0F172A'} />
          <path
            d="M11 25V11H18.5C21.8137 11 24.5 13.4624 24.5 16.5C24.5 19.5376 21.8137 22 18.5 22H14.5"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="24.5" r="2.5" fill="#38BDF8" />
        </svg>

        <div className="flex flex-col leading-none">
          <span
            className={`font-display font-extrabold tracking-tight ${
              isLarge ? 'text-xl' : 'text-[17px]'
            } ${dark ? 'text-white' : 'text-slate-900'}`}
          >
            Park<span className="text-[#2563EB] dark:text-indigo-400">Engage</span>
          </span>
          {showSubtitle && (
            <span
              className={`text-[9px] font-mono tracking-widest uppercase mt-1 ${
                dark ? 'text-zinc-400' : 'text-slate-500'
              }`}
            >
              People &amp; Operations Portal
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

