// CitizenConnect - Reports Manager
// Storage: server-side JSON files via /api/reports and /api/notifications
// All devices share the same data through the server.

class ReportsManager {
  constructor() {
    this._reports = [];   // in-memory cache
    this._notifs  = [];   // in-memory notifications cache
    this.storageKey = 'citizenReports'; // localStorage fallback key
  }

  // ── Initialise: load from server ─────────────────────────────────────────
  async init() {
    try {
      const [rRes, nRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/notifications')
      ]);
      if (!rRes.ok || !nRes.ok) throw new Error('server error');
      this._reports = await rRes.json();
      this._notifs  = await nRes.json();
    } catch (e) {
      // Offline fallback: use localStorage
      console.warn('Server unreachable — using localStorage fallback');
      const r = localStorage.getItem(this.storageKey);
      const n = localStorage.getItem('citizenNotifications');
      this._reports = r ? JSON.parse(r) : [];
      this._notifs  = n ? JSON.parse(n) : [];
    }
  }

  // ── Persist reports to server ─────────────────────────────────────────────
  _saveReports() {
    fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this._reports)
    }).catch(() => {
      localStorage.setItem(this.storageKey, JSON.stringify(this._reports));
    });
  }

  // ── Persist notifications to server ───────────────────────────────────────
  _saveNotifs() {
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this._notifs)
    }).catch(() => {
      localStorage.setItem('citizenNotifications', JSON.stringify(this._notifs));
    });
  }

  // ── Read helpers ──────────────────────────────────────────────────────────
  getAllReports() {
    return this._reports;
  }

  getReport(id) {
    return this._reports.find(r => r.id === id);
  }

  getReportsByStatus(status) {
    return this._reports.filter(r => r.status === status);
  }

  getReportsAssignedTo(email) {
    return this._reports.filter(r => r.assignedTo === email);
  }

  getActiveReportsAssignedTo(email) {
    return this._reports.filter(r =>
      r.assignedTo === email &&
      r.status !== 'closed' &&
      r.status !== 'resolved'
    );
  }

  getRecentReports(limit = 5) {
    return this._reports.slice(0, limit);
  }

  // ── Submit new report ─────────────────────────────────────────────────────
  addReport(report) {
    this._reports.unshift(report); // newest first
    this._saveReports();

    // Notify all admins
    this.addNotification(
      'admin@example.com',
      `📬 New report: "${report.title}" submitted by ${report.submitterName}`,
      'new_report',
      report.id
    );
  }

  // ── Status updates ────────────────────────────────────────────────────────
  updateReportStatus(id, status) {
    this._reports = this._reports.map(r =>
      r.id === id ? { ...r, status } : r
    );
    this._saveReports();
  }

  assignReportToStaff(id, staffEmail) {
    this._reports = this._reports.map(r =>
      r.id === id
        ? { ...r, assignedTo: staffEmail, status: 'assigned', assignedDate: new Date().toLocaleString() }
        : r
    );
    this._saveReports();

    const report = this.getReport(id);
    if (report) {
      // Notify staff
      this.addNotification(
        staffEmail,
        `📋 New task assigned to you: "${report.title}"`,
        'assignment',
        id
      );
      // Notify the user who submitted
      if (report.submittedBy) {
        this.addNotification(
          report.submittedBy,
          `✅ Your report "${report.title}" has been assigned to a staff member.`,
          'status_update',
          id
        );
      }
    }
  }

  startWorkOnTask(id, staffEmail) {
    this._reports = this._reports.map(r =>
      r.id === id && r.assignedTo === staffEmail
        ? { ...r, status: 'in_progress', startedDate: new Date().toLocaleString() }
        : r
    );
    this._saveReports();
  }

  submitResolution(id, staffEmail, resolutionNotes) {
    this._reports = this._reports.map(r =>
      r.id === id && r.assignedTo === staffEmail
        ? {
            ...r,
            status: 'pending_approval',
            resolutionNotes,
            resolvedDate: new Date().toLocaleString(),
            rejectionReason: null // clear previous rejection if any
          }
        : r
    );
    this._saveReports();

    const report = this.getReport(id);
    if (report) {
      this.addNotification(
        'admin@example.com',
        `⏳ Staff completed "${report.title}" — awaiting your approval.`,
        'approval_needed',
        id
      );
    }
  }

  approveResolution(id, adminEmail) {
    this._reports = this._reports.map(r =>
      r.id === id
        ? { ...r, status: 'resolved', approvedDate: new Date().toLocaleString(), approvedBy: adminEmail }
        : r
    );
    this._saveReports();

    const report = this.getReport(id);
    if (report) {
      // Notify the citizen
      if (report.submittedBy) {
        this.addNotification(
          report.submittedBy,
          `🎉 Your report "${report.title}" has been resolved!`,
          'resolved',
          id
        );
      }
      // Notify staff
      if (report.assignedTo) {
        this.addNotification(
          report.assignedTo,
          `✅ Admin approved your resolution for "${report.title}".`,
          'approved',
          id
        );
      }
    }
  }

  rejectResolution(id, adminEmail, rejectionReason) {
    this._reports = this._reports.map(r =>
      r.id === id
        ? {
            ...r,
            status: 'in_progress',
            rejectionReason,
            rejectedDate: new Date().toLocaleString(),
            rejectedBy: adminEmail
          }
        : r
    );
    this._saveReports();

    const report = this.getReport(id);
    if (report && report.assignedTo) {
      this.addNotification(
        report.assignedTo,
        `❌ Admin rejected your resolution for "${report.title}". Reason: ${rejectionReason}`,
        'rejected',
        id
      );
    }
  }

  // ── Comments ──────────────────────────────────────────────────────────────
  addComment(id, text, author) {
    this._reports = this._reports.map(r => {
      if (r.id !== id) return r;
      const comments = r.comments || [];
      return {
        ...r,
        comments: [...comments, {
          id: Date.now(),
          text,
          author,
          timestamp: new Date().toISOString(),
          isInternal: false
        }]
      };
    });
    this._saveReports();
  }

  getComments(id) {
    const r = this.getReport(id);
    return r && r.comments ? r.comments : [];
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  addNotification(userId, message, type, relatedTicketId = null) {
    const notif = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      userId,
      message,
      type,
      relatedTicketId,
      timestamp: new Date().toISOString(),
      read: false
    };
    this._notifs.push(notif);
    this._saveNotifs();
    return notif;
  }

  getAllNotifications(userId = null) {
    const all = [...this._notifs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return userId ? all.filter(n => n.userId === userId) : all;
  }

  getUnreadNotificationsCount(userId) {
    return this.getAllNotifications(userId).filter(n => !n.read).length;
  }

  dismissNotification(notifId) {
    this._notifs = this._notifs.map(n =>
      n.id === notifId ? { ...n, read: true } : n
    );
    this._saveNotifs();
  }

  dismissAllNotifications(userId) {
    this._notifs = this._notifs.map(n =>
      n.userId === userId ? { ...n, read: true } : n
    );
    this._saveNotifs();
  }

  // ── Stats helpers ─────────────────────────────────────────────────────────
  getStatusSummary() {
    const r = this._reports;
    return {
      total:      r.length,
      submitted:  r.filter(x => x.status === 'submitted').length,
      assigned:   r.filter(x => x.status === 'assigned').length,
      inProgress: r.filter(x => x.status === 'in_progress').length,
      pendingApproval: r.filter(x => x.status === 'pending_approval').length,
      resolved:   r.filter(x => x.status === 'resolved').length,
      closed:     r.filter(x => x.status === 'closed').length
    };
  }

  // ── Search / filter ───────────────────────────────────────────────────────
  searchReports(query) {
    if (!query || !query.trim()) return this._reports;
    const q = query.toLowerCase();
    return this._reports.filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      (r.submitterName || '').toLowerCase().includes(q)
    );
  }

  // ── Legacy compat methods (used by existing pages) ────────────────────────
  validateData()      { return this._reports.length > 0; }
  restoreFromBackup() { return false; } // no longer needed
  createBackup()      { return true; }  // no-op

  exportAsCSV() {
    const headers = ['ID','Date','Category','Title','Location','Status','Assigned To'];
    const rows = this._reports.map(r => [
      r.id,
      r.createdDate || '',
      r.category,
      `"${r.title}"`,
      `"${r.location}"`,
      r.status,
      r.assignedTo || 'Unassigned'
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  downloadCSV(filename = 'reports.csv') {
    const csv = this.exportAsCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
}

// Global instance
const reportsManager = new ReportsManager();

// ── Shared helper functions (used across all pages) ───────────────────────

function getCategoryInfo(category) {
  const map = {
    water: { icon: '💧', name: 'Water & Plumbing',   color: '#3B82F6' },
    road:  { icon: '🛣️', name: 'Road & Transport',   color: '#F59E0B' },
    light: { icon: '💡', name: 'Street Lighting',     color: '#FBBF24' },
    waste: { icon: '♻️', name: 'Waste Management',    color: '#10B981' },
    park:  { icon: '🌳', name: 'Parks & Green',       color: '#34D399' },
    other: { icon: '📝', name: 'Other',               color: '#6B7280' }
  };
  return map[category] || { icon: '📋', name: 'Unknown', color: '#9CA3AF' };
}

function getStatusColor(status) {
  const map = {
    submitted:        '#3B82F6',
    assigned:         '#F59E0B',
    in_progress:      '#8B5CF6',
    pending_approval: '#EC4899',
    resolved:         '#10B981',
    closed:           '#6B7280'
  };
  return map[status] || '#6B7280';
}

function getStatusBadgeText(status) {
  const map = {
    submitted:        '📬 Submitted',
    assigned:         '👤 Assigned',
    in_progress:      '🔧 In Progress',
    pending_approval: '⏳ Pending Approval',
    resolved:         '✅ Resolved',
    closed:           '🔒 Closed'
  };
  return map[status] || status;
}

function getTimeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7)  return `${d}d ago`;
  return new Date(dateString).toLocaleDateString();
}
