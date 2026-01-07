import { Wallet, ArrowLeft, CheckCircle, ExternalLink } from 'lucide-react';
import { setCurrentUser } from './data/userStorage'; // ✅ import storage

interface WalletConnectFormProps {
  onConnect: () => void;
  onBack: () => void;
  fromSignUp?: boolean;
}

const wallets = [
  { id: 'nami', name: 'Nami Wallet', description: 'Simple and secure Cardano wallet', icon: '🦊', available: true },
  { id: 'lace', name: 'Lace Wallet', description: 'Light wallet for Cardano', icon: '🔷', available: true },
  { id: 'eternl', name: 'Eternl Wallet', description: 'Advanced Cardano wallet', icon: '♾️', available: true },
  { id: 'flint', name: 'Flint Wallet', description: 'Fast and friendly', icon: '⚡', available: false },
];

export function WalletConnectForm({ onConnect, onBack, fromSignUp = false }: WalletConnectFormProps) {
  const handleWalletClick = (walletId: string, available: boolean) => {
    if (!available) return;

    // ✅ Simulate wallet connection
    const walletUser = { email: `${walletId}@wallet.com`, accountType: 'member' };

    // ✅ Save the wallet user in userStorage
    setCurrentUser(walletUser);

    setTimeout(() => {
      onConnect();
    }, 500); // simulate short delay
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-indigo-50 flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 mt-6">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-slate-800">Connect Wallet</h2>
          <p className="text-slate-600 text-sm">
            {fromSignUp ? 'Complete your registration' : 'Choose your Cardano wallet'}
          </p>
        </div>
      </div>

      {/* Wallet Options */}
      <div className="space-y-4 mb-8">
        {wallets.map(wallet => (
          <button
            key={wallet.id}
            onClick={() => handleWalletClick(wallet.id, wallet.available)}
            disabled={!wallet.available}
            className={`w-full bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all border-2 ${
              wallet.available
                ? 'border-slate-200 hover:border-emerald-500'
                : 'border-slate-100 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">
                  {wallet.icon}
                </div>
                <div className="text-left">
                  <h4 className="text-slate-800 mb-1">{wallet.name}</h4>
                  <p className="text-slate-600 text-sm">{wallet.description}</p>
                </div>
              </div>
              {wallet.available ? <div className="w-8 h-8 border-2 border-emerald-500 rounded-full" /> : <span className="text-slate-400 text-xs">Coming Soon</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
