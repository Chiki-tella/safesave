import { useState } from 'react';
import { ArrowLeft, Shield, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AdminSignInFormProps {
  onSignIn: () => void;
  onBack: () => void;
}

export function AdminSignInForm({ onSignIn, onBack }: AdminSignInFormProps) {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
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
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl shadow-lg flex items-center justify-center mb-4">
            <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-purple-600 mb-2">Admin Portal</h2>
          <p className="text-slate-600 text-center">
            Sign in to manage your savings group
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-purple-900 text-sm mb-1">Admin Access Required</p>
              <p className="text-purple-700 text-xs">
                Only group administrators can access this portal. Use your admin credentials to continue.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          {/* Email Field */}
          <div>
            <label className="text-slate-700 text-sm mb-2 block">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
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
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button className="text-purple-600 hover:text-purple-700 text-sm transition-colors">
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Sign In as Admin</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-slate-500 text-sm text-center mt-8">
          Need to create an admin account?{' '}
          <button
            onClick={onBack}
            className="text-purple-600 hover:text-purple-700 transition-colors"
          >
            Create Group
          </button>
        </p>
      </div>
    </div>
  );
}
