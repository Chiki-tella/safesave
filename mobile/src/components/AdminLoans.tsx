import { useEffect, useState } from 'react';
import { DollarSign, Bell } from 'lucide-react';
import { toast } from 'sonner';

export function AdminLoans() {
  const [loanRequests, setLoanRequests] = useState<any[]>([]);

  useEffect(() => {
    const loadLoanRequests = () => {
      const requests = JSON.parse(localStorage.getItem('safe_save_loan_requests') || '[]');
      const pendingRequests = requests.filter((r: any) => r.status === 'pending');
      setLoanRequests(pendingRequests);
    };

    loadLoanRequests();
    const interval = setInterval(loadLoanRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = (loan: any) => {
    const allRequests = JSON.parse(localStorage.getItem('safe_save_loan_requests') || '[]');
    const updatedRequests = allRequests.map((r: any) =>
      r.id === loan.id ? { ...r, status: 'approved' } : r
    );
    localStorage.setItem('safe_save_loan_requests', JSON.stringify(updatedRequests));

    const users = JSON.parse(localStorage.getItem('safe_save_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === loan.requestedBy);
    if (userIndex !== -1) {
      users[userIndex].loanBalance = (users[userIndex].loanBalance || 0) + loan.amount;
      users[userIndex].walletBalance = (users[userIndex].walletBalance || 0) + loan.amount;
      localStorage.setItem('safe_save_users', JSON.stringify(users));

      const currentUser = JSON.parse(localStorage.getItem('safe_save_current_user') || '{}');
      if (currentUser.email === loan.requestedBy) {
        localStorage.setItem('safe_save_current_user', JSON.stringify(users[userIndex]));
      }
    }

    setLoanRequests((prev) => prev.filter((r: any) => r.id !== loan.id));
    toast.success('Loan approved!', {
      description: `₳${loan.amount} has been disbursed to the member`,
    });
  };

  const handleReject = (loan: any) => {
    const allRequests = JSON.parse(localStorage.getItem('safe_save_loan_requests') || '[]');
    const updatedRequests = allRequests.map((r: any) =>
      r.id === loan.id ? { ...r, status: 'rejected' } : r
    );
    localStorage.setItem('safe_save_loan_requests', JSON.stringify(updatedRequests));

    setLoanRequests((prev) => prev.filter((r: any) => r.id !== loan.id));
    toast.error('Loan rejected', {
      description: 'The member has been notified',
    });
  };

  return (
    <div className="px-6 pt-6 pb-8">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-indigo-600" />
        <h3 className="text-slate-800">Loan Requests ({loanRequests.length})</h3>
      </div>

      {loanRequests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-3">
          <Bell className="w-5 h-5 text-slate-400" />
          <p className="text-slate-600 text-sm">No pending loan requests right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {loanRequests.map((loan: any) => (
            <div
              key={loan.id}
              className="bg-white rounded-2xl shadow-md p-5 border-2 border-indigo-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-slate-800 mb-1">₳{loan.amount.toLocaleString()}</h4>
                  <p className="text-slate-600 text-sm">{loan.requestedBy}</p>
                </div>
                <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs">
                  Pending
                </div>
              </div>

              <div className="mb-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Purpose:</span>
                  <span className="text-slate-800">{loan.purpose}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Duration:</span>
                  <span className="text-slate-800">{loan.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Requested:</span>
                  <span className="text-slate-500 text-xs">
                    {new Date(loan.requestedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => handleApprove(loan)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl text-sm transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(loan)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl text-sm transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
