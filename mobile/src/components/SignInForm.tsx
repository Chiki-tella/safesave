import { useState } from 'react';
import { ArrowLeft, Wallet, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SignInFormProps {
  onSignIn: () => void;
  onBack: () => void;
  onWalletSignIn?: () => void;
}

export function SignInForm({ onSignIn, onBack, onWalletSignIn }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = () => {
    onSignIn();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-indigo-50">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Content */}
      <div className="px-6 max-w-md mx-auto">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl shadow-lg flex items-center justify-center mb-4">
            <Wallet className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-emerald-600 mb-2">Welcome Back</h2>
          <p className="text-slate-600 text-center">
            Sign in to your Safe-Save account
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          {/* Email Field */}
          <div>
            <label className="text-slate-700 text-sm mb-2 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-slate-700 text-sm mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button className="text-emerald-600 hover:text-emerald-700 text-sm transition-colors">
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-emerald-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-slate-400 text-sm">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Wallet Connect Option */}
        <button 
          onClick={onWalletSignIn}
          className="w-full bg-white text-slate-700 py-4 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-slate-200 flex items-center justify-center gap-2"
        >
          <Wallet className="w-5 h-5 text-emerald-600" />
          <span>Quick Sign In with Wallet</span>
        </button>

        {/* Footer */}
        <p className="text-slate-500 text-sm text-center mt-8">
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