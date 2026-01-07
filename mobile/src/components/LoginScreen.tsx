import { Wallet, Users, LogIn, Shield } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
  onJoinGroup: () => void;
  onSignIn: () => void;
  onAdminSignIn: () => void;
}

export function LoginScreen({ onLogin, onJoinGroup, onSignIn, onAdminSignIn }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-indigo-50 flex flex-col items-center justify-center p-6">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl shadow-lg flex items-center justify-center mb-6">
          <Users className="w-12 h-12 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-emerald-600 mb-2">Safe-Save</h1>
        <p className="text-slate-600 text-center max-w-xs">
          Blockchain Ibimina Platform
        </p>
      </div>

      {/* Illustration */}
      <div className="mb-12 relative">
        <div className="grid grid-cols-3 gap-4 opacity-20">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-16 h-16 bg-emerald-200 rounded-2xl"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full opacity-20 animate-pulse" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={onLogin}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-5 rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all flex items-center justify-center gap-3"
        >
          <Wallet className="w-6 h-6" />
          <span>Connect Cardano Wallet</span>
        </button>
        
        <button
          onClick={onJoinGroup}
          className="w-full bg-white text-emerald-600 py-5 rounded-2xl shadow-md hover:shadow-lg transition-all border-2 border-emerald-100"
        >
          Create Account
        </button>

        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-slate-400 text-sm">Already have account?</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <button
          onClick={onSignIn}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-5 rounded-2xl transition-all flex items-center justify-center gap-3"
        >
          <LogIn className="w-6 h-6" />
          <span>Member Sign In</span>
        </button>
        
        <button
          onClick={onAdminSignIn}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 transition-all flex items-center justify-center gap-3"
        >
          <Shield className="w-6 h-6" />
          <span>Admin Sign In</span>
        </button>
      </div>

      {/* Footer Text */}
      <p className="text-slate-400 text-sm mt-12 text-center max-w-xs">
        Connect with Nami or Lace wallet to start saving with your community
      </p>
    </div>
  );
}