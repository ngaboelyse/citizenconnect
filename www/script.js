// CitizenConnect - Interactive Functionality

document.addEventListener('DOMContentLoaded', async function() {
    // Load all data from server first
    if (typeof reportsManager !== 'undefined') {
        await reportsManager.init();
    }

    // Initialize event listeners
    initializeNavigation();
    initializeButtons();
    initializeNotifications();
    initializeAuthMenu();
    populateUserName();
    loadUserReports();
    hideReportSectionForNonCitizens();
    updateNotificationBadge();
});

// Hide Report Issue section for admin/staff
function hideReportSectionForNonCitizens() {
    if (typeof auth !== 'undefined' && auth.isAuthenticated()) {
        const userRole = auth.getUserRole();
        // Hide "Report an Issue" for admin and staff - only citizens can report
        if (userRole === 'admin' || userRole === 'staff') {
            const reportSection = document.getElementById('reportIssueSection');
            if (reportSection) {
                reportSection.style.display = 'none';
            }
        }
    }
}

// Auth Menu
function initializeAuthMenu() {
    const avatar = document.querySelector('.avatar[data-toggle="auth-menu"]');
    const authMenu = document.getElementById('authMenu');

    if (avatar && authMenu) {
        avatar.addEventListener('click', function() {
            authMenu.style.display = authMenu.style.display === 'none' ? 'block' : 'none';
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (e.target !== avatar && !authMenu.contains(e.target)) {
                authMenu.style.display = 'none';
            }
        });
    }
}

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get the text of clicked item
            const sectionName = this.querySelector('span').textContent;
            console.log(`Navigating to: ${sectionName}`);
            
            // Handle navigation based on section
            switch(sectionName.trim()) {
                case 'Home':
                    handleHome();
                    break;
                case 'Report':
                    handleReport();
                    break;
                case 'History':
                    handleHistory();
                    break;
                case 'Profile':
                    handleProfile();
                    break;
            }
        });
    });
}

// Navigation handlers
function handleHome() {
    console.log('Going to Home page');
    alert('📍 Home - All your reports and updates at a glance');
}

function handleReport() {
    console.log('Opening Report');
    // Open full report form page
    window.location.href = 'report-form.html';
}

function handleHistory() {
    console.log('Showing History');
    showHistoryModal();
}

function handleProfile() {
    console.log('Opening Profile');
    showProfileModal();
}

// History Link Handler
function handleViewHistory(event) {
    event.preventDefault();
    console.log('View History clicked');
    showHistoryModal();
}

// Map Button Handler
function handleMapClick() {
    console.log('Opening interactive map...');
    alert('🗺️ Interactive Map\n\nThis feature will open an interactive map where you can:\n• View all reported issues on the map\n• Filter by category\n• Track resolution progress\n\nComing soon!');
}

// Populate username in hero section
function populateUserName() {
    if (typeof auth !== 'undefined' && auth.isAuthenticated()) {
        const cleanEmail = auth.getCurrentUser().email;
        const userName = cleanEmail.split('@')[0].charAt(0).toUpperCase() + cleanEmail.split('@')[0].slice(1);
        const heroUserNameEl = document.getElementById('heroUserName');
        if (heroUserNameEl) heroUserNameEl.textContent = userName;
        // Populate desktop header email
        const desktopEmail = document.getElementById('desktopUserEmail');
        if (desktopEmail) desktopEmail.textContent = cleanEmail;
    }
}

// Load and display user reports in Recent Activity
function loadUserReports() {
    if (typeof reportsManager === 'undefined') return;
    
    const userEmail = auth.isAuthenticated() ? auth.getCurrentUser().email : null;
    if (!userEmail) return;
    
    // Get user's reports
    const allReports = reportsManager.getAllReports();
    const userReports = allReports.filter(r => r.submittedBy === userEmail);
    
    if (userReports.length === 0) {
        // Show placeholder
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            activityList.innerHTML = '<div style="text-align: center; color: #6B7280; padding: 20px;"><i class="fa-solid fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>No reports yet. Submit your first issue!</div>';
        }
        return;
    }
    
    // Display recent reports
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    activityList.innerHTML = userReports.slice(0, 3).map(report => {
        const categoryInfo = getCategoryInfo(report.category);
        const statusColor = getStatusColor(report.status);
        const timeAgo = getTimeAgo(report.timestamp);
        const commentsCount = report.comments ? report.comments.length : 0;
        const hasRating = report.rating ? true : false;
        
        const statusBadgeMap = {
            submitted: 'badge-blue',
            assigned: 'badge-orange',
            in_progress: 'badge-blue',
            pending_approval: 'badge-orange',
            resolved: 'badge-green',
            closed: 'badge-gray'
        };
        
        let statusDisplay = getStatusBadgeText(report.status);
        let verificationInfo = '';
        
        if (report.status === 'resolved') {
            statusDisplay = '✅ RESOLVED - Verified & Approved';
            if (report.approvedBy && report.approvedDate) {
                const approverName = report.approvedBy.split('@')[0];
                verificationInfo = `<div style="margin-top: 8px; padding: 8px; background: #D7F6E7; border-left: 3px solid #10B981; border-radius: 4px; font-size: 0.75rem; color: #158F49;">
                    <strong>✓ Admin Verified:</strong> Approved by ${approverName} on ${report.approvedDate}
                </div>`;
            }
        } else if (report.status === 'pending_approval') {
            statusDisplay = '⏳ PENDING ADMIN APPROVAL - Staff completed, awaiting verification';
        }

        const commentsButton = commentsCount > 0 ? `<button onclick="viewCommentsModal('${report.id}'); event.stopPropagation();" style="display: inline-block; margin-top: 8px; margin-right: 8px; padding: 6px 12px; background: #10B981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem;">💬 ${commentsCount}</button>` : '';

        const ratingButton = hasRating ? `<button onclick="viewCitizenFeedback('${report.id}'); event.stopPropagation();" style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: #EC4899; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem;">⭐ ${report.rating.score}/5</button>` : '';
        
        return `
            <div class="activity-card" onclick="handleReportClick('${report.id}')">
                <div class="activity-icon-container" style="background-color: ${categoryInfo.color}22;">
                    <span style="font-size: 1.2rem;">${categoryInfo.icon}</span>
                </div>
                <div class="activity-details">
                    <h4>
                        ${report.title}
                        <span class="id-tag">#${report.id}</span>
                    </h4>
                    <div class="location" style="color: #6B7280; margin: 6px 0;">
                        <i class="fa-solid fa-location-dot"></i> ${report.location}
                    </div>
                    <div class="status-row">
                        <span style="font-size: 0.8rem; color: #6B7280;">${timeAgo}</span>
                        <span class="status-badge" style="background-color: ${statusColor}22; color: ${statusColor}; font-weight: 600;">
                            <span class="dot" style="background-color: ${statusColor};"></span>
                            ${statusDisplay}
                        </span>
                    </div>
                    ${verificationInfo}
                    <div style="margin-top: 8px;">
                        ${commentsButton}
                        ${ratingButton}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function handleReportClick(ticketId) {
    const report = reportsManager.getAllReports().find(r => r.id === ticketId);
    if (report) {
        const categoryInfo = getCategoryInfo(report.category);
        alert(`Report Details\n\n` +
            `Ticket: #${report.id}\n` +
            `Category: ${categoryInfo.name}\n` +
            `Title: ${report.title}\n` +
            `Location: ${report.location}\n` +
            `Status: ${getStatusBadgeText(report.status)}\n` +
            `Submitted: ${report.createdDate}\n\n` +
            `Description:\n${report.description}`);
    }
}

// Logout handler
function handleLogout() {
    console.log('User logging out...');
    
    // Use auth system if available
    if (typeof auth !== 'undefined') {
        auth.logout();
    } else {
        // Fallback: Clear any user data from localStorage
        localStorage.removeItem('userSession');
        localStorage.removeItem('authToken');
    }
    
    // Close any open modals
    const modals = document.querySelectorAll('[style*="position: fixed"][style*="z-index"]');
    modals.forEach(modal => modal.remove());
    
    // Show logout confirmation
    alert('👋 You have been signed out successfully!\n\nThank you for using CitizenConnect.');
    
    // Reset active nav to home
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(nav => nav.classList.remove('active'));
    if (navItems.length > 0) {
        navItems[0].classList.add('active');
    }
    
    // Redirect to login after a short delay
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 300);
}

// Report Button
function initializeButtons() {
    const reportBtn = document.querySelector('.report-btn');
    
    if (reportBtn) {
        // Report button is now a link, so no need to attach click handler
        // It will navigate via href
    }
    
    // Activity card clicks
    const activityCards = document.querySelectorAll('.activity-card');
    activityCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h4').textContent;
            console.log(`Opened: ${title}`);
            // Future: Open detail view
        });
    });
    
    // Interactive map button
    const mapBtn = document.querySelector('.interactive-map-btn');
    if (mapBtn) {
        mapBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Opening interactive map...');
            // Future: Open map modal or navigate to map page
        });
    }
    
    // User avatar click
    const avatar = document.querySelector('.avatar');
    if (avatar) {
        avatar.addEventListener('click', function() {
            console.log('Opening user profile...');
            showProfileModal();
        });
    }
    
    // Notification icon
    const notificationIcon = document.querySelector('.notification-icon');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', function() {
            showNotificationsPanel();
        });
    }
}

// Notifications
function initializeNotifications() {
    // Example: Check for new notifications periodically
    // This is a placeholder for future notification system
    console.log('Notifications initialized');
}

// Modal for report issue
function openReportModal() {
    const modal = createModal(
        'Report an Issue',
        `
            <form id="reportForm">
                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Issue Category</label>
                    <select style="width: 100%; padding: 10px; border: 1px solid #E5E7EB; border-radius: 8px; font-family: Inter;">
                        <option>Water & Plumbing</option>
                        <option>Street Light</option>
                        <option>Waste Management</option>
                        <option>Road Damage</option>
                        <option>Other</option>
                    </select>
                </div>
                
                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Description</label>
                    <textarea placeholder="Describe the issue..." style="width: 100%; padding: 10px; border: 1px solid #E5E7EB; border-radius: 8px; font-family: Inter; min-height: 100px;"></textarea>
                </div>
                
                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Location</label>
                    <input type="text" placeholder="Enter location..." style="width: 100%; padding: 10px; border: 1px solid #E5E7EB; border-radius: 8px; font-family: Inter;">
                </div>
                
                <button type="submit" style="width: 100%; padding: 12px; background-color: #023469; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer;">Submit Report</button>
            </form>
        `
    );
    
    const form = modal.querySelector('#reportForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you! Your issue has been reported. Ticket #' + Math.floor(Math.random() * 9000 + 1000));
            modal.remove();
        });
    }
}

// Create modal helper
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 24px;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #6B7280;
    `;
    closeBtn.addEventListener('click', () => modal.remove());
    
    const titleEl = document.createElement('h2');
    titleEl.textContent = title;
    titleEl.style.cssText = 'margin: 0 0 16px 0; font-size: 1.5rem; color: #1C1F23;';
    
    const contentEl = document.createElement('div');
    contentEl.innerHTML = content;
    
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(titleEl);
    modalContent.appendChild(contentEl);
    modal.appendChild(modalContent);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    document.body.appendChild(modal);
    return modalContent;
}

// History Modal
function showHistoryModal() {
    const historyContent = `
        <div style="margin-top: 16px;">
            <div style="padding: 12px; border-left: 4px solid #195EC9; background: #E3EDFB; margin: 12px 0; border-radius: 4px;">
                <div style="font-weight: 600; color: #023469;">Broken Water Pipe</div>
                <div style="font-size: 0.9rem; color: #6B7280; margin-top: 4px;">#CR-4029 • 2 hours ago</div>
                <div style="font-size: 0.9rem; color: #023469; margin-top: 4px; font-weight: 500;">Status: <span style="color: #195EC9;">In Progress</span></div>
            </div>
            
            <div style="padding: 12px; border-left: 4px solid #4B5563; background: #F3F4F6; margin: 12px 0; border-radius: 4px;">
                <div style="font-weight: 600; color: #1C1F23;">Street Light Out</div>
                <div style="font-size: 0.9rem; color: #6B7280; margin-top: 4px;">#CR-3988 • Yesterday</div>
                <div style="font-size: 0.9rem; color: #023469; margin-top: 4px; font-weight: 500;">Status: <span style="color: #4B5563;">Pending</span></div>
            </div>
            
            <div style="padding: 12px; border-left: 4px solid #158F49; background: #D7F6E7; margin: 12px 0; border-radius: 4px;">
                <div style="font-weight: 600; color: #1C1F23;">Missed Trash Collection</div>
                <div style="font-size: 0.9rem; color: #6B7280; margin-top: 4px;">#CR-3850 • 3 days ago</div>
                <div style="font-size: 0.9rem; color: #023469; margin-top: 4px; font-weight: 500;">Status: <span style="color: #158F49;">Resolved ✓</span></div>
            </div>
        </div>
    `;
    createModal('📋 Report History', historyContent);
}

// Profile Modal
function showProfileModal() {
    // Get user data from auth system if available
    let userName = 'User';
    let userEmail = 'user@example.com';
    let userRole = 'citizen';
    
    if (typeof auth !== 'undefined' && auth.isAuthenticated()) {
        const user = auth.getCurrentUser();
        userEmail = user.email;
        userRole = auth.getUserRole() || 'citizen';
        userName = userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1);
    }
    
    let roleDisplay = userRole.charAt(0).toUpperCase() + userRole.slice(1);
    let dashboardButton = '';
    
    // Show dashboard button for admin/staff
    if (userRole === 'admin' || userRole === 'staff') {
        const dashboardUrl = userRole === 'admin' ? 'admin-dashboard.html' : 'staff-dashboard.html';
        const dashboardLabel = userRole === 'admin' ? '🔒 Admin Dashboard' : '👷 Staff Dashboard';
        dashboardButton = `
            <button onclick="window.location.href='${dashboardUrl}'" style="width: 100%; padding: 12px; background: #023469; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-bottom: 12px;">
                ${dashboardLabel}
            </button>
        `;
    }
    
    const profileContent = `
        <div style="text-align: center; margin-top: 16px;">
            <div style="width: 60px; height: 60px; background: #E3EDFB; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 2rem;">
                👤
            </div>
            
            <div style="text-align: left; margin-top: 24px;">
                <div style="margin: 16px 0;">
                    <label style="display: block; font-weight: 600; color: #6B7280; font-size: 0.9rem; margin-bottom: 4px;">Name</label>
                    <div style="padding: 12px; background: #F8F9FB; border-radius: 8px; color: #1C1F23;">${userName}</div>
                </div>
                
                <div style="margin: 16px 0;">
                    <label style="display: block; font-weight: 600; color: #6B7280; font-size: 0.9rem; margin-bottom: 4px;">Email</label>
                    <div style="padding: 12px; background: #F8F9FB; border-radius: 8px; color: #1C1F23;">${userEmail}</div>
                </div>

                <div style="margin: 16px 0;">
                    <label style="display: block; font-weight: 600; color: #6B7280; font-size: 0.9rem; margin-bottom: 4px;">Role</label>
                    <div style="padding: 12px; background: #F8F9FB; border-radius: 8px; color: #1C1F23;">${roleDisplay}</div>
                </div>
                
                <div style="margin: 16px 0;">
                    <label style="display: block; font-weight: 600; color: #6B7280; font-size: 0.9rem; margin-bottom: 4px;">Reports Submitted</label>
                    <div style="padding: 12px; background: #F8F9FB; border-radius: 8px; color: #1C1F23;">3 total • 1 active • 2 resolved</div>
                </div>
                
                ${dashboardButton}
                <button id="logoutBtn" style="width: 100%; padding: 12px; background: #EF4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Sign Out</button>
            </div>
        </div>
    `;
    const modalEl = createModal('👤 My Profile', profileContent);
    
    // Add logout functionality
    setTimeout(() => {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }, 100);
}

// Utility: Log page state
function logPageState() {
    const activeNav = document.querySelector('.nav-item.active span').textContent;
    console.log(`Current page: ${activeNav}`);
}

// Add visual feedback to buttons
function addButtonFeedback() {
    const buttons = document.querySelectorAll('button, [role="button"], .nav-item');
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        btn.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Initialize visual feedback
document.addEventListener('DOMContentLoaded', addButtonFeedback);

// PHASE 1: Comments & Ratings Functions

// Helper Functions
function getCategoryInfo(category) {
    const categoryMap = {
        'water': { icon: '💧', name: 'Water & Plumbing', color: '#3B82F6' },
        'road': { icon: '🛣️', name: 'Road & Transport', color: '#8B5CF6' },
        'light': { icon: '💡', name: 'Street Lighting', color: '#F59E0B' },
        'waste': { icon: '♻️', name: 'Waste Management', color: '#10B981' },
        'park': { icon: '🌳', name: 'Parks & Green', color: '#06B6D4' },
        'other': { icon: '📝', name: 'Other', color: '#6B7280' }
    };
    return categoryMap[category] || { icon: '📋', name: 'Unknown', color: '#6B7280' };
}

function getStatusColor(status) {
    const colorMap = {
        'submitted': '#3B82F6',
        'assigned': '#8B5CF6',
        'in_progress': '#8B5CF6',
        'pending_approval': '#EC4899',
        'resolved': '#10B981',
        'closed': '#6B7280'
    };
    return colorMap[status] || '#6B7280';
}

function getStatusBadgeText(status) {
    const statusMap = {
        'submitted': '📩 Submitted',
        'assigned': '📋 Assigned',
        'in_progress': '🔧 In Progress',
        'pending_approval': '⏳ Pending Approval',
        'resolved': '✅ Resolved',
        'closed': '🔒 Closed'
    };
    return statusMap[status] || status;
}

function getTimeAgo(timestamp) {
    if (!timestamp) return 'Recently';
    
    try {
        const date = new Date(timestamp);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
        if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
        return date.toLocaleDateString();
    } catch (e) {
        return 'Recently';
    }
}

// View Comments Modal (Citizen version)
function viewCommentsModal(ticketId) {
    if (typeof reportsManager === 'undefined') {
        alert('⚠️ Error loading comments');
        return;
    }

    const report = reportsManager.getReport(ticketId);
    if (!report) return;

    const comments = reportsManager.getComments(ticketId);
    
    let commentsHTML = comments.map(comment => `
        <div style="padding: 12px; background: ${comment.isInternal ? '#FEE2E2' : '#F0FDF4'}; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid ${comment.isInternal ? '#DC2626' : '#10B981'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong style="color: ${comment.isInternal ? '#991B1B' : '#065F46'}">${comment.author}${comment.isInternal ? ' (Internal)' : ''}</strong>
                <span style="font-size: 0.75rem; color: #6B7280;">${new Date(comment.timestamp).toLocaleString()}</span>
            </div>
            <div style="color: ${comment.isInternal ? '#7F1D1D' : '#1F2937'}">${comment.text}</div>
        </div>
    `).join('');

    const commentsContent = `
        <div style="max-height: 500px; overflow-y: auto;">
            <h3 style="margin-bottom: 16px;">💬 Updates for #${ticketId}</h3>
            ${comments.length === 0 ? '<p style="color: #6B7280; text-align: center; padding: 20px;">No updates yet. Staff will post updates as they work on this issue.</p>' : commentsHTML}
        </div>
    `;
    
    createModal(`🗨️ Comments & Updates`, commentsContent);
}

// View Citizen Feedback / Rating
function viewCitizenFeedback(ticketId) {
    if (typeof reportsManager === 'undefined') {
        alert('⚠️ Error loading feedback');
        return;
    }

    const report = reportsManager.getReport(ticketId);
    if (!report || !report.rating) {
        alert('⚠️ No feedback available yet');
        return;
    }

    const stars = '⭐'.repeat(report.rating.score);
    const content = `
        <div style="text-align: center;">
            <div style="font-size: 2.5rem; margin: 20px 0;">${stars}</div>
            <div style="font-size: 1.3rem; font-weight: 700; color: #023469; margin-bottom: 16px;">${report.rating.score} out of 5</div>
            <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: left;">
                <div style="font-weight: 600; margin-bottom: 8px;">Your feedback:</div>
                <div style="color: #4B5563; line-height: 1.6;">${report.rating.feedback || 'No additional feedback'}</div>
            </div>
            <div style="font-size: 0.85rem; color: #6B7280;">
                Given on ${new Date(report.rating.timestamp).toLocaleDateString()}
            </div>
        </div>
    `;
    
    createModal('⭐ Your Rating', content);
}

// ===== PHASE 2: NOTIFICATIONS FUNCTIONS =====

/**
 * Update notification badge count
 */
function updateNotificationBadge() {
    if (typeof reportsManager === 'undefined' || !auth.isAuthenticated()) return;
    
    const userEmail = auth.getCurrentUser().email;
    const unreadCount = reportsManager.getUnreadNotificationsCount(userEmail);
    const badge = document.getElementById('notificationBadge');
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

/**
 * Show notifications panel
 */
function showNotificationsPanel() {
    if (typeof reportsManager === 'undefined' || !auth.isAuthenticated()) {
        alert('Please sign in to view notifications');
        return;
    }
    
    const userEmail = auth.getCurrentUser().email;
    const notifications = reportsManager.getAllNotifications(userEmail);
    
    let notificationsHTML = '';
    
    if (notifications.length === 0) {
        notificationsHTML = '<div style="text-align: center; color: #6B7280; padding: 30px; font-size: 0.9rem;"><i class="fa-solid fa-inbox" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>No notifications</div>';
    } else {
        notificationsHTML = notifications.slice(0, 20).map(notif => {
            const backgroundColor = notif.read ? '#F9FAFB' : '#E0E7FF';
            const typeEmoji = {
                'new_report': '📬',
                'assignment': '📋',
                'status_update': '🔄',
                'approval_needed': '⏳',
                'resolved': '✅',
                'rejected': '❌',
                'duplicate': '🔗'
            }[notif.type] || '📬';
            
            return `
                <div style="padding: 12px; background: ${backgroundColor}; border-bottom: 1px solid #E5E7EB; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#F3F4F6'" onmouseout="this.style.background='${backgroundColor}'">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="font-size: 0.95rem; color: #1F2937;">
                                ${typeEmoji} ${notif.message}
                            </div>
                            <div style="font-size: 0.75rem; color: #9CA3AF; margin-top: 6px;">
                                ${new Date(notif.timestamp).toLocaleString()}
                                ${notif.relatedTicketId ? ` • #${notif.relatedTicketId}` : ''}
                            </div>
                        </div>
                        <button onclick="dismissNotificationUI('${notif.id}'); event.stopPropagation();" style="background: none; border: none; color: #9CA3AF; cursor: pointer; font-size: 1.2rem; margin-left: 8px;">✕</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    const content = `
        <div style="max-height: 500px; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #E5E7EB;">
                <h3 style="margin: 0;">🔔 Notifications</h3>
                ${reportsManager.getAllNotifications(userEmail).some(n => !n.read) ? `
                    <button onclick="reportsManager.dismissAllNotifications('${userEmail}'); updateNotificationBadge(); showNotificationsPanel();" style="background: #023469; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Mark All Read</button>
                ` : ''}
            </div>
            ${notificationsHTML}
        </div>
    `;
    
    createModal('Notifications', content);
}

/**
 * Dismiss a notification from UI
 */
function dismissNotificationUI(notificationId) {
    if (typeof reportsManager !== 'undefined') {
        reportsManager.dismissNotification(notificationId);
        updateNotificationBadge();
        showNotificationsPanel(); // Refresh modal
    }
}

/**
 * Create notification for new report submitted
 */
function notifyNewReportSubmitted(report) {
    if (typeof reportsManager === 'undefined') return;
    
    // Notify admins
    reportsManager.addNotification(
        'admin@example.com',
        `📬 New report submitted: "${report.title}" in ${report.location}`,
        'new_report',
        report.id
    );
    
    // Notify citizen
    reportsManager.addNotification(
        report.submittedBy,
        `✓ Your report has been submitted successfully. Ticket #${report.id}`,
        'new_report',
        report.id
    );
    
    updateNotificationBadge();
}

/**
 * Create notification for status change
 */
function notifyStatusChange(report, newStatus, byUser) {
    if (typeof reportsManager === 'undefined') return;
    
    const statusMessages = {
        'assigned': '📋 Your report has been assigned to our team',
        'in_progress': '🔧 Work has started on your report',
        'pending_approval': '⏳ Work is pending admin verification',
        'resolved': '✅ Your report has been resolved!',
        'rejected': '❌ Work was not approved. Staff will resubmit.'
    };
    
    const message = statusMessages[newStatus] || `Status updated: ${newStatus}`;
    
    // Notify citizen
    reportsManager.addNotification(
        report.submittedBy,
        message + ` (Ticket #${report.id})`,
        'status_update',
        report.id
    );
    
    // Notify relevant staff if it's a status they need to know
    if (newStatus === 'pending_approval' || newStatus === 'rejected') {
        if (report.assignedTo) {
            reportsManager.addNotification(
                report.assignedTo,
                `⏳ Work on #${report.id} is ${newStatus === 'pending_approval' ? 'pending admin approval' : 'rejected and needs revision'}`,
                'status_update',
                report.id
            );
        }
    }
    
    updateNotificationBadge();
}

/**
 * Create notification for duplicate detection
 */
function notifyPotentialDuplicate(report, duplicates) {
    if (typeof reportsManager === 'undefined' || duplicates.length === 0) return;
    
    // Notify admins about duplicate
    const duplicateList = duplicates.slice(0, 3).map(d => `#${d.id}: ${d.title}`).join(', ');
    reportsManager.addNotification(
        'admin@example.com',
        `🔗 Potential duplicate detected! New report #${report.id} may be related to: ${duplicateList}`,
        'duplicate',
        report.id
    );
    
    updateNotificationBadge();
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeNavigation,
        initializeButtons,
        initializeNotifications,
        openReportModal,
        createModal,
        showHistoryModal,
        showProfileModal,
        handleHome,
        handleReport,
        handleHistory,
        handleProfile,
        handleLogout,
        viewCommentsModal,
        viewCitizenFeedback,
        getCategoryInfo,
        getStatusColor,
        getStatusBadgeText,
        getTimeAgo,
        updateNotificationBadge,
        showNotificationsPanel,
        dismissNotificationUI,
        notifyNewReportSubmitted,
        notifyStatusChange,
        notifyPotentialDuplicate
    };
}
