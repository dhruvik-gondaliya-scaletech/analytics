import React from 'react';
import { Dashboard } from '@/services/dashboard.service';
import { Activity, Users, ArrowUpRight } from 'lucide-react';

interface DashboardViewProps {
  dashboards: Dashboard[];
}

// Dumb Component: Only handles rendering UI based on props. No data fetching.
export default function DashboardView({ dashboards }: DashboardViewProps) {
  return (
    <div>
      <header className="mb-[32px]">
        <h1 className="text-[28px] md:text-[32px] leading-tight font-semibold text-foreground mb-1.5">Analytics Overview</h1>
        <p className="text-[15px] text-muted-foreground">Monitor your project performance metrics.</p>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-[32px]">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5">Total Events</p>
              <h3 className="text-[28px] leading-none font-bold text-foreground">1.2M</h3>
            </div>
            <div className="w-10 h-10 flex items-center justify-center bg-accent rounded-lg text-muted-foreground">
              <Activity size={18} strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-center text-[13px] text-green-600 mt-auto font-medium">
            <ArrowUpRight size={14} className="mr-0.5" strokeWidth={2.5} />
            <span>+12.5% from last week</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5">Active Users</p>
              <h3 className="text-[28px] leading-none font-bold text-foreground">45,231</h3>
            </div>
            <div className="w-10 h-10 flex items-center justify-center bg-accent rounded-lg text-muted-foreground">
              <Users size={18} strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-center text-[13px] text-green-600 mt-auto font-medium">
            <ArrowUpRight size={14} className="mr-0.5" strokeWidth={2.5} />
            <span>+5.2% from last week</span>
          </div>
        </div>
      </div>

      {/* Dynamic Data from Props */}
      <section>
        <h2 className="text-[19px] font-semibold text-foreground mb-4">Your Dashboards</h2>
        {dashboards.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[220px] bg-accent/30 border border-border border-dashed rounded-xl p-8 text-center w-full">
            <h3 className="text-[17px] font-semibold text-foreground mb-1.5">No dashboards found</h3>
            <p className="text-[14px] text-muted-foreground mb-6">Create your first dashboard to visualize your data.</p>
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-[14px] font-medium h-[38px] px-5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Create Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {dashboards.map((dash) => (
              <div key={dash.id} className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer shadow-sm group">
                <h3 className="text-[17px] font-semibold text-foreground group-hover:text-primary transition-colors">{dash.name}</h3>
                <p className="text-[14px] text-muted-foreground mt-2 line-clamp-2">{dash.description || 'No description provided.'}</p>
                <div className="mt-5 pt-4 border-t border-border flex justify-between items-center text-xs font-medium text-muted-foreground">
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
