import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Info, Minus, HelpCircle } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  unit?: string;
  changePct?: number;
  changeLabel?: string;
  comparisonNote?: string;
  tooltipText: string;
  icon?: React.ReactNode;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'default';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  unit,
  changePct,
  changeLabel = 'vs previous period',
  comparisonNote,
  tooltipText,
  icon,
  variant = 'default',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const isPositive = changePct !== undefined && changePct > 0;
  const isNegative = changePct !== undefined && changePct < 0;
  const isNeutral = changePct !== undefined && changePct === 0;

  const getVariantStyles = () => {
    switch (variant) {
      case 'blue':
        return {
          border: 'border-slate-200 hover:border-blue-300',
          iconBg: 'bg-blue-50 text-blue-600',
          accent: 'text-blue-600',
        };
      case 'emerald':
        return {
          border: 'border-slate-200 hover:border-emerald-300',
          iconBg: 'bg-emerald-50 text-emerald-600',
          accent: 'text-emerald-600',
        };
      case 'amber':
        return {
          border: 'border-slate-200 hover:border-amber-300',
          iconBg: 'bg-amber-50 text-amber-600',
          accent: 'text-amber-600',
        };
      case 'rose':
        return {
          border: 'border-slate-200 hover:border-rose-300',
          iconBg: 'bg-rose-50 text-rose-600',
          accent: 'text-rose-600',
        };
      default:
        return {
          border: 'border-slate-200 hover:border-slate-300',
          iconBg: 'bg-slate-100 text-slate-700',
          accent: 'text-slate-800',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`relative bg-white rounded-2xl border ${styles.border} p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">
            {title}
          </span>
          <div className="flex items-center gap-1.5">
            {icon && (
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${styles.iconBg}`}>
                {icon}
              </div>
            )}
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                title="Click or hover to learn more"
                aria-label={`What is ${title}?`}
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {showTooltip && (
                <div className="absolute right-0 top-7 z-50 w-60 p-3 bg-slate-900 text-white text-xs leading-relaxed rounded-xl shadow-xl border border-slate-700 pointer-events-none">
                  <div className="font-semibold text-teal-400 mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> What does this mean?
                  </div>
                  {tooltipText}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Big Value Display */}
        <div className="mt-1 flex items-baseline gap-1.5">
          {unit && <span className="text-base font-semibold text-slate-400">{unit}</span>}
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </span>
        </div>
        {subtitle && (
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Comparison Badge with friendly wording */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs">
        {changePct !== undefined ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center font-bold px-2 py-0.5 rounded-full text-[11px] ${
                isPositive
                  ? 'bg-emerald-100 text-emerald-800'
                  : isNegative
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isPositive && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />}
              {isNegative && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />}
              {isNeutral && <Minus className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />}
              {Math.abs(changePct)}% {isPositive ? 'more' : isNegative ? 'less' : 'same'}
            </span>
            <span className="text-slate-400 text-[11px] truncate">{changeLabel}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px] flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" />
            {comparisonNote || 'No previous period to compare'}
          </span>
        )}
      </div>
    </div>
  );
};
