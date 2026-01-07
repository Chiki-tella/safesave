import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

export function AdminAlerts() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loanRequests, setLoanRequests] = useState<any[]>([]);

  useEffect(() => {
    const load = () => {
      const pending = JSON.parse(localStorage.getItem('safe_save_pending_requests') || '[]');
      const loans = JSON.parse(localStorage.getItem('safe_save_loan_requests') || '[]');
      setPendingRequests(pending);
      setLoanRequests(loans.filter((l: any) => l.status === 'pending'));
    };

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const hasNotifications = pendingRequests.length > 0 || loanRequests.length > 0;

  return (
    <div className="px-6 pt-6 pb-8">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-purple-600" />
        <h3 className="text-slate-800">Alerts &amp; Notifications</h3>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5">
        {!hasNotifications ? (
          <p className="text-slate-500 text-sm">No new notifications right now.</p>
        ) : (
          <div className="space-y-3 text-sm">
            {pendingRequests.map((req: any) => (
              <div
                key={`notif-req-${req.id}`}
                className="flex items-start gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1" />
                <div>
                  <p className="text-slate-800">New join request from {req.name}</p>
                  <p className="text-slate-500 text-xs">
                    Requested: {req.requestDate}
                  </p>
                </div>
              </div>
            ))}

            {loanRequests.map((loan: any) => (
              <div
                key={`notif-loan-${loan.id}`}
                className="flex items-start gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1" />
                <div>
                  <p className="text-slate-800">
                    Loan request of ₳{loan.amount.toLocaleString()}
                  </p>
                  <p className="text-slate-500 text-xs">
                    Requested by {loan.requestedBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
