import React, { useEffect, useState } from 'react';
import { useEventExplorer } from '../hooks/useEventExplorer';
import type { EventItem } from '../types';
import { Search, Download, Code, X, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const EventExplorerPage: React.FC = () => {
  const { events, loading, totalPages, fetchEvents, getExportCsvUrl } = useEventExplorer();
  const [page, setPage] = useState(1);
  const [eventName, setEventName] = useState('');
  const [userId, setUserId] = useState('');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchEvents({ page, limit: 25, event_name: eventName || undefined, user_id: userId || undefined, search: search || undefined });
  }, [page, eventName, userId, fetchEvents]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEvents({ page: 1, limit: 25, event_name: eventName || undefined, user_id: userId || undefined, search: search || undefined });
  };

  const handleExportCsv = () => {
    const url = getExportCsvUrl({ event_name: eventName || undefined, user_id: userId || undefined, search: search || undefined });
    window.open(url, '_blank');
  };

  const copyPayload = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Controls Bar */}
      <Card className="bg-[#111e22]/90 border-white/10 p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[200px] flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
              <Input
                type="text"
                placeholder="Search event payloads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#0b1417] border-white/10 text-xs pl-10 focus:border-[#4a7c8f]"
              />
            </div>

            <Input
              type="text"
              placeholder="Filter by event name"
              value={eventName}
              onChange={(e) => {
                setEventName(e.target.value);
                setPage(1);
              }}
              className="bg-[#0b1417] border-white/10 text-xs w-44 focus:border-[#4a7c8f]"
            />

            <Input
              type="text"
              placeholder="Filter by User ID"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setPage(1);
              }}
              className="bg-[#0b1417] border-white/10 text-xs w-44 focus:border-[#4a7c8f]"
            />

            <Button
              type="submit"
              variant="brand"
              size="sm"
              className="cursor-pointer"
            >
              Apply Filters
            </Button>
          </form>

          <Button
            onClick={handleExportCsv}
            variant="secondary"
            size="sm"
            className="cursor-pointer gap-2 bg-[#1a2f37] border-white/10 text-slate-200 hover:bg-[#24404b]"
          >
            <Download className="w-4 h-4 text-[#4a7c8f]" />
            <span>Export CSV</span>
          </Button>
        </div>
      </Card>

      {/* Events Table */}
      <Card className="bg-[#111e22]/90 border-white/10 shadow-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#1a2f37]">
              <TableHead className="py-3.5 px-4 text-slate-400">Timestamp (UTC)</TableHead>
              <TableHead className="py-3.5 px-4 text-slate-400">Event Name</TableHead>
              <TableHead className="py-3.5 px-4 text-slate-400">User ID</TableHead>
              <TableHead className="py-3.5 px-4 text-slate-400">Anonymous ID</TableHead>
              <TableHead className="py-3.5 px-4 text-slate-400">IP / Country</TableHead>
              <TableHead className="py-3.5 px-4 text-right text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-mono">
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                  Loading events...
                </TableCell>
              </TableRow>
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                  No matching events found.
                </TableCell>
              </TableRow>
            ) : (
              events.map((evt) => (
                <TableRow key={evt.event_id} className="hover:bg-[#1a2f37]/40 border-[#1a2f37]">
                  <TableCell className="text-slate-400">{evt.timestamp.slice(0, 19).replace('T', ' ')}</TableCell>
                  <TableCell className="font-sans font-semibold text-[#8abacb]">
                    <Badge variant="brand" className="font-mono">{evt.event_name}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-300 truncate max-w-[120px]">{evt.user_id || '—'}</TableCell>
                  <TableCell className="text-slate-400 truncate max-w-[120px]">{evt.anonymous_id || '—'}</TableCell>
                  <TableCell className="text-slate-400">
                    {evt.ip || '—'} {evt.country ? `(${evt.country})` : ''}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => setSelectedEvent(evt)}
                      variant="secondary"
                      size="sm"
                      className="cursor-pointer gap-1 bg-[#1a2f37] hover:bg-[#24404b] border-white/10 text-xs"
                    >
                      <Code className="w-3.5 h-3.5 text-[#4a7c8f]" />
                      <span>Inspect Payload</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#1a2f37] bg-[#0b1417]/40 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page <strong className="text-slate-200">{page}</strong> of <strong className="text-slate-200">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <Button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              variant="secondary"
              size="icon"
              className="cursor-pointer bg-[#1a2f37] border-white/10 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              variant="secondary"
              size="icon"
              className="cursor-pointer bg-[#1a2f37] border-white/10 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* JSON Detail Drawer Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-[#111e22] border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <CardHeader className="p-5 border-b border-[#1a2f37] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-bold text-slate-100 text-base">{selectedEvent.event_name}</CardTitle>
                <p className="text-xs font-mono text-slate-400">ID: {selectedEvent.event_id}</p>
              </div>
              <Button
                onClick={() => setSelectedEvent(null)}
                variant="ghost"
                size="icon"
                className="cursor-pointer p-1 text-slate-400 hover:text-white hover:bg-[#1a2f37]"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Event Payload JSON</span>
                <Button
                  onClick={() => copyPayload(selectedEvent)}
                  variant="secondary"
                  size="sm"
                  className="cursor-pointer gap-1 bg-[#1a2f37] text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </Button>
              </div>
              <pre className="bg-[#0b1417] p-4 rounded-xl text-xs font-mono text-slate-200 border border-[#1a2f37] overflow-x-auto">
                {JSON.stringify(selectedEvent, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
