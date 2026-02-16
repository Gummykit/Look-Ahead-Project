# Role-Based Authentication: Quick Start Guide

## 🎯 What's New

A complete login system with three user roles:
- **Contractor** - Create, edit, delete projects
- **Architect** - Create, edit, delete projects  
- **Builder** - View projects only (read-only)

---

## 🚀 Getting Started

### 1. Login to the App

When you open the app, you'll see the login screen.

**Demo Accounts Available:**

```
Contractor:
  Username: contractor1
  Password: contractor123

Architect:
  Username: architect1
  Password: architect123

Builder:
  Username: builder1
  Password: builder123
```

### 2. Select Your Role

Choose from three roles:
- 👷 **Contractor** - Full project management
- 🏗️ **Architect** - Full project management
- 👨‍🔧 **Builder** - View-only access

### 3. Enter Credentials

- Username/Email
- Password
- Click "Log In"

### 4. You're In!

Home screen shows your user info and assigned role.

---

## 👥 Role Comparison

| Feature | Contractor | Architect | Builder |
|---------|-----------|-----------|---------|
| Create Projects | ✅ Yes | ✅ Yes | ❌ No |
| Edit Projects | ✅ Yes | ✅ Yes | ❌ No |
| Delete Projects | ✅ Yes | ✅ Yes | ❌ No |
| View Timechart | ✅ Yes | ✅ Yes | ✅ Yes |
| Add Activities | ✅ Yes | ✅ Yes | ❌ No |
| Edit Activities | ✅ Yes | ✅ Yes | ❌ No |
| Delete Activities | ✅ Yes | ✅ Yes | ❌ No |
| Add Holidays | ✅ Yes | ✅ Yes | ❌ No |
| Add Subcontractors | ✅ Yes | ✅ Yes | ❌ No |
| Log Daily Progress | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🔐 Key Features

### User Authentication
- ✅ Secure login with role selection
- ✅ Signup with email verification
- ✅ Session persistence
- ✅ Logout functionality

### Role-Based Permissions
- ✅ Three distinct permission levels
- ✅ Automatic UI adjustments based on role
- ✅ Permission checks before actions
- ✅ Clear permission denied messages

### Home Screen
- ✅ User information display
- ✅ Current role visible
- ✅ Logout button
- ✅ Create project button (conditional)

### Enhanced Security
- ✅ Automatic redirect to login if not authenticated
- ✅ Protected routes
- ✅ Permission validation
- ✅ Session management

---

## 💻 Code Examples

### Importing the Auth Hook

```typescript
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { user, isLoggedIn, logout } = useAuth();
  
  return <Text>{user?.fullName}</Text>;
}
```

### Checking Permissions

```typescript
import { useAuth } from '@/hooks/useAuth';
import { canPerformAction } from '@/utils/rolePermissions';

export default function EditButton() {
  const { user } = useAuth();
  
  const canEdit = user && canPerformAction(user.role, 'canEdit');
  
  if (!canEdit) {
    return <Text>You don't have permission to edit</Text>;
  }
  
  return <TouchableOpacity onPress={handleEdit} />;
}
```

### Getting Role Display Name

```typescript
import { getRoleDisplayName } from '@/utils/rolePermissions';

const role = user?.role;
const displayName = getRoleDisplayName(role);
// Output: "Contractor", "Architect", or "Builder"
```

---

## 📝 Signup Process

1. Click "Don't have an account? Sign Up"
2. Fill in your details:
   - Username
   - Email address
   - Password (min 6 characters)
   - Full name
   - Select your role
3. Click "Create Account"
4. Login with your new credentials

---

## 🔓 Logout

1. Click "Logout" button (top right)
2. Confirm logout
3. Return to login screen
4. Session is cleared

---

## ⚠️ Permission Denied

If you try to perform an action you don't have permission for:

- ❌ Button will be disabled (Builders)
- ⛔ Alert message will appear
- 🚫 Action will be prevented

---

## 🧪 Testing the Roles

### Test as Contractor
1. Login with `contractor1` / `contractor123`
2. You should see:
   - Create project button (+)
   - Delete buttons on projects
   - Full edit access in editor

### Test as Builder
1. Login with `builder1` / `builder123`
2. You should see:
   - NO create project button
   - NO delete buttons
   - View-only timechart
   - Can still log daily activities

---

## 📱 UI Indicators

### Home Screen Shows

```
┌─────────────────────────────────┐
│ 👤 John Contractor              │
│ Contractor        [Logout]      │
├─────────────────────────────────┤
│     Construction Timechart      │
│  Manage project schedules...    │
├─────────────────────────────────┤
│  Project 1                    ✕ │  (Delete visible)
├─────────────────────────────────┤
│              [+] Create          │  (Create visible)
└─────────────────────────────────┘
```

### Builder View

```
┌─────────────────────────────────┐
│ 👤 Bob Builder                  │
│ Builder           [Logout]      │
├─────────────────────────────────┤
│     Construction Timechart      │
│  View project timecharts        │
├─────────────────────────────────┤
│  Project 1                      │  (No delete button)
├─────────────────────────────────┤
│        (No Create button)        │
└─────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Can't login?
- Check spelling of username/password
- Ensure role is selected
- Try demo accounts first

### Permission denied message?
- Your role may not have that permission
- Contact admin if you need elevated access
- Use different role account to test

### Still on login screen after restart?
- Your session wasn't saved
- Try logging in again
- Check AsyncStorage isn't cleared

---

## 🎓 For Developers

### Add Permission Check

```typescript
if (!canPerformAction(user.role, 'canEdit')) {
  Alert.alert('Permission Denied');
  return;
}
```

### Conditional UI Rendering

```typescript
{user && canPerformAction(user.role, 'canDelete') && (
  <DeleteButton />
)}
```

### Get User Info

```typescript
const { user } = useAuth();
console.log(user.username);    // 'contractor1'
console.log(user.role);         // 'contractor'
console.log(user.fullName);     // 'John Contractor'
```

---

## 📚 Related Documentation

- See `ROLE_BASED_AUTH.md` for detailed implementation
- See `types/index.ts` for type definitions
- See `utils/rolePermissions.ts` for permission definitions
- See `hooks/useAuth.tsx` for auth context implementation

---

**Last Updated:** February 15, 2026
**Version:** 1.0.0
