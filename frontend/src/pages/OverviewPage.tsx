import React from 'react';
import { useOverview } from '../hooks/useOverview';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { Users, Activity, TrendingUp, Layers, MousePointer, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export const OverviewPage: React.FC = () => {
  const { data, loading } = useOverview();

  const metrics = data?.metrics || {
    dau: 0,
    wau: 0,
    mau: 0,
    total_events: 0,
    unique_users: 0,
    active_sessions: 0,
  };

  const kpiCards = [
    { title: 'Daily Active Users (DAU)', value: metrics.dau.toLocaleString(), icon: Users, color: 'text-[#4a7c8f]' },
    { title: 'Weekly Active Users (WAU)', value: metrics.wau.toLocaleString(), icon: TrendingUp, color: 'text-emerald-400' },
    { title: 'Monthly Active Users (MAU)', value: metrics.mau.toLocaleString(), icon: ShieldCheck, color: 'text-purple-400' },
    { title: 'Total Ingested Events', value: metrics.total_events.toLocaleString(), icon: Activity, color: 'text-sky-400' },
    { title: 'Unique Product Identities', value: metrics.unique_users.toLocaleString(), icon: MousePointer, color: 'text-amber-400' },
    { title: 'Active Product Sessions', value: metrics.active_sessions.toLocaleString(), icon: Layers, color: 'text-indigo-400' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="bg-[#111e22]/90 border-white/10 hover:border-[#4a7c8f]/40 transition-all shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
                  <div className="p-2 rounded-lg bg-[#1a2f37] border border-[#24404b]">
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-display font-bold text-slate-100 tracking-tight">
                  {loading ? <Skeleton className="h-8 w-24 bg-[#1a2f37]" /> : card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Activity Chart */}
      <Card className="bg-[#111e22]/90 border-white/10 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display font-bold text-slate-100">30-Day Activity Trend</CardTitle>
          <p className="text-xs text-slate-400">Daily event volume and active user count (UTC)</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full bg-[#1a2f37]" />
          ) : (
            <TimeSeriesChart data={data?.trend || []} type="area" dataKey="events" height={280} color="#4a7c8f" />
          )}
        </CardContent>
      </Card>

      {/* Top Events Table */}
      <Card className="bg-[#111e22]/90 border-white/10 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display font-bold text-slate-100">Top Observed Events</CardTitle>
          <p className="text-xs text-slate-400">Most frequent event types in selected window</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#1a2f37]">
                <TableHead className="py-3 px-4 text-slate-400">Event Name</TableHead>
                <TableHead className="py-3 px-4 text-right text-slate-400">Event Count</TableHead>
                <TableHead className="py-3 px-4 text-right text-slate-400">Unique Users</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-slate-500 font-sans">
                    <Skeleton className="h-10 w-full bg-[#1a2f37]" />
                  </TableCell>
                </TableRow>
              ) : !data?.top_events || data.top_events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-slate-500 font-sans">
                    No events ingested yet. Send your first event via API to begin.
                  </TableCell>
                </TableRow>
              ) : (
                data.top_events.map((evt, idx) => (
                  <TableRow key={idx} className="hover:bg-[#1a2f37]/40 border-[#1a2f37]">
                    <TableCell className="font-sans font-semibold text-[#8abacb]">
                      <Badge variant="brand" className="font-mono">{evt.event_name}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-100 font-mono">
                      {evt.count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-slate-300 font-mono">
                      {evt.unique_users.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
