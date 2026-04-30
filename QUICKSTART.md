# QuickStart Guide - CitizenConnect/IssueReport

## 🚀 Getting Started in 60 Seconds

### Step 1: Open Login Page
1. Open `login.html` in your browser
2. You'll see the login screen with role selection

### Step 2: Select Your Role
Choose one of three roles:

#### 👤 **User (Citizen)**
- **For**: Reporting issues in your community
- **Demo Email**: `user@example.com`
- **Demo Password**: `password123`
- **Redirects to**: Main Dashboard (index.html)

#### 👷 **Staff (Worker)**
- **For**: Managing and resolving reports
- **Demo Email**: `staff@example.com`
- **Demo Password**: `password123`
- **Redirects to**: Staff Dashboard (staff-dashboard.html)

#### 🔒 **Admin (Manager)**
- **For**: System overview and analytics
- **Demo Email**: `admin@example.com`
- **Demo Password**: `password123`
- **Redirects to**: Admin Dashboard (admin-dashboard.html)

### Step 3: Login
1. Click on role button
2. Enter email and password
3. (Optional) Check "Remember me" to stay logged in
4. Click "Login"

### Step 4: Access Your Dashboard
You'll be automatically redirected to your role's dashboard.

---

## 📊 Using Each Dashboard

### 👤 USER DASHBOARD (index.html)

**What you can do:**
- View welcome message
- See your key stats
- Submit new reports
- View your report history
- Check community issues map
- Access your profile
- Logout

**Key Actions:**
1. Click **"Report an Issue"** → Opens multi-step form
2. Fill 5 steps → Submit report → Get ticket number
3. View **"Recent Activity"** → See all your past reports
4. Click **Profile icon** → View account, logout

**Demo Flow:**
```
Login as User
    ↓
See Dashboard with:
- Active Reports: 2
- Resolved: 1
- Response Time: 48h
    ↓
Click "Report an Issue"
    ↓
Fill 5-step form:
1. Category, Title, Description
2. Upload photo (optional)
3. Enter location
4. Add more details
5. Review & Submit
    ↓
Get Ticket #REP-XXXX
```

---

### 👷 STAFF DASHBOARD (staff-dashboard.html)

**What you can do:**
- View assigned tasks
- Filter by priority/category
- Update task status
- Access reports queue
- Export summaries
- Logout

**Key Metrics:**
- Resolved this week: 24 (↑ +12%)
- Average Response: 1.4h
- Active Complaints: 42 (↑ +8%)

**Key Sections:**
1. **Quick Filters** - Filter by priority level
2. **Assigned to Me** - Your current tasks
3. **Recent Reports Queue** - All incoming reports

**Demo Flow:**
```
Login as Staff
    ↓
See 8 Active Tasks:
- Pothole Emergency (URGENT)
- Broken Streetlight (IN-PROGRESS)
- Tree Maintenance (RESOLVED)
    ↓
Click "Update Status" → Change task status
Click "View Details" → See full complaint
    ↓
Export Summary → Download report
Logout → End session
```

---

### 🔒 ADMIN DASHBOARD (admin-dashboard.html)

**What you can do:**
- View all system statistics
- See reports by category
- Manage pending assignments
- Monitor system health
- Generate and export reports
- Logout

**Key Metrics:**
- Total Reports: 1,482 (↑ +18%)
- Urgent Issues: 43 (↑ +5%)
- Resolution Rate: 94.2% (↑ +2.1%)
- Pending Assignments: 12

**Key Sections:**
1. **Reports by Category** - Water & Sewage (452), Roads (312), Lighting (208), etc.
2. **Pending Assignments** - Assign reports to staff
3. **System Health** - Monitor API, Sensors, Database status

**Demo Flow:**
```
Login as Admin
    ↓
See System Overview:
- Total Reports: 1,482
- Urgent Issues: 43
- Resolution Rate: 94.2%
    ↓
View Categories:
- Water & Sewage: 452 reports
- Road Maintenance: 312 reports
- etc.
    ↓
Check Pending Assignments:
- Burst Pipe (URGENT) → Click "Assign"
- Streetlight Failure (MEDIUM) → Click "Assign"
    ↓
Monitor System Health:
- API Stability: 99.9% Uptime
- Sensor Network: Online
- Database: Latency High
    ↓
Export CSV / Generate Report
Logout
```

---

## 🔐 Authentication Features

### Session Management
- **Automatic Login**: If you close browser, session saved
- **Remember Me**: Keeps you logged in across sessions
- **Auto-Logout**: Click profile icon → Click "Logout"

### Security
- **Role-Based Access**: Each role sees only allowed pages
- **Auto-Redirect**: Trying wrong URL? Redirected to correct dashboard
- **Session Validation**: Every page checks if you're logged in

### Logout Flow
```
Click Profile Icon (top right)
    ↓
See User Menu:
- Your Name
- Your Role
- Your Email
- Logout Button
    ↓
Click "Logout"
    ↓
Confirm: "Are you sure?"
    ↓
Session Cleared
Redirected to Login
```

---

## 📍 Complete User Journey Examples

### Example 1: Citizen Reports a Pothole

```
1. Open login.html
2. Select "User" role
3. Login: user@example.com / password123
4. See "Report an Issue" button
5. Click it → Step 1 form opens
   - Select Category: Road Damage
   - Title: "Large Pothole on Oak Street"
   - Description: "Dangerous pothole, 2ft deep"
6. Continue → Step 2 (photo upload)
   - Click camera icon
   - (Optional) Upload photo
7. Continue → Step 3 (location)
   - Enter: "123 Oak Street, Downtown"
   - Or click "Use Current Location"
8. Continue → Step 4 (details)
   - When: Today
   - Impact: Safety hazard
   - Check: "Notify me of updates"
9. Continue → Step 5 (review)
   - Review form details
   - Read privacy notice
10. Click "Submit Report"
    → Success! Ticket #REP-8974
11. Return to dashboard
12. See report in "Recent Activity"
13. Click profile → Logout
```

### Example 2: Staff Member Updates a Report

```
1. Open login.html
2. Select "Staff" role
3. Login: staff@example.com / password123
4. See Staff Dashboard with 8 tasks
5. See "Pothole Emergency - Broadway Ave" (URGENT)
6. Click "Update Status"
   - Change to "In Progress"
7. Click "View Details"
   - See full report info
   - Citizen contact info
   - Previous updates
8. Check other urgent task
9. Filter by "High Priority" to focus
10. Export Summary for supervisor
11. Click Logout button
    → Confirm logout
    → Return to login page
```

### Example 3: Admin Reviews System

```
1. Open login.html
2. Select "Admin" role
3. Login: admin@example.com / password123
4. See Admin Dashboard
5. Check KPIs:
   - 1,482 total reports
   - 43 urgent issues
   - 94.2% resolution rate
6. See breakdown by category
7. Check pending assignments (12 items)
8. Assign "Burst Pipe" to Staff team
9. Check system health:
   - API: 99.9% uptime ✓
   - Database: High latency ⚠️
   - SMS Gateway: Offline ✗
10. Generate monthly report
11. Export data as CSV
12. Click Logout
```

---

## 🎯 Common Tasks

### Report a New Issue (User)
1. Dashboard → "Report an Issue"
2. Follow 5-step form
3. Submit → Get ticket number

### Update Report Status (Staff)
1. Dashboard → Find task
2. Click "Update Status"
3. Select new status
4. Save

### Assign Report (Admin)
1. Dashboard → "Pending Assignments"
2. Click "Assign"
3. Select staff member
4. Confirm

### Check My Reports (User)
1. Dashboard → "Recent Activity"
2. Or click Profile → See history

### Logout (Any User)
1. Click profile icon (top right)
2. Click "Logout"
3. Confirm

---

## ❓ FAQs

**Q: I forget my password, what do I do?**  
A: For demo, passwords are: `password123` for all roles

**Q: Can I use multiple roles?**  
A: Yes, logout and login with different credentials

**Q: My session expired, what happened?**  
A: Browser storage was cleared. Login again.

**Q: Can I access Staff Dashboard as a User?**  
A: No, you'll be redirected to User Dashboard. Login as Staff to see it.

**Q: How do I test all features?**  
A: Login with each role (User, Staff, Admin) and explore

**Q: Can I change my role after login?**  
A: Yes, logout and login with different role

**Q: What if I see "Access Denied"?**  
A: You don't have permission for that page. Login with correct role.

---

## 📊 What You Can Test

### ✅ User Role (citizen)
- [x] Submit issue report (5-step form)
- [x] View report history
- [x] Check report status
- [x] View profile
- [x] Logout

### ✅ Staff Role (worker)
- [x] View assigned tasks
- [x] Filter by priority
- [x] Update task status
- [x] View reports queue
- [x] Export summary
- [x] Logout

### ✅ Admin Role (manager)
- [x] View system statistics
- [x] See reports by category
- [x] Manage assignments
- [x] Monitor system health
- [x] Generate reports
- [x] Export data
- [x] Logout

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't login | Check email/password, verify role selected |
| Session lost | Enable cookies, use "Remember Me" |
| Wrong dashboard | Check you logged in with correct role |
| Can't report issue | Make sure you're logged in as User |
| Export not working | Check browser's popup blocker |
| See "Access Denied" | Wrong role for that page, login again |

---

**Ready? Start with `login.html` and select your role! 🚀**
