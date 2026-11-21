import React from 'react';
import type { ShapeId } from '../../types';
import { SHAPES } from '../../data/catalog';

interface ShapeSvgProps {
  shapeId: ShapeId;
  size?: number;
  silhouette?: boolean;
  colorOverride?: string;
  className?: string;
}

export const ShapeSvg: React.FC<ShapeSvgProps> = ({
  shapeId,
  size = 84,
  silhouette = false,
  colorOverride,
  className = '',
}) => {
  const info = SHAPES.find((s) => s.id === shapeId) || SHAPES[0];
  const fill = silhouette ? '#CBD5E1' : colorOverride || info.colorHex;
  const stroke = silhouette ? '#94A3B8' : 'rgba(0,0,0,0.14)';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label={info.name}>
      {shapeId === 'circulo' && (
        <circle
          cx="50"
          cy="50"
          r="38"
          fill={fill}
          stroke={stroke}
          strokeWidth={silhouette ? 4 : 3}
          strokeDasharray={silhouette ? '7 5' : undefined}
        />
      )}
      {shapeId === 'quadrado' && (
        <rect
          x="16"
          y="16"
          width="68"
          height="68"
          rx="12"
          fill={fill}
          stroke={stroke}
          strokeWidth={silhouette ? 4 : 3}
          strokeDasharray={silhouette ? '7 5' : undefined}
        />
      )}
      {shapeId === 'retangulo' && (
        <rect
          x="8"
          y="26"
          width="84"
          height="48"
          rx="12"
          fill={fill}
          stroke={stroke}
          strokeWidth={silhouette ? 4 : 3}
          strokeDasharray={silhouette ? '7 5' : undefined}
        />
      )}
      {shapeId === 'triangulo' && (
        <path
          d="M50 13 L88 83 Q90 87 85 87 L15 87 Q10 87 12 83 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth={silhouette ? 4 : 3}
          strokeDasharray={silhouette ? '7 5' : undefined}
          strokeLinejoin="round"
        />
      )}
      {shapeId === 'estrela' && (
        <path
          d="M50 10 L61 36 L89 39 L67 57 L74 85 L50 70 L26 85 L33 57 L11 39 L39 36 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth={silhouette ? 4 : 3}
          strokeDasharray={silhouette ? '7 5' : undefined}
          strokeLinejoin="round"
        />
      )}
      {shapeId === 'coracao' && (
        <path
          d="M50 86 C20 66 10 46 16 30 C22 14 40 16 50 30 C60 16 78 14 84 30 C90 46 80 66 50 86 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth={silhouette ? 4 : 3}
          strokeDasharray={silhouette ? '7 5' : undefined}
          strokeLinejoin="round"
        />
      )}

      {/* Friendly cute face on non-silhouette shapes */}
      {!silhouette && (
        <g opacity="0.9">
          <circle cx="40" cy={shapeId === 'triangulo' ? 60 : 48} r="3.5" fill="#2D3436" />
          <circle cx="60" cy={shapeId === 'triangulo' ? 60 : 48} r="3.5" fill="#2D3436" />
          <path
            d={
              shapeId === 'triangulo'
                ? 'M44 68 Q50 74 56 68'
                : 'M44 56 Q50 62 56 56'
            }
            stroke="#2D3436"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
};
