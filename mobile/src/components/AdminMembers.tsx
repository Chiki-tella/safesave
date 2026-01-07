import { useEffect, useState } from 'react';
import { Clock, Search, Trash2, Users as UsersIcon, Bell } from 'lucide-react';
import { toast } from 'sonner';

export function AdminMembers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [rejectModal, setRejectModal] = useState<{
    show: boolean;
    id: number;
    name: string;
    type: 'request' | 'member';
  } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    id: number;
    name: string;
  } | null>(null);
  const [notifyModal, setNotifyModal] = useState<{
    show: boolean;
    id: number;
    name: string;
    email: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const storedMembers = JSON.parse(localStorage.getItem('safe_save_approved_members') || 'null');
    if (Array.isArray(storedMembers) && storedMembers.length > 0) {
      setGroupMembers(storedMembers);
    }

    const loadPending = () => {
      const stored = JSON.parse(localStorage.getItem('safe_save_pending_requests') || '[]');
      setPendingRequests(stored);
    };

    loadPending();
    const interval = setInterval(loadPending, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = (id: number) => {
    const request = pendingRequests.find((r: any) => r.id === id);
    if (!request) return;

    const newMember = {
      id,
      name: request.name,
      email: request.email,
      phone: request.phone,
      joinDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: 'active' as const,
      totalSavings: 0,
      loans: 0,
      rating: 0,
    };

    const updatedMembers = [...groupMembers, newMember];
    setGroupMembers(updatedMembers);
    localStorage.setItem('safe_save_approved_members', JSON.stringify(updatedMembers));

    const updatedPending = pendingRequests.filter((r: any) => r.id !== id);
    setPendingRequests(updatedPending);
    localStorage.setItem('safe_save_pending_requests', JSON.stringify(updatedPending));

    toast.success(`${request.name} has been approved and notified via email!`, {
      description: 'Member can now access the group',
    });
  };

  const handleRejectWithReason = () => {
    if (!rejectModal) return;

    if (rejectModal.type === 'request') {
      const request = pendingRequests.find((r: any) => r.id === rejectModal.id);
      const updatedPending = pendingRequests.filter((r: any) => r.id !== rejectModal.id);
      setPendingRequests(updatedPending);
      localStorage.setItem('safe_save_pending_requests', JSON.stringify(updatedPending));
      toast.error(`${request?.name} has been rejected and notified`, {
        description: rejectReason || 'No reason provided',
      });
    } else {
      const member = groupMembers.find((m: any) => m.id === rejectModal.id);
      const updatedMembers = groupMembers.filter((m: any) => m.id !== rejectModal.id);
      setGroupMembers(updatedMembers);
      localStorage.setItem('safe_save_approved_members', JSON.stringify(updatedMembers));
      toast.error(`${member?.name} has been removed and notified`, {
        description: rejectReason || 'No reason provided',
      });
    }

    setRejectModal(null);
    setRejectReason('');
  };

  const handleDeleteWithReason = () => {
    if (!deleteModal) return;

    const member = groupMembers.find((m: any) => m.id === deleteModal.id);
    const updatedMembers = groupMembers.filter((m: any) => m.id !== deleteModal.id);
    setGroupMembers(updatedMembers);
    localStorage.setItem('safe_save_approved_members', JSON.stringify(updatedMembers));
    toast.error(`${member?.name} has been removed from the group and notified`, {
      description: rejectReason || 'No reason provided',
    });
    setDeleteModal(null);
    setRejectReason('');
  };

  const handleNotifyMember = () => {
    if (!notifyModal) return;

    toast.info(`Notification sent to ${notifyModal.name}`, {
      description: 'Member has been notified via email and SMS',
    });
    setNotifyModal(null);
    setNotificationMessage('');
  };

  const filteredMembers = groupMembers.filter((member: any) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-6 pt-6 pb-24">
      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="text-slate-800">Pending Approval ({pendingRequests.length})</h3>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((request: any) => (
              <div
                key={request.id}
                className="bg-white rounded-2xl shadow-md p-5 border-2 border-amber-200"
              >
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
                    className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      setRejectModal({
                        show: true,
                        id: request.id,
                        name: request.name,
                        type: 'request',
                      })
                    }
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl transition-colors text-sm"
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
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl focus:border-purple-500 focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Members list */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <UsersIcon className="w-5 h-5 text-purple-600" />
          <h3 className="text-slate-800">All Members ({filteredMembers.length})</h3>
        </div>
        <div className="space-y-3">
          {filteredMembers.map((member: any) => (
            <div key={member.id} className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-slate-800 mb-1">{member.name}</h4>
                  <p className="text-slate-600 text-sm">{member.email}</p>
                  <p className="text-slate-500 text-sm">{member.phone}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs ${
                    member.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {member.status === 'active' ? 'Active' : 'Pending'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                <div className="bg-emerald-50 rounded-lg p-2">
                  <p className="text-emerald-700 mb-1">Savings</p>
                  <p className="text-emerald-800 text-sm">₳{member.totalSavings?.toLocaleString?.() ?? member.totalSavings}</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-2">
                  <p className="text-indigo-700 mb-1">Loans</p>
                  <p className="text-indigo-800 text-sm">{member.loans ?? 0}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-2">
                  <p className="text-purple-700 mb-1">Rating</p>
                  <p className="text-purple-800 text-sm">{member.rating || '-'} /100</p>
                </div>
              </div>

              <p className="text-slate-500 text-xs">Joined: {member.joinDate}</p>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() =>
                    setNotifyModal({
                      show: true,
                      id: member.id,
                      name: member.name,
                      email: member.email,
                    })
                  }
                  className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                >
                  Notify Member
                </button>
                <button
                  onClick={() =>
                    setDeleteModal({ show: true, id: member.id, name: member.name })
                  }
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

      {/* Simple notifications hint */}
      <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-3">
        <Bell className="w-5 h-5 text-purple-600" />
        <p className="text-slate-600 text-sm">
          Member-related alerts also appear in the Alerts tab.
        </p>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-slate-800 mb-2">
              Reject {rejectModal.type === 'request' ? 'Request' : 'Member'}
            </h3>
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
                Reject &amp; Notify
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
                Remove &amp; Notify
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
    </div>
  );
}
