"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Activity,
  Users,
  Filter,
  Settings,
  Bell,
  LineChart,
  LogOut
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { removeStorageItems } from '@/lib/storage';
import { AUTH_STORAGE_KEYS } from '@/lib/constants';

const sidebarNavItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboards", href: "/dashboard", icon: LayoutDashboard },
      { title: "Events", href: "/event", icon: Activity },
      { title: "Funnels", href: "/funnel", icon: Filter },
      { title: "Trends", href: "/trend", icon: LineChart },
    ]
  },
  {
    title: "Audience",
    items: [
      { title: "Identities", href: "/identity", icon: Users },
      { title: "User Profiles", href: "/userprofile", icon: Users },
    ]
  },
  {
    title: "Settings",
    items: [
      { title: "Alerts", href: "/alert", icon: Bell },
      { title: "Configuration", href: "/analyticsconfig", icon: Settings },
    ]
  }
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const handleLogout = () => {
    removeStorageItems([AUTH_STORAGE_KEYS.ACCESS_TOKEN]);
    window.location.href = '/login';
  };

  return (
    <div className={cn("pb-12 h-screen border-r border-border bg-background flex flex-col", className)}>
      <div className="space-y-4 py-6 flex-1">
        <div className="px-6 pb-2">
          <h2 className="mb-1 text-2xl font-bold tracking-tight text-brand-deep flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-brand flex items-center justify-center shadow-sm">
              <Activity className="w-4 h-4 text-brand-foreground" strokeWidth={2.5} />
            </div>
            TrustLayer
          </h2>
          <p className="text-[13px] font-medium text-muted-foreground ml-11">Analytics Platform</p>
        </div>
        <Separator className="my-4" />
        <ScrollArea className="px-4 h-[calc(100vh-220px)]">
          <div className="space-y-8 mt-2">
            {sidebarNavItems.map((group, idx) => (
              <div key={idx} className="px-2">
                <h3 className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {group.title}
                </h3>
                <div className="space-y-[2px]">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Button
                        key={item.href}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start transition-colors duration-150 h-9 px-3 font-medium text-[14px]",
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground hover:bg-accent hover:text-foreground"
                        )}
                        asChild
                      >
                        <Link href={item.href}>
                          <item.icon className={cn(
                            "mr-3 h-[18px] w-[18px]",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )} />
                          {item.title}
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="px-6 pb-6 mt-auto">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground hover:text-foreground border-border hover:bg-accent transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
