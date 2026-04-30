// Authentication & Session Management

class AuthManager {
    constructor() {
        this.sessionKey = 'userSession';
    }

    /**
     * Get current user session
     */
    getSession() {
        try {
            const session = localStorage.getItem(this.sessionKey);
            return session ? JSON.parse(session) : null;
        } catch (error) {
            console.error('Error reading session:', error);
            return null;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const session = this.getSession();
        return session && session.authenticated === true;
    }

    /**
     * Get user role
     */
    getUserRole() {
        const session = this.getSession();
        return session ? session.role : null;
    }

    /**
     * Get user name
     */
    getUserName() {
        const session = this.getSession();
        return session ? session.name : 'Guest';
    }

    /**
     * Get complete current user object
     */
    getCurrentUser() {
        return this.getSession();
    }

    /**
     * Get user email
     */
    getUserEmail() {
        const session = this.getSession();
        return session ? session.email : null;
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        return this.getUserRole() === role;
    }

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(roles) {
        return roles.includes(this.getUserRole());
    }

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem(this.sessionKey);
        window.location.href = 'login.html';
    }

    /**
     * Require authentication
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    /**
     * Require specific role
     */
    requireRole(requiredRole) {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }

        if (!this.hasRole(requiredRole)) {
            alert(`Access Denied: This page requires ${requiredRole} role.`);
            window.location.href = 'index.html';
            return false;
        }

        return true;
    }

    /**
     * Require any of the specified roles
     */
    requireAnyRole(roles) {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }

        if (!this.hasAnyRole(roles)) {
            alert(`Access Denied: You don't have permission to access this page.`);
            window.location.href = 'index.html';
            return false;
        }

        return true;
    }

    /**
     * Block access for specific roles
     */
    blockRole(blockedRole) {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }

        if (this.hasRole(blockedRole)) {
            alert(`Access Denied: This page is not available for ${blockedRole} users.`);
            window.location.href = 'index.html';
            return false;
        }

        return true;
    }

    /**
     * Update session info (e.g., update user name)
     */
    updateSession(updates) {
        const session = this.getSession();
        if (session) {
            const updatedSession = { ...session, ...updates };
            localStorage.setItem(this.sessionKey, JSON.stringify(updatedSession));
            return updatedSession;
        }
        return null;
    }

    /**
     * Get time since login
     */
    getTimeSinceLogin() {
        const session = this.getSession();
        if (!session || !session.loginTime) return null;
        
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const diff = now - loginTime;
        
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
}

// Create global instance
const auth = new AuthManager();

/**
 * Add logout button to page
 */
function addLogoutButton() {
    const logoutBtn = document.querySelector('[data-logout]') || document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                auth.logout();
            }
        });
    }
}

/**
 * Display user info in header
 */
function displayUserInfo() {
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    const userEmailEl = document.getElementById('userEmail');

    if (userNameEl) {
        userNameEl.textContent = auth.getUserName();
    }
    if (userRoleEl) {
        userRoleEl.textContent = auth.getUserRole().toUpperCase();
    }
    if (userEmailEl) {
        userEmailEl.textContent = auth.getUserEmail();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (window.location.pathname.includes('login.html')) {
        // On login page, no need to check
        return;
    }

    // Require authentication for non-login pages
    auth.requireAuth();

    // Initialize user info display
    displayUserInfo();

    // Setup logout buttons
    addLogoutButton();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager, auth };
}
