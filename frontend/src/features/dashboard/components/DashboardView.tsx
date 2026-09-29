import React from 'react';
import { Dashboard } from '@/services/dashboard.service';
import { Activity, Users, ArrowUpRight } from 'lucide-react';

interface DashboardViewProps {
  dashboards: Dashboard[];
}

// Dumb Component: Only handles rendering UI based on props. No data fetching.
export default function DashboardView({ dashboards }: DashboardViewProps) {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-brand-dark mb-2">Analytics Overview</h1>
        <p className="text-muted-foreground">Monitor your project performance metrics.</p>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Events</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">1.2M</h3>
            </div>
            <div className="p-3 bg-brand/10 rounded-lg text-brand">
              <Activity size={20} />
            </div>
          </div>
          <div className="flex items-center text-sm text-primary">
            <ArrowUpRight size={16} className="mr-1" />
            <span className="font-medium">+12.5% from last week</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Users</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">45,231</h3>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
              <Users size={20} />
            </div>
          </div>
          <div className="flex items-center text-sm text-primary">
            <ArrowUpRight size={16} className="mr-1" />
            <span className="font-medium">+5.2% from last week</span>
          </div>
        </div>
      </div>

      {/* Dynamic Data from Props */}
      <section>
        <h2 className="text-xl font-bold text-brand-deep mb-4">Your Dashboards</h2>
        {dashboards.length === 0 ? (
          <div className="bg-accent rounded-xl p-12 text-center border border-border-strong border-dashed">
            <h3 className="text-lg font-medium text-foreground mb-2">No dashboards found</h3>
            <p className="text-muted-foreground mb-6">Create your first dashboard to visualize your data.</p>
            <button className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium px-6 py-2 rounded-md transition-colors">
              Create Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboards.map((dash) => (
              <div key={dash.id} className="bg-card border border-border rounded-xl p-6 hover:border-brand transition-colors cursor-pointer shadow-sm">
                <h3 className="text-lg font-bold text-foreground">{dash.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{dash.description || 'No description provided.'}</p>
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                  <span>{dash.panels?.length || 0} panels</span>
                  <span>Updated {new Date(dash.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
