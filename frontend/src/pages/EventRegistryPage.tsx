import React from 'react';
import { useEventRegistry } from '../hooks/useEventRegistry';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export const EventRegistryPage: React.FC = () => {
  const { events, loading, deprecateEvent } = useEventRegistry();

  const handleDeprecate = async (eventName: string) => {
    if (window.confirm(`Are you sure you want to mark event '${eventName}' as DEPRECATED?`)) {
      try {
        await deprecateEvent(eventName);
      } catch (err: any) {
        alert(err.message || 'Failed to deprecate event');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="success" className="gap-1.5 px-2.5 py-1 text-xs">
            <CheckCircle className="w-3.5 h-3.5" /> ACTIVE
          </Badge>
        );
      case 'DEPRECATED':
        return (
          <Badge variant="destructive" className="gap-1.5 px-2.5 py-1 text-xs bg-amber-500/10 text-amber-400 border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> DEPRECATED
          </Badge>
        );
      case 'UNREGISTERED':
      default:
        return (
          <Badge variant="outline" className="gap-1.5 px-2.5 py-1 text-xs bg-sky-500/10 text-sky-400 border-sky-500/30 font-mono">
            <Clock className="w-3.5 h-3.5" /> DISCOVERED
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-100">Event Registry & Data Quality</h3>
          <p className="text-xs text-slate-400">
            Catalog of instrumented and auto-discovered analytics events
          </p>
        </div>
      </div>

      {/* Registry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-32 w-full bg-[#1a2f37]" />
            <Skeleton className="h-32 w-full bg-[#1a2f37]" />
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-500 text-sm font-sans">
            No events registered or discovered yet.
          </div>
        ) : (
          events.map((evt) => (
            <Card
              key={evt.id || evt.eventName}
              className="bg-[#111e22]/90 border-white/10 shadow-lg space-y-4 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-slate-100 text-base">{evt.displayName || evt.eventName}</h4>
                  </div>
                  <p className="text-xs font-mono text-[#8abacb] mt-0.5">{evt.eventName}</p>
                </div>
                {getStatusBadge(evt.status)}
              </div>

              {evt.description && <p className="text-xs text-slate-300">{evt.description}</p>}

              {evt.properties && evt.properties.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Property Definitions</span>
                  <pre className="p-3 bg-[#0b1417] rounded-xl text-xs font-mono text-slate-300 border border-[#1a2f37] overflow-x-auto max-h-36">
                    {JSON.stringify(evt.properties, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#1a2f37] text-xs">
                <span className="text-slate-400 font-mono">Category: {evt.category || 'Core'}</span>
                {evt.status === 'ACTIVE' && (
                  <Button
                    onClick={() => handleDeprecate(evt.eventName)}
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                  >
                    Deprecate Event
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
