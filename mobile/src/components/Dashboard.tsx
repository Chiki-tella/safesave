import { useEffect, useState } from 'react';
import { TrendingUp, Plus, DollarSign, PieChart, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const demoSavingsData = [
  { month: 'Jan', amount: 1200 },
  { month: 'Feb', amount: 1800 },
  { month: 'Mar', amount: 2400 },
  { month: 'Apr', amount: 3200 },
  { month: 'May', amount: 4100 },
  { month: 'Jun', amount: 5200 },
];

const activityData = [
  { name: 'Deposits', value: 45, color: '#10b981' },
  { name: 'Loans', value: 25, color: '#6366f1' },
  { name: 'Investments', value: 30, color: '#fbbf24' },
];

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [savingsHistory, setSavingsHistory] = useState<any[]>(demoSavingsData);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('safe_save_current_user') || 'null');
      if (stored && typeof stored === 'object') {
        setCurrentUser(stored);
      }
    } catch {
      // ignore parse errors and keep defaults
    }
  }, []);

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('safe_save_savings_history') || 'null');
      if (Array.isArray(history) && history.length > 0) {
        setSavingsHistory(history);
      }
    } catch {
      // keep demo data on error
    }
  }, []);

  const fullName = currentUser?.fullName || 'Member';
  const firstName = fullName.split(' ')[0];

  const userSavings = currentUser?.savings ?? 0;
  const userWalletBalance = currentUser?.walletBalance ?? 0;
  const userLoanBalance = currentUser?.loanBalance ?? 0;
  const userInvestmentProfit = currentUser?.investmentProfit ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 pt-12 pb-8 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-emerald-100 mb-1">Hello, {firstName}</p>
            <h2 className="text-white">Your Savings Overview</h2>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <p className="text-emerald-100 text-sm mb-1">Total Savings</p>
            <h3 className="text-white">₳{userSavings.toLocaleString()}</h3>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-200" />
              <span className="text-emerald-200 text-sm">+12.5%</span>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <p className="text-emerald-100 text-sm mb-1">Group Savings</p>
            <h3 className="text-white">₳45,890</h3>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-200" />
              <span className="text-emerald-200 text-sm">+8.3%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h4 className="text-slate-800 mb-4">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onNavigate('savings')} className="flex flex-col items-center gap-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl p-4 transition-colors">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="text-emerald-700 text-sm">Deposit</span>
            </button>
            
            <button onClick={() => onNavigate('loans')} className="flex flex-col items-center gap-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl p-4 transition-colors">
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-indigo-700 text-sm">Request Loan</span>
            </button>
            
            <button onClick={() => onNavigate('investments')} className="flex flex-col items-center gap-2 bg-amber-50 hover:bg-amber-100 rounded-xl p-4 transition-colors">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <span className="text-amber-700 text-sm">Investments</span>
            </button>
            
            <button onClick={() => onNavigate('rewards')} className="flex flex-col items-center gap-2 bg-purple-50 hover:bg-purple-100 rounded-xl p-4 transition-colors">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-purple-700 text-sm">Rewards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="px-6 mb-8 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-slate-600 text-sm">Active Loans</p>
          </div>
          <h3 className="text-slate-800">₳{userLoanBalance.toLocaleString()}</h3>
          <p className="text-slate-500 text-sm mt-1">Your current loan balance</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-slate-600 text-sm">Investment Profit</p>
          </div>
          <h3 className="text-slate-800">₳{userInvestmentProfit.toLocaleString()}</h3>
          <p className="text-emerald-600 text-sm mt-1">Your investment returns</p>
        </div>
      </div>

      {/* Savings Growth Chart */}
      <div className="px-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h4 className="text-slate-800 mb-4">Savings Growth</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={savingsHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Group Activity */}
      <div className="px-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h4 className="text-slate-800 mb-4">Group Activity</h4>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPie>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {activityData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 text-xs">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}