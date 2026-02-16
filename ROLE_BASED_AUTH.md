# Role-Based Login & Access Control System

## Overview

A comprehensive role-based authentication system for the Construction Timechart application with three user roles:
- **Contractor** - Full edit access (create, edit, delete projects)
- **Architect** - Full edit access (manage timecharts)
- **Builder** - View-only access (view timecharts, log daily activities)

---

## Architecture

### Components

#### 1. **Authentication Context** (`hooks/useAuth.tsx`)
- Manages login/signup state
- Stores user information in AsyncStorage
- Provides login, logout, and signup functions
- Mock user database for testing

#### 2. **Role Permissions** (`utils/rolePermissions.ts`)
- Defines permissions for each role
- Helper functions to check permissions
- Display names and descriptions for roles

#### 3. **Login Screen** (`app/login.tsx`)
- Beautiful login/signup interface
- Role selection UI
- Demo credentials display
- Form validation

#### 4. **Protected Routes** (updated `app/_layout.tsx`)
- Automatic route redirection based on login status
- Prevents unauthorized access

---

## User Roles & Permissions

### Contractor
```
✅ Full Project Management Access
- Create new projects
- Edit project details
- Delete projects
- Add/edit/delete activities
- Add/edit/delete holidays
- Add/edit/delete subcontractors
- View timechart
- Log daily activities
```

### Architect
```
✅ Full Project Management Access
- Create new projects
- Edit project details
- Delete projects
- Add/edit/delete activities
- Add/edit/delete holidays
- Add/edit/delete subcontractors
- View timechart
- Log daily activities
```

### Builder
```
✅ View-Only Access
- View timecharts (read-only)
- Log daily activities (progress updates)
- Cannot modify any project details
- Cannot add/edit/delete activities
- Cannot manage holidays or subcontractors
```

---

## Demo Credentials

Pre-configured test accounts available on login screen:

| Role | Username | Password | Purpose |
|------|----------|----------|---------|
| Contractor | contractor1 | contractor123 | Full project management |
| Architect | architect1 | architect123 | Full project management |
| Builder | builder1 | builder123 | View-only access |

---

## API Reference

### AuthContext Hook

```typescript
const { user, isLoggedIn, login, logout, signup } = useAuth();
```

**Properties:**
- `user: User | null` - Current logged-in user
- `isLoggedIn: boolean` - Login status

**Methods:**
```typescript
// Login
await login(username: string, password: string, role: UserRole)

// Logout
await logout()

// Signup
await signup(
  username: string,
  email: string,
  password: string,
  role: UserRole,
  fullName: string
)
```

### Role Permissions Hook

```typescript
import { 
  getPermissions,
  canPerformAction,
  getRoleDisplayName,
  getRoleDescription
} from '@/utils/rolePermissions';

// Get all permissions for a role
const permissions = getPermissions('contractor');

// Check specific permission
const canEdit = canPerformAction('contractor', 'canEdit');

// Get display name
const name = getRoleDisplayName('builder'); // 'Builder'

// Get description
const desc = getRoleDescription('architect');
```

---

## File Structure

```
📁 app/
  ├── _layout.tsx              (Updated with auth provider)
  ├── login.tsx                (NEW - Login/signup screen)
  ├── index.tsx                (Updated with user info)
  ├── create-project.tsx       (Existing, role-protected)
  └── editor.tsx               (Existing, role-protected)

📁 hooks/
  └── useAuth.tsx              (NEW - Authentication context)

📁 utils/
  └── rolePermissions.ts       (NEW - Permission definitions)

📁 types/
  └── index.ts                 (Updated with auth types)
```

---

## Implementation Flow

### Login Flow

```
User Opens App
    ↓
Check AsyncStorage for stored user
    ↓
Is user stored? 
  ├─ YES → Load user & show home screen
  └─ NO → Show login screen
         ↓
      User enters credentials & role
         ↓
      Validate against mock database
         ↓
      Store user in AsyncStorage
         ↓
      Navigate to home screen
```

### Route Protection Flow

```
User navigates to protected route
    ↓
Check useAuth hook
    ↓
Is user logged in?
  ├─ YES → Allow access
  └─ NO → Redirect to login
```

### Permission Check Flow

```
User attempts action
    ↓
Get user role from useAuth
    ↓
Call canPerformAction(role, action)
    ↓
Is action allowed?
  ├─ YES → Perform action
  └─ NO → Show permission denied alert
```

---

## Type Definitions

### User Type

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  createdAt: Date;
  lastLogin?: Date;
}
```

### UserRole Type

```typescript
type UserRole = 'contractor' | 'architect' | 'builder';
```

### RolePermissions Type

```typescript
interface RolePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canAddActivity: boolean;
  canEditActivity: boolean;
  canDeleteActivity: boolean;
  canAddHoliday: boolean;
  canDeleteHoliday: boolean;
  canAddSubcontractor: boolean;
  canDeleteSubcontractor: boolean;
  canViewTimechart: boolean;
  canLogDailyActivity: boolean;
}
```

---

## Usage Examples

### Check Permission Before Action

```typescript
const { user } = useAuth();
import { canPerformAction } from '@/utils/rolePermissions';

const handleDeleteProject = (projectId: string) => {
  if (!user || !canPerformAction(user.role, 'canDelete')) {
    Alert.alert('Permission Denied', 'You cannot delete projects');
    return;
  }
  // Proceed with delete
};
```

### Conditional UI Rendering

```typescript
const { user } = useAuth();
const { canPerformAction } from '@/utils/rolePermissions';

const canEditProject = user && canPerformAction(user.role, 'canEdit');

return (
  <>
    {canEditProject && <EditButton />}
    {!canEditProject && <ViewOnlyMessage />}
  </>
);
```

### Display User Info

```typescript
const { user } = useAuth();
import { getRoleDisplayName } from '@/utils/rolePermissions';

<Text>{user?.fullName}</Text>
<Text>{getRoleDisplayName(user?.role || 'builder')}</Text>
```

### Logout User

```typescript
const { logout } = useAuth();
const router = useRouter();

const handleLogout = async () => {
  await logout();
  router.replace('/login');
};
```

---

## Login Screen Features

### UI Elements

1. **Logo/Header**
   - App title and subtitle
   - Toggle between login and signup modes

2. **Input Fields**
   - Username field
   - Email field (signup only)
   - Password field (secured)
   - Full Name field (signup only)

3. **Role Selection**
   - Three role buttons
   - Visual feedback for selected role
   - Role description display

4. **Demo Info** (login mode)
   - Pre-configured test accounts
   - Quick reference for testing

5. **Authentication Buttons**
   - Login/Create Account button
   - Loading state indicator
   - Error handling with alerts

6. **Mode Toggle**
   - Link to switch between login and signup
   - Clear call-to-action

### Form Validation

```typescript
// Login
✓ Username required
✓ Password required
✓ Valid role selected

// Signup
✓ Username required
✓ Email required
✓ Password required (min 6 chars)
✓ Full name required
✓ Username not already taken
✓ Email not already taken
```

---

## Security Considerations

### Current Implementation (Demo)
- Mock user database stored in memory
- Passwords stored as plain text (for demo only)
- AsyncStorage for session persistence

### Production Recommendations
- ✅ Use real backend API for authentication
- ✅ Hash passwords with bcrypt or similar
- ✅ Implement JWT tokens for sessions
- ✅ Use HTTPS for all API calls
- ✅ Add password strength requirements
- ✅ Implement token refresh mechanism
- ✅ Add rate limiting for login attempts
- ✅ Implement account lockout after failed attempts
- ✅ Add two-factor authentication (optional)
- ✅ Encrypt sensitive data in storage

---

## Protected Components

### Home Screen (`index.tsx`)
- Show user information at top
- Logout button visible
- Create project button (conditional on permissions)
- Delete project button (conditional on permissions)

### Create Project (`create-project.tsx`)
- Protected by role permissions
- Shows permission denied message if not allowed
- Guided workflow for project creation

### Editor (`editor.tsx`)
- Read-only mode for Builders
- Edit mode for Contractors/Architects
- Hide edit buttons for Builders

---

## Testing

### Test Login Flow

1. **Contractor Login**
   - Username: contractor1
   - Password: contractor123
   - Expected: Full access to all features

2. **Architect Login**
   - Username: architect1
   - Password: architect123
   - Expected: Full access to all features

3. **Builder Login**
   - Username: builder1
   - Password: builder123
   - Expected: View-only access, can log activities

### Test Signup Flow

1. Fill signup form with new credentials
2. Select role
3. Create account
4. Login with new credentials

### Test Permission Enforcement

1. Login as Builder
2. Verify:
   - Create project button is hidden
   - Delete buttons are hidden/disabled
   - Timechart is view-only
   - Can log daily activities

---

## Future Enhancements

1. **Backend Integration**
   - Connect to real authentication API
   - JWT token management
   - Password hashing

2. **Advanced Features**
   - Two-factor authentication
   - Password reset
   - Profile management
   - User role management (admin)

3. **Security**
   - Biometric authentication
   - Social login (Google, GitHub)
   - Device fingerprinting

4. **Additional Roles**
   - Admin role
   - Supervisor role
   - Finance role

5. **Activity Logging**
   - Track user actions
   - Audit trail
   - Activity history

---

## Troubleshooting

### User Stays on Login Screen

**Solution:** 
- Check if AuthProvider wraps the app
- Verify AsyncStorage permissions
- Check console for errors

### Permission Denied Errors

**Solution:**
- Verify user role is correct
- Check canPerformAction function
- Check role permissions in rolePermissions.ts

### Logout Not Working

**Solution:**
- Check AsyncStorage.removeItem call
- Verify route navigation
- Check console for errors

### Demo Credentials Not Working

**Solution:**
- Case-sensitive username/password
- Check spelling exactly as shown
- Reset AsyncStorage: `AsyncStorage.clear()`

---

## API Integration Guide

To integrate with a real backend, replace the mock user database in `hooks/useAuth.tsx`:

```typescript
// Replace this:
const mockUsers = [...]

// With API calls:
const login = async (username: string, password: string, role: UserRole) => {
  const response = await fetch('https://api.example.com/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
  });
  const data = await response.json();
  // Handle response...
};
```

---

**Last Updated:** February 15, 2026
**Version:** 1.0.0
**Status:** ✅ Complete & Ready for Testing
