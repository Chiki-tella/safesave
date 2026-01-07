import { Users, ArrowLeft, User, Mail, Phone, MapPin, Lock } from 'lucide-react'; 
import { useState } from 'react';
import { toast } from 'sonner';
import { WalletConnectForm } from './WalletConnectForm';
import {
  addUser,
  emailExists,
  setCurrentUser,

} from './data/userStorage';
interface SignUpFormProps {
  onBack: () => void;
}

export function SignUpForm({ onBack }: SignUpFormProps) {
  const [accountType, setAccountType] = useState<'member' | 'admin'>('member');
  const [showGroupCode, setShowGroupCode] = useState(true);
  const [showWalletConnect, setShowWalletConnect] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Callback after WalletConnect
  const handleWalletConnect = (userType: 'admin' | 'member') => {
    // Save user type in localStorage
    localStorage.setItem('safe_save_current_user_type', userType);

    if (userType === 'admin') {
      window.location.href = '/admin-dashboard';
    } else {
      window.location.href = '/dashboard';
    }
  };

  const handleAccountTypeChange = (type: 'member' | 'admin') => {
    setAccountType(type);
    setShowGroupCode(type === 'member');
  };

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // Required fields
  if (!fullName || !email || !password || !confirmPassword || !phone || !location) {
    toast.error('Please fill in all required fields');
    return;
  }

  // Terms
  if (!agreedToTerms) {
    toast.error('Please agree to the terms and conditions');
    return;
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    toast.error('Please enter a valid email address');
    return;
  }

  // Password
  if (password.length < 6) {
    toast.error('Password must be at least 6 characters');
    return;
  }

  if (password !== confirmPassword) {
    toast.error('Passwords do not match');
    return;
  }

  // Phone
  if (phone.length < 10) {
    toast.error('Please enter a valid phone number');
    return;
  }

  // Admin group name
  if (accountType === 'admin' && !groupName) {
    toast.error('Please enter a group name to create');
    return;
  }

  // Email uniqueness
  if (emailExists(email)) {
    toast.error('Email already registered');
    return;
  }

  // User object
  const userData = {
    id: Date.now(),
    fullName,
    email,
    password,
    phone,
    location,
    accountType,
    groupCode: accountType === 'member' ? groupCode : undefined,
    groupName: accountType === 'admin' ? groupName : undefined,
    walletBalance: 0,
    savings: 0,
    loans: [],
    createdAt: new Date().toISOString(),
  };

  // Save user
  addUser(userData);
  setCurrentUser(userData);

  // Member → pending request
  if (accountType === 'member') {
    addPendingRequest({
      id: Date.now(),
      name: fullName,
      email,
      phone,
      requestDate: new Date().toLocaleDateString(),
      groupCode: groupCode || 'N/A',
    });
  }

  toast.success('Account created successfully!');

  // Show Wallet Connect
  setShowWalletConnect(true);
};

  if (showWalletConnect) {
    return (
      <WalletConnectForm
        onBack={() => setShowWalletConnect(false)}
        onConnect={() => handleWalletConnect(accountType)}
      />
    );
  }

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
          <h2 className="text-slate-800">Create Account</h2>
          <p className="text-slate-600 text-sm">Join or create a savings group</p>
        </div>
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl shadow-lg flex items-center justify-center mb-4">
          <Users className="w-10 h-10 text-white" strokeWidth={2.5} />
        </div>
        <h3 className="text-emerald-600 mb-1">Safe-Save</h3>
        <p className="text-slate-600 text-sm text-center max-w-xs">Fill in your details to get started</p>
      </div>

      {/* Account Type */}
      <div className="mb-6">
        <p className="text-slate-700 text-sm mb-3">I want to:</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleAccountTypeChange('member')}
            className={`p-4 rounded-2xl border-2 transition-all ${
              accountType === 'member' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'
            }`}
          >
            <Users className={`w-6 h-6 mx-auto mb-2 ${accountType === 'member' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <p className={`text-sm ${accountType === 'member' ? 'text-emerald-700' : 'text-slate-600'}`}>Join a Group</p>
          </button>

          <button
            type="button"
            onClick={() => handleAccountTypeChange('admin')}
            className={`p-4 rounded-2xl border-2 transition-all ${
              accountType === 'admin' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 bg-white'
            }`}
          >
            <User className={`w-6 h-6 mx-auto mb-2 ${accountType === 'admin' ? 'text-purple-600' : 'text-slate-400'}`} />
            <p className={`text-sm ${accountType === 'admin' ? 'text-purple-700' : 'text-slate-600'}`}>Create Group</p>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
       <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
  <div className="space-y-4 mb-6">
    {/* Full Name */}
    <div>
      <label className="text-slate-700 text-sm mb-2 block">Full Name</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <User className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Enter your full name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors"
        />
      </div>
    </div>

    {/* Email */}
    <div>
      <label className="text-slate-700 text-sm mb-2 block">Email Address</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <Mail className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="email"
          placeholder="your@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors"
        />
      </div>
    </div>

    {/* Password */}
    <div>
      <label className="text-slate-700 text-sm mb-2 block">Password</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <Lock className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="password"
          placeholder="Enter your password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors"
        />
      </div>
    </div>

    {/* Confirm Password */}
    <div>
      <label className="text-slate-700 text-sm mb-2 block">Confirm Password</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <Lock className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="password"
          placeholder="Confirm your password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors"
        />
      </div>
    </div>

    {/* Phone Number */}
    <div>
      <label className="text-slate-700 text-sm mb-2 block">Phone Number</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <Phone className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="tel"
          placeholder="+250 XXX XXX XXX"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors"
        />
      </div>
    </div>

    {/* Location */}
    <div>
      <label className="text-slate-700 text-sm mb-2 block">Location</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <MapPin className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="City, District"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors"
        />
      </div>
    </div>

    {/* Group Code */}
    {showGroupCode && (
      <div>
        <label className="text-slate-700 text-sm mb-2 block">Group Code (Optional)</label>
        <input
          type="text"
          placeholder="Enter group invitation code"
          value={groupCode}
          onChange={(e) => setGroupCode(e.target.value)}
          className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors"
        />
        <p className="text-slate-500 text-xs mt-2">Have a group code? Enter it to join directly</p>
      </div>
    )}

    {/* Group Name */}
    {accountType === 'admin' && (
      <div>
        <label className="text-slate-700 text-sm mb-2 block">Group Name</label>
        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors"
        />
        <p className="text-slate-500 text-xs mt-2">Enter a name for your new group</p>
      </div>
    )}
  </div>

  {/* Terms */}
  <div className="mb-6">
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={agreedToTerms}
        onChange={(e) => setAgreedToTerms(e.target.checked)}
        className="mt-1 w-5 h-5 text-emerald-500 border-slate-300 rounded focus:ring-emerald-500"
      />
      <span className="text-slate-600 text-sm">
        I agree to the terms and conditions of Safe-Save platform and commit to active participation in my savings group
      </span>
    </label>
  </div>

  {/* Submit Button */}
  <button
    type="submit"
    className={`w-full text-white py-5 rounded-2xl shadow-lg transition-all ${
      accountType === 'admin'
        ? 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-purple-200 hover:shadow-xl hover:shadow-purple-300'
        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300'
    }`}
  >
    {accountType === 'admin' ? 'Create Group & Connect Wallet' : 'Join Group & Connect Wallet'}
  </button>
</form>

        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-5 h-5 text-emerald-500 border-slate-300 rounded focus:ring-emerald-500"
            />
            <span className="text-slate-600 text-sm">
              I agree to the terms and conditions of Safe-Save platform and commit to active participation in my savings group
            </span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`w-full text-white py-5 rounded-2xl shadow-lg transition-all ${
            accountType === 'admin'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-purple-200 hover:shadow-xl hover:shadow-purple-300'
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300'
          }`}
        >
          {accountType === 'admin' ? 'Create Group & Connect Wallet' : 'Join Group & Connect Wallet'}
        </button>

        {/* Footer */}
        <p className="text-slate-400 text-sm mt-6 text-center">
          Already have an account?{' '}
          <button type="button" onClick={onBack} className="text-emerald-600 hover:text-emerald-700">
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
}
