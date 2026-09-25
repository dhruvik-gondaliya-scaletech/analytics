import React, { useState } from 'react';
import { useDashboards } from '../hooks/useDashboards';
import { Plus, Trash2, Globe, Lock } from 'lucide-react';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export const DashboardsPage: React.FC = () => {
  const {
    dashboards,
    activeDashboard,
    setActiveDashboard,
    createDashboard,
    deleteDashboard,
  } = useDashboards();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDashboard({
        title,
        description,
        visibility: 'SHARED',
      });

      setShowCreateModal(false);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      alert(err.message || 'Failed to create dashboard');
    }
  };

  const handleDeleteDashboard = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dashboard?')) {
      try {
        await deleteDashboard(id);
        if (activeDashboard?.id === id) {
          setActiveDashboard(dashboards.find((d) => d.id !== id) || null);
        }
      } catch (err: any) {
        alert(err.message || 'Failed to delete dashboard');
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Selector & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select
            value={activeDashboard?.id || ''}
            onValueChange={(val) => {
              const selected = dashboards.find((d) => d.id === val);
              if (selected) setActiveDashboard(selected);
            }}
          >
            <SelectTrigger className="bg-[#111e22] border-white/10 text-sm font-bold text-slate-100 min-w-[220px]">
              <SelectValue placeholder="Select Dashboard" />
            </SelectTrigger>
            <SelectContent>
              {dashboards.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.title} ({d.visibility})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeDashboard && (
            <Badge
              variant={activeDashboard.visibility === 'SHARED' ? 'success' : 'outline'}
              className="gap-1.5 px-2.5 py-1 text-xs"
            >
              {activeDashboard.visibility === 'SHARED' ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {activeDashboard.visibility}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="brand"
            className="cursor-pointer gap-2 font-semibold text-xs shadow-lg shadow-[#4a7c8f]/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Dashboard</span>
          </Button>

          {activeDashboard && (
            <Button
              onClick={() => handleDeleteDashboard(activeDashboard.id)}
              variant="ghost"
              size="icon"
              className="cursor-pointer text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
              title="Delete Dashboard"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Dashboard Viewport & Widget Grid */}
      {!activeDashboard ? (
        <Card className="bg-[#111e22]/90 border-white/10 p-12 text-center text-slate-500 text-sm">
          No active dashboard selected. Create or select a dashboard above.
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="bg-[#111e22]/90 border-white/10 p-6 shadow-xl space-y-1">
            <CardTitle className="text-xl font-display font-bold text-slate-100">{activeDashboard.title}</CardTitle>
            {activeDashboard.description && (
              <p className="text-xs text-slate-400">{activeDashboard.description}</p>
            )}
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(!activeDashboard.widgets || activeDashboard.widgets.length === 0) ? (
              <Card className="col-span-2 bg-[#111e22]/90 border-white/10 p-12 text-center text-slate-500 text-sm">
                No layout widgets configured for this dashboard yet.
              </Card>
            ) : (
              activeDashboard.widgets.map((widget, idx) => (
                <Card key={idx} className="bg-[#111e22]/90 border-white/10 shadow-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-display font-bold text-slate-100">
                      {widget.insight?.title || `Analytical Widget #${idx + 1}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <TimeSeriesChart
                      data={widget.insight?.execution_result?.results || []}
                      type="area"
                      dataKey="events"
                      height={240}
                      color="#4a7c8f"
                    />
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Dashboard Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#111e22] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-display font-bold text-slate-100">Create New Dashboard</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateDashboard} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Dashboard Title</label>
              <Input
                type="text"
                required
                placeholder="e.g. Executive Growth Overview"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#0b1417] border-white/10 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Description</label>
              <Input
                type="text"
                placeholder="Brief summary of layout focus"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-[#0b1417] border-white/10 text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreateModal(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="brand"
                className="cursor-pointer font-semibold"
              >
                Create Dashboard
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
