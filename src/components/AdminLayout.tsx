import { ReactNode } from 'react';
import { Shield, Bell } from 'lucide-react';

interface AdminLayoutProps {
  activeScreen: 'home' | 'savings' | 'loans' | 'investments' | 'members' | 'alerts';
  onNavigate: (screen: AdminLayoutProps['activeScreen']) => void;
  children: ReactNode;
}

export function AdminLayout({ activeScreen, onNavigate, children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-white" />
            <h2 className="text-white">Admin Dashboard</h2>
          </div>
          <div className="bg-white/20 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
            <Bell className="w-4 h-4" />
            <span>Group Admin</span>
          </div>
        </div>
        <p className="text-purple-100 text-sm">Monitor and manage your savings group</p>
      </div>

      {/* Page content */}
      <div className="max-w-md mx-auto -mt-4 pb-20">
        {children}
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-3 safe-area-bottom z-40">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {[
            { id: 'home',        icon: Shield, label: 'Home' },
            { id: 'savings',     icon: Shield, label: 'Savings' },
            { id: 'loans',       icon: Shield, label: 'Loans' },
            { id: 'investments', icon: Shield, label: 'Invest' },
            { id: 'members',     icon: Shield, label: 'Members' },
            { id: 'alerts',      icon: Shield, label: 'Alerts' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as AdminLayoutProps['activeScreen'])}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full" />
                  )}
                </div>
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
