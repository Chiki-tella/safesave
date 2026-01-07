import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const DEFAULT_INVESTMENTS = [
  { id: 1, title: 'Community Shop Expansion', invested: 15000, profitSoFar: 2300 },
  { id: 2, title: 'Irrigation Project', invested: 10000, profitSoFar: 1800 },
  { id: 3, title: 'Motorbike Taxi Fleet', invested: 8000, profitSoFar: 1500 },
];

export function AdminInvestments() {
  const [investments, setInvestments] = useState<any[]>(() => {
    try { const raw = localStorage.getItem('safe_save_investments'); return raw ? JSON.parse(raw) : DEFAULT_INVESTMENTS.slice(); } catch { return DEFAULT_INVESTMENTS.slice(); }
  });
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [roi, setRoi] = useState('');

  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === 'safe_save_investments') { try { setInvestments(JSON.parse(localStorage.getItem('safe_save_investments') || '[]')); } catch {} } };
    const onCustom = () => { try { setInvestments(JSON.parse(localStorage.getItem('safe_save_investments') || '[]')); } catch {} };
    window.addEventListener('storage', onStorage);
    window.addEventListener('safe_save_investments_updated', onCustom as EventListener);
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('safe_save_investments_updated', onCustom as EventListener); };
  }, []);

  const totalInvested = investments.reduce((s, i) => s + Number(i.invested || 0), 0);
  const totalProfit = investments.reduce((s, i) => s + Number(i.profitSoFar || 0), 0);
  const avgROI = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const reset = () => { setTitle(''); setDesc(''); setAmount(''); setRoi(''); };

  const confirmInvest = () => {
    const amt = Number(amount || 0);
    const expected = Number(roi || 0);
    if (!title.trim() || !desc.trim() || !amt || amt <= 0) return toast.error('Please provide valid details');
    const inv = { id: `inv-${Date.now()}`, title, description: desc, invested: amt, expectedROI: expected, profitSoFar: 0, status: 'active', createdAt: new Date().toISOString() };
    const next = [inv, ...investments];
    setInvestments(next);
    try { localStorage.setItem('safe_save_investments', JSON.stringify(next)); window.dispatchEvent(new Event('safe_save_investments_updated')); } catch (e) { console.error(e); }

    // Deduct evenly from approved members and users (mobile mirrors web behavior)
    try {
      const approved = JSON.parse(localStorage.getItem('safe_save_approved_members') || '[]');
      const users = JSON.parse(localStorage.getItem('safe_save_users') || '[]');
      if (approved && approved.length) {
        const share = amt / approved.length; const now = new Date().toISOString();
        approved.forEach((m: any) => { m.totalSavings = Math.max(0, Number(m.totalSavings || 0) - share); m.savings = Array.isArray(m.savings) ? m.savings : []; m.savings.push({ amount: -share, date: now, note: 'investment contribution' }); });
        localStorage.setItem('safe_save_approved_members', JSON.stringify(approved)); try { window.dispatchEvent(new Event('safe_save_approved_members_updated')); } catch {}
      }
      if (users && users.length) {
        const share = amt / users.length; const now = new Date().toISOString();
        users.forEach((u: any) => { if (Array.isArray(u.savings)) { u.savings.push({ amount: -share, date: now, note: 'investment contribution' }); u.totalSavings = Math.max(0, Number(u.totalSavings || 0) - share); } else { u.savings = Math.max(0, Number(u.savings || 0) - share); } });
        localStorage.setItem('safe_save_users', JSON.stringify(users)); try { window.dispatchEvent(new Event('safe_save_users_updated')); } catch {}
      }
    } catch (e) { console.error('deduct failed', e); }

    reset(); setShowForm(false); toast.success('Investment recorded (mobile)');
  };

  return (
    <div className="px-6 pt-6 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-800">Group Investments</h3>
        <button onClick={() => setShowForm(true)} className="bg-amber-500 text-white px-3 py-2 rounded">Invest</button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-slate-500 text-xs mb-1">Total Invested</p>
          <h2 className="text-slate-900 text-2xl">₳{totalInvested.toLocaleString()}</h2>
          <p className="text-slate-500 text-xs mt-2">Total amount your group has put into current projects.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-slate-500 text-xs mb-1">Profit So Far</p>
          <h2 className="text-slate-900 text-2xl">₳{totalProfit.toLocaleString()}</h2>
          <p className="text-slate-500 text-xs mt-2">Combined profit from all active investments.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-slate-500 text-xs mb-1">Average ROI</p>
          <h2 className="text-slate-900 text-2xl">{avgROI.toFixed(1)}%</h2>
          <p className="text-slate-500 text-xs mt-2">Average return on investment across your projects.</p>
        </div>
      </div>

      {/* simple list */}
      <div>
        {investments.map((inv) => (
          <div key={inv.id} className="bg-white rounded-2xl shadow-md p-4 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-900 font-medium">{inv.title}</div>
                <div className="text-slate-500 text-xs">₳{Number(inv.invested || 0).toLocaleString()} invested</div>
              </div>
              <div className="text-emerald-700 font-semibold">₳{Number(inv.profitSoFar || 0).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 w-full max-w-md">
            <h4 className="mb-3">New Investment</h4>
            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded mb-2" />
            <textarea placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-2 border rounded mb-2" />
            <input placeholder="Amount (₳)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 border rounded mb-2" />
            <input placeholder="Expected ROI (%)" type="number" value={roi} onChange={(e) => setRoi(e.target.value)} className="w-full p-2 border rounded mb-2" />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => { reset(); setShowForm(false); }} className="px-3 py-2 rounded bg-slate-100">Cancel</button>
              <button onClick={confirmInvest} className="px-3 py-2 rounded bg-amber-500 text-white">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
