import { useEffect, useMemo, useState } from 'react';
import { DollarSign, Bell } from 'lucide-react';
import { toast } from 'sonner';

type Loan = { id: string; amount: number; purpose?: string; duration?: string; status?: string; requestedBy?: string; requestedAt?: string };

export function AdminLoans() {
  const [loanRequests, setLoanRequests] = useState<Loan[]>([]);
  const [usersWithLoans, setUsersWithLoans] = useState<any[]>([]);
  // Static override for demo users when storage/seeder isn't used
  const STATIC_OUTSTANDING = 500;
  const OVERRIDE_NAMES = ['Alice Mukamana', 'Bob Kamanzi', 'Carol Shimwa'];

  useEffect(() => {
    const load = () => {
      // load approved members to ensure we only show loans for members
      const approved = JSON.parse(localStorage.getItem('safe_save_approved_members') || '[]');
      const approvedEmails = (approved || []).map((m: any) => m.email).filter(Boolean);

      // pending loan requests (only from approved members)
      const requests: Loan[] = JSON.parse(localStorage.getItem('safe_save_loan_requests') || '[]');
      const pending = requests.filter((r) => r.status === 'pending' && approvedEmails.includes(r.requestedBy));
      setLoanRequests(pending);

      // load users and derive loans, but only for approved members
      const users = JSON.parse(localStorage.getItem('safe_save_users') || '[]');
      const membersWithLoans: any[] = [];

      approved.forEach((am: any) => {
        const user = users.find((u: any) => u.email === am.email);
        // gather repayments for this user (may indicate loans activity)
        const repayments = JSON.parse(localStorage.getItem(`safe_save_loan_repayments_${am.email}`) || '[]');

        // helper to ensure we have a loans array and possibly add placeholders
        const normalizeLoans = (base: any, sourceRecord: any) => {
          const loansArr: any[] = Array.isArray(base.loans) ? base.loans.slice() : [];

          // If there's a loanBalance but no detailed loans, create a legacy loan
          const balance = Number(base.loanBalance || sourceRecord.loanBalance || 0);
          if (loansArr.length === 0 && balance > 0) {
            loansArr.push({ id: `legacy-${base.email || sourceRecord.email}`, amount: balance, purpose: 'Legacy loan', duration: 'N/A', status: 'active' });
          }

          // If the approved-member record stores a numeric `loans` count (e.g., loans: 2), add a placeholder if no loan objects
          const count = typeof sourceRecord.loans === 'number' ? sourceRecord.loans : (typeof base.loans === 'number' ? base.loans : null);
          if (loansArr.length === 0 && count && count > 0) {
            loansArr.push({ id: `placeholder-${base.email || sourceRecord.email}`, amount: 0, purpose: `${count} loan(s) recorded`, duration: 'N/A', status: 'active' });
          }

          return loansArr;
        };

        if (user) {
          const loans = normalizeLoans(user, am);
          const uCopy: any = { ...user, loans: loans.slice() };

          // override zero balances for demo users
          if (OVERRIDE_NAMES.includes(uCopy.name) && Number(uCopy.loanBalance || 0) === 0) {
            uCopy.loanBalance = STATIC_OUTSTANDING;
            if (!uCopy.loans || uCopy.loans.length === 0) {
              uCopy.loans = [{ id: `override-${uCopy.email}`, amount: STATIC_OUTSTANDING, purpose: 'Override balance', duration: 'N/A', status: 'active' }];
            } else {
              uCopy.loans = uCopy.loans.map((l: any) => ({ ...l, amount: l.amount && l.amount > 0 ? l.amount : STATIC_OUTSTANDING }));
            }
          }

          if (uCopy.loans.length > 0 || (uCopy.loanBalance && uCopy.loanBalance > 0) || (repayments && repayments.length > 0)) {
            membersWithLoans.push(uCopy);
          }
        } else {
          // no user record but approved member exists; use approved-member record
          const loans = normalizeLoans(am, am);
          const aCopy: any = { ...am, loans: loans.slice() };

          if (OVERRIDE_NAMES.includes(aCopy.name) && Number(aCopy.loanBalance || 0) === 0) {
            aCopy.loanBalance = STATIC_OUTSTANDING;
            if (!aCopy.loans || aCopy.loans.length === 0) {
              aCopy.loans = [{ id: `override-${aCopy.email}`, amount: STATIC_OUTSTANDING, purpose: 'Override balance', duration: 'N/A', status: 'active' }];
            } else {
              aCopy.loans = aCopy.loans.map((l: any) => ({ ...l, amount: l.amount && l.amount > 0 ? l.amount : STATIC_OUTSTANDING }));
            }
          }

          if (aCopy.loans.length > 0 || (Number(aCopy.loanBalance || 0) > 0) || (repayments && repayments.length > 0)) {
            membersWithLoans.push(aCopy);
          }
        }
      });

      setUsersWithLoans(membersWithLoans);
    };

    load();
    const onStorage = (e: StorageEvent) => {
      if (['safe_save_loan_requests', 'safe_save_users'].includes(e.key || '')) load();
    };
    window.addEventListener('storage', onStorage);

    const onCustom = () => load();
    window.addEventListener('safe_save_loan_requests_updated', onCustom as EventListener);
    window.addEventListener('safe_save_users_updated', onCustom as EventListener);

    const interval = setInterval(load, 3000);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('safe_save_loan_requests_updated', onCustom as EventListener);
      window.removeEventListener('safe_save_users_updated', onCustom as EventListener);
      clearInterval(interval);
    };
  }, []);

  const totalLoans = useMemo(() => {
    const users = JSON.parse(localStorage.getItem('safe_save_users') || '[]');
    return users.reduce((acc: number, u: any) => {
      const name = u.name || u.fullName || '';
      const base = Number(u.loanBalance || 0);
      const overridden = OVERRIDE_NAMES.includes(name) && base === 0 ? STATIC_OUTSTANDING : base;
      return acc + overridden;
    }, 0);
  }, [loanRequests]);

  const handleApprove = (loan: Loan) => {
    const allRequests = JSON.parse(localStorage.getItem('safe_save_loan_requests') || '[]');
    const updatedRequests = allRequests.map((r: any) => (r.id === loan.id ? { ...r, status: 'approved' } : r));
    localStorage.setItem('safe_save_loan_requests', JSON.stringify(updatedRequests));

    const users = JSON.parse(localStorage.getItem('safe_save_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === loan.requestedBy);
    if (userIndex !== -1) {
      users[userIndex].loanBalance = (users[userIndex].loanBalance || 0) + loan.amount;
      users[userIndex].walletBalance = (users[userIndex].walletBalance || 0) + loan.amount;
      // also push loan into user's loans array
      users[userIndex].loans = users[userIndex].loans || [];
      users[userIndex].loans.push({ ...loan, status: 'approved', requestedAt: loan.requestedAt });
      localStorage.setItem('safe_save_users', JSON.stringify(users));

      const currentUser = JSON.parse(localStorage.getItem('safe_save_current_user') || '{}');
      if (currentUser.email === loan.requestedBy) {
        localStorage.setItem('safe_save_current_user', JSON.stringify(users[userIndex]));
      }
    }

    setLoanRequests((prev) => prev.filter((r) => r.id !== loan.id));
    toast.success('Loan approved!', { description: `₳${loan.amount} has been disbursed to the member` });
  };

  const handleReject = (loan: Loan) => {
    const allRequests = JSON.parse(localStorage.getItem('safe_save_loan_requests') || '[]');
    const updatedRequests = allRequests.map((r: any) => (r.id === loan.id ? { ...r, status: 'rejected' } : r));
    localStorage.setItem('safe_save_loan_requests', JSON.stringify(updatedRequests));

    setLoanRequests((prev) => prev.filter((r) => r.id !== loan.id));
    toast.error('Loan rejected', { description: 'The member has been notified' });
  };

  return (
    <div className="px-6 pt-6 pb-8">
      {/* Totals card */}
      <div className="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl p-5 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sky-100 text-xs">Total Loans Outstanding</p>
            <h2 className="text-2xl">₳{totalLoans.toLocaleString()}</h2>
          </div>
          <div className="text-right">
            <p className="text-sky-100 text-xs">Pending Requests</p>
            <h3 className="text-xl">{loanRequests.length}</h3>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-indigo-600" />
          <h3 className="text-slate-800">Pending Loan Requests ({loanRequests.length})</h3>
        </div>

        {loanRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-3">
            <Bell className="w-5 h-5 text-slate-400" />
            <p className="text-slate-600 text-sm">No pending loan requests right now.</p>
          </div>
          
        ) : (
          <div className="space-y-3">
            {loanRequests.map((loan) => (
              <div key={loan.id} className="bg-white rounded-2xl shadow-md p-5 border-2 border-indigo-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-slate-800 mb-1">₳{Number(loan.amount).toLocaleString()}</h4>
                    <p className="text-slate-600 text-sm">{loan.requestedBy}</p>
                  </div>
                  <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs">Pending</div>
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
                    <span className="text-slate-500 text-xs">{new Date(loan.requestedAt || '').toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button onClick={() => handleApprove(loan)} className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl text-sm transition-colors">Approve</button>
                  <button onClick={() => handleReject(loan)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl text-sm transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Users with loans */}
      <div>
        <h4 className="text-slate-800 mb-4">Members' Loans</h4>
        {usersWithLoans.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-slate-600 text-sm">No active loans for members.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {usersWithLoans.map((u: any) => (
              <div key={u.email || u.id} className="bg-white rounded-2xl shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-slate-900 font-medium">{u.name || u.fullName || u.email}</div>
                    <div className="text-slate-500 text-xs">Outstanding: ₳{Number(u.loanBalance || 0).toLocaleString()}</div>
                  </div>
                  <div className="text-slate-900 font-semibold">Loans: {u.loans?.length ?? 0}</div>
                </div>

                <div className="space-y-2">
                  {(u.loans || []).map((loan: any) => (
                    <div key={loan.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-slate-800">₳{Number(loan.amount).toLocaleString()}</div>
                          <div className="text-slate-500 text-xs">{loan.purpose}</div>
                        </div>
                        <div className="text-slate-500 text-xs">{loan.status || 'active'}</div>
                      </div>

                      {/* repayment history for this loan (read from repayments by user) */}
                      <div className="mt-2">
                        <details>
                          <summary className="cursor-pointer text-slate-700 text-sm">View payment history</summary>
                          <div className="mt-2 space-y-2">
                            {(() => {
                              const key = `safe_save_loan_repayments_${u.email}`;
                              const reps = JSON.parse(localStorage.getItem(key) || '[]');
                              const forLoan = reps.filter((r: any) => !loan.id || r.loanId === loan.id || true);
                              return forLoan.length === 0 ? (
                                <div className="text-slate-500 text-sm">No repayments yet.</div>
                              ) : (
                                forLoan.map((r: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between text-sm">
                                    <div className="text-slate-700">{r.date}</div>
                                    <div className="font-medium">₳{Number(r.amount).toLocaleString()}</div>
                                  </div>
                                ))
                              );
                            })()}
                          </div>
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
