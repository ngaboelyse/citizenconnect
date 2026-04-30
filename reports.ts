// c:\Users\ngabo\OneDrive\Desktop\CitizenConnect-Mobile\src\utils\reports.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for better type safety
interface Report {
    id: string;
    category: string;
    title: string;
    description: string;
    location: string;
    priority: 'low' | 'medium' | 'high';
    status: 'submitted' | 'assigned' | 'in_progress' | 'pending_approval' | 'work_verified' | 'resolved' | 'closed';
    submittedBy: string; // email
    submitterName: string;
    timestamp: string; // ISO string
    createdDate: string; // Local date string
    createdTime: string; // Local time string
    assignedTo?: string; // email
    assignedDate?: string;
    assignedTime?: string;
    resolutionNotes?: string;
    resolvedDate?: string;
    resolutionSubmittedBy?: string;
    approvedDate?: string;
    approvedBy?: string;
    rejectionReason?: string;
    rejectedDate?: string;
    rejectedBy?: string;
    photoData?: string; // Base64 or URI
    comments?: Comment[];
    rating?: Rating;
    duplicateGroup?: DuplicateGroup;
    isDuplicate?: boolean;
    duplicateOf?: string;
    sla?: SLA;
    satisfactionRating?: number; // For staff productivity metrics
}

interface Comment {
    id: number;
    text: string;
    author: string;
    timestamp: string;
    isInternal: boolean;
}

interface Rating {
    score: number; // 1-5
    feedback?: string;
    author: string;
    timestamp: string;
}

interface Notification {
    id: string;
    userId: string; // email of the recipient
    message: string;
    type: 'new_report' | 'status_update' | 'assignment' | 'approval_needed' | 'resolved' | 'rejected' | 'duplicate';
    relatedTicketId?: string;
    timestamp: string;
    read: boolean;
}

interface DuplicateGroup {
    primary: string;
    duplicates: string[];
    mergedDate: string;
}

interface SLA {
    target: number; // hours
    dueDate: string; // ISO string
    status: 'active' | 'breached' | 'met';
    hoursRemaining: number;
}

class ReportsManager {
    private storageKey = 'citizenReports';
    private notificationsKey = 'citizenNotifications';

    /**
     * Get all reports
     */
    async getAllReports(): Promise<Report[]> {
        try {
            const reports = localStorage.getItem(this.storageKey);
            return reports ? JSON.parse(reports) : [];
        } catch (error) {
            console.error('Error reading reports from AsyncStorage:', error);
            return [];
        }
    }

    /**
     * Save all reports
     */
    private async saveAllReports(reports: Report[]): Promise<void> {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(reports));
        } catch (error) {
            console.error('Error saving reports to AsyncStorage:', error);
        }
    }

    /**
     * Get reports by category
     */
    async getReportsByCategory(category: string): Promise<Report[]> {
        const reports = await this.getAllReports();
        return reports.filter(r => r.category === category);
    }

    /**
     * Get reports by status
     */
    async getReportsByStatus(status: Report['status']): Promise<Report[]> {
        const reports = await this.getAllReports();
        return reports.filter(r => r.status === status);
    }

    /**
     * Get reports assigned to a user
     */
    async getReportsAssignedTo(email: string): Promise<Report[]> {
        const reports = await this.getAllReports();
        return reports.filter(r => r.assignedTo === email);
    }

    /**
     * Get active reports assigned to a user (not closed/resolved)
     */
    async getActiveReportsAssignedTo(email: string): Promise<Report[]> {
        const reports = await this.getAllReports();
        return reports.filter(r =>
            r.assignedTo === email &&
            r.status !== 'closed' &&
            r.status !== 'resolved'
        );
    }

    /**
     * Get all staff members with active assignments
     */
    async getActiveStaff(): Promise<string[]> {
        const reports = await this.getAllReports();
        const staffSet = new Set<string>();

        reports.forEach(r => {
            if (r.assignedTo && r.status !== 'closed' && r.status !== 'resolved') {
                staffSet.add(r.assignedTo);
            }
        });

        return Array.from(staffSet);
    }

    /**
     * Get staff workload summary
     */
    async getStaffWorkloadSummary() {
        const reports = await this.getAllReports();
        const staffMap: { [email: string]: { email: string; total: number; assigned: number; in_progress: number; pending_approval: number; completed: number; } } = {};

        reports.forEach(r => {
            if (r.assignedTo && r.status !== 'closed' && r.status !== 'resolved') {
                if (!staffMap[r.assignedTo]) {
                    staffMap[r.assignedTo] = {
                        email: r.assignedTo,
                        total: 0,
                        assigned: 0,
                        in_progress: 0,
                        pending_approval: 0,
                        completed: 0
                    };
                }

                staffMap[r.assignedTo].total++;

                if (r.status === 'assigned') staffMap[r.assignedTo].assigned++;
                else if (r.status === 'in_progress') staffMap[r.assignedTo].in_progress++;
                else if (r.status === 'pending_approval') staffMap[r.assignedTo].pending_approval++;
                else if (r.status === 'resolved') staffMap[r.assignedTo].completed++;
            }
        });

        return Object.values(staffMap);
    }

    /**
     * Get recent reports (last N)
     */
    async getRecentReports(limit = 5): Promise<Report[]> {
        const reports = await this.getAllReports();
        return reports.slice(0, limit);
    }

    /**
     * Get a single report by ID
     */
    async getReport(ticketId: string): Promise<Report | undefined> {
        const reports = await this.getAllReports();
        return reports.find(r => r.id === ticketId);
    }

    /**
     * Update report status
     */
    async updateReportStatus(ticketId: string, status: Report['status']): Promise<void> {
        let reports = await this.getAllReports();
        reports = reports.map(r => {
            if (r.id === ticketId) {
                return { ...r, status: status };
            }
            return r;
        });
        await this.createBackup(); // Create backup before saving
        await this.saveAllReports(reports);
    }

    /**
     * Assign report to staff
     */
    async assignReportToStaff(ticketId: string, staffEmail: string): Promise<void> {
        let reports = await this.getAllReports();
        reports = reports.map(r => {
            if (r.id === ticketId) {
                return {
                    ...r,
                    assignedTo: staffEmail,
                    status: 'assigned',
                    assignedDate: new Date().toLocaleString()
                };
            }
            return r;
        });
        await this.saveAllReports(reports);
    }

    /**
     * Staff starts working on task
     */
    async startWorkOnTask(ticketId: string, staffEmail: string): Promise<void> {
        let reports = await this.getAllReports();
        reports = reports.map(r => {
            if (r.id === ticketId && r.assignedTo === staffEmail) {
                return {
                    ...r,
                    status: 'in_progress',
                    startedDate: new Date().toLocaleString()
                };
            }
            return r;
        });
        await this.saveAllReports(reports);
    }

    /**
     * Staff submits resolution
     */
    async submitResolution(ticketId: string, staffEmail: string, resolutionNotes: string): Promise<void> {
        let reports = await this.getAllReports();
        reports = reports.map(r => {
            if (r.id === ticketId && r.assignedTo === staffEmail) {
                return {
                    ...r,
                    status: 'pending_approval',
                    resolutionNotes: resolutionNotes,
                    resolvedDate: new Date().toLocaleString(),
                    resolutionSubmittedBy: staffEmail
                };
            }
            return r;
        });
        await this.saveAllReports(reports);
    }

    /**
     * Admin verifies staff's work quality FIRST
     */
    async verifyStaffWork(ticketId: string, adminEmail: string, verificationNotes = ''): Promise<void> {
        let reports = await this.getAllReports();
        reports = reports.map(r => {
            if (r.id === ticketId) {
                return {
                    ...r,
                    status: 'work_verified',
                    workVerifiedDate: new Date().toLocaleString(),
                    workVerifiedBy: adminEmail,
                    adminVerificationNotes: verificationNotes
                };
            }
            return r;
        });
        await this.saveAllReports(reports);
    }

    /**
     * Admin approves resolution (FINAL STEP after work verification)
     */
    async approveResolution(ticketId: string, adminEmail: string): Promise<void> {
        let reports = await this.getAllReports();
        reports = reports.map(r => {
            if (r.id === ticketId) {
                return {
                    ...r,
                    status: 'resolved',
                    approvedDate: new Date().toLocaleString(),
                    approvedBy: adminEmail
                };
            }
            return r;
        });
        await this.saveAllReports(reports);
    }

    /**
     * Admin rejects resolution (returns to staff)
     */
    async rejectResolution(ticketId: string, adminEmail: string, rejectionReason: string): Promise<void> {
        let reports = await this.getAllReports();
        reports = reports.map(r => {
            if (r.id === ticketId) {
                return {
                    ...r,
                    status: 'in_progress',
                    rejectionReason: rejectionReason,
                    rejectedDate: new Date().toLocaleString(),
                    rejectedBy: adminEmail
                };
            }
            return r;
        });
        await this.saveAllReports(reports);
    }

    /**
     * Get stats by category
     */
    async getStatsByCategory(): Promise<{ [category: string]: number }> {
        const reports = await this.getAllReports();
        const stats: { [category: string]: number } = {};

        reports.forEach(r => {
            if (!stats[r.category]) {
                stats[r.category] = 0;
            }
            stats[r.category]++;
        });

        return stats;
    }

    /**
     * Get status summary
     */
    async getStatusSummary() {
        const reports = await this.getAllReports();
        const summary = {
            total: reports.length,
            submitted: reports.filter(r => r.status === 'submitted').length,
            assigned: reports.filter(r => r.status === 'assigned').length,
            inProgress: reports.filter(r => r.status === 'in_progress').length,
            resolved: reports.filter(r => r.status === 'resolved').length,
            closed: reports.filter(r => r.status === 'closed').length
        };
        return summary;
    }

    /**
     * Get high priority reports (priority='high')
     */
    async getHighPriorityReports(): Promise<Report[]> {
        const reports = await this.getAllReports();
        return reports.filter(r => r.priority === 'high' && r.status !== 'resolved' && r.status !== 'closed');
    }

    /**
     * Get urgent issues count (active reports with high priority)
     */
    async getUrgentIssuesCount(): Promise<number> {
        const reports = await this.getAllReports();
        return reports.filter(r => r.priority === 'high' && r.status !== 'resolved' && r.status !== 'closed').length;
    }

    /**
     * Create automatic backup of reports
     */
    async createBackup(): Promise<boolean> {
        try {
            const reports = await this.getAllReports();
            const backup = {
                timestamp: new Date().toISOString(),
                data: reports,
                count: reports.length
            };
            localStorage.setItem(this.storageKey + '_backup', JSON.stringify(backup));
            return true;
        } catch (error) {
            console.error('Backup failed:', error);
            return false;
        }
    }

    /**
     * Restore from backup if data is lost
     */
    async restoreFromBackup(): Promise<boolean> {
        try {
            const backup = localStorage.getItem(this.storageKey + '_backup');
            if (backup) {
                const backupData = JSON.parse(backup);
                await this.saveAllReports(backupData.data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Restore failed:', error);
            return false;
        }
    }

    /**
     * Check if data exists and is valid
     */
    async validateData(): Promise<boolean> {
        try {
            const reports = await this.getAllReports();
            if (Array.isArray(reports) && reports.length > 0) {
                return true;
            }
            // Try to restore backup if main data is empty
            if (await this.restoreFromBackup()) {
                console.log('✅ Data restored from backup');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Validation failed:', error);
            return false;
        }
    }

    /**
     * Export all data as JSON
     */
    async exportAllData(): Promise<string> {
        try {
            const reports = await this.getAllReports();
            return JSON.stringify(reports, null, 2);
        } catch (error) {
            console.error('Export failed:', error);
            return '';
        }
    }

    /**
     * Import data from JSON
     */
    async importData(jsonString: string): Promise<boolean> {
        try {
            const data = JSON.parse(jsonString);
            if (Array.isArray(data)) {
                await this.createBackup(); // Backup before import
                await this.saveAllReports(data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }

    /**
     * FEATURE 1: Search reports by title, description, location, or ID
     */
    async searchReports(query: string): Promise<Report[]> {
        if (!query || query.trim().length === 0) return this.getAllReports();

        const searchTerm = query.toLowerCase();
        const reports = await this.getAllReports();

        return reports.filter(r =>
            r.id.toLowerCase().includes(searchTerm) ||
            r.title.toLowerCase().includes(searchTerm) ||
            r.description.toLowerCase().includes(searchTerm) ||
            r.location.toLowerCase().includes(searchTerm) ||
            r.submitterName.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * FEATURE 1: Filter reports by multiple criteria
     */
    async filterReports(filters: { status?: Report['status'] | 'all'; category?: string | 'all'; priority?: Report['priority'] | 'all'; assignedTo?: string | 'all'; dateFrom?: string; dateTo?: string; }): Promise<Report[]> {
        let reports = await this.getAllReports();

        if (filters.status && filters.status !== 'all') {
            reports = reports.filter(r => r.status === filters.status);
        }

        if (filters.category && filters.category !== 'all') {
            reports = reports.filter(r => r.category === filters.category);
        }

        if (filters.priority && filters.priority !== 'all') {
            reports = reports.filter(r => r.priority === filters.priority);
        }

        if (filters.assignedTo && filters.assignedTo !== 'all') {
            reports = reports.filter(r => r.assignedTo === filters.assignedTo);
        }

        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            reports = reports.filter(r => new Date(r.timestamp) >= fromDate);
        }

        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            reports = reports.filter(r => new Date(r.timestamp) <= toDate);
        }

        return reports;
    }

    /**
     * FEATURE 1: Combined search and filter
     */
    async searchAndFilter(query: string, filters: { status?: Report['status'] | 'all'; category?: string | 'all'; priority?: Report['priority'] | 'all'; assignedTo?: string | 'all'; dateFrom?: string; dateTo?: string; }): Promise<Report[]> {
        let results = await this.getAllReports();

        if (query && query.trim().length > 0) {
            results = await this.searchReports(query);
        }

        if (filters) {
            results = results.filter(r => {
                if (filters.status && filters.status !== 'all' && r.status !== filters.status) return false;
                if (filters.category && filters.category !== 'all' && r.category !== filters.category) return false;
                if (filters.priority && filters.priority !== 'all' && r.priority !== filters.priority) return false;
                if (filters.assignedTo && filters.assignedTo !== 'all' && r.assignedTo !== filters.assignedTo) return false;
                if (filters.dateFrom && new Date(r.timestamp) < new Date(filters.dateFrom)) return false;
                if (filters.dateTo) {
                    const toDate = new Date(filters.dateTo);
                    toDate.setHours(23, 59, 59, 999);
                    if (new Date(r.timestamp) > toDate) return false;
                }
                return true;
            });
        }

        return results;
    }

    /**
     * FEATURE 2: Add comment to a report
     */
    async addComment(ticketId: string, commentText: string, author: string): Promise<void> {
        let reports = await this.getAllReports();
        reports = reports.map(r => {
            if (r.id === ticketId) {
                if (!r.comments) r.comments = [];
                r.comments.push({
                    id: Date.now(),
                    text: commentText,
                    author: author,
                    timestamp: new Date().toISOString(),
                    isInternal: false
                });
            }
            return r;
        });
        await this.createBackup();
        await this.saveAllReports(reports);
    }

    /**
     * FEATURE 2: Add internal note (admin only)
     */
    async addInternalNote(ticketId: string, note: string, author: string): Promise<void> {
        let reports = await this.getAllReports();
        reports = reports.map(r => {
            if (r.id === ticketId) {
                if (!r.comments) r.comments = [];
                r.comments.push({
                    id: Date.now(),
                    text: note,
                    author: author,
                    timestamp: new Date().toISOString(),
                    isInternal: true
                });
            }
            return r;
        });
        await this.createBackup();
        await this.saveAllReports(reports);
    }

    /**
     * FEATURE 2: Get comments for a report
     */
    async getComments(ticketId: string): Promise<Comment[]> {
        const report = await this.getReport(ticketId);
        return report && report.comments ? report.comments : [];
    }

    /**
     * FEATURE 3: Add rating and feedback to a report
     */
    async addRating(ticketId: string, ratingScore: number, feedback: string, author: string): Promise<boolean> {
        if (ratingScore < 1 || ratingScore > 5) {
            console.error('Rating must be between 1 and 5');
            return false;
        }

        let reports = await this.getAllReports();
        reports = reports.map(r => {
            if (r.id === ticketId) {
                r.rating = {
                    score: ratingScore,
                    feedback: feedback,
                    author: author,
                    timestamp: new Date().toISOString()
                };
            }
            return r;
        });
        await this.createBackup();
        await this.saveAllReports(reports);
        return true;
    }

    /**
     * FEATURE 3: Get satisfaction metrics
     */
    async getSatisfactionMetrics() {
        const reports = await this.getAllReports();
        const ratedReports = reports.filter(r => r.rating);

        if (ratedReports.length === 0) {
            return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
        }

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;

        ratedReports.forEach(r => {
            if (r.rating) {
                sum += r.rating.score;
                distribution[r.rating.score]++;
            }
        });

        return {
            average: (sum / ratedReports.length).toFixed(2),
            total: ratedReports.length,
            distribution: distribution,
            percentageRated: ((ratedReports.length / reports.length) * 100).toFixed(1)
        };
    }

    // ===== PHASE 2: NOTIFICATIONS SYSTEM =====

    /**
     * Add a notification for a user
     */
    async addNotification(userId: string, message: string, type: Notification['type'], relatedTicketId: string | null = null): Promise<Notification | null> {
        try {
            const notifications = await this.getAllNotifications();
            const notification: Notification = {
                id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                userId: userId,
                message: message,
                type: type,
                relatedTicketId: relatedTicketId,
                timestamp: new Date().toISOString(),
                read: false
            };

            notifications.push(notification);
            localStorage.setItem(this.notificationsKey, JSON.stringify(notifications));
            return notification;
        } catch (error) {
            console.error('Error adding notification:', error);
            return null;
        }
    }

    /**
     * Get all notifications for a user
     */
    async getAllNotifications(userId: string | null = null): Promise<Notification[]> {
        try {
            const notifications = localStorage.getItem(this.notificationsKey);
            const allNotifications: Notification[] = notifications ? JSON.parse(notifications) : [];

            if (userId) {
                return allNotifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            }
            return allNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } catch (error) {
            console.error('Error reading notifications:', error);
            return [];
        }
    }

    /**
     * Get unread notifications count for a user
     */
    async getUnreadNotificationsCount(userId: string): Promise<number> {
        const notifications = await this.getAllNotifications(userId);
        return notifications.filter(n => !n.read).length;
    }

    /**
     * Mark notification as read
     */
    async dismissNotification(notificationId: string): Promise<boolean> {
        try {
            const notifications = await this.getAllNotifications();
            const notification = notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
                localStorage.setItem(this.notificationsKey, JSON.stringify(notifications));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error dismissing notification:', error);
            return false;
        }
    }

    /**
     * Dismiss all notifications for a user
     */
    async dismissAllNotifications(userId: string): Promise<boolean> {
        try {
            const notifications = await this.getAllNotifications();
            notifications.forEach(n => {
                if (n.userId === userId) n.read = true;
            });
            localStorage.setItem(this.notificationsKey, JSON.stringify(notifications));
            return true;
        } catch (error) {
            console.error('Error dismissing all notifications:', error);
            return false;
        }
    }

    // ===== PHASE 2: DUPLICATE DETECTION =====

    /**
     * Detect potential duplicate reports
     * Finds similar reports based on location, category, and keywords
     */
    async detectDuplicates(newReport: Report): Promise<Report[]> {
        const allReports = await this.getAllReports();
        const similarReports: (Report & { similarity: number })[] = [];

        // Only check against reports from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        for (const report of allReports) {
            if (report.id === newReport.id) continue; // Skip self

            try {
                const reportDate = new Date(report.timestamp || report.createdDate);
                if (reportDate < thirtyDaysAgo) continue; // Skip old reports
            } catch (e) {
                continue;
            }

            let similarityScore = 0;

            // Category match (25 points)
            if (report.category === newReport.category) {
                similarityScore += 25;
            }

            // Location proximity (25 points)
            if (this.isLocationSimilar(report.location, newReport.location)) {
                similarityScore += 25;
            }

            // Keyword match in title/description (30 points)
            if (this.hasKeywordMatch(report, newReport)) {
                similarityScore += 30;
            }

            // Status not closed/resolved (20 points bonus)
            if (!['closed', 'resolved'].includes(report.status)) {
                similarityScore += 20;
            }

            if (similarityScore >= 50) {
                similarReports.push({
                    ...report,
                    similarity: similarityScore,
                });
            }
        }

        return similarReports.sort((a, b) => b.similarity - a.similarity);
    }

    /**
     * Helper: Check if locations are similar
     */
    private isLocationSimilar(location1: string | undefined, location2: string | undefined): boolean {
        if (!location1 || !location2) return false;

        const loc1 = location1.toLowerCase().trim();
        const loc2 = location2.toLowerCase().trim();

        // Exact match
        if (loc1 === loc2) return true;

        // Check if one contains the other
        if (loc1.includes(loc2) || loc2.includes(loc1)) return true;

        // Check for common street/area names
        const words1 = loc1.split(/[\s,]+/);
        const words2 = loc2.split(/[\s,]+/);
        const commonWords = words1.filter(w => words2.includes(w));

        return commonWords.length >= 2;
    }

    /**
     * Helper: Check for keyword matches
     */
    private hasKeywordMatch(report1: Report, report2: Report): boolean {
        const text1 = ((report1.title || '') + ' ' + (report1.description || '')).toLowerCase();
        const text2 = ((report2.title || '') + ' ' + (report2.description || '')).toLowerCase();

        // Extract key terms (words longer than 4 chars, except common words)
        const commonWords = new Set(['water', 'pipe', 'light', 'street', 'road', 'trash', 'waste', 'broken', 'damaged', 'issue', 'problem', 'report']);

        const words1 = text1.split(/\W+/).filter(w => w.length > 4 && !commonWords.has(w));
        const words2 = text2.split(/\W+/).filter(w => w.length > 4 && !commonWords.has(w));

        const matches = words1.filter(w => words2.includes(w));
        return matches.length >= 2;
    }

    /**
     * Link reports as duplicates
     */
    async linkDuplicates(primaryReportId: string, duplicateReportIds: string[]): Promise<boolean> {
        try {
            const reports = await this.getAllReports();
            const primaryReport = reports.find(r => r.id === primaryReportId);

            if (!primaryReport) return false;

            // Initialize duplicate group if not exists
            if (!primaryReport.duplicateGroup) {
                primaryReport.duplicateGroup = {
                    primary: primaryReportId,
                    duplicates: [],
                    mergedDate: new Date().toISOString()
                };
            }

            // Add duplicates
            duplicateReportIds.forEach(dupId => {
                if (!primaryReport.duplicateGroup!.duplicates.includes(dupId)) {
                    primaryReport.duplicateGroup!.duplicates.push(dupId);

                    // Mark duplicate report
                    const dupReport = reports.find(r => r.id === dupId);
                    if (dupReport) {
                        dupReport.isDuplicate = true;
                        dupReport.duplicateOf = primaryReportId;
                    }
                }
            });

            await this.saveAllReports(reports);
            await this.createBackup(); // Assuming backupToFile is now createBackup
            return true;
        } catch (error) {
            console.error('Error linking duplicates:', error);
            return false;
        }
    }

    // ===== PHASE 2: AUTOMATIC ROUTING =====

    /**
     * Get best staff member for auto-assignment
     * Considers workload and expertise (category assignment history)
     */
    async getAutoAssignee(category: string, priority: Report['priority'] = 'medium'): Promise<string> {
        try {
            const activeStaff = await this.getActiveStaff();
            if (activeStaff.length === 0) return 'admin@example.com'; // Fallback to admin

            // Get workload for each staff member
            const staffWorkloads: {
                email: string;
                workloadScore: number;
                totalAssignments: number;
                specialization: string;
                highPriorityCount: number;
            }[] = [];

            for (const staffEmail of activeStaff) {
                const assignedReports = await this.getActiveReportsAssignedTo(staffEmail);

                // Count by priority
                const highPriorityCount = assignedReports.filter(r => r.priority === 'high').length;
                const totalCount = assignedReports.length;

                // Calculate workload score (lower is better)
                // High priority tasks count double
                const workloadScore = totalCount + (highPriorityCount * 0.5);

                // Get specialization (most frequent category for this staff)
                const categoryCount: { [cat: string]: number } = {};
                assignedReports.forEach(r => {
                    categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
                });

                const specialization = Object.keys(categoryCount).reduce((a, b) =>
                    categoryCount[a] > categoryCount[b] ? a : b, 'none');

                // Expertise bonus (if staff specializes in this category, reduce workload score)
                const specialization_bonus = specialization === category ? -1 : 0;

                staffWorkloads.push({
                    email: staffEmail,
                    workloadScore: workloadScore + specialization_bonus,
                    totalAssignments: totalCount,
                    specialization: specialization,
                    highPriorityCount: highPriorityCount
                });
            }

            // Return staff with lowest workload score
            return staffWorkloads.sort((a, b) => a.workloadScore - b.workloadScore)[0].email;
        } catch (error) {
            console.error('Error getting auto assignee:', error);
            return 'admin@example.com';
        }
    }

    /**
     * Auto-assign a report to the best available staff member
     */
    async autoAssignReport(ticketId: string): Promise<boolean> {
        try {
            const report = await this.getReport(ticketId);
            if (!report) return false;

            // Determine best assignee
            const assignee = await this.getAutoAssignee(report.category, report.priority);

            // Assign report
            let reports = await this.getAllReports();
            const reportToUpdate = reports.find(r => r.id === ticketId);

            if (reportToUpdate) {
                reportToUpdate.assignedTo = assignee;
                reportToUpdate.status = 'assigned';
                reportToUpdate.assignedDate = new Date().toISOString().split('T')[0];
                reportToUpdate.assignedTime = new Date().toLocaleTimeString();

                await this.saveAllReports(reports);
                await this.createBackup();

                // Create notifications
                // Notify staff member
                await this.addNotification(
                    assignee,
                    `📋 New task assigned: ${report.title} (High priority: ${report.priority === 'high' ? 'YES' : 'NO'})`,
                    'assignment',
                    ticketId
                );

                // Notify citizen
                await this.addNotification(
                    report.submittedBy,
                    `✓ Your report "#${ticketId}" has been assigned to our team. Work will begin shortly.`,
                    'assignment',
                    ticketId
                );

                return true;
            }
            return false;
        } catch (error) {
            console.error('Error auto-assigning report:', error);
            return false;
        }
    }

    /**
     * Get categories with staffing gaps (many reports, few staff)
     */
    async getCategoryStaffingGaps() {
        try {
            const reports = await this.getAllReports();
            const staffMap: { [category: string]: Set<string> } = {};
            const categoryReportCount: { [category: string]: number } = {};

            reports.forEach(r => {
                if (r.status !== 'closed' && r.status !== 'resolved') {
                    categoryReportCount[r.category] = (categoryReportCount[r.category] || 0) + 1;

                    if (r.assignedTo) {
                        if (!staffMap[r.category]) staffMap[r.category] = new Set();
                        staffMap[r.category].add(r.assignedTo);
                    }
                }
            });

            const gaps: { category: string; reportCount: number; staffCount: number; ratio: string; }[] = [];
            Object.entries(categoryReportCount).forEach(([category, count]) => {
                const staffCount = staffMap[category] ? staffMap[category].size : 0;
                const ratio = staffCount > 0 ? count / staffCount : count;

                if (ratio > 3) { // More than 3 reports per staff member
                    gaps.push({
                        category: category,
                        reportCount: count,
                        staffCount: staffCount,
                        ratio: ratio.toFixed(1)
                    });
                }
            });

            return gaps.sort((a, b) => parseFloat(b.ratio) - parseFloat(a.ratio));
        } catch (error) {
            console.error('Error getting staffing gaps:', error);
            return [];
        }
    }

    // ===== PHASE 3: ANALYTICS & PERFORMANCE =====

    /**
     * Get resolution metrics (resolution time, completion rate, etc)
     */
    async getResolutionMetrics() {
        try {
            const reports = await this.getAllReports();
            const metrics = {
                totalReports: reports.length,
                resolvedReports: 0,
                avgResolutionTime: 0,
                resolutionsByCategory: {} as { [category: string]: { total: number; resolved: number; avgTime: number; } },
                trendsLastWeek: [] as { date: string; resolved: number; }[],
                completionRate: 0
            };

            let totalResolutionTime = 0;
            const resolvedByDate: { [date: string]: number } = {};
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            reports.forEach(r => {
                if (r.status === 'resolved' || r.status === 'closed') {
                    metrics.resolvedReports++;

                    // Calculate resolution time
                    if (r.createdDate && r.resolvedDate) {
                        const created = new Date(r.createdDate);
                        const resolved = new Date(r.resolvedDate);
                        const daysToResolve = Math.ceil((resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
                        totalResolutionTime += daysToResolve;

                        // Track trends for last 7 days
                        if (resolved > sevenDaysAgo) {
                            const dateKey = resolved.toISOString().split('T')[0];
                            resolvedByDate[dateKey] = (resolvedByDate[dateKey] || 0) + 1;
                        }
                    }

                    // Group by category
                    if (!metrics.resolutionsByCategory[r.category]) {
                        metrics.resolutionsByCategory[r.category] = {
                            total: 0,
                            resolved: 0,
                            avgTime: 0
                        };
                    }
                    metrics.resolutionsByCategory[r.category].resolved++;
                }

                // Category stats
                const cat = r.category;
                if (!metrics.resolutionsByCategory[cat]) {
                    metrics.resolutionsByCategory[cat] = {
                        total: 0,
                        resolved: 0,
                        avgTime: 0
                    };
                }
                metrics.resolutionsByCategory[cat].total++;
            });

            metrics.avgResolutionTime = metrics.resolvedReports > 0
                ? parseFloat((totalResolutionTime / metrics.resolvedReports).toFixed(1))
                : 0;

            metrics.completionRate = metrics.totalReports > 0
                ? parseFloat(((metrics.resolvedReports / metrics.totalReports) * 100).toFixed(1))
                : 0;

            // Convert trends to array
            metrics.trendsLastWeek = Object.entries(resolvedByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, count]) => ({ date, resolved: count }));

            return metrics;
        } catch (error) {
            console.error('Error getting resolution metrics:', error);
            return {};
        }
    }

    /**
     * Get staff productivity metrics
     */
    async getStaffProductivity() {
        try {
            const reports = await this.getAllReports();
            const staffMetrics: { [email: string]: {
                email: string;
                totalAssigned: number;
                resolved: number;
                inProgress: number;
                avgResolutionTime: number;
                satisfactionRating: number;
                ratingCount: number;
                completionRate?: string | number;
                productivityScore?: string | number;
            } } = {};

            reports.forEach(r => {
                if (r.assignedTo) {
                    if (!staffMetrics[r.assignedTo]) {
                        staffMetrics[r.assignedTo] = {
                            email: r.assignedTo,
                            totalAssigned: 0,
                            resolved: 0,
                            inProgress: 0,
                            avgResolutionTime: 0,
                            satisfactionRating: 0,
                            ratingCount: 0
                        };
                    }

                    staffMetrics[r.assignedTo].totalAssigned++;

                    if (r.status === 'resolved' || r.status === 'closed') {
                        staffMetrics[r.assignedTo].resolved++;
                    } else if (r.status === 'in_progress') {
                        staffMetrics[r.assignedTo].inProgress++;
                    }

                    // Calculate satisfaction rating if available
                    if (r.satisfactionRating) {
                        staffMetrics[r.assignedTo].satisfactionRating += r.satisfactionRating;
                        staffMetrics[r.assignedTo].ratingCount++;
                    }
                }
            });

            // Calculate averages and productivity score
            Object.values(staffMetrics).forEach(staff => {
                staff.completionRate = staff.totalAssigned > 0
                    ? parseFloat(((staff.resolved / staff.totalAssigned) * 100).toFixed(1))
                    : 0;

                staff.satisfactionRating = staff.ratingCount > 0
                    ? parseFloat((staff.satisfactionRating / staff.ratingCount).toFixed(1))
                    : 0;

                // Productivity score: 50% completion + 50% satisfaction
                const completionScore = (typeof staff.completionRate === 'number' ? staff.completionRate : 0 / 100) * 50;
                const satisfactionScore = (typeof staff.satisfactionRating === 'number' ? staff.satisfactionRating : 0 / 5) * 50;
                staff.productivityScore = parseFloat((completionScore + satisfactionScore).toFixed(1));
            });

            return Object.values(staffMetrics).sort((a, b) => (typeof b.productivityScore === 'number' ? b.productivityScore : 0) - (typeof a.productivityScore === 'number' ? a.productivityScore : 0));
        } catch (error) {
            console.error('Error getting staff productivity:', error);
            return [];
        }
    }

    /**
     * Get high-performing staff in a category (for advanced routing)
     */
    async getHighPerformersInCategory(category: string, limit = 3) {
        try {
            const productivity = await this.getStaffProductivity();
            const categoryStats: { [email: string]: {
                email: string;
                assigned: number;
                resolved: number;
                satisfaction: number;
                ratingCount: number;
            } } = {};

            const allReports = await this.getAllReports();
            allReports.forEach(r => {
                if (r.category === category && r.assignedTo) {
                    if (!categoryStats[r.assignedTo]) {
                        categoryStats[r.assignedTo] = {
                            email: r.assignedTo,
                            assigned: 0,
                            resolved: 0,
                            satisfaction: 0,
                            ratingCount: 0
                        };
                    }

                    categoryStats[r.assignedTo].assigned++;
                    if (r.status === 'resolved' || r.status === 'closed') {
                        categoryStats[r.assignedTo].resolved++;
                    }

                    if (r.satisfactionRating) {
                        categoryStats[r.assignedTo].satisfaction += r.satisfactionRating;
                        categoryStats[r.assignedTo].ratingCount++;
                    }
                }
            });

            // Score staff in this category
            const scored = Object.values(categoryStats).map(staff => ({
                ...staff,
                categoryScore: staff.assigned > 0
                    ? ((staff.resolved / staff.assigned) * 0.6 +
                       (staff.ratingCount > 0 ? (staff.satisfaction / staff.ratingCount) / 5 : 0) * 0.4) * 100
                    : 0
            }));

            return scored.sort((a, b) => b.categoryScore - a.categoryScore).slice(0, limit);
        } catch (error) {
            console.error('Error getting high performers:', error);
            return [];
        }
    }

    /**
     * Enhanced auto-assign with performance history
     */
    async getAdvancedAutoAssignee(category: string, priority: Report['priority'] = 'medium'): Promise<string> {
        try {
            const highPerformers = await this.getHighPerformersInCategory(category, 5);
            const activeStaff = await this.getActiveStaff();

            if (highPerformers.length > 0) {
                // Try to assign to high performer first
                for (let performer of highPerformers) {
                    const activeReports = await this.getActiveReportsAssignedTo(performer.email);
                    const workloadScore = activeReports.length +
                        (activeReports.filter(r => r.priority === 'high').length * 0.5);

                    if (workloadScore < 5) { // Only if not overloaded
                        return performer.email;
                    }
                }
            }

            // Fallback to regular load balancing
            return await this.getAutoAssignee(category, priority);
        } catch (error) {
            console.error('Error in advanced auto-assign:', error);
            return await this.getAutoAssignee(category, priority);
        }
    }

    // ===== PHASE 3: SLA MANAGEMENT =====

    /**
     * Set SLA for report based on priority
     */
    async setSLA(reportId: string, priority: Report['priority'] = 'medium'): Promise<boolean> {
        try {
            let reports = await this.getAllReports();
            const report = reports.find(r => r.id === reportId);

            if (!report) return false;

            // SLA targets in hours
            const slaHours = {
                high: 24,
                medium: 72,
                low: 168
            };

            const created = new Date(report.timestamp);
            const dueDate = new Date(created.getTime() + slaHours[priority] * 60 * 60 * 1000);

            report.sla = {
                target: slaHours[priority],
                dueDate: dueDate.toISOString(),
                status: 'active',
                hoursRemaining: slaHours[priority]
            };

            await this.saveAllReports(reports);
            return true;
        } catch (error) {
            console.error('Error setting SLA:', error);
            return false;
        }
    }

    /**
     * Get SLA status for all reports
     */
    async getSLAMetrics() {
        try {
            const reports = await this.getAllReports();
            const metrics = {
                totalWithSLA: 0,
                onTrack: 0,
                warning: 0,
                breached: 0,
                upcoming: [] as { id: string; title: string; status: string; hoursRemaining: number; }[]
            };

            const now = new Date();

            reports.forEach(r => {
                if (r.sla && r.sla.status === 'active' && r.status !== 'resolved' && r.status !== 'closed') {
                    metrics.totalWithSLA++;
                    const dueDate = new Date(r.sla.dueDate);
                    const hoursRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

                    if (hoursRemaining < 0) {
                        metrics.breached++;
                        metrics.upcoming.push({
                            id: r.id,
                            title: r.title,
                            status: 'breached',
                            hoursRemaining: Math.ceil(hoursRemaining)
                        });
                    } else if (hoursRemaining < 4) {
                        metrics.warning++;
                        metrics.upcoming.push({
                            id: r.id,
                            title: r.title,
                            status: 'warning',
                            hoursRemaining: Math.ceil(hoursRemaining)
                        });
                    } else {
                        metrics.onTrack++;
                    }
                }
            });

            return metrics;
        } catch (error) {
            console.error('Error getting SLA metrics:', error);
            return {};
        }
    }

    /**
     * Get overdue SLA reports
     */
    async getOverdueSLAReports(): Promise<Report[]> {
        try {
            const reports = await this.getAllReports();
            const overdue: (Report & { overdueHours: number })[] = [];
            const now = new Date();

            reports.forEach(r => {
                if (r.sla && r.sla.status === 'active' && r.status !== 'resolved' && r.status !== 'closed') {
                    const dueDate = new Date(r.sla.dueDate);
                    if (now.getTime() > dueDate.getTime()) {
                        overdue.push({
                            ...r,
                            overdueHours: Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60))
                        });
                    }
                }
            });

            return overdue.sort((a, b) => b.overdueHours - a.overdueHours);
        } catch (error) {
            console.error('Error getting overdue SLA reports:', error);
            return [];
        }
    }

    // ===== PHASE 3: EXPORT FUNCTIONALITY =====

    /**
     * Export reports as CSV
     * NOTE: This function will need a mobile-specific implementation for file saving/sharing.
     * For now, it returns the CSV string.
     */
    async exportAsCSV(filters: { category?: string; status?: Report['status']; dateFrom?: string; dateTo?: string; } = {}): Promise<string | null> {
        try {
            let reports = await this.getAllReports();

            // Apply filters
            if (filters.category) reports = reports.filter(r => r.category === filters.category);
            if (filters.status) reports = reports.filter(r => r.status === filters.status);
            if (filters.dateFrom) reports = reports.filter(r => new Date(r.timestamp) >= new Date(filters.dateFrom));
            if (filters.dateTo) reports = reports.filter(r => new Date(r.timestamp) <= new Date(filters.dateTo));

            const headers = ['ID', 'Date', 'Category', 'Title', 'Location', 'Status', 'Priority', 'Assigned To', 'Satisfaction'];
            const rows: string[][] = [];

            reports.forEach(r => {
                rows.push([
                    r.id,
                    new Date(r.timestamp).toLocaleDateString(),
                    r.category,
                    `"${r.title}"`,
                    `"${r.location}"`,
                    r.status,
                    r.priority,
                    r.assignedTo || 'Unassigned',
                    r.satisfactionRating ? r.satisfactionRating.toString() : 'N/A'
                ]);
            });

            const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            return csv;
        } catch (error) {
            console.error('Error exporting CSV:', error);
            return null;
        }
    }

    /**
     * Download CSV file
     * NOTE: This function is browser-specific. For mobile, you would use libraries like
     * `expo-sharing` or `react-native-fs` to save/share the file.
     */
    async downloadCSV(filename = 'reports.csv', filters = {}): Promise<boolean> {
        const csv = await this.exportAsCSV(filters);
        if (!csv) return false;

        // This part needs to be replaced with mobile-specific file handling
        console.warn('downloadCSV is browser-specific. Implement mobile file saving/sharing here.');
        // Example with Expo:
        // import * as FileSystem from 'expo-file-system';
        // import * as Sharing from 'expo-sharing';
        // const fileUri = FileSystem.documentDirectory + filename;
        // await FileSystem.writeAsStringAsync(fileUri, csv);
        // await Sharing.shareAsync(fileUri);

        return true;
    }

    /**
     * Get system overview dashboard data
     */
    async getSystemOverview() {
        try {
            const reports = await this.getAllReports();
            const resMetrics = await this.getResolutionMetrics();
            const slaMetrics = await this.getSLAMetrics();
            const staffWorkload = await this.getStaffWorkloadSummary();
            const staffProductivity = await this.getStaffProductivity();

            return {
                timestamp: new Date().toISOString(),
                reports: {
                    total: reports.length,
                    submitted: reports.filter(r => r.status === 'submitted').length,
                    assigned: reports.filter(r => r.status === 'assigned').length,
                    inProgress: reports.filter(r => r.status === 'in_progress').length,
                    resolved: reports.filter(r => r.status === 'resolved').length,
                    closed: reports.filter(r => r.status === 'closed').length
                },
                categories: Object.keys(reports.reduce((acc, r) => { acc[r.category] = true; return acc; }, {} as { [key: string]: boolean })),
                resolution: resMetrics,
                sla: slaMetrics,
                staff: {
                    total: staffWorkload.length,
                    avgWorkload: staffWorkload.length > 0 ? parseFloat((staffWorkload.reduce((sum, s) => sum + s.total, 0) / staffWorkload.length).toFixed(1)) : 0,
                    topPerformers: staffProductivity.slice(0, 3)
                }
            };
        } catch (error) {
            console.error('Error getting system overview:', error);
            return {};
        }
    }
}

// Create global instance
export const reportsManager = new ReportsManager();

/**
 * Get category icon and name
 */
export function getCategoryInfo(category: string) {
    const categoryMap = {
        water: { icon: '💧', name: 'Water & Plumbing', color: '#3B82F6' },
        road: { icon: '🛣️', name: 'Road & Transport', color: '#F59E0B' },
        light: { icon: '💡', name: 'Street Lighting', color: '#FBBF24' },
        waste: { icon: '♻️', name: 'Waste Management', color: '#10B981' },
        park: { icon: '🌳', name: 'Parks & Green', color: '#34D399' },
        other: { icon: '📝', name: 'Other', color: '#6B7280' }
    };
    return categoryMap[category] || { icon: '📋', name: 'Unknown', color: '#9CA3AF' };
}

/**
 * Get status color
 */
export function getStatusColor(status: Report['status']) {
    const statusMap = {
        submitted: '#3B82F6',
        assigned: '#F59E0B',
        in_progress: '#8B5CF6',
        pending_approval: '#EC4899',
        work_verified: '#3B82F6',
        resolved: '#10B981',
        closed: '#6B7280'
    };
    return statusMap[status] || '#6B7280';
}

/**
 * Get status badge text
 */
export function getStatusBadgeText(status: Report['status']) {
    const statusMap = {
        submitted: '📬 Submitted',
        assigned: '👤 Assigned',
        in_progress: '🔄 In Progress',
        pending_approval: '⏳ Pending Approval (Needs Verification)',
        work_verified: '✓ Work Verified',
        resolved: '✓ Resolved',
        closed: '📭 Closed'
    };
    return statusMap[status] || status;
}

/**
 * Format time ago
 */
export function getTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}