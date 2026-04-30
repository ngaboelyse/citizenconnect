// c:\Users\ngabo\OneDrive\Desktop\CitizenConnect-Mobile\src\utils\auth.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

// Define a type for the user session
interface UserSession {
    role: 'user' | 'staff' | 'admin';
    email: string;
    name: string;
    loginTime: string;
    authenticated: boolean;
}

class AuthManager {
    private sessionKey = 'userSession';

    /**
     * Get current user session from AsyncStorage
     */
    async getSession(): Promise<UserSession | null> {
        try {
            const session = await AsyncStorage.getItem(this.sessionKey);
            return session ? JSON.parse(session) : null;
        } catch (error) {
            console.error('Error reading session from AsyncStorage:', error);
            return null;
        }
    }

    /**
     * Set user session in AsyncStorage
     */
    async setSession(session: UserSession): Promise<void> {
        try {
            await AsyncStorage.setItem(this.sessionKey, JSON.stringify(session));
        } catch (error) {
            console.error('Error saving session to AsyncStorage:', error);
        }
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        const session = await this.getSession();
        return session && session.authenticated === true;
    }

    /**
     * Get user role
     */
    async getUserRole(): Promise<UserSession['role'] | null> {
        const session = await this.getSession();
        return session ? session.role : null;
    }

    /**
     * Get user name
     */
    async getUserName(): Promise<string> {
        const session = await this.getSession();
        return session ? session.name : 'Guest';
    }

    /**
     * Get complete current user object
     */
    async getCurrentUser(): Promise<UserSession | null> {
        return this.getSession();
    }

    /**
     * Get user email
     */
    async getUserEmail(): Promise<string | null> {
        const session = await this.getSession();
        return session ? session.email : null;
    }

    /**
     * Check if user has specific role
     */
    async hasRole(role: UserSession['role']): Promise<boolean> {
        return (await this.getUserRole()) === role;
    }

    /**
     * Check if user has any of the specified roles
     */
    async hasAnyRole(roles: UserSession['role'][]): Promise<boolean> {
        const userRole = await this.getUserRole();
        return userRole ? roles.includes(userRole) : false;
    }

    /**
     * Logout user
     * NOTE: In a React Native app, this would typically involve navigating to the login screen
     * using a navigation prop or a global navigation service.
     * For now, we'll just clear the session.
     */
    async logout(): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.sessionKey);
            // TODO: Implement navigation to LoginScreen here
            // Example: navigation.navigate('Login');
        } catch (error) {
            console.error('Error removing session from AsyncStorage:', error);
        }
    }

    /**
     * Require authentication
     * NOTE: This function would typically be used within a navigation guard or a HOC.
     * It should not directly manipulate window.location.href in React Native.
     */
    async requireAuth(): Promise<boolean> {
        const authenticated = await this.isAuthenticated();
        if (!authenticated) {
            // TODO: Implement navigation to LoginScreen here
            // Example: navigation.navigate('Login');
            return false;
        }
        return true;
    }

    /**
     * Require specific role
     * NOTE: Similar to requireAuth, this needs to be adapted for React Native navigation.
     */
    async requireRole(requiredRole: UserSession['role']): Promise<boolean> {
        const authenticated = await this.isAuthenticated();
        if (!authenticated) {
            // TODO: Implement navigation to LoginScreen here
            return false;
        }

        const hasRequiredRole = await this.hasRole(requiredRole);
        if (!hasRequiredRole) {
            // TODO: Implement alert and navigation to a default dashboard (e.g., UserDashboard)
            // Example: Alert.alert('Access Denied', `This page requires ${requiredRole} role.`);
            // Example: navigation.navigate('UserDashboard');
            return false;
        }
        return true;
    }

    /**
     * Require any of the specified roles
     * NOTE: Similar adaptation for React Native navigation.
     */
    async requireAnyRole(roles: UserSession['role'][]): Promise<boolean> {
        const authenticated = await this.isAuthenticated();
        if (!authenticated) {
            // TODO: Implement navigation to LoginScreen here
            return false;
        }

        const hasAnyOfRoles = await this.hasAnyRole(roles);
        if (!hasAnyOfRoles) {
            // TODO: Implement alert and navigation to a default dashboard
            // Example: Alert.alert('Access Denied', "You don't have permission to access this page.");
            // Example: navigation.navigate('UserDashboard');
            return false;
        }
        return true;
    }

    /**
     * Block access for specific roles
     * NOTE: Similar adaptation for React Native navigation.
     */
    async blockRole(blockedRole: UserSession['role']): Promise<boolean> {
        const authenticated = await this.isAuthenticated();
        if (!authenticated) {
            // TODO: Implement navigation to LoginScreen here
            return false;
        }

        const isBlocked = await this.hasRole(blockedRole);
        if (isBlocked) {
            // TODO: Implement alert and navigation to a default dashboard
            // Example: Alert.alert('Access Denied', `This page is not available for ${blockedRole} users.`);
            // Example: navigation.navigate('UserDashboard');
            return false;
        }
        return true;
    }

    /**
     * Update session info (e.g., update user name)
     */
    async updateSession(updates: Partial<UserSession>): Promise<UserSession | null> {
        const session = await this.getSession();
        if (session) {
            const updatedSession = { ...session, ...updates };
            await this.setSession(updatedSession);
            return updatedSession;
        }
        return null;
    }

    /**
     * Get time since login
     */
    async getTimeSinceLogin(): Promise<string | null> {
        const session = await this.getSession();
        if (!session || !session.loginTime) return null;
        
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const diff = now.getTime() - loginTime.getTime();
        
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
}

// Create and export a global instance
export const auth = new AuthManager();