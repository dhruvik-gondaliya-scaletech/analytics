"use client";

import React from 'react';
import { DrilldownView } from './DrilldownView';
import { useDrilldown } from '../../../hooks/useDrilldown';


export interface Drilldown {
  id: string;
  name?: string;
  created_at: string;
}

export function DrilldownContainer() {
  const { data, isLoading, error } = useDrilldown({ startDate: '2026-01-01T00:00:00.000Z', endDate: '2026-01-01T00:00:00.000Z' });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded-md" />
        <div className="h-4 w-96 bg-muted rounded-md mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-muted rounded-xl" />
        </div>
        <div className="h-96 bg-muted rounded-xl mt-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
        <h3 className="font-bold mb-2">Error Loading Data</h3>
        <p>{(error as Error)?.message || 'Failed to load data'}</p>
      </div>
    );
  }

  return <DrilldownView data={data || []} />;
}
