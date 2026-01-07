import { useState } from 'react';
import { ArrowLeft, Wallet, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { getUsers, addUser, setCurrentUser } from './data/userStorage';
import { WalletConnectForm } from './WalletConnectForm';

interface SignInFormProps {
  onSignIn: () => void;
  onBack: () => void;
}

export function SignInForm({ onSignIn, onBack }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWalletConnect, setShowWalletConnect] = useState(false);

  // ✅ Email/Password sign-in
  const handleEmailSignIn = () => {
    setIsLoading(true);

    let user = getUsers().find(u => u.email === email && u.password === password);

    if (!user) {
      toast.error('User not found! Creating demo account...');
      user = { email, password, accountType: 'member' };
      addUser(user);
      toast.success('Demo account created!');
    }

    setCurrentUser(user);

    setTimeout(() => {
      setIsLoading(false);
      onSignIn();
    }, 500);
  };

  // ✅ Wallet sign-in
  const handleWalletSignIn = (accountType: 'admin' | 'member') => {
    const walletUser = { email: `${accountType}@wallet.com`, accountType };
    setCurrentUser(walletUser);
    onSignIn();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEmailSignIn();
  };

  if (showWalletConnect) {
    return (
      <WalletConnectForm
        onConnect={handleWalletSignIn}
        onBack={() => setShowWalletConnect(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-indigo-50">
      <div className="px-6 pt-12 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="px-6 max-w-md mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl shadow-lg flex items-center justify-center mb-4">
            <Wallet className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-emerald-600 mb-2">Welcome Back</h2>
          <p className="text-slate-600 text-center">
            Sign in with your email or connect a wallet
          </p>
        </div>

        {/* Email/Password Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5 mb-6">
          <div>
            <label className="text-slate-700 text-sm mb-2 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 text-sm mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="text-right">
            <button className="text-emerald-600 hover:text-emerald-700 text-sm transition-colors">
              Forgot password?
            </button>
          </div>

          <button
            onClick={handleEmailSignIn}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Sign In with Email</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-slate-400 text-sm">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Wallet Sign-In */}
        <button
          onClick={() => setShowWalletConnect(true)}
          className="w-full bg-white text-slate-700 py-4 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-slate-200 flex items-center justify-center gap-2"
        >
          <Wallet className="w-5 h-5 text-emerald-600" />
          <span>Sign In with Wallet</span>
        </button>

        <p className="text-slate-500 text-sm text-center mt-6">
          Don't have an account?{' '}
          <button
            onClick={onBack}
            className="text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Join a Group
          </button>
        </p>
      </div>
    </div>
  );
}
