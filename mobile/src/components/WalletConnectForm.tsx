import { Wallet, ArrowLeft, CheckCircle, ExternalLink } from 'lucide-react';

interface WalletConnectFormProps {
  onConnect: () => void;
  onBack: () => void;
  fromSignUp?: boolean;
}

const wallets = [
  {
    id: 'nami',
    name: 'Nami Wallet',
    description: 'Simple and secure Cardano wallet',
    icon: '🦊',
    available: true,
  },
  {
    id: 'lace',
    name: 'Lace Wallet',
    description: 'Light wallet for Cardano',
    icon: '🔷',
    available: true,
  },
  {
    id: 'eternl',
    name: 'Eternl Wallet',
    description: 'Advanced Cardano wallet',
    icon: '♾️',
    available: true,
  },
  {
    id: 'flint',
    name: 'Flint Wallet',
    description: 'Fast and friendly',
    icon: '⚡',
    available: false,
  },
];

export function WalletConnectForm({ onConnect, onBack, fromSignUp = false }: WalletConnectFormProps) {
  const handleWalletClick = (walletId: string, available: boolean) => {
    if (available) {
      // Simulate wallet connection
      setTimeout(() => {
        onConnect();
      }, 1000);
    }
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

      {/* Logo Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl shadow-lg flex items-center justify-center mb-4">
          <Wallet className="w-10 h-10 text-white" strokeWidth={2.5} />
        </div>
        <h3 className="text-emerald-600 mb-1">Safe-Save</h3>
        <p className="text-slate-600 text-sm text-center max-w-xs">
          Connect your Cardano wallet to access the platform
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-blue-900 mb-1">Secure Connection</h4>
            <p className="text-blue-700 text-sm">
              Your wallet credentials are never stored. We only request read-only access to verify your account.
            </p>
          </div>
        </div>
      </div>

      {/* Wallet Options */}
      <div className="space-y-4 mb-8">
        <h4 className="text-slate-800">Choose Wallet</h4>
        {wallets.map((wallet) => (
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
              {wallet.available ? (
                <div className="w-8 h-8 border-2 border-emerald-500 rounded-full" />
              ) : (
                <span className="text-slate-400 text-xs">Coming Soon</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Don't have a wallet */}
      <div className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-200">
        <div className="flex items-start gap-3">
          <Wallet className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-slate-800 mb-2">Don't have a wallet?</h4>
            <p className="text-slate-600 text-sm mb-4">
              You'll need a Cardano wallet to use Safe-Save. We recommend Nami for beginners.
            </p>
            <div className="space-y-2">
              <a
                href="https://namiwallet.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm"
              >
                <span>Get Nami Wallet</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://www.lace.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm"
              >
                <span>Get Lace Wallet</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-slate-400 text-xs mt-8 text-center">
        By connecting your wallet, you agree to Safe-Save's Terms of Service
      </p>
    </div>
  );
}
