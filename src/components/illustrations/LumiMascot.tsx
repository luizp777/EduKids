import React from 'react';
import type { MascotMood } from '../../types';

interface LumiMascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
}

export const LumiMascot: React.FC<LumiMascotProps> = ({
  mood = 'happy',
  size = 96,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={`shrink-0 ${mood === 'excited' ? 'animate-bounce' : 'animate-float'} ${className}`}
      aria-label="Mascote Lumi"
    >
      {/* Wings */}
      <ellipse
        cx="26"
        cy="96"
        rx="16"
        ry="28"
        fill="#6C5CE7"
        transform={mood === 'excited' ? 'rotate(-35 26 96)' : 'rotate(12 26 96)'}
      />
      <ellipse
        cx="134"
        cy="96"
        rx="16"
        ry="28"
        fill="#6C5CE7"
        transform={mood === 'excited' ? 'rotate(35 134 96)' : 'rotate(-12 134 96)'}
      />

      {/* Feet */}
      <ellipse cx="62" cy="144" rx="13" ry="7" fill="#FF9F43" />
      <ellipse cx="98" cy="144" rx="13" ry="7" fill="#FF9F43" />

      {/* Body */}
      <circle cx="80" cy="90" r="54" fill="#8B7CF6" />

      {/* Ear tufts */}
      <path d="M40 50 L54 24 L70 46 Z" fill="#6C5CE7" />
      <path d="M120 50 L106 24 L90 46 Z" fill="#6C5CE7" />

      {/* Belly */}
      <ellipse cx="80" cy="110" rx="34" ry="29" fill="#FFF9F0" />
      <path d="M64 104 Q72 110 80 104 Q88 110 96 104" stroke="#E2D9FF" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M68 118 Q74 123 80 118 Q86 123 92 118" stroke="#E2D9FF" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* Eye whites */}
      <circle cx="58" cy="76" r="19" fill="#FFFFFF" />
      <circle cx="102" cy="76" r="19" fill="#FFFFFF" />

      {/* Pupils based on mood */}
      {mood === 'excited' ? (
        <>
          <path d="M48 76 Q58 64 68 76" stroke="#2D3436" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M92 76 Q102 64 112 76" stroke="#2D3436" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={mood === 'thinking' ? 62 : 60} cy={mood === 'thinking' ? 72 : 76} r="9.5" fill="#2D3436" />
          <circle cx={mood === 'thinking' ? 106 : 100} cy={mood === 'thinking' ? 72 : 76} r="9.5" fill="#2D3436" />
          <circle cx={mood === 'thinking' ? 65 : 63} cy={mood === 'thinking' ? 69 : 72} r="3.5" fill="#FFFFFF" />
          <circle cx={mood === 'thinking' ? 109 : 103} cy={mood === 'thinking' ? 69 : 72} r="3.5" fill="#FFFFFF" />
        </>
      )}

      {/* Cheeks */}
      <circle cx="38" cy="92" r="8" fill="#FF7675" opacity="0.65" />
      <circle cx="122" cy="92" r="8" fill="#FF7675" opacity="0.65" />

      {/* Beak */}
      <path d="M72 88 L88 88 L80 100 Z" fill="#FF9F43" />

      {/* Celebration star */}
      {mood === 'excited' && (
        <path
          d="M132 18 L136 28 L147 29 L139 36 L141 47 L132 41 L123 47 L125 36 L117 29 L128 28 Z"
          fill="#FFD93D"
        />
      )}
    </svg>
  );
};
