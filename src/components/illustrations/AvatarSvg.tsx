import React from 'react';
import type { AvatarId } from '../../types';

export const AVATAR_OPTIONS: { id: AvatarId; label: string; bg: string }[] = [
  { id: 'owl', label: 'Coruja', bg: '#E5DBFF' },
  { id: 'bear', label: 'Urso', bg: '#FFE8CC' },
  { id: 'cat', label: 'Gato', bg: '#FFD8E4' },
  { id: 'bunny', label: 'Coelho', bg: '#D0EBFF' },
  { id: 'fox', label: 'Raposa', bg: '#FFE3E3' },
  { id: 'dino', label: 'Dino', bg: '#D3F9D8' },
];

export const AvatarSvg: React.FC<{ avatar: AvatarId; size?: number; className?: string }> = ({
  avatar,
  size = 56,
  className = '',
}) => {
  const meta = AVATAR_OPTIONS.find((a) => a.id === avatar) || AVATAR_OPTIONS[0];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label={meta.label}>
      <circle cx="50" cy="50" r="48" fill={meta.bg} />
      {avatar === 'owl' && (
        <g>
          <circle cx="50" cy="56" r="30" fill="#8B7CF6" />
          <path d="M26 36 L34 22 L44 34 Z" fill="#6C5CE7" />
          <path d="M74 36 L66 22 L56 34 Z" fill="#6C5CE7" />
          <circle cx="38" cy="50" r="11" fill="#FFF" />
          <circle cx="62" cy="50" r="11" fill="#FFF" />
          <circle cx="39" cy="50" r="5" fill="#2D3436" />
          <circle cx="61" cy="50" r="5" fill="#2D3436" />
          <path d="M45 58 L55 58 L50 66 Z" fill="#FF9F43" />
        </g>
      )}
      {avatar === 'bear' && (
        <g>
          <circle cx="28" cy="30" r="12" fill="#C68B59" />
          <circle cx="72" cy="30" r="12" fill="#C68B59" />
          <circle cx="28" cy="30" r="6" fill="#E8C39E" />
          <circle cx="72" cy="30" r="6" fill="#E8C39E" />
          <circle cx="50" cy="54" r="30" fill="#C68B59" />
          <ellipse cx="50" cy="62" rx="14" ry="11" fill="#F3D9B1" />
          <circle cx="38" cy="48" r="4.5" fill="#2D3436" />
          <circle cx="62" cy="48" r="4.5" fill="#2D3436" />
          <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="#4A2C2A" />
        </g>
      )}
      {avatar === 'cat' && (
        <g>
          <path d="M24 44 L28 20 L46 34 Z" fill="#FF9F43" />
          <path d="M76 44 L72 20 L54 34 Z" fill="#FF9F43" />
          <circle cx="50" cy="56" r="28" fill="#FF9F43" />
          <circle cx="39" cy="52" r="4.5" fill="#2D3436" />
          <circle cx="61" cy="52" r="4.5" fill="#2D3436" />
          <path d="M46 60 L54 60 L50 65 Z" fill="#FF6B6B" />
          <path d="M44 69 Q50 74 56 69" stroke="#2D3436" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      )}
      {avatar === 'bunny' && (
        <g>
          <ellipse cx="38" cy="24" rx="8" ry="20" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <ellipse cx="62" cy="24" rx="8" ry="20" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <ellipse cx="38" cy="24" rx="4" ry="13" fill="#FFB3C6" />
          <ellipse cx="62" cy="24" rx="4" ry="13" fill="#FFB3C6" />
          <circle cx="50" cy="60" r="27" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="40" cy="56" r="4" fill="#2D3436" />
          <circle cx="60" cy="56" r="4" fill="#2D3436" />
          <ellipse cx="50" cy="64" rx="4" ry="3" fill="#FF758F" />
        </g>
      )}
      {avatar === 'fox' && (
        <g>
          <path d="M22 46 L26 18 L46 36 Z" fill="#FF6B35" />
          <path d="M78 46 L74 18 L54 36 Z" fill="#FF6B35" />
          <circle cx="50" cy="56" r="28" fill="#FF6B35" />
          <path d="M22 58 Q50 86 78 58 Q62 66 50 56 Q38 66 22 58 Z" fill="#FFF9F0" />
          <circle cx="38" cy="52" r="4" fill="#2D3436" />
          <circle cx="62" cy="52" r="4" fill="#2D3436" />
          <circle cx="50" cy="63" r="4.5" fill="#2D3436" />
        </g>
      )}
      {avatar === 'dino' && (
        <g>
          <circle cx="36" cy="24" r="7" fill="#2D9E5F" />
          <circle cx="50" cy="20" r="7" fill="#2D9E5F" />
          <circle cx="64" cy="24" r="7" fill="#2D9E5F" />
          <circle cx="50" cy="56" r="29" fill="#52B788" />
          <ellipse cx="50" cy="68" rx="18" ry="12" fill="#B7E4C7" />
          <circle cx="38" cy="50" r="4.5" fill="#2D3436" />
          <circle cx="62" cy="50" r="4.5" fill="#2D3436" />
          <path d="M40 64 Q50 72 60 64" stroke="#1B4332" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};
