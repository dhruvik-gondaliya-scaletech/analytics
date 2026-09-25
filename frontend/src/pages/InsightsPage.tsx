import React, { useState } from 'react';
import { useInsights } from '../hooks/useInsights';
import type { SavedInsight } from '../types';
import { Plus, Trash2, Globe, Lock, Play } from 'lucide-react';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export const InsightsPage: React.FC = () => {
  const { insights, loading, createInsight, deleteInsight } = useInsights();
  const [selectedInsight, setSelectedInsight] = useState<SavedInsight | null>(null);
  const [showModal, setShowModal] = useState(false);

  // New Insight Form
  const [title, setTitle] = useState('');
  const [eventName, setEventName] = useState('checkout.completed');
  const [aggregation, setAggregation] = useState('COUNT');
  const [visibility, setVisibility] = useState<'PRIVATE' | 'SHARED'>('SHARED');

  const handleCreateInsight = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.valueOf() - 30 * 24 * 60 * 60 * 1000);

      await createInsight({
        title,
        description: `Saved query for ${eventName} (${aggregation})`,
        type: 'time_series',
        chart_config: {
          chart_type: 'LINE',
          event_name: eventName,
          aggregation,
          date_range: {
            from: thirtyDaysAgo.toISOString(),
            to: now.toISOString(),
          },
          interval: 'day',
        },
        visibility,
      });

      setShowModal(false);
      setTitle('');
    } catch (err: any) {
      alert(err.message || 'Failed to save insight');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this saved insight?')) {
      try {
        await deleteInsight(id);
        if (selectedInsight?.id === id) setSelectedInsight(null);
      } catch (err: any) {
        alert(err.message || 'Failed to delete insight');
      }
    }
  };

  const inspectInsight = (insight: SavedInsight) => {
    setSelectedInsight(insight);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-100">Saved Insights</h3>
          <p className="text-xs text-slate-400">Reusable query configurations and saved analytical reports</p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          variant="brand"
          className="cursor-pointer gap-2 font-semibold text-xs shadow-lg shadow-[#4a7c8f]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Saved Insight</span>
        </Button>
      </div>

      {/* Grid of Saved Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 space-y-4">
            <Skeleton className="h-36 w-full bg-[#1a2f37]" />
          </div>
        ) : insights.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-slate-500 text-sm font-sans">
            No saved insights created yet. Click "Create Saved Insight" above.
          </div>
        ) : (
          insights.map((insight) => (
            <Card
              key={insight.id}
              className="bg-[#111e22]/90 border-white/10 shadow-lg p-5 flex flex-col justify-between hover:border-[#4a7c8f]/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-display font-bold text-slate-100 text-sm truncate">{insight.title}</h4>
                  <Badge
                    variant={insight.visibility === 'SHARED' ? 'success' : 'outline'}
                    className="gap-1 text-[10px]"
                  >
                    {insight.visibility === 'SHARED' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {insight.visibility}
                  </Badge>
                </div>
                {insight.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{insight.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-[#1a2f37] flex items-center justify-between text-xs">
                <Button
                  onClick={() => inspectInsight(insight)}
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer gap-1 text-[#4a7c8f] hover:text-[#8abacb] hover:bg-[#1a2f37] font-semibold text-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute & Render</span>
                </Button>
                <Button
                  onClick={() => handleDelete(insight.id)}
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Selected Insight Render Drawer/Modal */}
      {selectedInsight && (
        <Card className="bg-[#111e22]/90 border-white/10 shadow-2xl space-y-4">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[#1a2f37] pb-4">
            <div>
              <CardTitle className="text-lg font-display font-bold text-slate-100">{selectedInsight.title}</CardTitle>
              <p className="text-xs text-slate-400 font-mono">
                Event: {selectedInsight.chartConfig?.event_name || 'All'} | Agg: {selectedInsight.chartConfig?.aggregation}
              </p>
            </div>
            <Button
              onClick={() => setSelectedInsight(null)}
              variant="ghost"
              size="sm"
              className="cursor-pointer text-xs text-slate-400 hover:text-white"
            >
              Close Preview
            </Button>
          </CardHeader>

          <CardContent className="pt-2">
            <TimeSeriesChart
              data={selectedInsight.execution_result?.results || []}
              type="area"
              dataKey="value"
              height={300}
              color="#4a7c8f"
            />
          </CardContent>
        </Card>
      )}

      {/* Create Insight Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#111e22] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-display font-bold text-slate-100">Save Analytical Insight</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateInsight} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Insight Title</label>
              <Input
                type="text"
                required
                placeholder="e.g. Daily Checkout Count"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#0b1417] border-white/10 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Event Name</label>
              <Input
                type="text"
                required
                placeholder="checkout.completed"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="bg-[#0b1417] border-white/10 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Aggregation</label>
              <Select value={aggregation} onValueChange={setAggregation}>
                <SelectTrigger className="bg-[#0b1417] border-white/10 text-xs">
                  <SelectValue placeholder="Select aggregation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COUNT">Total Count</SelectItem>
                  <SelectItem value="UNIQUE_USERS">Unique Users</SelectItem>
                  <SelectItem value="SUM">Sum of Property</SelectItem>
                  <SelectItem value="AVG">Average of Property</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Visibility</label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as any)}>
                <SelectTrigger className="bg-[#0b1417] border-white/10 text-xs">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHARED">SHARED (Visible to all dashboard users)</SelectItem>
                  <SelectItem value="PRIVATE">PRIVATE (Only visible to you & ADMIN)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowModal(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="brand"
                className="cursor-pointer font-semibold"
              >
                Save Insight
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
