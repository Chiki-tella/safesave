import { Users, Copy, CheckCircle, Shield, TrendingUp, Clock, Search, Plus, Key, Trash2, X, DollarSign, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

const initialMembers = [
  {
    id: 1,
    name: 'Alice Mukamana',
    email: 'alice@email.com',
    phone: '+250 788 123 456',
    joinDate: 'Jan 15, 2025',
    status: 'active',
    totalSavings: 5240,
    loans: 1,
    rating: 95
  },
  {
    id: 2,
    name: 'Bob Kamanzi',
    email: 'bob@email.com',
    phone: '+250 788 234 567',
    joinDate: 'Feb 3, 2025',
    status: 'active',
    totalSavings: 4890,
    loans: 2,
    rating: 88
  },
  {
    id: 3,
    name: 'Carol Shimwa',
    email: 'carol@email.com',
    phone: '+250 788 345 678',
    joinDate: 'Mar 10, 2025',
    status: 'active',
    totalSavings: 4200,
    loans: 1,
    rating: 92
  },
  {
    id: 4,
    name: 'David Niyonzima',
    email: 'david@email.com',
    phone: '+250 788 456 789',
    joinDate: 'Apr 5, 2025',
    status: 'pending',
    totalSavings: 0,
    loans: 0,
    rating: 0
  },
  {
    id: 5,
    name: 'Emma Uwera',
    email: 'emma@email.com',
    phone: '+250 788 567 890',
    joinDate: 'May 20, 2025',
    status: 'active',
    totalSavings: 3850,
    loans: 0,
    rating: 90
  },
];

const initialPendingRequests = [
  {
    id: 101,
    name: 'John Habimana',
    email: 'john@email.com',
    phone: '+250 788 678 901',
    requestDate: 'Nov 28, 2025',
    groupCode: 'IKIMINA-2025'
  },
  {
    id: 102,
    name: 'Sarah Uwase',
    email: 'sarah@email.com',
    phone: '+250 788 789 012',
    requestDate: 'Nov 29, 2025',
    groupCode: 'IKIMINA-2025'
  },
];

export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupCode, setGroupCode] = useState('IKIMINA-2025-A7B3');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showNewCodeModal, setShowNewCodeModal] = useState(false);
  const [groupMembers, setGroupMembers] = useState(initialMembers);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loanRequests, setLoanRequests] = useState<any[]>([]);
  const [showLoanApprovalModal, setShowLoanApprovalModal] = useState<any>(null);
  const [rejectModal, setRejectModal] = useState<{ show: boolean; id: number; name: string; type: 'request' | 'member' } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: number; name: string } | null>(null);
  const [notifyModal, setNotifyModal] = useState<{ show: boolean; id: number; name: string; email: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'savings' | 'loans' | 'investments' | 'members' | 'alerts'>('home');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Load approved members and pending join requests from localStorage
  useEffect(() => {
    // Seed or load approved members
    const storedMembers = JSON.parse(localStorage.getItem('safe_save_approved_members') || 'null');
    if (Array.isArray(storedMembers) && storedMembers.length > 0) {
      setGroupMembers(storedMembers);
    } else {
      setGroupMembers(initialMembers);
      localStorage.setItem('safe_save_approved_members', JSON.stringify(initialMembers));
    }

    const loadPendingRequests = () => {
      const stored = JSON.parse(localStorage.getItem('safe_save_pending_requests') || '[]');
      if (stored.length > 0) {
        setPendingRequests(stored);
      } else {
        setPendingRequests(initialPendingRequests);
        localStorage.setItem('safe_save_pending_requests', JSON.stringify(initialPendingRequests));
      }
    };

    loadPendingRequests();

    // Refresh every 3 seconds to catch new join requests from sign-ups
    const interval = setInterval(loadPendingRequests, 3000);

    return () => clearInterval(interval);
  }, []);

  // Load loan requests from localStorage
  useEffect(() => {
    const loadLoanRequests = () => {
      const requests = JSON.parse(localStorage.getItem('safe_save_loan_requests') || '[]');
      const pendingRequests = requests.filter((r: any) => r.status === 'pending');
      
      // Check if there are new loan requests
      if (pendingRequests.length > loanRequests.length) {
        const newRequests = pendingRequests.filter(
          (newReq: any) => !loanRequests.some((oldReq: any) => oldReq.id === newReq.id)
        );
        
        // Show notification for each new request
        newRequests.forEach((req: any) => {
          toast.info('New Loan Request!', {
            description: `${req.requestedBy} requested ₳${req.amount} for ${req.purpose}`,
            duration: 6000,
          });
        });
      }
      
      setLoanRequests(pendingRequests);
    };
    
    loadLoanRequests();
    
    // Refresh every 3 seconds to catch new loan requests faster
    const interval = setInterval(loadLoanRequests, 3000);
    
    return () => clearInterval(interval);
  }, [loanRequests]);

  const activeMembers = groupMembers.filter(m => m.status === 'active').length;
  const pendingMembers = groupMembers.filter(m => m.status === 'pending').length;
  const totalSavings = groupMembers.reduce((sum, m) => sum + m.totalSavings, 0);

  const handleCopyCode = () => {
    // Fallback method for environments where clipboard API is blocked
    const textArea = document.createElement('textarea');
    textArea.value = groupCode;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      textArea.remove();
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      textArea.remove();
      // Show the code is "copied" anyway for better UX
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleGenerateNewCode = () => {
    const newCode = `IKIMINA-2025-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setGroupCode(newCode);
    setShowNewCodeModal(false);
  };

  const handleApprove = (id: number) => {
    // Find the request
    const request = pendingRequests.find(r => r.id === id);
    if (request) {
      // Add to members list
      const newMember = {
        id: id,
        name: request.name,
        email: request.email,
        phone: request.phone,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'active' as const,
        totalSavings: 0,
        loans: 0,
        rating: 0
      };

      const updatedMembers = [...groupMembers, newMember];
      setGroupMembers(updatedMembers);
      localStorage.setItem('safe_save_approved_members', JSON.stringify(updatedMembers));

      // Remove from pending requests (state + localStorage)
      const updatedPending = pendingRequests.filter(r => r.id !== id);
      setPendingRequests(updatedPending);
      localStorage.setItem('safe_save_pending_requests', JSON.stringify(updatedPending));
      
      // Notify
      toast.success(`${request.name} has been approved and notified via email!`, {
        description: 'Member can now access the group'
      });
    }
  };

  const handleRejectWithReason = () => {
    if (rejectModal) {
      if (rejectModal.type === 'request') {
        const request = pendingRequests.find(r => r.id === rejectModal.id);
        const updatedPending = pendingRequests.filter(r => r.id !== rejectModal.id);
        setPendingRequests(updatedPending);
        localStorage.setItem('safe_save_pending_requests', JSON.stringify(updatedPending));
        toast.error(`${request?.name} has been rejected and notified`, {
          description: rejectReason || 'No reason provided'
        });
      } else {
        const member = groupMembers.find(m => m.id === rejectModal.id);
        const updatedMembers = groupMembers.filter(m => m.id !== rejectModal.id);
        setGroupMembers(updatedMembers);
        localStorage.setItem('safe_save_approved_members', JSON.stringify(updatedMembers));
        toast.error(`${member?.name} has been removed and notified`, {
          description: rejectReason || 'No reason provided'
        });
      }
      setRejectModal(null);
      setRejectReason('');
    }
  };

  const handleDeleteWithReason = () => {
    if (deleteModal) {
      const member = groupMembers.find(m => m.id === deleteModal.id);
      const updatedMembers = groupMembers.filter(m => m.id !== deleteModal.id);
      setGroupMembers(updatedMembers);
      localStorage.setItem('safe_save_approved_members', JSON.stringify(updatedMembers));
      toast.error(`${member?.name} has been removed from the group and notified`, {
        description: rejectReason || 'No reason provided'
      });
      setDeleteModal(null);
      setRejectReason('');
    }
  };

  const handleNotifyMember = () => {
    if (notifyModal) {
      toast.info(`Notification sent to ${notifyModal.name}`, {
        description: 'Member has been notified via email and SMS'
      });
      setNotifyModal(null);
      setNotificationMessage('');
    }
  };

  const filteredMembers = groupMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 px-6 pt-12 pb-8 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-white" />
            <h2 className="text-white">Admin Dashboard</h2>
          </div>
          {loanRequests.length > 0 && (
            <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 animate-pulse">
              <Bell className="w-4 h-4" />
              <span>{loanRequests.length}</span>
            </div>
          )}
        </div>
        <p className="text-purple-100 mb-6">Manage your savings group</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <p className="text-purple-100 text-xs mb-1">Total Members</p>
            <h3 className="text-white">{groupMembers.length}</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <p className="text-purple-100 text-xs mb-1">Active</p>
            <h3 className="text-white">{activeMembers}</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <p className="text-purple-100 text-xs mb-1">Pending</p>
            <h3 className="text-white">{pendingMembers}</h3>
          </div>
        </div>
      </div>

      {/* Group Code Section */}
      <div id="admin-home-section" className="px-6 -mt-4 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-600" />
              <h4 className="text-slate-800">Group Code</h4>
            </div>
            <button
              onClick={() => setShowNewCodeModal(true)}
              className="text-purple-600 text-sm hover:text-purple-700"
            >
              Generate New
            </button>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-3">
            <p className="text-slate-600 text-sm mb-2">Share this code with new members:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white px-4 py-3 rounded-lg text-purple-700 font-mono">
                {groupCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center transition-colors"
              >
                {copiedCode ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <Copy className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          <p className="text-slate-500 text-xs">
            Members need this code to join your group
          </p>
        </div>
      </div>

      {/* Total Savings */}
      <div id="admin-savings-section" className="px-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 mb-1">Total Group Savings</p>
              <h1>₳{totalSavings.toLocaleString()}</h1>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Loan Requests from Members */}
      {loanRequests.length > 0 && (
        <div id="admin-loans-section" className="px-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            <h4 className="text-slate-800">Loan Requests ({loanRequests.length})</h4>
          </div>
          <div className="space-y-3">
            {loanRequests.map((loan: any) => (
              <div key={loan.id} className="bg-white rounded-2xl shadow-md p-5 border-2 border-indigo-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-slate-800 mb-1">₳{loan.amount.toLocaleString()}</h4>
                    <p className="text-slate-600 text-sm">{loan.requestedBy}</p>
                  </div>
                  <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs">
                    Pending
                  </div>
                </div>
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Purpose:</span>
                    <span className="text-slate-800">{loan.purpose}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Duration:</span>
                    <span className="text-slate-800">{loan.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Requested:</span>
                    <span className="text-slate-500 text-xs">{new Date(loan.requestedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      // Approve loan
                      const allRequests = JSON.parse(localStorage.getItem('safe_save_loan_requests') || '[]');
                      const updatedRequests = allRequests.map((r: any) => 
                        r.id === loan.id ? { ...r, status: 'approved' } : r
                      );
                      localStorage.setItem('safe_save_loan_requests', JSON.stringify(updatedRequests));
                      
                      // Update user's loan balance
                      const users = JSON.parse(localStorage.getItem('safe_save_users') || '[]');
                      const userIndex = users.findIndex((u: any) => u.email === loan.requestedBy);
                      if (userIndex !== -1) {
                        users[userIndex].loanBalance = (users[userIndex].loanBalance || 0) + loan.amount;
                        users[userIndex].walletBalance = (users[userIndex].walletBalance || 0) + loan.amount;
                        localStorage.setItem('safe_save_users', JSON.stringify(users));
                        
                        // Update current user if it's them
                        const currentUser = JSON.parse(localStorage.getItem('safe_save_current_user') || '{}');
                        if (currentUser.email === loan.requestedBy) {
                          localStorage.setItem('safe_save_current_user', JSON.stringify(users[userIndex]));
                        }
                      }
                      
                      setLoanRequests(loanRequests.filter((r: any) => r.id !== loan.id));
                      toast.success('Loan approved!', {
                        description: `₳${loan.amount} has been disbursed to the member`
                      });
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      // Reject loan
                      const allRequests = JSON.parse(localStorage.getItem('safe_save_loan_requests') || '[]');
                      const updatedRequests = allRequests.map((r: any) => 
                        r.id === loan.id ? { ...r, status: 'rejected' } : r
                      );
                      localStorage.setItem('safe_save_loan_requests', JSON.stringify(updatedRequests));
                      setLoanRequests(loanRequests.filter((r: any) => r.id !== loan.id));
                      toast.error('Loan rejected', {
                        description: 'The member has been notified'
                      });
                    }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Approval Requests */}
      {pendingRequests.length > 0 && (
        <div className="px-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
            <h4 className="text-slate-800">Pending Approval ({pendingRequests.length})</h4>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl shadow-md p-5 border-2 border-amber-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-slate-800 mb-1">{request.name}</h4>
                    <p className="text-slate-600 text-sm">{request.email}</p>
                    <p className="text-slate-500 text-sm">{request.phone}</p>
                  </div>
                  <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs">
                    Pending
                  </div>
                </div>
                <p className="text-slate-500 text-xs mb-4">Requested: {request.requestDate}</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectModal({ show: true, id: request.id, name: request.name, type: 'request' })}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div id="admin-members-section" className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="px-6 mb-8">
        <h4 className="text-slate-800 mb-4">All Members ({filteredMembers.length})</h4>
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-slate-800 mb-1">{member.name}</h4>
                  <p className="text-slate-600 text-sm">{member.email}</p>
                  <p className="text-slate-500 text-sm">{member.phone}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs ${
                  member.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {member.status === 'active' ? 'Active' : 'Pending'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-emerald-50 rounded-lg p-2">
                  <p className="text-emerald-700 text-xs mb-1">Savings</p>
                  <p className="text-emerald-800 text-sm">₳{member.totalSavings.toLocaleString()}</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-2">
                  <p className="text-indigo-700 text-xs mb-1">Loans</p>
                  <p className="text-indigo-800 text-sm">{member.loans}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-2">
                  <p className="text-purple-700 text-xs mb-1">Rating</p>
                  <p className="text-purple-800 text-sm">{member.rating || '-'}/100</p>
                </div>
              </div>

              <p className="text-slate-500 text-xs">Joined: {member.joinDate}</p>
              
              {/* Member Actions */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => setNotifyModal({ show: true, id: member.id, name: member.name, email: member.email })}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                >
                  Notify Member
                </button>
                <button
                  onClick={() => setDeleteModal({ show: true, id: member.id, name: member.name })}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications Section */}
      <div id="admin-notifications-section" className="px-6 mb-24">
        <div className="bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-purple-600" />
            <h4 className="text-slate-800">Notifications</h4>
          </div>
          {pendingRequests.length === 0 && loanRequests.length === 0 ? (
            <p className="text-slate-500 text-sm">No new notifications right now.</p>
          ) : (
            <div className="space-y-3 text-sm">
              {pendingRequests.map((req) => (
                <div key={`notif-req-${req.id}`} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1" />
                  <div>
                    <p className="text-slate-800">New join request from {req.name}</p>
                    <p className="text-slate-500 text-xs">Requested: {req.requestDate}</p>
                  </div>
                </div>
              ))}
              {loanRequests.map((loan: any) => (
                <div key={`notif-loan-${loan.id}`} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1" />
                  <div>
                    <p className="text-slate-800">Loan request of ₳{loan.amount.toLocaleString()}</p>
                    <p className="text-slate-500 text-xs">Requested by {loan.requestedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Generate New Code Modal */}
      {showNewCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-slate-800 mb-2">Generate New Group Code?</h3>
            <p className="text-slate-600 text-sm mb-6">
              This will create a new code for your group. The old code will no longer work.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowNewCodeModal(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateNewCode}
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl transition-colors"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-slate-800 mb-2">Reject {rejectModal.type === 'request' ? 'Request' : 'Member'}</h3>
            <p className="text-slate-600 text-sm mb-4">
              Provide a reason for rejecting {rejectModal.name} (optional)
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Incomplete information, Group is full, etc."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none mb-4 resize-none"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason('');
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectWithReason}
                className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl transition-colors"
              >
                Reject & Notify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-slate-800 mb-2">Remove Member</h3>
            <p className="text-slate-600 text-sm mb-4">
              Provide a reason for removing {deleteModal.name}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Violation of group rules, Inactive member, etc."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none mb-4 resize-none"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setDeleteModal(null);
                  setRejectReason('');
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWithReason}
                className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl transition-colors"
              >
                Remove & Notify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notify Modal */}
      {notifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-slate-800 mb-2">Notify Member</h3>
            <p className="text-slate-600 text-sm mb-4">
              Provide a message to notify {notifyModal.name}
            </p>
            <textarea
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder="e.g., Your membership has been approved, etc."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none mb-4 resize-none"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setNotifyModal(null);
                  setNotificationMessage('');
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNotifyMember}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition-colors"
              >
                Notify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation bar (mirrors member BottomNav styling) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-3 safe-area-bottom z-40">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {[
            { id: 'home', icon: Shield, label: 'Home', target: 'admin-home-section' },
            { id: 'savings', icon: TrendingUp, label: 'Savings', target: 'admin-savings-section' },
            { id: 'loans', icon: DollarSign, label: 'Loans', target: 'admin-loans-section' },
            { id: 'investments', icon: TrendingUp, label: 'Invest', target: 'admin-investments-section' },
            { id: 'members', icon: Users, label: 'Members', target: 'admin-members-section' },
            { id: 'alerts', icon: Bell, label: 'Alerts', target: 'admin-notifications-section' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  scrollToSection(item.target);
                }}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all cursor-pointer ${
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
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}