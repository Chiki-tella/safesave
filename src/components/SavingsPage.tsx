import { TrendingUp, Plus, Target, Calendar, Users, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function SavingsPage() {
  const [totalSavings, setTotalSavings] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [goalAmount, setGoalAmount] = useState('7500');
  const [goalDate, setGoalDate] = useState('2025-12-31');
  const [goalDescription, setGoalDescription] = useState('');
  const [savedGoals, setSavedGoals] = useState<any[]>([]);
  const [depositHistory, setDepositHistory] = useState<any[]>([]);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);

  // Load wallet balance, savings, deposit history and group members from localStorage
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('safe_save_current_user') || '{}');
    setWalletBalance(currentUser.walletBalance || 0);
    setTotalSavings(currentUser.savings || 0);
    setSavedGoals(currentUser.goals || []);

    // Load deposit history for this user
    const historyKey = currentUser.email
      ? `safe_save_deposit_history_${currentUser.email}`
      : 'safe_save_deposit_history_guest';
    const storedHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
    setDepositHistory(storedHistory);

    // Load group members approved by admin and map to current savings
    const approved = JSON.parse(localStorage.getItem('safe_save_approved_members') || '[]');
    const users = JSON.parse(localStorage.getItem('safe_save_users') || '[]');
    const viewMembers = approved.map((member: any) => {
      const user = users.find((u: any) => u.email === member.email);
      return {
        name: member.name,
        email: member.email,
        amount: user?.savings ?? member.totalSavings ?? 0,
      };
    });
    setGroupMembers(viewMembers);
  }, []);

  // Update localStorage when wallet balance changes
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

  const handleAddFunds = () => {
    const amount = parseFloat(addFundsAmount);
    if (amount && amount >= 50) {
      const newBalance = walletBalance + amount;
      setWalletBalance(newBalance);
      updateUserData({ walletBalance: newBalance });
      
      toast.success(`₳${amount} added to wallet!`, {
        description: 'Funds are now available for deposits'
      });
      setShowAddFundsModal(false);
      setAddFundsAmount('');
    } else {
      toast.error('Minimum amount is ₳50');
    }
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount < 50) {
      toast.error('Minimum deposit is ₳50');
      return;
    }

    if (amount > walletBalance) {
      toast.error('Insufficient wallet balance', {
        description: 'Please add funds to your wallet first'
      });
      return;
    }

    const newSavings = totalSavings + amount;
    const newWalletBalance = walletBalance - amount;
    
    setTotalSavings(newSavings);
    setWalletBalance(newWalletBalance);
    updateUserData({ 
      savings: newSavings, 
      walletBalance: newWalletBalance 
    });

    // Update deposit history for this user
    const currentUser = JSON.parse(localStorage.getItem('safe_save_current_user') || '{}');
    const historyKey = currentUser.email
      ? `safe_save_deposit_history_${currentUser.email}`
      : 'safe_save_deposit_history_guest';
    const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const newEntry = {
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      amount,
      streak: (existingHistory[0]?.streak || 0) + 1,
    };
    const updatedHistory = [newEntry, ...existingHistory];
    setDepositHistory(updatedHistory);
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));

    // Also update group approved members so admin sees this deposit
    try {
      const approved = JSON.parse(localStorage.getItem('safe_save_approved_members') || '[]');
      const idx = approved.findIndex((m: any) => m.email === currentUser.email);
      if (idx !== -1) {
        const member = { ...approved[idx] };
        const memberSavings = Array.isArray(member.savings) ? member.savings.slice() : [];
        memberSavings.unshift({ amount, date: new Date().toISOString() });
        member.savings = memberSavings;
        member.totalSavings = (Number(member.totalSavings || 0) + amount);
        approved[idx] = member;
        localStorage.setItem('safe_save_approved_members', JSON.stringify(approved));

        // Notify same-tab listeners
        try { window.dispatchEvent(new Event('safe_save_approved_members_updated')); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      // ignore malformed storage
    }

    toast.success(`₳${amount} deposited successfully!`, {
      description: 'Your savings have been updated'
    });
    setShowDepositModal(false);
    setDepositAmount('');
  };

  const handleSetGoal = () => {
    if (goalAmount && parseFloat(goalAmount) > 0) {
      const newGoals = [...savedGoals, { amount: goalAmount, date: goalDate, description: goalDescription }];
      updateUserData({ goals: newGoals });
      setSavedGoals(newGoals);
      toast.success('Savings goal updated!', {
        description: `Target: ₳${goalAmount} by ${goalDate}`
      });
      setShowGoalModal(false);
    } else {
      toast.error('Please enter a valid goal amount');
    }
  };

  // Derive current goal summary (use latest saved goal if any, otherwise the in-form values)
  const activeGoal = savedGoals.length > 0 ? savedGoals[savedGoals.length - 1] : null;
  const currentGoalTarget = (() => {
    const raw = activeGoal ? activeGoal.amount : goalAmount;
    const num = parseFloat(raw);
    return Number.isFinite(num) && num > 0 ? num : 0;
  })();

  const currentGoalDateValue = activeGoal ? activeGoal.date : goalDate;
  const currentGoalProgress = currentGoalTarget > 0
    ? Math.min((totalSavings / currentGoalTarget) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 pt-12 pb-8 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-white">My Savings</h2>
            <p className="text-emerald-100">Keep growing your future</p>
          </div>
          <button 
            onClick={() => setShowAddFundsModal(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-sm backdrop-blur-sm"
          >
            <Wallet className="w-4 h-4" />
            <span>₳{walletBalance}</span>
          </button>
        </div>
      </div>

      {/* Total Savings Card */}
      <div className="px-6 -mt-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-slate-600 mb-1">Total Savings</p>
              <h1 className="text-emerald-600">₳{totalSavings.toLocaleString()}</h1>
            </div>
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

          {/* Streak */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-amber-900">12 Week Streak 🔥</h4>
              <p className="text-amber-700 text-sm">Keep it going!</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              onClick={() => setShowDepositModal(true)}
            >
              <Plus className="w-5 h-5" />
              <span>Deposit</span>
            </button>
            <button 
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              onClick={() => setShowGoalModal(true)}
            >
              <Target className="w-5 h-5" />
              <span>Set Goal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Savings Goal */}
      <div className="px-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-slate-800">Current Goal</h4>
            <span className="text-emerald-600">{currentGoalProgress.toFixed(0)}%</span>
          </div>
          <div className="mb-2">
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                style={{ width: `${currentGoalProgress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-slate-600 text-sm">
              ₳{totalSavings.toLocaleString()} / ₳{currentGoalTarget.toLocaleString() || '0'}
            </p>
            <p className="text-slate-500 text-sm">
              Target:{' '}
              {currentGoalDateValue
                ? new Date(currentGoalDateValue).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* All Saved Goals */}
      {savedGoals.length > 0 && (
        <div className="px-6 mb-8">
          <h4 className="text-slate-800 mb-4">My Savings Goals ({savedGoals.length})</h4>
          <div className="space-y-3">
            {savedGoals.map((goal, index) => {
              const targetAmount = parseFloat(goal.amount);
              const progress = Math.min((totalSavings / targetAmount) * 100, 100);
              const isCompleted = progress >= 100;
              
              return (
                <div key={index} className={`bg-white rounded-2xl shadow-md p-5 border-2 ${
                  isCompleted ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-slate-800">₳{goal.amount}</h4>
                        {isCompleted && <span className="text-xl">🎯</span>}
                      </div>
                      {goal.description && (
                        <p className="text-slate-600 text-sm mb-2">{goal.description}</p>
                      )}
                      <p className="text-slate-500 text-xs">Target: {new Date(goal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-xs ${
                        isCompleted 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {isCompleted ? 'Completed' : 'In Progress'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
                            : 'bg-gradient-to-r from-indigo-400 to-indigo-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-slate-600 text-sm">
                      ₳{totalSavings.toLocaleString()} / ₳{targetAmount.toLocaleString()}
                    </p>
                    <p className={`text-sm ${
                      isCompleted ? 'text-emerald-600' : 'text-indigo-600'
                    }`}>
                      {progress.toFixed(0)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Deposit History */}
      <div className="px-6 mb-8">
        <h4 className="text-slate-800 mb-4">Deposit History</h4>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {depositHistory.map((deposit, index) => (
            <div
              key={index}
              className={`p-5 flex items-center justify-between ${
                index !== depositHistory.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <div>
                <p className="text-slate-800 mb-1">₳{deposit.amount}</p>
                <p className="text-slate-500 text-sm">{deposit.date}</p>
              </div>
              <div className="text-right">
                <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Week {deposit.streak}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Group Members Contributions */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-slate-600" />
          <h4 className="text-slate-800">Group Members</h4>
        </div>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {groupMembers.map((member, index) => (
            <div
              key={index}
              className={`p-5 flex items-center justify-between ${
                index !== groupMembers.length - 1 ? 'border-b border-slate-100' : ''
              } ${member.email && member.email === JSON.parse(localStorage.getItem('safe_save_current_user') || '{}').email ? 'bg-emerald-50' : ''}`}
            >
              <div>
                <p className={`${member.email && member.email === JSON.parse(localStorage.getItem('safe_save_current_user') || '{}').email ? 'text-emerald-700 font-medium' : 'text-slate-800'}`}>
                  {member.name}
                </p>
              </div>
              <p className="text-slate-600 text-sm">₳{member.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-slate-800 mb-2">Make a Deposit</h3>
            <p className="text-slate-600 text-sm mb-4">
              Add to your savings balance
            </p>
            
            <div className="mb-6">
              <label className="text-slate-700 text-sm mb-2 block">Deposit Amount (₳)</label>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <p className="text-slate-500 text-xs mt-2">Minimum: ₳50</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowDepositModal(false);
                  setDepositAmount('');
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors"
              >
                Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-slate-800 mb-2">Set Savings Goal</h3>
            <p className="text-slate-600 text-sm mb-4">
              Define your target amount and deadline
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-slate-700 text-sm mb-2 block">Goal Amount (₳)</label>
                <input
                  type="number"
                  placeholder="Enter goal amount"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-slate-700 text-sm mb-2 block">Target Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-slate-700 text-sm mb-2 block">Description</label>
                <textarea
                  placeholder="Enter description"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowGoalModal(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSetGoal}
                className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors"
              >
                Set Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-slate-800 mb-2">Add Funds to Wallet</h3>
            <p className="text-slate-600 text-sm mb-4">
              Add funds to your wallet for deposits
            </p>
            
            <div className="mb-6">
              <label className="text-slate-700 text-sm mb-2 block">Add Funds Amount (₳)</label>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                value={addFundsAmount}
                onChange={(e) => setAddFundsAmount(e.target.value)}
              />
              <p className="text-slate-500 text-xs mt-2">Minimum: ₳50</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowAddFundsModal(false);
                  setAddFundsAmount('');
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFunds}
                className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors"
              >
                Add Funds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}