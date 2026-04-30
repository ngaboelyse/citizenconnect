// Reports Management System

class ReportsManager {
    constructor() {
        this.storageKey = 'citizenReports';
    }

    /**
     * Get all reports
     */
    getAllReports() {
        try {
            const reports = localStorage.getItem(this.storageKey);
            return reports ? JSON.parse(reports) : [];
        } catch (error) {
            console.error('Error reading reports:', error);
            return [];
        }
    }

    /**
     * Get reports by category
     */
    getReportsByCategory(category) {
        const reports = this.getAllReports();
        return reports.filter(r => r.category === category);
    }

    /**
     * Get reports by status
     */
    getReportsByStatus(status) {
        const reports = this.getAllReports();
        return reports.filter(r => r.status === status);
    }

    /**
     * Get reports assigned to a user
     */
    getReportsAssignedTo(email) {
        const reports = this.getAllReports();
        return reports.filter(r => r.assignedTo === email);
    }

    /**
     * Get active reports assigned to a user (not closed/resolved)
     */
    getActiveReportsAssignedTo(email) {
        const reports = this.getAllReports();
        return reports.filter(r => 
            r.assignedTo === email && 
            r.status !== 'closed' && 
            r.status !== 'resolved'
        );
    }

    /**
     * Get all staff members with active assignments
     */
    getActiveStaff() {
        const reports = this.getAllReports();
        const staffSet = new Set();
        
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
    getStaffWorkloadSummary() {
        const reports = this.getAllReports();
        const staffMap = {};
        
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
        
        return staffMap;
    }

    /**
     * Get recent reports (last N)
     */
    getRecentReports(limit = 5) {
        const reports = this.getAllReports();
        return reports.slice(0, limit);
    }

    /**
     * Update report status
     */
    updateReportStatus(ticketId, status) {
        let reports = this.getAllReports();
        reports = reports.map(r => {
            if (r.id === ticketId) {
                return { ...r, status: status };
            }
            return r;
        });
        this.createBackup(); // Create backup before saving
        localStorage.setItem(this.storageKey, JSON.stringify(reports));
    }

    /**
     * Assign report to staff
     */
    assignReportToStaff(ticketId, staffEmail) {
        let reports = this.getAllReports();
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
        localStorage.setItem(this.storageKey, JSON.stringify(reports));
    }

    /**
     * Staff starts working on task
     */
    startWorkOnTask(ticketId, staffEmail) {
        let reports = this.getAllReports();
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
        localStorage.setItem(this.storageKey, JSON.stringify(reports));
    }

    /**
     * Staff submits resolution
     */
    submitResolution(ticketId, staffEmail, resolutionNotes) {
        let reports = this.getAllReports();
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
        localStorage.setItem(this.storageKey, JSON.stringify(reports));
    }

    /**
     * Admin verifies staff's work quality FIRST
     */
    verifyStaffWork(ticketId, adminEmail, verificationNotes = '') {
        let reports = this.getAllReports();
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
        localStorage.setItem(this.storageKey, JSON.stringify(reports));
    }

    /**
     * Admin approves resolution (FINAL STEP after work verification)
     */
    approveResolution(ticketId, adminEmail) {
        let reports = this.getAllReports();
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
        localStorage.setItem(this.storageKey, JSON.stringify(reports));
    }

    /**
     * Admin rejects resolution (returns to staff)
     */
    rejectResolution(ticketId, adminEmail, rejectionReason) {
        let reports = this.getAllReports();
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
        localStorage.setItem(this.storageKey, JSON.stringify(reports));
    }

    /**
     * Get stats by category
     */
    getStatsByCategory() {
        const reports = this.getAllReports();
        const stats = {};
        
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
    getStatusSummary() {
        const reports = this.getAllReports();
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
    getHighPriorityReports() {
        const reports = this.getAllReports();
        return reports.filter(r => r.priority === 'high' && r.status !== 'resolved' && r.status !== 'closed');
    }

    /**
     * Get urgent issues count (active reports with high priority)
     */
    getUrgentIssuesCount() {
        const reports = this.getAllReports();
        return reports.filter(r => r.priority === 'high' && r.status !== 'resolved' && r.status !== 'closed').length;
    }

    /**
     * Create automatic backup of reports
     */
    createBackup() {
        try {
            const reports = this.getAllReports();
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
    restoreFromBackup() {
        try {
            const backup = localStorage.getItem(this.storageKey + '_backup');
            if (backup) {
                const backupData = JSON.parse(backup);
                localStorage.setItem(this.storageKey, JSON.stringify(backupData.data));
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
    validateData() {
        try {
            const reports = this.getAllReports();
            if (Array.isArray(reports) && reports.length > 0) {
                return true;
            }
            // Try to restore backup if main data is empty
            if (this.restoreFromBackup()) {
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
    exportAllData() {
        try {
            const reports = this.getAllReports();
            return JSON.stringify(reports, null, 2);
        } catch (error) {
            console.error('Export failed:', error);
            return '';
        }
    }

    /**
     * Import data from JSON
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (Array.isArray(data)) {
                this.createBackup(); // Backup before import
                localStorage.setItem(this.storageKey, JSON.stringify(data));
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
    searchReports(query) {
        if (!query || query.trim().length === 0) return this.getAllReports();
        
        const searchTerm = query.toLowerCase();
        const reports = this.getAllReports();
        
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
    filterReports(filters) {
        let reports = this.getAllReports();
        
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
    searchAndFilter(query, filters) {
        let results = this.getAllReports();
        
        if (query && query.trim().length > 0) {
            results = this.searchReports(query);
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
    addComment(ticketId, comment, author) {
        let reports = this.getAllReports();
        reports = reports.map(r => {
            if (r.id === ticketId) {
                if (!r.comments) r.comments = [];
                r.comments.push({
                    id: Date.now(),
                    text: comment,
                    author: author,
                    timestamp: new Date().toISOString(),
                    isInternal: false
                });
            }
            return r;
        });
        this.createBackup();
        localStorage.setItem(this.storageKey, JSON.stringify(reports));
    }

    /**
     * FEATURE 2: Add internal note (admin only)
     */
    addInternalNote(ticketId, note, author) {
        let reports = this.getAllReports();
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
        this.createBackup();
        localStorage.setItem(this.storageKey, JSON.stringify(reports));
    }

    /**
     * FEATURE 2: Get comments for a report
     */
    getComments(ticketId) {
        const report = this.getAllReports().find(r => r.id === ticketId);
        return report && report.comments ? report.comments : [];
    }

    /**
     * FEATURE 3: Add rating and feedback to a report
     */
    addRating(ticketId, rating, feedback, author) {
        if (rating < 1 || rating > 5) {
            console.error('Rating must be between 1 and 5');
            return false;
        }
        
        let reports = this.getAllReports();
        reports = reports.map(r => {
            if (r.id === ticketId) {
                r.rating = {
                    score: rating,
                    feedback: feedback,
                    author: author,
                    timestamp: new Date().toISOString()
                };
            }
            return r;
        });
        this.createBackup();
        localStorage.setItem(this.storageKey, JSON.stringify(reports));
        return true;
    }

    /**
     * FEATURE 3: Get average rating for a report
     */
    getReport(ticketId) {
        return this.getAllReports().find(r => r.id === ticketId);
    }

    /**
     * FEATURE 3: Get satisfaction metrics
     */
    getSatisfactionMetrics() {
        const reports = this.getAllReports();
        const ratedReports = reports.filter(r => r.rating);
        
        if (ratedReports.length === 0) {
            return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
        }
        
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;
        
        ratedReports.forEach(r => {
            sum += r.rating.score;
            distribution[r.rating.score]++;
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
    addNotification(userId, message, type, relatedTicketId = null) {
        try {
            const notifications = this.getAllNotifications();
            const notification = {
                id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                userId: userId,
                message: message,
                type: type, // 'new_report', 'status_update', 'assignment', 'approval_needed', 'resolved', 'rejected'
                relatedTicketId: relatedTicketId,
                timestamp: new Date().toISOString(),
                read: false
            };
            
            notifications.push(notification);
            localStorage.setItem('citizenNotifications', JSON.stringify(notifications));
            return notification;
        } catch (error) {
            console.error('Error adding notification:', error);
            return null;
        }
    }

    /**
     * Get all notifications for a user
     */
    getAllNotifications(userId = null) {
        try {
            const notifications = localStorage.getItem('citizenNotifications');
            const allNotifications = notifications ? JSON.parse(notifications) : [];
            
            if (userId) {
                return allNotifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            }
            return allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            console.error('Error reading notifications:', error);
            return [];
        }
    }

    /**
     * Get unread notifications count for a user
     */
    getUnreadNotificationsCount(userId) {
        const notifications = this.getAllNotifications(userId);
        return notifications.filter(n => !n.read).length;
    }

    /**
     * Mark notification as read
     */
    dismissNotification(notificationId) {
        try {
            const notifications = this.getAllNotifications();
            const notification = notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
                localStorage.setItem('citizenNotifications', JSON.stringify(notifications));
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
    dismissAllNotifications(userId) {
        try {
            const notifications = this.getAllNotifications();
            notifications.forEach(n => {
                if (n.userId === userId) n.read = true;
            });
            localStorage.setItem('citizenNotifications', JSON.stringify(notifications));
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
    detectDuplicates(newReport) {
        const allReports = this.getAllReports();
        const similarReports = [];
        
        // Only check against reports from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        allReports.forEach(report => {
            if (report.id === newReport.id) return; // Skip self
            
            try {
                const reportDate = new Date(report.timestamp || report.createdDate);
                if (reportDate < thirtyDaysAgo) return; // Skip old reports
            } catch (e) {
                return;
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
                    id: report.id,
                    title: report.title,
                    location: report.location,
                    status: report.status,
                    similarity: similarityScore,
                    createdDate: report.createdDate
                });
            }
        });
        
        return similarReports.sort((a, b) => b.similarity - a.similarity);
    }

    /**
     * Helper: Check if locations are similar
     */
    isLocationSimilar(location1, location2) {
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
    hasKeywordMatch(report1, report2) {
        const text1 = (report1.title + ' ' + report1.description).toLowerCase();
        const text2 = (report2.title + ' ' + report2.description).toLowerCase();
        
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
    linkDuplicates(primaryReportId, duplicateReportIds) {
        try {
            const reports = this.getAllReports();
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
                if (!primaryReport.duplicateGroup.duplicates.includes(dupId)) {
                    primaryReport.duplicateGroup.duplicates.push(dupId);
                    
                    // Mark duplicate report
                    const dupReport = reports.find(r => r.id === dupId);
                    if (dupReport) {
                        dupReport.isDuplicate = true;
                        dupReport.duplicateOf = primaryReportId;
                    }
                }
            });
            
            localStorage.setItem(this.storageKey, JSON.stringify(reports));
            this.backupToFile();
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
    getAutoAssignee(category, priority = 'medium') {
        try {
            const activeStaff = this.getActiveStaff();
            if (activeStaff.length === 0) return 'admin@example.com'; // Fallback to admin
            
            // Get workload for each staff member
            const staffWorkloads = [];
            
            activeStaff.forEach(staffEmail => {
                const assignedReports = this.getActiveReportsAssignedTo(staffEmail);
                
                // Count by priority
                const highPriorityCount = assignedReports.filter(r => r.priority === 'high').length;
                const totalCount = assignedReports.length;
                
                // Calculate workload score (lower is better)
                // High priority tasks count double
                const workloadScore = totalCount + (highPriorityCount * 0.5);
                
                // Get specialization (most frequent category for this staff)
                const categoryCount = {};
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
            });
            
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
    autoAssignReport(ticketId) {
        try {
            const report = this.getReport(ticketId);
            if (!report) return false;
            
            // Determine best assignee
            const assignee = this.getAutoAssignee(report.category, report.priority);
            
            // Assign report
            const reports = this.getAllReports();
            const reportToUpdate = reports.find(r => r.id === ticketId);
            
            if (reportToUpdate) {
                reportToUpdate.assignedTo = assignee;
                reportToUpdate.status = 'assigned';
                reportToUpdate.assignedDate = new Date().toISOString().split('T')[0];
                reportToUpdate.assignedTime = new Date().toLocaleTimeString();
                
                localStorage.setItem(this.storageKey, JSON.stringify(reports));
                this.backupToFile();
                
                // Create notifications
                // Notify staff member
                this.addNotification(
                    assignee,
                    `📋 New task assigned: ${report.title} (High priority: ${report.priority === 'high' ? 'YES' : 'NO'})`,
                    'assignment',
                    ticketId
                );
                
                // Notify citizen
                this.addNotification(
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
    getCategoryStaffingGaps() {
        try {
            const reports = this.getAllReports();
            const staffMap = {};
            const categoryReportCount = {};
            
            reports.forEach(r => {
                if (r.status !== 'closed' && r.status !== 'resolved') {
                    categoryReportCount[r.category] = (categoryReportCount[r.category] || 0) + 1;
                    
                    if (r.assignedTo) {
                        if (!staffMap[r.category]) staffMap[r.category] = new Set();
                        staffMap[r.category].add(r.assignedTo);
                    }
                }
            });
            
            const gaps = [];
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
            
            return gaps.sort((a, b) => b.ratio - a.ratio);
        } catch (error) {
            console.error('Error getting staffing gaps:', error);
            return [];
        }
    }

    // ===== PHASE 3: ANALYTICS & PERFORMANCE =====

    /**
     * Get resolution metrics (resolution time, completion rate, etc)
     */
    getResolutionMetrics() {
        try {
            const reports = this.getAllReports();
            const metrics = {
                totalReports: reports.length,
                resolvedReports: 0,
                avgResolutionTime: 0,
                resolutionsByCategory: {},
                trendsLastWeek: [],
                completionRate: 0
            };

            let totalResolutionTime = 0;
            const resolvedByDate = {};
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            reports.forEach(r => {
                if (r.status === 'resolved' || r.status === 'closed') {
                    metrics.resolvedReports++;

                    // Calculate resolution time
                    if (r.createdDate && r.resolvedDate) {
                        const created = new Date(r.createdDate);
                        const resolved = new Date(r.resolvedDate);
                        const daysToResolve = Math.ceil((resolved - created) / (1000 * 60 * 60 * 24));
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
                ? (totalResolutionTime / metrics.resolvedReports).toFixed(1)
                : 0;

            metrics.completionRate = metrics.totalReports > 0
                ? ((metrics.resolvedReports / metrics.totalReports) * 100).toFixed(1)
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
    getStaffProductivity() {
        try {
            const reports = this.getAllReports();
            const staffMetrics = {};

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
                    ? ((staff.resolved / staff.totalAssigned) * 100).toFixed(1)
                    : 0;

                staff.satisfactionRating = staff.ratingCount > 0
                    ? (staff.satisfactionRating / staff.ratingCount).toFixed(1)
                    : 0;

                // Productivity score: 50% completion + 50% satisfaction
                const completionScore = (staff.completionRate / 100) * 50;
                const satisfactionScore = (staff.satisfactionRating / 5) * 50;
                staff.productivityScore = (completionScore + satisfactionScore).toFixed(1);
            });

            return Object.values(staffMetrics).sort((a, b) => b.productivityScore - a.productivityScore);
        } catch (error) {
            console.error('Error getting staff productivity:', error);
            return [];
        }
    }

    /**
     * Get high-performing staff in a category (for advanced routing)
     */
    getHighPerformersInCategory(category, limit = 3) {
        try {
            const productivity = this.getStaffProductivity();
            const categoryStats = {};

            this.getAllReports().forEach(r => {
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
    getAdvancedAutoAssignee(category, priority = 'medium') {
        try {
            const highPerformers = this.getHighPerformersInCategory(category, 5);
            const activeStaff = this.getActiveStaff();

            if (highPerformers.length > 0) {
                // Try to assign to high performer first
                for (let performer of highPerformers) {
                    const activeReports = this.getActiveReportsAssignedTo(performer.email);
                    const workloadScore = activeReports.length + 
                        (activeReports.filter(r => r.priority === 'high').length * 0.5);
                    
                    if (workloadScore < 5) { // Only if not overloaded
                        return performer.email;
                    }
                }
            }

            // Fallback to regular load balancing
            return this.getAutoAssignee(category, priority);
        } catch (error) {
            console.error('Error in advanced auto-assign:', error);
            return this.getAutoAssignee(category, priority);
        }
    }

    // ===== PHASE 3: SLA MANAGEMENT =====

    /**
     * Set SLA for report based on priority
     */
    setSLA(reportId, priority = 'medium') {
        try {
            const reports = this.getAllReports();
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

            localStorage.setItem(this.storageKey, JSON.stringify(reports));
            return true;
        } catch (error) {
            console.error('Error setting SLA:', error);
            return false;
        }
    }

    /**
     * Get SLA status for all reports
     */
    getSLAMetrics() {
        try {
            const reports = this.getAllReports();
            const metrics = {
                totalWithSLA: 0,
                onTrack: 0,
                warning: 0,
                breached: 0,
                upcoming: []
            };

            const now = new Date();

            reports.forEach(r => {
                if (r.sla && r.sla.status === 'active' && r.status !== 'resolved' && r.status !== 'closed') {
                    metrics.totalWithSLA++;
                    const dueDate = new Date(r.sla.dueDate);
                    const hoursRemaining = (dueDate - now) / (1000 * 60 * 60);

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
    getOverdueSLAReports() {
        try {
            const reports = this.getAllReports();
            const overdue = [];
            const now = new Date();

            reports.forEach(r => {
                if (r.sla && r.sla.status === 'active' && r.status !== 'resolved' && r.status !== 'closed') {
                    const dueDate = new Date(r.sla.dueDate);
                    if (now > dueDate) {
                        overdue.push({
                            ...r,
                            overdueHours: Math.ceil((now - dueDate) / (1000 * 60 * 60))
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
     */
    exportAsCSV(filters = {}) {
        try {
            let reports = this.getAllReports();

            // Apply filters
            if (filters.category) reports = reports.filter(r => r.category === filters.category);
            if (filters.status) reports = reports.filter(r => r.status === filters.status);
            if (filters.dateFrom) reports = reports.filter(r => new Date(r.timestamp) >= new Date(filters.dateFrom));
            if (filters.dateTo) reports = reports.filter(r => new Date(r.timestamp) <= new Date(filters.dateTo));

            const headers = ['ID', 'Date', 'Category', 'Title', 'Location', 'Status', 'Priority', 'Assigned To', 'Satisfaction'];
            const rows = [];

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
                    r.satisfactionRating || 'N/A'
                ]);
            });

            const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
            return csv;
        } catch (error) {
            console.error('Error exporting CSV:', error);
            return null;
        }
    }

    /**
     * Download CSV file
     */
    downloadCSV(filename = 'reports.csv', filters = {}) {
        const csv = this.exportAsCSV(filters);
        if (!csv) return false;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'reports_' + new Date().toISOString().split('T')[0] + '.csv';
        link.click();
        window.URL.revokeObjectURL(url);
        return true;
    }

    /**
     * Get system overview dashboard data
     */
    getSystemOverview() {
        try {
            const reports = this.getAllReports();
            const resMetrics = this.getResolutionMetrics();
            const slaMetrics = this.getSLAMetrics();
            const staffWorkload = this.getStaffWorkloadSummary();

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
                categories: Object.keys(this.getReportsByCategory('park').length > 0 ? 
                    reports.reduce((acc, r) => { acc[r.category] = true; return acc; }, {}) : {}),
                resolution: resMetrics,
                sla: slaMetrics,
                staff: {
                    total: staffWorkload.length,
                    avgWorkload: (staffWorkload.reduce((sum, s) => sum + s.total, 0) / staffWorkload.length).toFixed(1),
                    topPerformers: this.getStaffProductivity().slice(0, 3)
                }
            };
        } catch (error) {
            console.error('Error getting system overview:', error);
            return {};
        }
    }
}

// Create global instance
const reportsManager = new ReportsManager();

/**
 * Get category icon and name
 */
function getCategoryInfo(category) {
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
/**
 * Get status color
 */
function getStatusColor(status) {
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
function getStatusBadgeText(status) {
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
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}
