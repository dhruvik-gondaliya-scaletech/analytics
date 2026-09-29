import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export interface Identity {
  id: string;
  name?: string;
  created_at: string;
}


interface IdentityViewProps {
  data: Identity[];
}

export function IdentityView({ data }: IdentityViewProps) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Identity Analytics</h1>
        <p className="text-muted-foreground">Manage and analyze your identity data.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-border/50 bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Identitys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.length || 0}</div>
            <p className="text-xs text-primary mt-1">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Recent Identitys</CardTitle>
          <CardDescription>A list of your most recent identity records.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-8 text-center bg-accent/50 rounded-lg border border-dashed border-border">
                <p className="text-muted-foreground">No identity data available yet.</p>
             </div>
          ) : (
            <div className="space-y-4">
              {data.map((item, i) => (
                <div key={item.id || i} className="flex items-center justify-between p-4 border rounded-lg bg-background">
                  <div className="font-medium">{item.name || 'Identity ' + item.id}</div>
                  <div className="text-sm text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
