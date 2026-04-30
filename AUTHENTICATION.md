# Authentication & Role-Based Access Guide

## Overview

The CitizenConnect/IssueReport system includes a comprehensive authentication and role-based access control (RBAC) system to ensure different user types have appropriate access levels.

## User Roles

### 1. **User/Citizen** 👤
- **Access**: Main CitizenConnect dashboard (index.html)
- **Permissions**:
  - Submit new complaints/issues
  - View personal report history
  - Track report status
  - View personal profile
- **URL**: `index.html`

### 2. **Staff** 👷
- **Access**: Staff Dashboard (staff-dashboard.html)
- **Permissions**:
  - View assigned tasks/complaints
  - Update complaint status
  - Filter by priority and category
  - View reports queue
  - Export summary reports
- **URL**: `staff-dashboard.html`

### 3. **Admin** 🔒
- **Access**: Global/Admin Dashboard (admin-dashboard.html)
- **Permissions**:
  - View all system statistics
  - See all reports by category
  - Manage pending assignments
  - Monitor system health
  - Generate comprehensive reports
  - Export data as CSV
- **URL**: `admin-dashboard.html`

## Login Page

**URL**: `login.html`

### Demo Credentials

```
User:  user@example.com / password123
Staff: staff@example.com / password123
Admin: admin@example.com / password123
```

### Features
- Role selection (User, Staff, Admin)
- Email & password authentication
- "Remember me" functionality
- Auto-redirect based on role
- Session persistence

## Session Management

### How Sessions Work

1. **Login**: User submits credentials with selected role
2. **Validation**: System validates email/password
3. **Session Creation**: User session stored in localStorage
4. **Redirect**: User automatically redirected to appropriate dashboard
5. **Protection**: All pages require valid session before access

### Session Data Structure

```javascript
{
  role: "user|staff|admin",
  email: "user@example.com",
  name: "User|Staff|Admin",
  loginTime: "2026-04-27T...",
  authenticated: true
}
```

### Session Locations

- **Primary**: Browser localStorage (`userSession` key)
- **Optional**: "Remember Me" saves last email

## Authentication API (auth.js)

### Main Methods

```javascript
// Check authentication
auth.isAuthenticated()          // Returns true if logged in

// Get user info
auth.getUserRole()              // Returns user role
auth.getUserName()              // Returns user name
auth.getUserEmail()             // Returns user email

// Check roles
auth.hasRole('admin')           // Check specific role
auth.hasAnyRole(['admin', 'staff'])  // Check multiple roles

// Require authentication
auth.requireAuth()              // Redirect to login if not authenticated
auth.requireRole('staff')       // Redirect if wrong role
auth.requireAnyRole(['admin', 'staff'])  // Check multiple roles
auth.blockRole('user')          // Block specific role

// Logout
auth.logout()                   // Clear session and redirect to login

// Session info
auth.getTimeSinceLogin()        // Get login duration
```

## Page Protection

### Implementing Role-Based Access

Add this to any page that requires authentication:

```html
<script src="auth.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Require login (any user)
    auth.requireAuth();
    
    // OR require specific role
    auth.requireRole('admin');
    
    // OR require any of multiple roles
    auth.requireAnyRole(['admin', 'staff']);
  });
</script>
```

## User Interface

### Login Menu
Every authenticated dashboard has a user menu showing:
- Current username
- User role (uppercase)
- Email address
- **Logout button**

### Accessing User Info
In any page:
```html
<div id="userName"></div>   <!-- Displays: Name -->
<div id="userRole"></div>   <!-- Displays: ADMIN, STAFF, USER -->
<div id="userEmail"></div>  <!-- Displays: email@example.com -->
```

These automatically populate via `auth.js`.

## Logout Flow

1. **Click Logout**: User clicks logout button
2. **Confirmation**: System asks for confirmation
3. **Session Clear**: localStorage session is deleted
4. **Redirect**: User sent to login.html
5. **New Login**: User must login again to access system

## Security Features

✅ **Session Validation**: Every page checks authentication  
✅ **Role-Based Access**: Different roles have different permissions  
✅ **Auto-Redirect**: Unauthorized users redirected to login  
✅ **Session Persistence**: Sessions survive page refreshes  
✅ **Logout Cleanup**: Session properly cleared on logout  
✅ **Remember Me**: Optional persistent login on same device  

## Workflow Examples

### Example 1: User Reporting an Issue
```
1. User not logged in → Sees login page
2. Selects "User" role
3. Enters credentials
4. Clicks "Login"
5. Redirected to index.html (User Dashboard)
6. User clicks "Report an Issue"
7. Fills multi-step form
8. Submits report
9. Returns to dashboard
10. User can click "Profile" to logout
```

### Example 2: Staff Member Tracking Issues
```
1. Staff member visits staff-dashboard.html directly
2. Not authenticated → Redirected to login.html
3. Selects "Staff" role
4. Enters staff credentials
5. Redirected to staff-dashboard.html
6. Can see assigned tasks and queue
7. Can update task status
8. Clicks logout to end session
```

### Example 3: Admin Accessing System Overview
```
1. Admin visits admin-dashboard.html
2. Not logged in → Login required
3. Selects "Admin" role
4. Enters admin credentials
5. Access granted to admin-dashboard.html
6. Can see all statistics and reports
7. Can generate reports and export data
```

## Customizing Authentication

### Adding New Roles

1. **Update login.html**: Add new role button
2. **Update credentials**: Add role validation
3. **Create dashboard**: Create role-specific page
4. **Add protection**: Include `auth.requireRole('newrole')`

### Changing Credentials

Edit `login.html` and modify:
```javascript
const validCredentials = {
  user: { email: 'user@example.com', password: 'password123' },
  // Add your credentials here
};
```

### Connecting to Backend

Replace demo validation with API call:
```javascript
// Instead of local check:
fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({ email, password, role: selectedRole })
})
.then(response => response.json())
.then(data => {
  localStorage.setItem('userSession', JSON.stringify(data));
  // Redirect...
});
```

## FAQ

**Q: What happens if I clear browser storage?**  
A: You'll be logged out and need to login again

**Q: Can I access multiple dashboards with one login?**  
A: Yes, but only your assigned role's dashboard works. Others redirect to login.

**Q: How long does a session last?**  
A: Until you logout or clear browser storage. No automatic expiration.

**Q: Can I use the system without login?**  
A: No, all pages require authentication

**Q: How do I add password reset?**  
A: Add recovery email functionality to login.html and backend API

## Support

For authentication issues:
1. Check browser console for error messages
2. Verify credentials match demo accounts
3. Clear browser storage and try again
4. Check localStorage for `userSession` key
