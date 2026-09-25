import React from 'react';
import type { FunnelStep } from '../../types';
import { ArrowDownRight, Users } from 'lucide-react';

interface FunnelChartProps {
  steps: FunnelStep[];
}

export const FunnelChartComponent: React.FC<FunnelChartProps> = ({ steps }) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        No funnel steps configured or data available.
      </div>
    );
  }

  const maxUsers = steps[0]?.unique_users || 1;

  return (
    <div className="space-y-6">
      {steps.map((step, idx) => {
        const widthPct = Math.max(12, Math.round((step.unique_users / maxUsers) * 100));

        return (
          <div key={idx} className="space-y-2">
            {/* Step Header */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold flex items-center justify-center border border-brand-500/30">
                  {step.step_index}
                </span>
                <span className="font-semibold text-slate-200">{step.step_name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-300 font-mono flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-brand-400" />
                  {step.unique_users.toLocaleString()} users
                </span>
                <span className="text-emerald-400 font-semibold font-mono">
                  {step.overall_conversion_pct}% overall
                </span>
              </div>
            </div>

            {/* Funnel Bar */}
            <div className="w-full bg-slate-900 rounded-lg overflow-hidden h-10 p-1 border border-slate-800 flex items-center">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-md transition-all duration-500 flex items-center justify-end px-3 shadow-md"
                style={{ width: `${widthPct}%` }}
              >
                <span className="text-xs font-bold text-white drop-shadow">
                  {step.conversion_from_prev_pct}%
                </span>
              </div>
            </div>

            {/* Drop-off Callout */}
            {idx < steps.length - 1 && (
              <div className="flex items-center gap-2 px-3 py-1 text-xs text-rose-400/90 font-medium">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>
                  Drop-off: {step.dropoff_count.toLocaleString()} users ({step.dropoff_pct}%)
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
