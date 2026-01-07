import { TrendingUp, Building2, Leaf, Store, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const investments = [
  {
    id: 1,
    title: 'Real Estate Project',
    icon: Building2,
    invested: 15000,
    expectedROI: 18,
    profitSoFar: 2700,
    status: 'active',
    progress: 75,
    color: 'bg-blue-500',
    description: 'A mixed-use commercial development featuring retail spaces and office units in the central business district.',
  },
  {
    id: 2,
    title: 'Agricultural Venture',
    icon: Leaf,
    invested: 8000,
    expectedROI: 22,
    profitSoFar: 1200,
    status: 'active',
    progress: 55,
    color: 'bg-green-500',
    description: 'Investment in modern irrigation and high-yield crops to supply local and regional markets.',
  },
  {
    id: 3,
    title: 'Retail Store Expansion',
    icon: Store,
    invested: 12000,
    expectedROI: 15,
    profitSoFar: 1800,
    status: 'completed',
    progress: 100,
    color: 'bg-purple-500',
    description: 'Expanding a profitable retail store into two new locations in high-traffic neighborhoods.',
  },
  {
    id: 4,
    title: 'Tech Startup Investment',
    icon: TrendingUp,
    invested: 10000,
    expectedROI: 25,
    profitSoFar: 0,
    status: 'pending',
    progress: 0,
    color: 'bg-amber-500',
    description: 'Early-stage investment in a fintech startup building mobile-first payment solutions.',
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

export function InvestmentsPage() {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any | null>(null);
  const totalInvested = investments.reduce((sum, inv) => sum + inv.invested, 0);
  const totalProfit = investments.reduce((sum, inv) => sum + inv.profitSoFar, 0);
  const avgROI = totalProfit / totalInvested * 100;

  const [userInvestmentProfit, setUserInvestmentProfit] = useState(0);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('safe_save_current_user') || 'null');
      if (stored && typeof stored === 'object') {
        setUserInvestmentProfit(stored.investmentProfit || 0);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const handleViewDetails = (investment: any) => {
    setSelectedInvestment(investment);
    setShowDetailsModal(true);
    toast.info(`Viewing ${investment.title} details`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 px-6 pt-12 pb-8 rounded-b-[2rem]">
        <h2 className="text-white mb-2">Investments</h2>
        <p className="text-amber-100">Group fund investments & returns</p>
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
            <p className="text-slate-600 text-sm">My Investment Profit</p>
            <p className="text-emerald-700 font-medium">₳{userInvestmentProfit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Investments List */}
      <div className="px-6 mb-8">
        <h4 className="text-slate-800 mb-4">Active & Past Investments</h4>
        <div className="space-y-4">
          {investments.map((investment) => {
            const statusConfig = getStatusConfig(investment.status);
            const StatusIcon = statusConfig.icon;
            const InvestmentIcon = investment.icon;

            return (
              <div key={investment.id} className="bg-white rounded-2xl shadow-md p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${investment.color} rounded-xl flex items-center justify-center`}>
                      <InvestmentIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-slate-800">{investment.title}</h4>
                      <p className="text-slate-500 text-sm">₳{investment.invested.toLocaleString()} invested</p>
                    </div>
                  </div>
                  <div className={`${statusConfig.bg} ${statusConfig.text} px-3 py-1 rounded-full flex items-center gap-1`}>
                    <StatusIcon className="w-3 h-3" />
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
                    <p className="text-emerald-800">₳{investment.profitSoFar.toLocaleString()}</p>
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

      {/* Investment Detail Example */}
      <div className="px-6 mb-8">
        <h4 className="text-slate-800 mb-4">Investment Updates</h4>
        <div className="bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-slate-800">Real Estate Project</h4>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {[
              { date: 'Nov 20, 2025', title: 'Construction Phase 3 Complete', type: 'success' },
              { date: 'Oct 15, 2025', title: 'Q3 Dividend Distributed', type: 'success' },
              { date: 'Sep 1, 2025', title: 'Milestone Payment Received', type: 'success' },
            ].map((update, index) => (
              <div key={index} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  update.type === 'success' ? 'bg-emerald-100' : 'bg-slate-100'
                }`}>
                  <CheckCircle className={`w-4 h-4 ${
                    update.type === 'success' ? 'text-emerald-600' : 'text-slate-400'
                  }`} />
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
                  <p className="text-blue-800">₳{selectedInvestment.invested.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3">
                  <p className="text-emerald-700 text-xs mb-1">Current Profit</p>
                  <p className="text-emerald-800">₳{selectedInvestment.profitSoFar.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3">
                  <p className="text-purple-700 text-xs mb-1">Expected ROI</p>
                  <p className="text-purple-800">{selectedInvestment.expectedROI}%</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-amber-700 text-xs mb-1">Project Status</p>
                  <p className="text-amber-800">75% Complete</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h4 className="text-slate-700 mb-3">Project Timeline</h4>
              <div className="space-y-3">
                {[
                  { date: 'Nov 20, 2025', title: 'Construction Phase 3 Complete', status: 'complete' },
                  { date: 'Oct 15, 2025', title: 'Q3 Dividend Distributed', status: 'complete' },
                  { date: 'Sep 1, 2025', title: 'Milestone Payment Received', status: 'complete' },
                  { date: 'Jan 2026', title: 'Final Phase & Handover', status: 'upcoming' },
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

            {/* Blockchain Info */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-4">
              <p className="text-slate-700 text-sm mb-2">Blockchain Verification</p>
              <p className="text-slate-500 text-xs mb-2">Transaction Hash:</p>
              <code className="text-xs text-purple-700 bg-white px-2 py-1 rounded block overflow-x-auto">
                0x7f3a9b2c8d1e...4f6a8b2c
              </code>
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