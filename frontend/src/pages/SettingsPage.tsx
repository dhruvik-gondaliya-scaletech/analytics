import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../hooks/useSettings';
import { Key, Users, Trash2, Plus, ShieldAlert, Check } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const {
    keys,
    users,
    createKey,
    revokeKey,
    createUser,
    purgeUserData,
  } = useSettings(isAdmin);

  // Ingestion Keys State
  const [newKeyName, setNewKeyName] = useState('');
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  // Users State
  const [newEmail, setNewEmail] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'ANALYST'>('ANALYST');

  // Deletion Purge State
  const [deleteUserId, setDeleteUserId] = useState('');
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createKey({ name: newKeyName });
      setCreatedToken(res.token);
      setNewKeyName('');
    } catch (err: any) {
      alert(err.message || 'Failed to generate write key');
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (window.confirm('Revoke this write key? Applications using this token will no longer be authorized to send events.')) {
      try {
        await revokeKey(id);
      } catch (err: any) {
        alert(err.message || 'Failed to revoke key');
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({
        email: newEmail,
        displayName: newDisplayName,
        password: newPassword,
        role: newRole,
      });
      setNewEmail('');
      setNewDisplayName('');
      setNewPassword('');
    } catch (err: any) {
      alert(err.message || 'Failed to create dashboard user');
    }
  };

  const handlePurgeUserData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteUserId) return;
    if (window.confirm(`Issue permanent deletion mutation for identity '${deleteUserId}'?`)) {
      try {
        await purgeUserData(deleteUserId);
        setDeleteStatus(`Deletion request queued for user ID: ${deleteUserId}`);
        setDeleteUserId('');
      } catch (err: any) {
        alert(err.message || 'Failed to issue deletion mutation');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl font-sans">
      {/* Section 1: Ingestion Keys */}
      <Card className="bg-[#111e22]/90 border-white/10 shadow-xl space-y-4 p-6">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-[#4a7c8f]" />
          <div>
            <CardTitle className="text-base font-display font-bold text-slate-100">Ingestion API Keys</CardTitle>
            <p className="text-xs text-slate-400">Bearer write tokens used by server and product integrations to send events</p>
          </div>
        </div>

        {createdToken && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <Check className="w-4 h-4" />
              <span>Ingestion Token Generated (Save this now!)</span>
            </div>
            <p className="font-mono bg-[#0b1417] p-2.5 rounded-lg border border-white/10 select-all text-[#8abacb]">
              {createdToken}
            </p>
            <p className="text-[11px] text-slate-400">This token will NOT be displayed again.</p>
          </div>
        )}

        {isAdmin && (
          <form onSubmit={handleCreateKey} className="flex items-center gap-3">
            <Input
              type="text"
              required
              placeholder="Key Name (e.g. Production Webhook Key)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 bg-[#0b1417] border-white/10 text-xs"
            />
            <Button
              type="submit"
              variant="brand"
              size="sm"
              className="cursor-pointer gap-1.5 shrink-0 text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Key</span>
            </Button>
          </form>
        )}

        <div className="divide-y divide-[#1a2f37] font-mono text-xs">
          {keys.map((k) => (
            <div key={k.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 font-sans">{k.name}</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Prefix: {k.keyPrefix}***</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={k.status === 'ACTIVE' ? 'success' : 'destructive'} className="text-[10px]">
                  {k.status}
                </Badge>
                {isAdmin && k.status === 'ACTIVE' && (
                  <Button
                    onClick={() => handleRevokeKey(k.id)}
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section 2: Dashboard Users (ADMIN only) */}
      {isAdmin && (
        <Card className="bg-[#111e22]/90 border-white/10 shadow-xl space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <div>
              <CardTitle className="text-base font-display font-bold text-slate-100">Dashboard User Management</CardTitle>
              <p className="text-xs text-slate-400">Manage dashboard user accounts and assign ADMIN / ANALYST roles</p>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              type="email"
              required
              placeholder="Email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="bg-[#0b1417] border-white/10 text-xs"
            />
            <Input
              type="text"
              required
              placeholder="Display Name"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              className="bg-[#0b1417] border-white/10 text-xs"
            />
            <Input
              type="password"
              required
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-[#0b1417] border-white/10 text-xs"
            />
            <div className="flex items-center gap-2">
              <Select value={newRole} onValueChange={(val) => setNewRole(val as any)}>
                <SelectTrigger className="bg-[#0b1417] border-white/10 text-xs flex-1">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANALYST">ANALYST</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="submit"
                variant="brand"
                size="sm"
                className="cursor-pointer font-semibold text-xs shrink-0"
              >
                Add User
              </Button>
            </div>
          </form>

          <div className="divide-y divide-[#1a2f37] font-mono text-xs">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 font-sans">{u.displayName}</span>
                  <span className="text-slate-400 text-xs ml-2 font-mono">({u.email})</span>
                </div>
                <Badge variant="outline" className="font-sans text-xs bg-[#1a2f37]">
                  {u.role}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Section 3: Data Deletion Purge (ADMIN only) */}
      {isAdmin && (
        <Card className="bg-[#111e22]/90 border-white/10 shadow-xl space-y-4 p-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <CardTitle className="text-base font-display font-bold text-slate-100">Administrative Data Deletion Purge</CardTitle>
              <p className="text-xs text-slate-400">Issue permanent ClickHouse mutation to purge raw event data by user_id</p>
            </div>
          </div>

          {deleteStatus && (
            <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs">
              {deleteStatus}
            </div>
          )}

          <form onSubmit={handlePurgeUserData} className="flex items-center gap-3">
            <Input
              type="text"
              required
              placeholder="Target user_id or anonymous_id to delete..."
              value={deleteUserId}
              onChange={(e) => setDeleteUserId(e.target.value)}
              className="flex-1 bg-[#0b1417] border-white/10 text-xs focus:border-rose-500"
            />
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              className="cursor-pointer font-semibold text-xs shrink-0"
            >
              Issue Purge Mutation
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
