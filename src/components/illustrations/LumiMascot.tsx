import React from 'react';
import type { LumiAccessoryId, MascotMood } from '../../types';

/** Propriedades da mascote `LumiMascot`. */
interface LumiMascotProps {
  /** Estado emocional que define a expressão facial e posição das asas. */
  mood?: MascotMood;
  /** Acessório visual equipado na Lumi. */
  accessory?: LumiAccessoryId;
  /** Dimensão em pixels (largura e altura). */
  size?: number;
  /** Classes CSS adicionais. */
  className?: string;
}

/** Ilustração SVG animada da mascote Lumi com expressões dinâmicas e acessórios colecionáveis. */
export const LumiMascot: React.FC<LumiMascotProps> = ({
  mood = 'happy',
  accessory = 'none',
  size = 96,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 -6 160 166"
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
        transform={
          mood === 'excited'
            ? 'rotate(-35 26 96)'
            : mood === 'encouraging'
              ? 'rotate(-20 26 96)'
              : 'rotate(12 26 96)'
        }
      />
      <ellipse
        cx="134"
        cy="96"
        rx="16"
        ry="28"
        fill="#6C5CE7"
        transform={
          mood === 'excited'
            ? 'rotate(35 134 96)'
            : mood === 'encouraging'
              ? 'rotate(20 134 96)'
              : 'rotate(-12 134 96)'
        }
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
      ) : mood === 'sleepy' ? (
        <>
          <path d="M46 76 Q58 84 70 76" stroke="#2D3436" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M90 76 Q102 84 114 76" stroke="#2D3436" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <text x="124" y="42" fontSize="18" fontWeight="900" fill="#6C5CE7">Z</text>
          <text x="138" y="28" fontSize="13" fontWeight="900" fill="#A29BFE">z</text>
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

      {/* Encouraging eyebrows & warm smile */}
      {mood === 'encouraging' && (
        <>
          <path d="M44 54 Q58 48 70 55" stroke="#4C38B8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M90 55 Q102 48 116 54" stroke="#4C38B8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M72 103 Q80 109 88 103" stroke="#6C5CE7" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* Beak */}
      <path d="M72 88 L88 88 L80 100 Z" fill="#FF9F43" />

      {/* Accessories */}
      {accessory === 'bow' && (
        <g>
          <path d="M80 39 L57 24 L62 49 Z" fill="#FF5C8D" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" />
          <path d="M80 39 L103 24 L98 49 Z" fill="#FF5C8D" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="80" cy="39" r="7.5" fill="#FFCA3A" stroke="#FFFFFF" strokeWidth="2.5" />
        </g>
      )}
      {accessory === 'crown' && (
        <g>
          <path
            d="M50 42 L57 14 L72 29 L80 10 L88 29 L103 14 L110 42 Z"
            fill="#FFCA3A"
            stroke="#C78A00"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <circle cx="80" cy="31" r="4.5" fill="#FF595E" />
          <circle cx="63" cy="33" r="3.5" fill="#3A86FF" />
          <circle cx="97" cy="33" r="3.5" fill="#52B788" />
        </g>
      )}
      {accessory === 'glasses' && (
        <g>
          <circle cx="58" cy="76" r="21.5" fill="rgba(255,202,58,0.22)" stroke="#FF924C" strokeWidth="5.5" />
          <circle cx="102" cy="76" r="21.5" fill="rgba(255,202,58,0.22)" stroke="#FF924C" strokeWidth="5.5" />
          <path d="M79 76 H81" stroke="#FF924C" strokeWidth="5.5" strokeLinecap="round" />
        </g>
      )}
      {accessory === 'wizard' && (
        <g>
          <ellipse cx="80" cy="40" rx="37" ry="9" fill="#4C1D95" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M53 38 L80 0 L107 38 Z" fill="#6D28D9" stroke="#4C1D95" strokeWidth="3" strokeLinejoin="round" />
          <path d="M80 14 L83 21 L90 21 L84 25 L86 32 L80 28 L74 32 L76 25 L70 21 L77 21 Z" fill="#FFCA3A" />
        </g>
      )}
      {accessory === 'cape' && (
        <g>
          <path d="M80 107 L58 96 L61 118 Z" fill="#FF595E" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M80 107 L102 96 L99 118 Z" fill="#FF595E" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="80" cy="107" r="6.5" fill="#FFCA3A" stroke="#FFFFFF" strokeWidth="2.5" />
        </g>
      )}

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
