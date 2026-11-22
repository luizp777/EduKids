import React from 'react';
import type { FigureId } from '../../types';

/** Propriedades do componente `FigureSvg`. */
interface FigureSvgProps {
  /** Identificador da figura do catálogo. */
  figureId: FigureId;
  /** Dimensão em pixels (largura e altura). */
  size?: number;
  /** Se `true`, renderiza como silhueta escura para o jogo de Sombras ou álbum bloqueado. */
  silhouette?: boolean;
  /** ViewBox customizado usado para recortar peças do quebra-cabeça. */
  viewBox?: string;
  /** Classes CSS adicionais. */
  className?: string;
}

/** Renderiza uma das 36 figuras ilustradas em SVG, com suporte a modo silhueta e recorte para quebra-cabeça. */
export const FigureSvg: React.FC<FigureSvgProps> = ({
  figureId,
  size = 84,
  silhouette = false,
  viewBox = '0 0 100 100',
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      className={className}
      style={silhouette ? { filter: 'brightness(0) saturate(0) opacity(0.68)' } : undefined}
      aria-label={figureId}
    >
      {figureId === 'abelha' && (
        <g>
          <ellipse cx="42" cy="30" rx="14" ry="18" fill="#E0F7FA" stroke="#80DEEA" strokeWidth="2" transform="rotate(-20 42 30)" />
          <ellipse cx="62" cy="30" rx="14" ry="18" fill="#E0F7FA" stroke="#80DEEA" strokeWidth="2" transform="rotate(20 62 30)" />
          <ellipse cx="52" cy="58" rx="30" ry="22" fill="#FFD93D" stroke="#E0A800" strokeWidth="2.5" />
          <path d="M40 37 L40 79 M54 36 L54 80 M68 41 L68 75" stroke="#2D3436" strokeWidth="6" strokeLinecap="round" />
          <circle cx="30" cy="54" r="3.5" fill="#2D3436" />
          <path d="M24 62 Q28 67 34 62" stroke="#2D3436" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M24 44 L16 32 M32 42 L28 30" stroke="#2D3436" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="16" cy="32" r="3" fill="#2D3436" />
          <circle cx="28" cy="30" r="3" fill="#2D3436" />
        </g>
      )}

      {figureId === 'elefante' && (
        <g>
          <ellipse cx="22" cy="50" rx="16" ry="24" fill="#74B9FF" />
          <ellipse cx="78" cy="50" rx="16" ry="24" fill="#74B9FF" />
          <ellipse cx="22" cy="52" rx="9" ry="15" fill="#FFC2D1" />
          <ellipse cx="78" cy="52" rx="9" ry="15" fill="#FFC2D1" />
          <circle cx="50" cy="52" r="28" fill="#4D96FF" />
          <path d="M46 58 Q46 84 62 84 Q70 84 66 76" stroke="#4D96FF" strokeWidth="11" fill="none" strokeLinecap="round" />
          <circle cx="39" cy="46" r="4" fill="#2D3436" />
          <circle cx="61" cy="46" r="4" fill="#2D3436" />
          <circle cx="40.5" cy="44.5" r="1.4" fill="#FFF" />
          <circle cx="62.5" cy="44.5" r="1.4" fill="#FFF" />
        </g>
      )}

      {figureId === 'ilha' && (
        <g>
          <ellipse cx="50" cy="80" rx="42" ry="12" fill="#4CC9F0" />
          <path d="M18 78 Q50 48 82 78 Z" fill="#FFD166" />
          <path d="M50 64 Q44 44 52 26" stroke="#A6633C" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M52 26 Q32 20 24 34 Q40 30 52 26 Z" fill="#52B788" />
          <path d="M52 26 Q72 18 80 34 Q64 30 52 26 Z" fill="#40916C" />
          <path d="M52 26 Q52 10 38 14 Q48 20 52 26 Z" fill="#74C69D" />
          <circle cx="76" cy="22" r="9" fill="#FFCA3A" />
        </g>
      )}

      {figureId === 'ovelha' && (
        <g>
          <rect x="34" y="68" width="7" height="18" rx="3" fill="#4A4E69" />
          <rect x="59" y="68" width="7" height="18" rx="3" fill="#4A4E69" />
          <circle cx="34" cy="46" r="16" fill="#F8F9FA" stroke="#DEE2E6" strokeWidth="2" />
          <circle cx="66" cy="46" r="16" fill="#F8F9FA" stroke="#DEE2E6" strokeWidth="2" />
          <circle cx="50" cy="36" r="17" fill="#F8F9FA" stroke="#DEE2E6" strokeWidth="2" />
          <circle cx="40" cy="60" r="15" fill="#F8F9FA" stroke="#DEE2E6" strokeWidth="2" />
          <circle cx="60" cy="60" r="15" fill="#F8F9FA" stroke="#DEE2E6" strokeWidth="2" />
          <ellipse cx="50" cy="54" rx="16" ry="15" fill="#9D4EDD" />
          <ellipse cx="31" cy="52" rx="7" ry="4" fill="#9D4EDD" transform="rotate(-20 31 52)" />
          <ellipse cx="69" cy="52" rx="7" ry="4" fill="#9D4EDD" transform="rotate(20 69 52)" />
          <circle cx="44" cy="52" r="3" fill="#FFF" />
          <circle cx="56" cy="52" r="3" fill="#FFF" />
          <circle cx="44" cy="52" r="1.5" fill="#2D3436" />
          <circle cx="56" cy="52" r="1.5" fill="#2D3436" />
          <path d="M46 60 Q50 64 54 60" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )}

      {figureId === 'urso' && (
        <g>
          <circle cx="26" cy="28" r="13" fill="#D9822B" />
          <circle cx="74" cy="28" r="13" fill="#D9822B" />
          <circle cx="26" cy="28" r="6" fill="#F7C59F" />
          <circle cx="74" cy="28" r="6" fill="#F7C59F" />
          <circle cx="50" cy="54" r="32" fill="#D9822B" />
          <ellipse cx="50" cy="62" rx="15" ry="12" fill="#F7C59F" />
          <circle cx="38" cy="48" r="4" fill="#2D3436" />
          <circle cx="62" cy="48" r="4" fill="#2D3436" />
          <ellipse cx="50" cy="58" rx="5.5" ry="4" fill="#4A2C2A" />
          <path d="M44 66 Q50 71 56 66" stroke="#4A2C2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      )}

      {figureId === 'bola' && (
        <g>
          <circle cx="50" cy="50" r="38" fill="#3A86FF" stroke="#1D5FD1" strokeWidth="3" />
          <path d="M22 25 Q50 45 78 25" stroke="#FFCA3A" strokeWidth="9" fill="none" />
          <path d="M22 75 Q50 55 78 75" stroke="#FF595E" strokeWidth="9" fill="none" />
          <circle cx="50" cy="50" r="10" fill="#FFFFFF" />
        </g>
      )}

      {figureId === 'casa' && (
        <g>
          <rect x="22" y="46" width="56" height="40" rx="4" fill="#FFF3BF" stroke="#E0A800" strokeWidth="2.5" />
          <path d="M12 50 L50 16 L88 50 Z" fill="#FF595E" stroke="#C9383D" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="42" y="60" width="16" height="26" rx="3" fill="#A6633C" />
          <circle cx="54" cy="74" r="2" fill="#FFD93D" />
          <rect x="28" y="56" width="10" height="10" rx="2" fill="#74B9FF" />
          <rect x="62" y="56" width="10" height="10" rx="2" fill="#74B9FF" />
        </g>
      )}

      {figureId === 'dado' && (
        <g>
          <rect x="16" y="16" width="68" height="68" rx="16" fill="#8338EC" stroke="#5E1DB8" strokeWidth="3" />
          <circle cx="34" cy="34" r="6" fill="#FFF" />
          <circle cx="66" cy="34" r="6" fill="#FFF" />
          <circle cx="50" cy="50" r="6" fill="#FFF" />
          <circle cx="34" cy="66" r="6" fill="#FFF" />
          <circle cx="66" cy="66" r="6" fill="#FFF" />
        </g>
      )}

      {figureId === 'flor' && (
        <g>
          <path d="M50 58 L50 88" stroke="#52B788" strokeWidth="7" strokeLinecap="round" />
          <ellipse cx="62" cy="76" rx="11" ry="6" fill="#52B788" transform="rotate(-25 62 76)" />
          <circle cx="50" cy="24" r="14" fill="#B57BFF" />
          <circle cx="70" cy="38" r="14" fill="#9B5DE5" />
          <circle cx="62" cy="58" r="14" fill="#B57BFF" />
          <circle cx="38" cy="58" r="14" fill="#9B5DE5" />
          <circle cx="30" cy="38" r="14" fill="#B57BFF" />
          <circle cx="50" cy="43" r="14" fill="#FFCA3A" />
          <circle cx="45" cy="41" r="2.5" fill="#2D3436" />
          <circle cx="55" cy="41" r="2.5" fill="#2D3436" />
          <path d="M46 47 Q50 51 54 47" stroke="#2D3436" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )}

      {figureId === 'gato' && (
        <g>
          <path d="M22 48 L24 18 L46 34 Z" fill="#FF924C" />
          <path d="M78 48 L76 18 L54 34 Z" fill="#FF924C" />
          <path d="M26 42 L28 24 L42 35 Z" fill="#FFB3C6" />
          <path d="M74 42 L72 24 L58 35 Z" fill="#FFB3C6" />
          <circle cx="50" cy="56" r="30" fill="#FF924C" />
          <circle cx="38" cy="52" r="4.5" fill="#2D3436" />
          <circle cx="62" cy="52" r="4.5" fill="#2D3436" />
          <path d="M46 60 L54 60 L50 65 Z" fill="#FF595E" />
          <path d="M43 68 Q50 74 57 68" stroke="#2D3436" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M16 56 L30 58 M16 64 L30 63 M84 56 L70 58 M84 64 L70 63" stroke="#2D3436" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {figureId === 'lua' && (
        <g>
          <path
            d="M62 16 A34 34 0 1 0 82 72 A26 26 0 1 1 62 16 Z"
            fill="#FFCA3A"
            stroke="#E0A800"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="72" cy="28" r="4" fill="#FFE085" />
          <circle cx="82" cy="44" r="3" fill="#FFE085" />
        </g>
      )}

      {figureId === 'maca' && (
        <g>
          <path d="M50 28 Q52 14 62 14" stroke="#6F4E37" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="64" cy="22" rx="10" ry="6" fill="#52B788" transform="rotate(-25 64 22)" />
          <path
            d="M50 32 C34 24 18 36 20 56 C22 76 38 88 50 84 C62 88 78 76 80 56 C82 36 66 24 50 32 Z"
            fill="#FF595E"
            stroke="#C9383D"
            strokeWidth="2.5"
          />
          <ellipse cx="34" cy="48" rx="5" ry="9" fill="#FF8A8E" transform="rotate(-15 34 48)" />
        </g>
      )}

      {figureId === 'nuvem' && (
        <g>
          <path
            d="M26 74 H74 A16 16 0 0 0 74 42 A20 20 0 0 0 36 36 A16 16 0 0 0 26 74 Z"
            fill="#74B9FF"
            stroke="#3A86FF"
            strokeWidth="3"
          />
          <circle cx="42" cy="56" r="3.5" fill="#2D3436" />
          <circle cx="58" cy="56" r="3.5" fill="#2D3436" />
          <path d="M46 63 Q50 67 54 63" stroke="#2D3436" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      )}

      {figureId === 'pato' && (
        <g>
          <ellipse cx="54" cy="64" rx="28" ry="20" fill="#FFCA3A" />
          <circle cx="38" cy="38" r="18" fill="#FFCA3A" />
          <ellipse cx="20" cy="40" rx="10" ry="5" fill="#FF924C" />
          <circle cx="34" cy="34" r="3.5" fill="#2D3436" />
          <path d="M50 58 Q64 56 68 66 Q56 72 48 66 Z" fill="#F4B400" />
        </g>
      )}

      {figureId === 'sapo' && (
        <g>
          <circle cx="32" cy="32" r="13" fill="#52B788" />
          <circle cx="68" cy="32" r="13" fill="#52B788" />
          <circle cx="32" cy="32" r="8" fill="#FFF" />
          <circle cx="68" cy="32" r="8" fill="#FFF" />
          <circle cx="32" cy="32" r="4" fill="#2D3436" />
          <circle cx="68" cy="32" r="4" fill="#2D3436" />
          <ellipse cx="50" cy="58" rx="34" ry="26" fill="#52B788" />
          <ellipse cx="50" cy="68" rx="22" ry="12" fill="#B7E4C7" />
          <path d="M32 58 Q50 70 68 58" stroke="#1B4332" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <circle cx="28" cy="58" r="4" fill="#FF8FA3" opacity="0.7" />
          <circle cx="72" cy="58" r="4" fill="#FF8FA3" opacity="0.7" />
        </g>
      )}

      {figureId === 'sol' && (
        <g>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="50"
              y1="10"
              x2="50"
              y2="20"
              stroke="#FF9F43"
              strokeWidth="6"
              strokeLinecap="round"
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="24" fill="#FFCA3A" stroke="#FF9F43" strokeWidth="3" />
          <circle cx="42" cy="46" r="3" fill="#2D3436" />
          <circle cx="58" cy="46" r="3" fill="#2D3436" />
          <path d="M43 55 Q50 61 57 55" stroke="#2D3436" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      )}

      {figureId === 'peixe' && (
        <g>
          <path d="M70 50 L90 30 L90 70 Z" fill="#00B4D8" />
          <ellipse cx="44" cy="50" rx="30" ry="22" fill="#3A86FF" />
          <path d="M46 28 Q56 16 62 32" fill="#00B4D8" />
          <circle cx="28" cy="46" r="5" fill="#FFF" />
          <circle cx="27" cy="46" r="2.5" fill="#2D3436" />
          <path d="M42 40 Q48 50 42 60" stroke="#90E0EF" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M54 42 Q60 50 54 58" stroke="#90E0EF" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      )}

      {figureId === 'morango' && (
        <g>
          <path d="M50 86 C26 76 18 46 28 32 C38 22 62 22 72 32 C82 46 74 76 50 86 Z" fill="#FF595E" />
          <path d="M32 30 L50 18 L68 30 L58 34 L50 26 L42 34 Z" fill="#52B788" />
          <circle cx="38" cy="46" r="2.5" fill="#FFCA3A" />
          <circle cx="52" cy="42" r="2.5" fill="#FFCA3A" />
          <circle cx="62" cy="50" r="2.5" fill="#FFCA3A" />
          <circle cx="44" cy="60" r="2.5" fill="#FFCA3A" />
          <circle cx="56" cy="64" r="2.5" fill="#FFCA3A" />
          <circle cx="48" cy="74" r="2.5" fill="#FFCA3A" />
        </g>
      )}

      {figureId === 'banana' && (
        <g>
          <path
            d="M24 68 C38 86 76 74 82 32 C84 22 74 20 70 28 C64 52 44 62 28 58 C20 56 18 62 24 68 Z"
            fill="#FFCA3A"
            stroke="#E0A800"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <rect x="74" y="18" width="6" height="8" rx="2" fill="#6F4E37" transform="rotate(15 77 22)" />
        </g>
      )}

      {figureId === 'borboleta' && (
        <g>
          <ellipse cx="30" cy="40" rx="20" ry="18" fill="#9B5DE5" />
          <ellipse cx="70" cy="40" rx="20" ry="18" fill="#9B5DE5" />
          <ellipse cx="34" cy="66" rx="15" ry="14" fill="#F15BB5" />
          <ellipse cx="66" cy="66" rx="15" ry="14" fill="#F15BB5" />
          <circle cx="28" cy="38" r="6" fill="#FFCA3A" />
          <circle cx="72" cy="38" r="6" fill="#FFCA3A" />
          <rect x="45" y="28" width="10" height="48" rx="5" fill="#2D3436" />
          <path d="M47 28 Q40 14 34 16 M53 28 Q60 14 66 16" stroke="#2D3436" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      )}

      {figureId === 'carro' && (
        <g>
          <path d="M26 52 L34 30 H66 L74 52 Z" fill="#FF595E" />
          <rect x="14" y="50" width="72" height="22" rx="10" fill="#FF595E" stroke="#C9383D" strokeWidth="2.5" />
          <path d="M36 35 H48 V50 H30 Z" fill="#A9DEF9" />
          <path d="M52 35 H64 L70 50 H52 Z" fill="#A9DEF9" />
          <circle cx="30" cy="74" r="10" fill="#2D3436" />
          <circle cx="70" cy="74" r="10" fill="#2D3436" />
          <circle cx="30" cy="74" r="4" fill="#E2E8F0" />
          <circle cx="70" cy="74" r="4" fill="#E2E8F0" />
          <circle cx="80" cy="58" r="4" fill="#FFCA3A" />
        </g>
      )}

      {figureId === 'foguete' && (
        <g>
          <path d="M36 72 L22 82 L28 60 Z" fill="#FF595E" />
          <path d="M64 72 L78 82 L72 60 Z" fill="#FF595E" />
          <path d="M42 74 L50 92 L58 74 Z" fill="#FFCA3A" />
          <path d="M50 12 C68 28 68 58 62 74 H38 C32 58 32 28 50 12 Z" fill="#FF924C" stroke="#D1651F" strokeWidth="2.5" />
          <circle cx="50" cy="44" r="10" fill="#A9DEF9" stroke="#FFFFFF" strokeWidth="3" />
        </g>
      )}

      {figureId === 'rato' && (
        <g>
          <circle cx="28" cy="30" r="15" fill="#ADB5BD" />
          <circle cx="72" cy="30" r="15" fill="#ADB5BD" />
          <circle cx="28" cy="30" r="8" fill="#FFB3C6" />
          <circle cx="72" cy="30" r="8" fill="#FFB3C6" />
          <ellipse cx="50" cy="58" rx="28" ry="24" fill="#CED4DA" />
          <circle cx="40" cy="52" r="4" fill="#2D3436" />
          <circle cx="60" cy="52" r="4" fill="#2D3436" />
          <ellipse cx="50" cy="64" rx="5" ry="3.5" fill="#FF758F" />
          <path d="M18 60 L32 62 M18 67 L32 66 M82 60 L68 62 M82 67 L68 66" stroke="#495057" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {figureId === 'pao' && (
        <g>
          <path d="M18 58 C18 32 82 32 82 58 L80 74 C80 78 20 78 20 74 Z" fill="#F4A261" stroke="#C67D38" strokeWidth="3" />
          <path d="M34 44 L42 54 M50 42 L58 54 M66 44 L72 52" stroke="#FFE8CC" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      {figureId === 'mao' && (
        <g>
          <rect x="30" y="44" width="40" height="36" rx="14" fill="#FFD1A9" stroke="#E0A87E" strokeWidth="2.5" />
          <rect x="28" y="20" width="9" height="30" rx="4.5" fill="#FFD1A9" stroke="#E0A87E" strokeWidth="2" />
          <rect x="40" y="14" width="9" height="36" rx="4.5" fill="#FFD1A9" stroke="#E0A87E" strokeWidth="2" />
          <rect x="52" y="16" width="9" height="34" rx="4.5" fill="#FFD1A9" stroke="#E0A87E" strokeWidth="2" />
          <rect x="64" y="24" width="8" height="28" rx="4" fill="#FFD1A9" stroke="#E0A87E" strokeWidth="2" />
          <rect x="16" y="46" width="18" height="9" rx="4.5" fill="#FFD1A9" stroke="#E0A87E" strokeWidth="2" transform="rotate(-30 24 50)" />
        </g>
      )}

      {figureId === 'uva' && (
        <g>
          <path d="M50 26 L50 14" stroke="#6F4E37" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="60" cy="20" rx="10" ry="5" fill="#52B788" transform="rotate(-20 60 20)" />
          <circle cx="38" cy="38" r="11" fill="#8338EC" stroke="#5E1DB8" strokeWidth="2" />
          <circle cx="52" cy="38" r="11" fill="#9B5DE5" stroke="#5E1DB8" strokeWidth="2" />
          <circle cx="64" cy="38" r="11" fill="#8338EC" stroke="#5E1DB8" strokeWidth="2" />
          <circle cx="44" cy="54" r="11" fill="#9B5DE5" stroke="#5E1DB8" strokeWidth="2" />
          <circle cx="58" cy="54" r="11" fill="#8338EC" stroke="#5E1DB8" strokeWidth="2" />
          <circle cx="51" cy="70" r="11" fill="#9B5DE5" stroke="#5E1DB8" strokeWidth="2" />
        </g>
      )}

      {figureId === 'arvore' && (
        <g>
          <rect x="42" y="56" width="16" height="30" rx="4" fill="#A6633C" />
          <circle cx="50" cy="36" r="24" fill="#52B788" />
          <circle cx="32" cy="46" r="18" fill="#40916C" />
          <circle cx="68" cy="46" r="18" fill="#40916C" />
          <circle cx="40" cy="34" r="4" fill="#FF595E" />
          <circle cx="60" cy="44" r="4" fill="#FF595E" />
        </g>
      )}

      {figureId === 'estrela' && (
        <g>
          <path
            d="M50 12 L61 36 L88 39 L68 57 L74 84 L50 70 L26 84 L32 57 L12 39 L39 36 Z"
            fill="#FFCA3A"
            stroke="#E0A800"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="42" cy="48" r="3.5" fill="#2D3436" />
          <circle cx="58" cy="48" r="3.5" fill="#2D3436" />
          <path d="M44 57 Q50 63 56 57" stroke="#2D3436" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      )}

      {figureId === 'cachorro' && (
        <g>
          <ellipse cx="24" cy="48" rx="12" ry="22" fill="#A6633C" transform="rotate(14 24 48)" />
          <ellipse cx="76" cy="48" rx="12" ry="22" fill="#A6633C" transform="rotate(-14 76 48)" />
          <circle cx="50" cy="54" r="28" fill="#F4A261" />
          <ellipse cx="50" cy="64" rx="15" ry="12" fill="#FFE8CC" />
          <circle cx="40" cy="48" r="4" fill="#2D3436" />
          <circle cx="60" cy="48" r="4" fill="#2D3436" />
          <ellipse cx="50" cy="58" rx="6" ry="4.5" fill="#2D3436" />
          <path d="M44 67 Q50 72 56 67" stroke="#2D3436" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <ellipse cx="50" cy="73" rx="4" ry="5" fill="#FF758F" />
        </g>
      )}

      {figureId === 'leao' && (
        <g>
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <circle
              key={deg}
              cx="50"
              cy="18"
              r="11"
              fill="#D97706"
              transform={`rotate(${deg} 50 52)`}
            />
          ))}
          <circle cx="32" cy="28" r="8" fill="#FBBF24" />
          <circle cx="68" cy="28" r="8" fill="#FBBF24" />
          <circle cx="50" cy="52" r="26" fill="#FCD34D" />
          <circle cx="40" cy="48" r="3.8" fill="#2D3436" />
          <circle cx="60" cy="48" r="3.8" fill="#2D3436" />
          <path d="M45 57 L55 57 L50 62 Z" fill="#92400E" />
          <path d="M43 66 Q50 71 57 66" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      )}

      {figureId === 'passaro' && (
        <g>
          <path d="M64 60 L86 48 L78 68 Z" fill="#1D5FD1" />
          <ellipse cx="48" cy="56" rx="26" ry="22" fill="#3A86FF" />
          <ellipse cx="44" cy="64" rx="16" ry="12" fill="#A9DEF9" />
          <circle cx="34" cy="46" r="14" fill="#3A86FF" />
          <path d="M22 46 L10 50 L22 54 Z" fill="#FFCA3A" />
          <circle cx="31" cy="44" r="3.5" fill="#2D3436" />
          <circle cx="32" cy="43" r="1.2" fill="#FFF" />
          <path d="M46 50 Q62 42 66 56 Q54 64 44 58 Z" fill="#74B9FF" />
        </g>
      )}

      {figureId === 'tartaruga' && (
        <g>
          <rect x="28" y="68" width="10" height="14" rx="4" fill="#74C69D" />
          <rect x="62" y="68" width="10" height="14" rx="4" fill="#74C69D" />
          <circle cx="80" cy="54" r="11" fill="#74C69D" />
          <circle cx="84" cy="51" r="2.5" fill="#2D3436" />
          <path d="M80 58 Q84 61 88 58" stroke="#1B4332" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M18 66 C18 32 76 32 76 66 Z" fill="#2D8A60" stroke="#1B4332" strokeWidth="2.5" />
          <circle cx="36" cy="52" r="6" fill="#52B788" />
          <circle cx="52" cy="46" r="7" fill="#52B788" />
          <circle cx="62" cy="56" r="5" fill="#52B788" />
        </g>
      )}

      {figureId === 'aviao' && (
        <g>
          <path d="M36 42 L20 20 L38 22 L56 42 Z" fill="#1D5FD1" />
          <path d="M36 58 L20 80 L38 78 L56 58 Z" fill="#1D5FD1" />
          <path d="M16 44 L10 34 L22 36 L26 46 Z" fill="#FF595E" />
          <path d="M16 50 C16 40 74 38 86 50 C74 62 16 60 16 50 Z" fill="#3A86FF" stroke="#1D5FD1" strokeWidth="2" />
          <circle cx="66" cy="48" r="5" fill="#A9DEF9" />
          <circle cx="50" cy="49" r="4" fill="#A9DEF9" />
          <circle cx="36" cy="49" r="4" fill="#A9DEF9" />
        </g>
      )}

      {figureId === 'livro' && (
        <g>
          <rect x="18" y="20" width="64" height="60" rx="8" fill="#FF595E" stroke="#C9383D" strokeWidth="3" />
          <rect x="26" y="20" width="52" height="54" rx="4" fill="#FFFDF9" />
          <rect x="18" y="20" width="12" height="60" rx="4" fill="#C9383D" />
          <line x1="38" y1="36" x2="68" y2="36" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
          <line x1="38" y1="48" x2="68" y2="48" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
          <circle cx="54" cy="62" r="7" fill="#FFCA3A" />
        </g>
      )}

      {figureId === 'arcoiris' && (
        <g>
          <path d="M16 70 A34 34 0 0 1 84 70" fill="none" stroke="#FF595E" strokeWidth="7" strokeLinecap="round" />
          <path d="M23 70 A27 27 0 0 1 77 70" fill="none" stroke="#FFCA3A" strokeWidth="7" strokeLinecap="round" />
          <path d="M30 70 A20 20 0 0 1 70 70" fill="none" stroke="#52B788" strokeWidth="7" strokeLinecap="round" />
          <path d="M37 70 A13 13 0 0 1 63 70" fill="none" stroke="#8338EC" strokeWidth="7" strokeLinecap="round" />
          <circle cx="18" cy="72" r="9" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="2" />
          <circle cx="28" cy="74" r="8" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="2" />
          <circle cx="82" cy="72" r="9" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="2" />
          <circle cx="72" cy="74" r="8" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="2" />
        </g>
      )}

      {figureId === 'melancia' && (
        <g>
          <path d="M14 44 A36 36 0 0 0 86 44 Z" fill="#52B788" stroke="#2D8A60" strokeWidth="3" />
          <path d="M20 44 A30 30 0 0 0 80 44 Z" fill="#FF595E" />
          <circle cx="36" cy="54" r="2.5" fill="#2D3436" />
          <circle cx="50" cy="60" r="2.5" fill="#2D3436" />
          <circle cx="64" cy="54" r="2.5" fill="#2D3436" />
          <circle cx="44" cy="50" r="2.5" fill="#2D3436" />
          <circle cx="56" cy="50" r="2.5" fill="#2D3436" />
        </g>
      )}
    </svg>
  );
};
