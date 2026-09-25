import React from 'react';
import type { RetentionCohort } from '../../types';

interface RetentionHeatmapProps {
  cohorts: RetentionCohort[];
}

export const RetentionHeatmap: React.FC<RetentionHeatmapProps> = ({ cohorts }) => {
  if (!cohorts || cohorts.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        No cohort retention data available for selected parameters.
      </div>
    );
  }

  const days = [0, 1, 7, 14, 30];

  const getBgColor = (pct: number) => {
    if (pct >= 80) return 'bg-brand-600 text-white font-bold';
    if (pct >= 50) return 'bg-brand-700/80 text-brand-100 font-semibold';
    if (pct >= 25) return 'bg-brand-800/60 text-brand-200';
    if (pct >= 10) return 'bg-brand-900/40 text-brand-300';
    return 'bg-slate-900 text-slate-500';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
            <th className="py-3 px-4">Cohort Date</th>
            <th className="py-3 px-4 text-right">Size</th>
            {days.map((d) => (
              <th key={d} className="py-3 px-4 text-center">
                Day {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono">
          {cohorts.map((cohort, idx) => (
            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 text-slate-300 font-sans font-medium">
                {cohort.cohort_date.slice(0, 10)}
              </td>
              <td className="py-3 px-4 text-right text-slate-200 font-bold">
                {cohort.cohort_size.toLocaleString()}
              </td>
              {days.map((day) => {
                const retItem = cohort.retention.find((r) => r.day === day);
                const pct = retItem ? retItem.retention_pct : 0;

                return (
                  <td key={day} className="py-2 px-2 text-center">
                    <div
                      className={`py-1.5 px-2 rounded-md transition-all ${getBgColor(pct)}`}
                      title={`${retItem?.returning_users || 0} returning users (${pct}%)`}
                    >
                      {pct}%
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
