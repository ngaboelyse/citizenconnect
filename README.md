# CitizenConnect

A modern web application for civic engagement and community issue reporting with role-based access control.

## 🔐 Authentication System

**NEW**: Complete login system with 3 user roles:
- **User/Citizen** - Report issues and track status
- **Staff** - Manage and resolve reported issues
- **Admin** - System overview and management

📖 See [AUTHENTICATION.md](AUTHENTICATION.md) for complete authentication guide.

### Quick Start
1. Go to `login.html`
2. Select your role (User, Staff, or Admin)
3. Use demo credentials:
   - User: `user@example.com` / `password123`
   - Staff: `staff@example.com` / `password123`
   - Admin: `admin@example.com` / `password123`

## Features

- **Report Issues**: Submit detailed reports about community problems (broken pipes, street lights, trash collection, etc.)
- **Real-time Tracking**: Monitor the status of your reports (In Progress, Pending, Resolved)
- **Activity History**: View all your past reports and their current status
- **Live Community Map**: See all reported issues in your area on an interactive map
- **Instant Notifications**: Get alerts when your reports are updated
- **User Profile**: Manage your account and preferences

## Project Structure

```
smart/
├── login.html              # 🔐 Login page (role selection & authentication)
├── index.html              # 👤 User Dashboard (citizens)
├── staff-dashboard.html    # 👷 Staff Dashboard (workers)
├── admin-dashboard.html    # 🔒 Admin Dashboard (system overview)
├── report-form.html        # 📝 Enhanced multi-step report form
├── auth.js                 # 🔑 Authentication & session management
├── script.js               # Interactive functionality
├── styles.css              # Complete styling
├── favicon.svg             # App icon
├── AUTHENTICATION.md       # 📖 Auth system documentation
└── README.md               # This file
```

## File Descriptions

### Core Files
- **login.html** - Entry point with role-based login system
- **auth.js** - Authentication manager and session handler
- **index.html** - Main citizen dashboard
- **script.js** - Interactive functionality for all pages
- **styles.css** - CSS styling for responsive design
- **favicon.svg** - Browser tab icon

### Dashboards
- **staff-dashboard.html** - Task management for staff members
- **admin-dashboard.html** - System analytics for administrators
- **report-form.html** - 5-step form for submitting issues

## Project Structure (Old)

```
smart/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling and layout
├── script.js           # Interactive functionality
├── favicon.ico         # Browser tab icon
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies required - pure HTML/CSS/JavaScript

### Installation

1. **Clone or download** the project
2. **Open `login.html`** in your web browser
3. **Select your role**:
   - 👤 User - For citizens reporting issues
   - 👷 Staff - For city workers managing reports
   - 🔒 Admin - For system administrators
4. **Use demo credentials** (see above)
5. **Access your dashboard** - You'll be redirected based on your role

### Authentication Flow

```
login.html (role selection)
    ↓
    ├─→ User role    → index.html (Citizen Dashboard)
    ├─→ Staff role   → staff-dashboard.html (Staff Dashboard)
    └─→ Admin role   → admin-dashboard.html (Admin Dashboard)
```

Every page is protected - you must login first to access.

## User Dashboards

### 👤 Citizen Dashboard (index.html)
**Access**: Login as "User"  
**Features**:
- Welcome message with personalized greeting
- Quick stats (Active Reports, Resolved, Response Time)
- Report an Issue button - Opens enhanced 5-step form
- Recent Activity showing all your reports
- Live Community Issues map
- Navigation to Staff & Admin dashboards (view-only, requires specific role)

### 👷 Staff Dashboard (staff-dashboard.html)
**Access**: Login as "Staff"  
**Features**:
- Dashboard metrics (Resolved this week, Average Response, Active Complaints)
- Quick Filters by priority and category
- Assigned Tasks with status badges (Urgent, In Progress, Resolved)
- Reports Queue showing recent complaints
- Task management with update capabilities

### 🔒 Admin Dashboard (admin-dashboard.html)
**Access**: Login as "Admin"  
**Features**:
- KPI Cards (Total Reports, Urgent Issues, Resolution Rate, Pending Assignments)
- Reports breakdown by category
- Pending Assignments with priority levels
- System Health monitoring
- Export CSV and Generate Report buttons

### 📝 Enhanced Report Form (report-form.html)
**Access**: Click "Report an Issue" from any dashboard  
**5-Step Process**:
1. **Report Details** - Category, title, description
2. **Visual Evidence** - Photo upload (optional)
3. **Location** - Address or GPS coordinates
4. **Additional Info** - When noticed, impact level
5. **Review & Submit** - Review before final submission

## Technologies Used

- **HTML5** - Semantic markup structure
- **CSS3** - Flexbox layout, gradients, animations
- **JavaScript** - Authentication, session management, interactivity
- **Font Awesome** - Icon library (6.4.0)
- **Google Fonts** - Inter font family

## Features

- **Report Issues** - Submit detailed reports about community problems
- **Real-time Tracking** - Monitor report status (In Progress, Pending, Resolved)
- **Activity History** - View all past reports and their status
- **Role-Based Access** - Different interfaces for citizens, staff, and admins
- **Authentication** - Secure login with session management
- **Multi-step Forms** - Guided process for issue reporting
- **System Analytics** - Admin overview of all issues and metrics
- **Responsive Design** - Works on mobile and desktop

## Security Features

- **HTML5**: Semantic markup structure
- **CSS3**: Flexbox layout, gradients, animations
- **JavaScript**: Interactive functionality and event handling
- **Font Awesome**: Icon library (6.4.0)
- **Google Fonts**: Inter font family

## Security Features

✅ **Authentication Required** - All pages require login  
✅ **Role-Based Access Control** - Different permissions per role  
✅ **Session Management** - Secure localStorage-based sessions  
✅ **Auto-Redirect** - Unauthorized users redirected to login  
✅ **Logout Functionality** - Clean session termination  
✅ **Remember Me Option** - Optional persistent login  
✅ **Input Validation** - Form validation before submission  
✅ **Privacy Notice** - User data handling transparency  

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Future Enhancements

- [ ] Backend API integration
- [ ] Real database storage
- [ ] Email notifications
- [ ] Push notifications
- [ ] Advanced filtering and search
- [ ] Community voting on issues
- [ ] Admin panel refinements
- [ ] Mobile app version
- [ ] Real-time GPS tracking
- [ ] Photo upload functionality

## Troubleshooting

### "Access Denied" message
- Make sure you're logged in with correct role
- Each dashboard requires specific role (User, Staff, or Admin)
- Try logging out and logging back in

### Session lost after refresh
- Enable cookies/localStorage in browser
- Try "Remember Me" option on login

### Can't login
- Check demo credentials are correct
- Ensure browser supports JavaScript
- Clear browser cache and try again

## Support & Documentation

- **Authentication Guide**: See [AUTHENTICATION.md](AUTHENTICATION.md)
- **API Reference**: Auth functions documented in auth.js
- **Demo Setup**: Use test credentials provided on login page

## License

This project is open source and available for community use.

## Contact

For issues or suggestions, please contact the development team.

---

**Last Updated**: April 27, 2026  
**Version**: 2.0 (Authentication System Added)
