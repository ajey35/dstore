import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'slate' | 'indigo';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'md',
  className = '',
}) => {
  const styles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${styles[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};
