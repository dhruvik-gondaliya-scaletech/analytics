import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  dateRange?: { from: string; to: string };
  setDateRange?: (range: { from: string; to: string }) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onRefresh,
}) => {
  return (
    <header className="h-16 px-8 border-b border-[#1a2f37] bg-[#0b1417]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10 font-sans">
      <div>
        <h2 className="text-lg font-display font-bold text-slate-100 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 font-normal">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Timezone Indicator */}
        <Badge variant="outline" className="gap-2 px-3 py-1.5 bg-[#111e22] border-[#1a2f37] text-slate-300 font-mono text-xs">
          <Calendar className="w-3.5 h-3.5 text-[#4a7c8f]" />
          <span>UTC Timezone</span>
        </Badge>

        {/* Live Indicator */}
        <Badge variant="success" className="gap-2 px-3 py-1.5 font-medium text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Ingestion</span>
        </Badge>

        {/* Manual Refresh */}
        {onRefresh && (
          <Button
            onClick={onRefresh}
            variant="secondary"
            size="icon"
            className="bg-[#1a2f37] hover:bg-[#24404b] border-[#4a7c8f]/30 text-slate-300 hover:text-white"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>
    </header>
  );
};
