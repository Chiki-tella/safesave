import { Home, PiggyBank, DollarSign, TrendingUp, Award, Shield } from 'lucide-react';

interface BottomNavProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'savings', icon: PiggyBank, label: 'Savings' },
    { id: 'loans', icon: DollarSign, label: 'Loans' },
    { id: 'investments', icon: TrendingUp, label: 'Invest' },
    { id: 'rewards', icon: Award, label: 'Rewards' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-3 safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-emerald-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full" />
                )}
              </div>
              <span className={`text-xs ${isActive ? '' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Floating Transparency Button */}
      <button
        onClick={() => onNavigate('transparency')}
        className={`absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all ${
          activeScreen === 'transparency'
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 scale-110'
            : 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:scale-105'
        }`}
      >
        <Shield className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>
    </div>
  );
}
