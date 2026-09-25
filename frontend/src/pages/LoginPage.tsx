import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@analytics.local');
  const [password, setPassword] = useState('AdminPass@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1417] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#111e22] via-[#0b1417] to-[#0b1417] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-[#4a7c8f]/10 blur-[140px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md bg-[#111e22]/90 backdrop-blur-md rounded-2xl p-2 shadow-2xl relative z-10 border-white/10">
        <CardHeader className="flex flex-col items-center mb-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1a2f37] to-[#4a7c8f] flex items-center justify-center shadow-xl shadow-[#4a7c8f]/20 border border-[#4a7c8f]/40 mb-3">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-xl font-display font-bold text-slate-100 tracking-tight">
            Standalone Product Analytics
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 mt-1">
            Sign in to your isolated product instance
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@analytics.local"
                  className="bg-[#0b1417]/80 border-white/10 focus:border-[#4a7c8f] focus:ring-[#4a7c8f] pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[#0b1417]/80 border-white/10 focus:border-[#4a7c8f] focus:ring-[#4a7c8f] pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="brand"
              className="w-full mt-2 font-semibold shadow-lg shadow-[#4a7c8f]/25"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-[11px] text-slate-400 font-mono">
              Default Admin: <span className="text-slate-200">admin@analytics.local</span> | Pass: <span className="text-slate-200">AdminPass@2026</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
