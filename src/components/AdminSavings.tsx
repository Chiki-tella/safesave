import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Users as UsersIcon } from 'lucide-react';

type Deposit = { amount: number; date: string };
type Member = {
  id?: string;
  name?: string;
  totalSavings?: number;
  savings?: Deposit[];
};

function formatCurrency(n = 0) {
  // Presentational: show absolute value to avoid negative signs in demo UI
  const v = Number(n) || 0;
  return `₳${Math.abs(v).toLocaleString()}`;
}

export function AdminSavings() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const load = () => {
      const raw = JSON.parse(localStorage.getItem('safe_save_approved_members') || '[]');
      const list: any[] = Array.isArray(raw) ? raw : [];

      // Normalize members so each has a `savings` array and `totalSavings` number
      const normalized: Member[] = list.map((m) => {
        const name = m.name || m.fullName || m.email || 'Member';
        let savings: Deposit[] = Array.isArray(m.savings) ? m.savings.slice() : [];

        // If there's a numeric total but no savings array, create a single deposit
        if ((!savings || savings.length === 0) && typeof m.totalSavings === 'number' && m.totalSavings > 0) {
          savings = [
            { amount: Number(m.totalSavings), date: m.joinedAt || new Date().toISOString() },
          ];
        }

        // Recompute total from savings if available
        const total = (savings || []).reduce((acc, d) => acc + Number(d.amount || 0), 0);

        return {
          id: m.id || m.userId || m.email,
          name,
          savings,
          totalSavings: total,
        };
      });

      setMembers(normalized);
    };

    load();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'safe_save_approved_members') load();
    };
    window.addEventListener('storage', onStorage);

    const onCustom = () => load();
    window.addEventListener('safe_save_approved_members_updated', onCustom as EventListener);

    const interval = setInterval(load, 3000);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('safe_save_approved_members_updated', onCustom as EventListener);
      clearInterval(interval);
    };
  }, []);

  const memberCount = members.length;

  const totalSavings = useMemo(
    () => members.reduce((acc, m) => acc + Number(m.totalSavings || 0), 0),
    [members]
  );

  const averageSavings = memberCount > 0 ? totalSavings / memberCount : 0;

  // Aggregate deposit history across members (most recent first)
  const depositHistory = useMemo(() => {
    const all: Array<{ name: string; amount: number; date: string }> = [];
    members.forEach((m) => {
      (m.savings || []).forEach((d) => {
        all.push({ name: m.name || 'Member', amount: Number(d.amount || 0), date: d.date });
      });
    });
    return all
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);
  }, [members]);

  return (
    <div className="px-6 pt-6 pb-8">
      <h3 className="text-slate-800 mb-4">Group Savings</h3>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
          <p className="text-emerald-100 text-xs mb-1">Total Group Savings</p>
          <h2 className="text-2xl">{formatCurrency(totalSavings)}</h2>
          <div className="flex items-center gap-1 mt-2 text-xs">
            <TrendingUp className="w-4 h-4 text-emerald-100" />
            <span className="text-emerald-100">Overall performance</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs mb-1">Members</p>
            <h3 className="text-slate-900 text-xl">{memberCount}</h3>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <UsersIcon className="w-5 h-5 text-slate-700" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-slate-500 text-xs mb-1">Average Savings per Member</p>
          <h3 className="text-slate-900 text-xl">{formatCurrency(Math.round(averageSavings))}</h3>
          <p className="text-slate-500 text-xs mt-2">This is based on all approved members in your group.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl shadow-md p-5">
          <h4 className="text-slate-800 mb-3">Recent Deposits</h4>
          {depositHistory.length === 0 ? (
            <p className="text-slate-500 text-sm">No deposits recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {depositHistory.map((d, i) => (
                <li key={i} className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-900 font-medium">{d.name}</div>
                    <div className="text-slate-500 text-xs">{new Date(d.date).toLocaleString()}</div>
                  </div>
                  <div className="text-slate-900 font-semibold">{formatCurrency(d.amount)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-md p-5">
          <h4 className="text-slate-800 mb-3">Members' Savings</h4>
          {members.length === 0 ? (
            <p className="text-slate-500 text-sm">No approved members yet.</p>
          ) : (
            <ul className="space-y-4">
              {members.map((m) => (
                <li key={m.id || m.name} className="border rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-slate-900 font-medium">{m.name}</div>
                      <div className="text-slate-500 text-xs">{(m.savings || []).length} deposits</div>
                    </div>
                    <div className="text-slate-900 font-semibold">{formatCurrency(m.totalSavings)}</div>
                  </div>

                  {(m.savings || []).length > 0 && (
                    <div className="mt-3 text-slate-600 text-sm">
                      <details>
                        <summary className="cursor-pointer text-slate-700 text-sm">View deposits</summary>
                        <ul className="mt-2 space-y-2">
                          {m.savings!.map((d, idx) => (
                            <li key={idx} className="flex items-center justify-between">
                              <div className="text-slate-700 text-sm">{new Date(d.date).toLocaleDateString()}</div>
                              <div className="font-medium">{formatCurrency(d.amount)}</div>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
