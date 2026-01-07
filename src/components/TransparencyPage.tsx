import { Shield, TrendingUp, DollarSign, Users, Link as LinkIcon, PieChart as PieChartIcon, ArrowRight, ArrowDown } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner@2.0.3';

const savingsVsLoansData = [
  { name: 'Jan', savings: 12000, loans: 4000 },
  { name: 'Feb', savings: 18000, loans: 6000 },
  { name: 'Mar', savings: 24000, loans: 8000 },
  { name: 'Apr', savings: 32000, loans: 10000 },
  { name: 'May', savings: 39000, loans: 12000 },
  { name: 'Jun', savings: 45890, loans: 14500 },
];

const moneyFlowData = [
  { name: 'Savings', value: 45890, color: '#10b981' },
  { name: 'Loans Issued', value: 14500, color: '#6366f1' },
  { name: 'Investments', value: 18200, color: '#fbbf24' },
  { name: 'Available', value: 13190, color: '#94a3b8' },
];

const memberActivity = [
  { name: 'Alice M.', deposits: 24, loans: 2, rating: 95 },
  { name: 'You', deposits: 22, loans: 1, rating: 92 },
  { name: 'Bob K.', deposits: 20, loans: 3, rating: 88 },
  { name: 'Carol S.', deposits: 18, loans: 2, rating: 85 },
  { name: 'David P.', deposits: 16, loans: 1, rating: 82 },
];

export function TransparencyPage() {
  const handleViewBlockchain = () => {
    toast.info('Opening Cardano Explorer', {
      description: 'This would open the blockchain explorer in production'
    });
    // In production, this would open:
    // window.open('https://cardanoscan.io/transaction/...', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 px-6 pt-12 pb-8 rounded-b-[2rem]">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-white" />
          <h2 className="text-white">Group Transparency</h2>
        </div>
        <p className="text-blue-100">Full visibility powered by blockchain</p>
      </div>

      {/* Key Metrics */}
      <div className="px-6 -mt-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h4 className="text-slate-800 mb-4">Group Overview</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <p className="text-emerald-700 text-sm">Total Savings</p>
              </div>
              <h3 className="text-emerald-800">₳45,890</h3>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <p className="text-indigo-700 text-sm">Total Loans</p>
              </div>
              <h3 className="text-indigo-800">₳14,500</h3>
            </div>

            <div className="bg-amber-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <PieChartIcon className="w-4 h-4 text-white" />
                </div>
                <p className="text-amber-700 text-sm">Investments</p>
              </div>
              <h3 className="text-amber-800">₳18,200</h3>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <p className="text-purple-700 text-sm">Profit Earned</p>
              </div>
              <h3 className="text-purple-800">₳2,700</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Money Flow Diagram */}
      <div className="px-6 mb-8">
        <h4 className="text-slate-800 mb-4">Money Flow Distribution</h4>
        <div className="bg-white rounded-2xl shadow-md p-5">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={moneyFlowData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {moneyFlowData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            {moneyFlowData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-slate-600 text-xs">{item.name}</p>
                  <p className="text-slate-800 text-sm">₳{item.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Savings vs Loans Chart */}
      <div className="px-6 mb-8">
        <h4 className="text-slate-800 mb-4">Savings vs Loans Trend</h4>
        <div className="bg-white rounded-2xl shadow-md p-5">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={savingsVsLoansData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="savings" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="loans" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded" />
              <span className="text-slate-600 text-sm">Savings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-500 rounded" />
              <span className="text-slate-600 text-sm">Loans</span>
            </div>
          </div>
        </div>
      </div>

      {/* Member Activity Ranking */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-slate-600" />
          <h4 className="text-slate-800">Member Activity Ranking</h4>
        </div>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {memberActivity.map((member, index) => (
            <div
              key={index}
              className={`p-5 ${
                member.name === 'You' ? 'bg-blue-50' : ''
              } ${index !== memberActivity.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className={`${member.name === 'You' ? 'text-blue-700' : 'text-slate-800'}`}>
                    {member.name}
                  </p>
                  <p className="text-slate-500 text-sm">Rating: {member.rating}/100</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  member.rating >= 90 ? 'bg-emerald-500' :
                  member.rating >= 85 ? 'bg-amber-400' :
                  'bg-slate-400'
                } text-white`}>
                  {String.fromCharCode(65 + index)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-slate-600 text-xs">Deposits</p>
                  <p className="text-slate-800 text-sm">{member.deposits}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-slate-600 text-xs">Loans Taken</p>
                  <p className="text-slate-800 text-sm">{member.loans}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blockchain Info */}
      <div className="px-6 mb-8">
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <LinkIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4>Smart Contract</h4>
              <p className="text-slate-300 text-sm">View on blockchain</p>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 mb-4">
            <p className="text-slate-300 text-xs mb-1">Contract Address</p>
            <p className="text-white text-sm font-mono break-all">
              addr1qx2fxv2umyhttkxy...f5n5gvs0
            </p>
          </div>

          <button className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2" onClick={handleViewBlockchain}>
            <span>View on Cardano Explorer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Group Expenses */}
      <div className="px-6 mb-8">
        <h4 className="text-slate-800 mb-4">Recent Group Expenses</h4>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {[
            { title: 'Platform Fee', amount: 45, date: 'Jun 20, 2025', type: 'expense' },
            { title: 'Investment Profit', amount: 780, date: 'Jun 15, 2025', type: 'income' },
            { title: 'Loan Interest', amount: 150, date: 'Jun 10, 2025', type: 'income' },
          ].map((transaction, index) => (
            <div
              key={index}
              className={`p-5 flex items-center justify-between ${
                index !== 2 ? 'border-b border-slate-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowDown className="w-5 h-5 text-emerald-600 rotate-180" />
                  ) : (
                    <ArrowDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-slate-800">{transaction.title}</p>
                  <p className="text-slate-500 text-sm">{transaction.date}</p>
                </div>
              </div>
              <p className={`${
                transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}₳{transaction.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}