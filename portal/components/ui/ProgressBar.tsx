import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  sublabel?: string;
  color?: 'emerald' | 'cyan' | 'amber' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  sublabel,
  color = 'emerald',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, value));

  const colors = {
    emerald: 'bg-emerald-500 shadow-emerald-500/50',
    cyan: 'bg-cyan-500 shadow-cyan-500/50',
    amber: 'bg-amber-500 shadow-amber-500/50',
    indigo: 'bg-indigo-500 shadow-indigo-500/50',
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || sublabel) && (
        <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5 font-medium">
          {label && <span className="text-slate-300">{label}</span>}
          {sublabel && <span className="text-slate-400 font-mono">{sublabel}</span>}
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 ${heights[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${colors[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
