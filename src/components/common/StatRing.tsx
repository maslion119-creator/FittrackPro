import React from 'react';

interface StatRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string; // e.g. '#10b981' or class
  bgColor?: string;
  children?: React.ReactNode;
  className?: string;
}

export const StatRing: React.FC<StatRingProps> = ({
  value,
  max,
  size = 90,
  strokeWidth = 8,
  color = '#10b981',
  bgColor,
  children,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 origin-center transition-all duration-500 ease-out"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor || 'currentColor'}
          strokeWidth={strokeWidth}
          fill="transparent"
          className={!bgColor ? 'text-slate-100 dark:text-slate-800' : ''}
        />
        {/* Active Progress Stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center slot */}
      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
        {children}
      </div>
    </div>
  );
};
