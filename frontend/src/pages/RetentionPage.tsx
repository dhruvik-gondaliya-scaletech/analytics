import React, { useState } from 'react';
import { useRetention } from '../hooks/useRetention';
import { RetentionHeatmap } from '../components/charts/RetentionHeatmap';
import { Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export const RetentionPage: React.FC = () => {
  const { retentionData, loading, calculateRetention } = useRetention();
  const [cohortEvent, setCohortEvent] = useState('user.signup');
  const [returnEvent, setReturnEvent] = useState('');

  const handleCalculateRetention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohortEvent) return;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.valueOf() - 30 * 24 * 60 * 60 * 1000);

    await calculateRetention({
      cohort_event: cohortEvent,
      return_event: returnEvent || undefined,
      date_range: {
        from: thirtyDaysAgo.toISOString(),
        to: now.toISOString(),
      },
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <Card className="bg-[#111e22]/90 border-white/10 shadow-xl">
        <CardHeader className="pb-3 flex flex-row items-center gap-3">
          <Users className="w-5 h-5 text-purple-400" />
          <div>
            <CardTitle className="text-base font-display font-bold text-slate-100">Cohort Retention Matrix</CardTitle>
            <p className="text-xs text-slate-400">Track user return rates over Day 0, Day 1, Day 7, Day 14, and Day 30</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCalculateRetention} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                Cohort Assignment Event
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. user.signup"
                value={cohortEvent}
                onChange={(e) => setCohortEvent(e.target.value)}
                className="bg-[#0b1417] border-white/10 text-xs focus:border-[#4a7c8f]"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                Return Activity Event (Optional)
              </label>
              <Input
                type="text"
                placeholder="Any qualifying activity if empty"
                value={returnEvent}
                onChange={(e) => setReturnEvent(e.target.value)}
                className="bg-[#0b1417] border-white/10 text-xs focus:border-[#4a7c8f]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="brand"
              className="font-semibold text-xs shadow-lg shadow-[#4a7c8f]/20 cursor-pointer"
            >
              {loading ? 'Calculating Matrix...' : 'Generate Retention Matrix'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Matrix Result Card */}
      <Card className="bg-[#111e22]/90 border-white/10 shadow-xl">
        <CardContent className="p-6">
          {loading ? (
            <div className="py-12 space-y-3">
              <Skeleton className="h-8 w-full bg-[#1a2f37]" />
              <Skeleton className="h-8 w-full bg-[#1a2f37]" />
              <Skeleton className="h-8 w-full bg-[#1a2f37]" />
            </div>
          ) : !retentionData ? (
            <div className="py-20 text-center text-slate-500 text-sm font-sans">
              Enter a cohort event above and click "Generate Retention Matrix" to view retention heatmap.
            </div>
          ) : (
            <RetentionHeatmap cohorts={retentionData.cohorts} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
