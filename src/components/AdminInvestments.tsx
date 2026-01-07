import { TrendingUp, Building2, Leaf, Store, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const DEFAULT_INVESTMENTS = [
  {
    id: 1,
    title: 'Community Shop Expansion',
    icon: Building2,
    invested: 15000,
    expectedROI: 12,
    profitSoFar: 2300,
    status: 'active',
    progress: 70,
    color: 'bg-blue-500',
    description: 'Expand a community-run shop to new larger premises.'
  },
  {
    id: 2,
    title: 'Irrigation Project',
    icon: Leaf,
    invested: 10000,
    expectedROI: 18,
    profitSoFar: 1800,
    status: 'active',
    progress: 55,
    color: 'bg-green-500',
    description: 'Modern irrigation to increase crop yield for cooperative farmers.'
  },
  {
    id: 3,
    title: 'Motorbike Taxi Fleet',
    icon: Store,
    invested: 8000,
    expectedROI: 14,
    profitSoFar: 1500,
    status: 'completed',
    progress: 100,
    color: 'bg-purple-500',
    description: 'Purchase and operate a fleet of motorbikes for urban transport.'
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'active':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Clock, label: 'Active' };
    case 'completed':
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle, label: 'Completed' };
    case 'pending':
      return { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle, label: 'Pending' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', icon: Clock, label: 'Unknown' };
  }
};

export function AdminInvestments() {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any | null>(null);
  const [investments, setInvestments] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('safe_save_investments');
      return raw ? JSON.parse(raw) : DEFAULT_INVESTMENTS.slice();
    } catch {
      return DEFAULT_INVESTMENTS.slice();
    }
  });

  const [showInvestForm, setShowInvestForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formROI, setFormROI] = useState('');

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.invested || 0), 0);
  const totalProfit = investments.reduce((sum, inv) => sum + Number(inv.profitSoFar || 0), 0);
  const avgROI = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  useEffect(() => {
    // keep local state in sync when storage changes externally
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'safe_save_investments') {
        try {
          setInvestments(JSON.parse(localStorage.getItem('safe_save_investments') || '[]'));
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleInvest = () => setShowInvestForm(true);

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormAmount('');
    setFormROI('');
  };

  const handleConfirmInvest = () => {
    const amount = Number(formAmount || 0);
    const roi = Number(formROI || 0);
    if (!formTitle.trim() || !formDescription.trim() || !amount || amount <= 0) return toast.error('Please fill valid investment details');

    // create investment object
    const inv = {
      id: `inv-${Date.now()}`,
      title: formTitle,
      description: formDescription,
      invested: amount,
      expectedROI: roi || 0,
      profitSoFar: 0,
      icon: Building2,
      color: 'bg-amber-500',
      status: 'active',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    const next = [inv, ...investments];
    setInvestments(next);
    try {
      localStorage.setItem('safe_save_investments', JSON.stringify(next));
      window.dispatchEvent(new Event('safe_save_investments_updated'));
    } catch (e) {
      console.error(e);
    }

    // Deduct the invested amount evenly from approved members' savings
    try {
      const approvedRaw = localStorage.getItem('safe_save_approved_members');
      const usersRaw = localStorage.getItem('safe_save_users');
      const approved = approvedRaw ? JSON.parse(approvedRaw) : [];
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      if (approved && approved.length > 0) {
        const share = amount / approved.length;
        const now = new Date().toISOString();
        approved.forEach((m: any) => {
          m.totalSavings = Math.max(0, Number(m.totalSavings || 0) - share);
          m.savings = Array.isArray(m.savings) ? m.savings : [];
          m.savings.push({ amount: -share, date: now, note: 'investment contribution' });
        });
        localStorage.setItem('safe_save_approved_members', JSON.stringify(approved));
        try { window.dispatchEvent(new Event('safe_save_approved_members_updated')); } catch {}
      }

      if (users && users.length > 0) {
        const share = amount / users.length;
        const now = new Date().toISOString();
        users.forEach((u: any) => {
          u.savings = u.savings || 0;
          // If savings is a number, subtract; if array, append negative entry
          if (Array.isArray(u.savings)) {
            u.savings.push({ amount: -share, date: now, note: 'investment contribution' });
            u.totalSavings = Math.max(0, Number(u.totalSavings || 0) - share);
          } else {
            u.savings = Math.max(0, Number(u.savings || 0) - share);
          }
        });
        localStorage.setItem('safe_save_users', JSON.stringify(users));
        try { window.dispatchEvent(new Event('safe_save_users_updated')); } catch {}
      }
    } catch (e) {
      console.error('Failed to deduct group savings', e);
    }

    resetForm();
    setShowInvestForm(false);
    toast.success('Investment recorded and group savings updated');
  };

  const handleViewDetails = (investment: any) => {
    setSelectedInvestment(investment);
    setShowDetailsModal(true);
    toast.info('Viewing ' + investment.title);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 px-6 pt-12 pb-8 rounded-b-[2rem] flex items-center justify-between">
        <div>
          <h2 className="text-white mb-2">Investments</h2>
          <p className="text-amber-100">Group fund investments & returns</p>
        </div>
        <div>
          <button onClick={handleInvest} className="bg-white text-amber-600 px-4 py-2 rounded-xl font-semibold shadow">Invest</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-6 -mt-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-slate-600 text-sm mb-1">Total Invested</p>
              <h4 className="text-slate-800">₳{totalInvested.toLocaleString()}</h4>
            </div>
            <div>
              <p className="text-slate-600 text-sm mb-1">Total Profit</p>
              <h4 className="text-emerald-600">₳{totalProfit.toLocaleString()}</h4>
            </div>
            <div>
              <p className="text-slate-600 text-sm mb-1">Avg ROI</p>
              <h4 className="text-amber-600">{avgROI.toFixed(1)}%</h4>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-slate-600 text-sm">Group Profit Share (demo)</p>
            <p className="text-emerald-700 font-medium">₳{Math.round(totalProfit / 3).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Investments List */}
      <div className="px-6 mb-8">
        <h4 className="text-slate-800 mb-4">Active & Past Investments</h4>
        <div className="space-y-4">
          {investments?.map((investment) => {
            const statusConfig = getStatusConfig(investment.status);
            const StatusIcon = statusConfig.icon;
            const InvestmentIcon = investment.icon;

            return (
              <div key={investment.id} className="bg-white rounded-2xl shadow-md p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${investment.color || 'bg-amber-500'} rounded-xl flex items-center justify-center`}>
                      {typeof InvestmentIcon === 'function' ? (
                        <InvestmentIcon className="w-6 h-6 text-white" />
                      ) : (
                        <div className="w-6 h-6 rounded bg-white/30" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-slate-800">{investment.title}</h4>
                      <p className="text-slate-500 text-sm">₳{Number(investment.invested || 0).toLocaleString()} invested</p>
                    </div>
                  </div>
                  <div className={`${statusConfig.bg} ${statusConfig.text} px-3 py-1 rounded-full flex items-center gap-1`}>
                    {typeof StatusIcon === 'function' ? <StatusIcon className="w-3 h-3" /> : <div className="w-3 h-3 rounded bg-white/30" />}
                    <span className="text-xs">{statusConfig.label}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-600 text-sm mb-1">Expected ROI</p>
                    <p className="text-slate-800">{investment.expectedROI}%</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <p className="text-emerald-700 text-sm mb-1">Profit So Far</p>
                    <p className="text-emerald-800">₳{Number(investment.profitSoFar || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Progress */}
                {investment.status !== 'pending' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-600 text-sm">Progress</p>
                      <span className="text-slate-800 text-sm">{investment.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${investment.color} rounded-full`}
                        style={{ width: `${investment.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* View details button */}
                    <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleViewDetails(investment)}
                    className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium cursor-pointer hover:bg-amber-100 hover:text-amber-800 transition-colors"
                  >
                    View details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invest Form Modal */}
      {showInvestForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-800">New Investment</h3>
              <button onClick={() => setShowInvestForm(false)} className="text-slate-400">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">Title</label>
                <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full mt-1 p-2 border rounded" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Description</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full mt-1 p-2 border rounded" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-slate-600">Amount (₳)</label>
                  <input value={formAmount} onChange={(e) => setFormAmount(e.target.value)} type="number" className="w-full mt-1 p-2 border rounded" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Expected ROI (%)</label>
                  <input value={formROI} onChange={(e) => setFormROI(e.target.value)} type="number" className="w-full mt-1 p-2 border rounded" />
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end mt-4">
                <button onClick={() => { resetForm(); setShowInvestForm(false); }} className="px-4 py-2 rounded bg-slate-100">Cancel</button>
                <button onClick={handleConfirmInvest} className="px-4 py-2 rounded bg-amber-500 text-white">Confirm Investment</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investment Detail Example */}
      <div className="px-6 mb-8">
        <h4 className="text-slate-800 mb-4">Investment Updates (demo)</h4>
        <div className="bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-slate-800">Community Shop Expansion</h4>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {[
              { date: 'Nov 20, 2025', title: 'Renovation Complete', type: 'success' },
              { date: 'Oct 15, 2025', title: 'Q3 Profit Distributed', type: 'success' },
            ].map((update, index) => (
              <div key={index} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  update.type === 'success' ? 'bg-emerald-100' : 'bg-slate-100'
                }`}>
                  <CheckCircle className={`w-4 h-4 ${update.type === 'success' ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className="text-slate-800">{update.title}</p>
                  <p className="text-slate-500 text-sm">{update.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-800">{selectedInvestment.title} Details</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedInvestment(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Project Overview */}
            <div className="mb-6">
              <h4 className="text-slate-700 mb-2">Project Overview</h4>
              <p className="text-slate-600 text-sm mb-3">
                {selectedInvestment.description}
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-blue-700 text-xs mb-1">Total Investment</p>
                  <p className="text-blue-800">₳{Number(selectedInvestment.invested || 0).toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3">
                  <p className="text-emerald-700 text-xs mb-1">Current Profit</p>
                  <p className="text-emerald-800">₳{Number(selectedInvestment.profitSoFar || 0).toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3">
                  <p className="text-purple-700 text-xs mb-1">Expected ROI</p>
                  <p className="text-purple-800">{selectedInvestment.expectedROI}%</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-amber-700 text-xs mb-1">Project Status</p>
                  <p className="text-amber-800">{selectedInvestment.progress}% Complete</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h4 className="text-slate-700 mb-3">Project Timeline</h4>
              <div className="space-y-3">
                {[
                  { date: 'Nov 20, 2025', title: 'Renovation Complete', status: 'complete' },
                  { date: 'Oct 15, 2025', title: 'Q3 Profit Distributed', status: 'complete' },
                  { date: 'Jan 2026', title: 'Final Handover', status: 'upcoming' },
                ].map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      event.status === 'complete' ? 'bg-emerald-100' : 'bg-slate-200'
                    }`}>
                      <CheckCircle className={`w-3 h-3 ${
                        event.status === 'complete' ? 'text-emerald-600' : 'text-slate-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-slate-800 text-sm">{event.title}</p>
                      <p className="text-slate-500 text-xs">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
