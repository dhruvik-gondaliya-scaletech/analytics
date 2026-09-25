import React, { useState } from 'react';
import { useFunnels } from '../hooks/useFunnels';
import { FunnelChartComponent } from '../components/charts/FunnelChartComponent';
import { Plus, Trash2, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export const FunnelsPage: React.FC = () => {
  const { funnelData, loading, calculateFunnel } = useFunnels();
  const [steps, setSteps] = useState<string[]>(['product.viewed', 'checkout.started', 'payment.completed']);
  const [windowDays, setWindowDays] = useState(7);

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleRemoveStep = (idx: number) => {
    if (steps.length <= 2) return;
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const handleStepChange = (idx: number, val: string) => {
    const updated = [...steps];
    updated[idx] = val;
    setSteps(updated);
  };

  const handleCalculateFunnel = async (e: React.FormEvent) => {
    e.preventDefault();
    const validSteps = steps.map((s) => s.trim()).filter(Boolean);
    if (validSteps.length < 2) return;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.valueOf() - 30 * 24 * 60 * 60 * 1000);

    await calculateFunnel({
      steps: validSteps,
      window_days: windowDays,
      date_range: {
        from: thirtyDaysAgo.toISOString(),
        to: now.toISOString(),
      },
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step Builder Form */}
        <Card className="bg-[#111e22]/90 border-white/10 shadow-xl h-fit">
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <Filter className="w-5 h-5 text-[#4a7c8f]" />
            <CardTitle className="text-base font-display font-bold text-slate-100">Funnel Step Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCalculateFunnel} className="space-y-4">
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#1a2f37] text-slate-400 text-xs font-bold flex items-center justify-center shrink-0 border border-white/10 font-mono">
                      {idx + 1}
                    </span>
                    <Input
                      type="text"
                      required
                      placeholder={`e.g. step_${idx + 1}`}
                      value={step}
                      onChange={(e) => handleStepChange(idx, e.target.value)}
                      className="bg-[#0b1417] border-white/10 text-xs focus:border-[#4a7c8f]"
                    />
                    {steps.length > 2 && (
                      <Button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                onClick={handleAddStep}
                variant="outline"
                className="w-full border-dashed border-[#1a2f37] hover:border-[#4a7c8f] text-xs font-semibold text-slate-300 gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Conversion Step</span>
              </Button>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                  Completion Window (Days)
                </label>
                <Select
                  value={windowDays.toString()}
                  onValueChange={(val) => setWindowDays(parseInt(val, 10))}
                >
                  <SelectTrigger className="bg-[#0b1417] border-white/10 text-xs">
                    <SelectValue placeholder="Select window days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="7">7 Days (Default)</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="brand"
                className="w-full font-semibold text-xs shadow-lg shadow-[#4a7c8f]/20 cursor-pointer"
              >
                {loading ? 'Calculating Funnel...' : 'Run Conversion Analysis'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Funnel Visualization */}
        <Card className="lg:col-span-2 bg-[#111e22]/90 border-white/10 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display font-bold text-slate-100">Funnel Conversion Results</CardTitle>
            <p className="text-xs text-slate-400">Identity basis: product user_id fallback to anonymous_id</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 space-y-4">
                <Skeleton className="h-10 w-full bg-[#1a2f37]" />
                <Skeleton className="h-10 w-3/4 bg-[#1a2f37]" />
                <Skeleton className="h-10 w-1/2 bg-[#1a2f37]" />
              </div>
            ) : !funnelData ? (
              <div className="py-20 text-center text-slate-500 text-sm font-sans">
                Configure steps on the left and click "Run Conversion Analysis" to calculate.
              </div>
            ) : (
              <FunnelChartComponent steps={funnelData.steps} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
