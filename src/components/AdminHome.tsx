import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Users as UsersIcon, DollarSign, PieChart, Bell, Key, Award, ArrowUpRight, Download } from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

const demoGroupSavingsHistory = [
  { month: 'Jan', amount: 8000 },
  { month: 'Feb', amount: 12000 },
  { month: 'Mar', amount: 16500 },
  { month: 'Apr', amount: 21000 },
  { month: 'May', amount: 26500 },
  { month: 'Jun', amount: 32000 },
  { month: 'Jul', amount: 37000 },
  { month: 'Aug', amount: 41000 },
  { month: 'Sep', amount: 38500 },
  { month: 'Oct', amount: 43000 },
  { month: 'Nov', amount: 47000 },
  { month: 'Dec', amount: 51500 },
];

const activityData = [
  { name: 'Deposits', value: 45, color: '#10b981' },
  { name: 'Loans', value: 25, color: '#6366f1' },
  { name: 'Investments', value: 30, color: '#fbbf24' },
];

type AdminScreen = 'home' | 'savings' | 'loans' | 'investments' | 'members' | 'alerts';

interface AdminHomeProps {
  onNavigate?: (screen: AdminScreen) => void;
}

export function AdminHome({ onNavigate }: AdminHomeProps) {
  const [totalSavings, setTotalSavings] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [loanRequests, setLoanRequests] = useState(0);
  const [groupCode, setGroupCode] = useState('IKIMINA-2025-A7B3');
  const [adminName, setAdminName] = useState('Admin');
  const [savingsHistory, setSavingsHistory] = useState<any[]>(demoGroupSavingsHistory);

  useEffect(() => {
    try {
      const members = JSON.parse(localStorage.getItem('safe_save_approved_members') || '[]');
      if (Array.isArray(members) && members.length > 0) {
        setTotalMembers(members.length);
        const sum = members.reduce((acc: number, m: any) => acc + (m.totalSavings || 0), 0);
        setTotalSavings(sum);
      }

      const pending = JSON.parse(localStorage.getItem('safe_save_pending_requests') || '[]');
      if (Array.isArray(pending)) setPendingApprovals(pending.length);

      const loans = JSON.parse(localStorage.getItem('safe_save_loan_requests') || '[]');
      if (Array.isArray(loans)) {
        const pendingLoans = loans.filter((r: any) => r.status === 'pending');
        setLoanRequests(pendingLoans.length);
      }

      const storedCode = localStorage.getItem('safe_save_group_code');
      if (storedCode) setGroupCode(storedCode);

      const storedUser = JSON.parse(localStorage.getItem('safe_save_current_user') || 'null');
      if (storedUser && storedUser.accountType === 'admin' && storedUser.fullName) setAdminName(storedUser.fullName);

      // scale demo data to match real total savings
      const approvedMembers = JSON.parse(localStorage.getItem('safe_save_approved_members') || '[]');
      if (Array.isArray(approvedMembers) && approvedMembers.length) {
        const groupTotal = approvedMembers.reduce((acc: number, m: any) => acc + (m.totalSavings || 0), 0);
        const demoTotal = demoGroupSavingsHistory.reduce((s, m) => s + m.amount, 0);
        const scale = demoTotal > 0 ? groupTotal / demoTotal : 1;
        setSavingsHistory(demoGroupSavingsHistory.map(m => ({ month: m.month, amount: Math.max(0, Math.round(m.amount * scale)) })));
      }
    } catch {}
  }, []);

  const { growthPercent, lastAmount, peak, trough } = useMemo(() => {
    if (!savingsHistory.length) return { growthPercent: 0, lastAmount: 0, peak: null, trough: null };
    const first = savingsHistory[0].amount || 1;
    const last = savingsHistory[savingsHistory.length - 1].amount || 0;
    const growth = Math.round(((last - first) / Math.max(1, first)) * 100);
    let peakMonth = savingsHistory[0];
    let troughMonth = savingsHistory[0];
    savingsHistory.forEach((m: any) => {
      if (m.amount > peakMonth.amount) peakMonth = m;
      if (m.amount < troughMonth.amount) troughMonth = m;
    });
    return { growthPercent: growth, lastAmount: last, peak: peakMonth, trough: troughMonth };
  }, [savingsHistory]);

  const firstName = adminName.split(' ')[0];
  const totalNotifications = pendingApprovals + loanRequests;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(groupCode);
      toast.success('Group code copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const exportMembersCsv = () => {
    try {
      const membersData = JSON.parse(localStorage.getItem('safe_save_approved_members') || '[]');
      if (!Array.isArray(membersData) || membersData.length === 0) return toast.error('No members to export');
      const header = ['id','name','email','phone','joinDate','status','totalSavings','loans','rating'];
      const rows = membersData.map((m:any) => header.map(h => JSON.stringify(m[h] ?? '')).join(','));
      const csv = [header.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `members_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export started');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="px-6 pb-12 bg-slate-50 min-h-screen">
      {/* HERO */}
      <div className="-mt-6 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-purple-600 rounded-2xl shadow-xl p-6 flex items-center justify-between gap-6">
          <div>
            <p className="text-white text-sm opacity-90">Good to see you, {firstName}</p>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white text-sm opacity-80 mt-1">Fast insights and actions for your group.</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-3 bg-white rounded-2xl p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Members</p>
              <h3 className="text-xl font-semibold">{totalMembers}</h3>
              <p className="text-xs text-slate-400">Approved</p>
            </div>
            <div className="bg-emerald-50 p-2 rounded-lg">
              <UsersIcon className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="col-span-3 bg-white rounded-2xl p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Pending</p>
              <h3 className="text-xl font-semibold">{pendingApprovals}</h3>
              <p className="text-xs text-slate-400">Join requests</p>
            </div>
            <div className="bg-amber-50 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="col-span-3 bg-white rounded-2xl p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Loan requests</p>
              <h3 className="text-xl font-semibold">{loanRequests}</h3>
              <p className="text-xs text-slate-400">Awaiting action</p>
            </div>
            <div className="bg-indigo-50 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="col-span-3 bg-white rounded-2xl p-4 shadow flex flex-col justify-between">
          <div>
            <p className="text-xs text-slate-500">Group code</p>
            <h3 className="text-sm font-mono break-all">{groupCode}</h3>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <button onClick={copyCode} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg">Copy</button>
            <button onClick={exportMembersCsv} className="text-xs bg-slate-50 px-3 py-1 rounded-lg">Export <Download className="w-4 h-4 inline-block ml-2"/></button>
          </div>
        </div>
      </div>

      {/* Main trend */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-8 bg-white rounded-2xl p-4 shadow">
          <h4 className="text-lg font-semibold mb-3">Savings — 12 month trend</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsHistory}>
                <defs>
                  <linearGradient id="gradAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.28}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v)=>`₳${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v:any)=>`₳${Number(v).toLocaleString()}`} />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="url(#gradAmt)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
            <div>
              <div className="text-xs text-slate-500">Growth vs start</div>
              <div className="font-semibold">{growthPercent}%</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Peak month</div>
              <div className="font-semibold">{peak?.month} — ₳{peak?.amount?.toLocaleString()}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Lowest</div>
              <div className="font-semibold">{trough?.month} — ₳{trough?.amount?.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="col-span-4 bg-white rounded-2xl p-4 shadow space-y-4">
          {/* Pie chart — group activity */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Group Activity</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={activityData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                  >
                    {activityData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {activityData.map(a => (
                <div key={a.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color }} />
                  <span className="text-slate-600 text-xs">{a.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <p className="text-xs text-slate-500">Quick actions</p>
            <div className="mt-2 grid grid-cols-1 gap-2">
              <button onClick={() => onNavigate && onNavigate('members')} className="w-full rounded-lg py-2 bg-emerald-50 hover:bg-emerald-100">Review members</button>
              <button onClick={() => onNavigate && onNavigate('loans')} className="w-full rounded-lg py-2 bg-indigo-50 hover:bg-indigo-100">Review loans</button>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <p className="text-xs text-slate-500">Notifications</p>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Pending approvals</div>
                  <div className="text-xs text-slate-500">{pendingApprovals} waiting</div>
                </div>
                <div className="text-indigo-600 font-semibold">View</div>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Loan requests</div>
                  <div className="text-xs text-slate-500">{loanRequests} pending</div>
                </div>
                <div className="text-indigo-600 font-semibold">View</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-500">Tip: Use the members page to approve new join requests quickly — it keeps growth steady.</div>
    </div>
  );
}
