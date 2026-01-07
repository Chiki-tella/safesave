import { useEffect, useState } from 'react';
import { TrendingUp, Users as UsersIcon } from 'lucide-react';

export function AdminSavings() {
  const [totalSavings, setTotalSavings] = useState(0);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    const members = JSON.parse(localStorage.getItem('safe_save_approved_members') || '[]');
    if (Array.isArray(members) && members.length > 0) {
      setMemberCount(members.length);
      const sum = members.reduce(
        (acc: number, m: any) => acc + (m.totalSavings || 0),
        0
      );
      setTotalSavings(sum);
    }
  }, []);

  const averageSavings = memberCount > 0 ? totalSavings / memberCount : 0;

  return (
    <div className="px-6 pt-6 pb-8">
      <h3 className="text-slate-800 mb-4">Group Savings</h3>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
          <p className="text-emerald-100 text-xs mb-1">Total Group Savings</p>
          <h2 className="text-2xl">₳{totalSavings.toLocaleString()}</h2>
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
          <h3 className="text-slate-900 text-xl">₳{averageSavings.toFixed(0)}</h3>
          <p className="text-slate-500 text-xs mt-2">
            This is based on all approved members in your group.
          </p>
        </div>
      </div>
    </div>
  );
}
