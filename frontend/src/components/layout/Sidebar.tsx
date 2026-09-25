import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  BookOpen,
  Filter,
  Users,
  Lightbulb,
  Grid,
  Settings,
  LogOut,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/overview', label: 'Overview', icon: LayoutDashboard },
    { path: '/explorer', label: 'Event Explorer', icon: Search },
    { path: '/registry', label: 'Event Registry', icon: BookOpen },
    { path: '/funnels', label: 'Funnels', icon: Filter },
    { path: '/retention', label: 'Retention', icon: Users },
    { path: '/insights', label: 'Saved Insights', icon: Lightbulb },
    { path: '/dashboards', label: 'Dashboards', icon: Grid },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0b1417] border-r border-[#1a2f37]/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 font-sans">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#1a2f37]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1a2f37] to-[#4a7c8f] flex items-center justify-center shadow-lg shadow-[#4a7c8f]/20 border border-[#4a7c8f]/40">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-slate-100 text-sm tracking-wide">PRODUCT ANALYTICS</h1>
            <span className="text-[10px] uppercase font-semibold text-[#4a7c8f] tracking-wider">
              Single Tenant v1.0
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#4a7c8f]/20 text-[#8abacb] border border-[#4a7c8f]/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#1a2f37]/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#4a7c8f]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-[#1a2f37] bg-[#111e22]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#1a2f37] flex items-center justify-center text-xs font-semibold text-[#8abacb] border border-[#4a7c8f]/40 shrink-0">
              {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.displayName}</p>
              <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1a2f37] text-slate-300 border border-[#24404b]">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

