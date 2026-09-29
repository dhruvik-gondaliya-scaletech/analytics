"use client";

import React, { useEffect, useState } from 'react';
import { AuditView } from './AuditView';

export interface Audit {
  id: string;
  name?: string;
  created_at: string;
}

export function AuditContainer() {
  const [data, setData] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // API removed
        setTimeout(() => {
          setData([
            { id: '1', name: 'Sample Audit A', created_at: new Date().toISOString() },
            { id: '2', name: 'Sample Audit B', created_at: new Date(Date.now() - 86400000).toISOString() }
          ]);
          setIsLoading(false);
        }, 600);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
        <p>{error}</p>
      </div>
    );
  }

  return <AuditView data={data} />;
}
