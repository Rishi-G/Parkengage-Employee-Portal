import React from 'react';

interface ParkEngageLogoProps {
  className?: string;
  showSubtitle?: boolean;
  dark?: boolean;
  height?: number | string;
}

export function ParkEngageLogo({ 
  className = '', 
  showSubtitle = true, 
  dark = false, 
}: ParkEngageLogoProps) {
  return (
    <div className={`inline-flex flex-col select-none text-left ${className}`}>
      <div className="flex items-center tracking-tight leading-none">
        <span className={`${dark ? 'text-white/95' : 'text-slate-900'} font-display font-bold text-xl md:text-2xl`}>Park</span>
        <span className="text-brand font-display font-black text-xl md:text-2xl">Engage</span>
      </div>
      {showSubtitle && (
        <span className={`text-[8px] font-mono tracking-widest uppercase mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          Digital at Every Touchpoint™
        </span>
      )}
    </div>
  );
}
