import { DollarSign, AlertCircle, Clock, TrendingDown, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

const loanRules = [
  { label: 'Max Borrow', value: '50% of savings' },
  { label: 'Interest Rate', value: '5% monthly' },
  { label: 'Required Savings', value: '₳2,000 minimum' },
];

export function LoanPage() {
  const [outstandingBalance, setOutstandingBalance] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanDuration, setLoanDuration] = useState('3 months');
  const [walletBalance, setWalletBalance] = useState(0);
  const [repaymentHistory, setRepaymentHistory] = useState<any[]>([]);

  // Load user data from localStorage
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('safe_save_current_user') || '{}');

    // Always sync from the latest user record in safe_save_users if available
    const users = JSON.parse(localStorage.getItem('safe_save_users') || '[]');
    const storedUser = users.find((u: any) => u.email === currentUser.email);
    const effectiveUser = storedUser || currentUser || {};

    const latestLoanBalance = effectiveUser.loanBalance || 0;
    const latestWalletBalance = effectiveUser.walletBalance || 0;

    setOutstandingBalance(latestLoanBalance);
    setWalletBalance(latestWalletBalance);

    // Write back to safe_save_current_user so Dashboard and other pages see the latest values
    localStorage.setItem('safe_save_current_user', JSON.stringify(effectiveUser));

    // Load repayment history for this user
    if (effectiveUser.email) {
      const repaymentsKey = `safe_save_loan_repayments_${effectiveUser.email}`;
      const storedRepayments = JSON.parse(localStorage.getItem(repaymentsKey) || '[]');
      setRepaymentHistory(storedRepayments);
    } else {
      setRepaymentHistory([]);
    }
  }, []);

  // Update localStorage when data changes
  const updateUserData = (updates: any) => {
    const currentUser = JSON.parse(localStorage.getItem('safe_save_current_user') || '{}');
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem('safe_save_current_user', JSON.stringify(updatedUser));

    // Also update in users array
    const users = JSON.parse(localStorage.getItem('safe_save_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === currentUser.email);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('safe_save_users', JSON.stringify(users));
    }
  };

  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (amount > outstandingBalance) {
      toast.error('Payment amount exceeds outstanding balance');
      return;
    }

    if (amount > walletBalance) {
      toast.error('Insufficient wallet balance', {
        description: 'Please add funds to your wallet first'
      });
      return;
    }

    const newBalance = outstandingBalance - amount;
    const newWalletBalance = walletBalance - amount;
    
    setOutstandingBalance(newBalance);
    setWalletBalance(newWalletBalance);
    updateUserData({ 
      loanBalance: newBalance,
      walletBalance: newWalletBalance
    });

    // Record this repayment in the user's repayment history
    const currentUser = JSON.parse(localStorage.getItem('safe_save_current_user') || '{}');
    if (currentUser.email) {
      const repaymentsKey = `safe_save_loan_repayments_${currentUser.email}`;
      const existingRepayments = JSON.parse(localStorage.getItem(repaymentsKey) || '[]');
      const newEntry = {
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        amount,
        status: 'paid',
        // For now, mark all payments as on-time; this can be expanded later with due-date logic
        onTime: true,
      };
      const updatedRepayments = [newEntry, ...existingRepayments];
      setRepaymentHistory(updatedRepayments);
      localStorage.setItem(repaymentsKey, JSON.stringify(updatedRepayments));
    }

    toast.success(`Payment of ₳${amount} successful!`, {
      description: `Remaining balance: ₳${newBalance.toFixed(2)}`
    });
    setShowPaymentModal(false);
    setPaymentAmount('');
  };

  const handleLoanRequest = () => {
    const amount = parseFloat(loanAmount);
    
    if (!amount || amount <= 0 || !loanPurpose || !loanDuration) {
      toast.error('Please fill in all fields');
      return;
    }

    // Save loan request to localStorage for admin to see
    const loanRequest = {
      id: Date.now().toString(),
      amount,
      purpose: loanPurpose,
      duration: loanDuration,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      requestedBy: JSON.parse(localStorage.getItem('safe_save_current_user') || '{}').email
    };

    const existingRequests = JSON.parse(localStorage.getItem('safe_save_loan_requests') || '[]');
    existingRequests.push(loanRequest);
    localStorage.setItem('safe_save_loan_requests', JSON.stringify(existingRequests));

    toast.success('Loan request submitted!', {
      description: `₳${amount} for ${loanPurpose} - ${loanDuration}`
    });

    setLoanAmount('');
    setLoanPurpose('');
    setLoanDuration('3 months');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 px-6 pt-12 pb-8 rounded-b-[2rem]">
        <h2 className="text-white mb-2">Loans</h2>
        <p className="text-indigo-100">Borrow responsibly from your group</p>
      </div>

      {/* Current Loan Status */}
      <div className="px-6 -mt-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
            <h4 className="text-slate-800">Active Loan</h4>
          </div>

          <div className="mb-6">
            <p className="text-slate-600 mb-1">Outstanding Balance</p>
            <h1 className="text-indigo-600">₳{outstandingBalance}</h1>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-600 text-sm mb-1">Due Date</p>
              <p className="text-slate-800">Jul 1, 2025</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-600 text-sm mb-1">Interest (5%)</p>
              <p className="text-slate-800">₳60</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-600 text-sm">Repayment Progress</p>
              <span className="text-emerald-600 text-sm">60%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>

          <button
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-4 rounded-xl transition-colors"
            onClick={() => setShowPaymentModal(true)}
          >
            Make Payment
          </button>
        </div>
      </div>

      {/* Warning/Info */}
      <div className="px-6 mb-8">
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-900 mb-1">Payment Due Soon</p>
            <p className="text-amber-700 text-sm">Next payment of ₳300 is due in 6 days. Late payments incur 2% penalty.</p>
          </div>
        </div>
      </div>

      {/* Repayment History */}
      <div className="px-6 mb-8">
        <h4 className="text-slate-800 mb-4">Repayment History</h4>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {repaymentHistory.map((payment, index) => (
            <div
              key={index}
              className={`p-5 flex items-center justify-between ${
                index !== repaymentHistory.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  payment.onTime ? 'bg-emerald-100' : 'bg-amber-100'
                }`}>
                  {payment.onTime ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="text-slate-800">₳{payment.amount}</p>
                  <p className="text-slate-500 text-sm">{payment.date}</p>
                </div>
              </div>
              <div className={`text-sm ${payment.onTime ? 'text-emerald-600' : 'text-amber-600'}`}>
                {payment.onTime ? 'On Time' : 'Late'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request New Loan */}
      <div className="px-6 mb-8">
        <h4 className="text-slate-800 mb-4">Request New Loan</h4>
        <div className="bg-white rounded-2xl shadow-md p-6">
          {/* Loan Rules */}
          <div className="mb-6">
            <p className="text-slate-600 mb-3 text-sm">Loan Rules</p>
            <div className="space-y-2">
              {loanRules.map((rule, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 text-sm">{rule.label}</span>
                  <span className="text-slate-800 text-sm">{rule.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-slate-700 text-sm mb-2 block">Amount (₳)</label>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="text-slate-700 text-sm mb-2 block">Purpose</label>
              <input
                type="text"
                placeholder="Business, Emergency, Education..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                value={loanPurpose}
                onChange={(e) => setLoanPurpose(e.target.value)}
              />
            </div>

            <div>
              <label className="text-slate-700 text-sm mb-2 block">Duration (months)</label>
              <select
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none appearance-none bg-white"
                value={loanDuration}
                onChange={(e) => setLoanDuration(e.target.value)}
              >
                <option>3 months</option>
                <option>6 months</option>
                <option>12 months</option>
              </select>
            </div>

            <button
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-4 rounded-xl transition-colors"
              onClick={handleLoanRequest}
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-slate-800 mb-2">Make Payment</h3>
            <p className="text-slate-600 text-sm mb-4">
              Outstanding balance: ₳{outstandingBalance}
            </p>
            
            <div className="mb-6">
              <label className="text-slate-700 text-sm mb-2 block">Payment Amount (₳)</label>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <p className="text-slate-500 text-xs mt-2">Maximum: ₳{outstandingBalance}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentAmount('');
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl transition-colors"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}