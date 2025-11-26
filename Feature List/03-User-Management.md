# User Management Features

**Features 2, 4: User Profile, Password Management, Account Deletion**

This document covers user account management, profile editing, password changes, and account deletion.

---

## Implementation Files

- `app/account/page.tsx` - Profile management
- `app/account/security/page.tsx` - Password management
- `app/account/notifications/page.tsx` - Notification preferences
- `components/account/*` - Account components
- `app/api/user/*` - User management APIs

---

## 2.1 User Profile Management (FUNCTIONAL)

### Implementation Location
**File:** `app/account/page.tsx`

### Editable Fields

| Field | Type | Description |
|-------|------|-------------|
| Name | Text input | User's full name (2-50 chars) |
| Avatar | Image upload | Profile picture (max 5MB) |
| Company Name | Text input | Optional company/organization name |
| Notification Preferences | Toggle switches | Email notification settings |

### Notification Preferences

- **Email Notifications**: Master toggle ON/OFF
- **Order Completion**: Notify when processing completes
- **Marketing Emails**: Promotional and update emails
- **System Alerts**: Important system notifications

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/user/profile` | Fetch current user data |
| PUT | `/api/user/profile` | Update profile information |
| POST | `/api/user/avatar` | Upload/update avatar image |

### Avatar Upload Logic

```typescript
// components/account/ProfileForm.tsx
const handleAvatarUpload = async (file: File) => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.error('Please upload an image file')
    return
  }
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    toast.error('File too large. Max 5MB')
    return
  }

  // Upload to cloud storage
  const formData = new FormData()
  formData.append('avatar', file)
  
  try {
    const { data } = await api.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    setAvatarUrl(data.avatarUrl)
    toast.success('Avatar updated successfully')
  } catch (error) {
    toast.error('Failed to upload avatar')
  }
}
```

### Profile Update Flow

1. **User Edits Fields**
   - Modify name, company name, or notifications
   - Changes tracked in local state

2. **Validation**
   - Name: Min 2 chars, max 50 chars
   - Company: Optional, max 100 chars
   - Real-time validation feedback

3. **Submit Changes**
   - Click "Save" button
   - PUT request to `/api/user/profile`

4. **Backend Processing**
   - Verify user authentication
   - Validate input data
   - Update database record
   - Return updated user object

5. **Success Response**
   - Update global state (Zustand)
   - Display success toast
   - Refresh UI with new data

### API Implementation

```typescript
// app/api/user/profile/route.ts
import { getServerSession } from 'next-auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      companyName: true,
      emailNotifications: true,
      createdAt: true
    }
  })

  return NextResponse.json(user)
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, companyName, emailNotifications } = body

  // Validate inputs
  if (name && (name.length < 2 || name.length > 50)) {
    return NextResponse.json({ error: 'Invalid name length' }, { status: 400 })
  }

  // Update user
  const updatedUser = await db.user.update({
    where: { id: session.user.id },
    data: {
      name,
      companyName,
      emailNotifications
    }
  })

  return NextResponse.json(updatedUser)
}
```

---

## 2.2 Password Management (FUNCTIONAL)

### Implementation Location
**File:** `app/account/security/page.tsx`

### Required Fields

| Field | Type | Validation |
|-------|------|------------|
| Current Password | Password input | Required, must match existing |
| New Password | Password input | Min 8 chars, complexity check |
| Confirm New Password | Password input | Must match new password |

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

### Password Strength Indicator

```typescript
const calculatePasswordStrength = (password: string): number => {
  let strength = 0
  
  if (password.length >= 8) strength += 1
  if (password.length >= 12) strength += 1
  if (/[A-Z]/.test(password)) strength += 1
  if (/[a-z]/.test(password)) strength += 1
  if (/[0-9]/.test(password)) strength += 1
  if (/[^A-Za-z0-9]/.test(password)) strength += 1
  
  return Math.min(strength / 6 * 100, 100)
}
```

### API Endpoint

**Endpoint:** `PUT /api/user/password`

**Request Body:**
```typescript
interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}
```

### Security Logic

```typescript
// app/api/user/password/route.ts
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currentPassword, newPassword } = await request.json()

  // Fetch user from database
  const user = await db.user.findUnique({ 
    where: { id: session.user.id } 
  })

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid current password' }, 
      { status: 400 }
    )
  }

  // Validate new password strength
  if (!validatePasswordStrength(newPassword)) {
    return NextResponse.json(
      { error: 'Password does not meet requirements' },
      { status: 400 }
    )
  }

  // Hash new password (bcrypt with 12 rounds)
  const newHash = await bcrypt.hash(newPassword, 12)

  // Update in database
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash }
  })

  // Send email notification
  await sendEmail({
    to: user.email,
    template: 'password-changed',
    data: { name: user.name, changeTime: new Date() }
  })

  // Invalidate all other sessions (optional security measure)
  // This forces user to re-login on other devices

  return NextResponse.json({ success: true })
}
```

### Password Change Flow

1. **User Enters Passwords**
   - Current password
   - New password (with strength indicator)
   - Confirm new password

2. **Client Validation**
   - Check all fields filled
   - Verify new passwords match
   - Validate password strength

3. **Submit Request**
   - POST to `/api/user/password`

4. **Server Validation**
   - Verify current password
   - Validate new password strength
   - Check not same as current

5. **Update Password**
   - Hash new password
   - Update database
   - Send notification email

6. **Success Response**
   - Display success message
   - Optional: Force re-login

---

## 4. Account Deletion (FUNCTIONAL)

### Implementation Location
**Component:** `components/account/DeleteAccountDialog.tsx`

### Deletion Process

1. **User Navigates to Settings**
   - Account settings page
   - "Delete Account" button in danger zone

2. **Confirmation Dialog Opens**
   - Warning message about permanence
   - List of data that will be deleted
   - Password re-entry required

3. **User Re-enters Password**
   - Security verification
   - Prevents accidental deletion

4. **Final Confirmation Checkbox**
   - "I understand this action is permanent"
   - Must be checked to proceed

5. **Submit Deletion Request**
   - POST to `/api/user/delete`

6. **Backend Processing**
   - Verify password
   - Perform soft delete
   - Tag all related data
   - Send confirmation email

7. **User Logged Out**
   - Session terminated
   - Redirect to homepage

8. **Cleanup** (Async)
   - Mark all orders as deleted
   - Disable DAM connections
   - Anonymize personal data (GDPR)

### API Endpoint

**Endpoint:** `DELETE /api/user/delete`

### Soft Delete Logic

```typescript
// app/api/user/delete/route.ts
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { password } = await request.json()

  // Verify password for security
  const user = await db.user.findUnique({ 
    where: { id: session.user.id } 
  })
  
  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid password' }, 
      { status: 400 }
    )
  }

  // Soft delete - mark as deleted, keep records for audit/fraud prevention
  await db.user.update({
    where: { id: user.id },
    data: {
      deletedAt: new Date(),
      status: 'DELETED',
      // Anonymize email to prevent reuse but keep user ID for referential integrity
      email: `deleted_${user.id}_${Date.now()}@deleted.com`,
      // Clear sensitive data
      passwordHash: null,
      avatar: null,
      name: 'Deleted User'
    }
  })

  // Mark all related orders as deleted
  await db.order.updateMany({
    where: { userId: user.id },
    data: { status: 'DELETED' }
  })

  // Disconnect all DAM connections
  await db.damConnection.updateMany({
    where: { userId: user.id },
    data: { isConnected: false }
  })

  // Send confirmation email (to original email, before anonymization)
  await sendEmail({
    to: user.email,
    template: 'account-deleted',
    data: { 
      name: user.name,
      deletionDate: new Date()
    }
  })

  // Log deletion for audit
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: 'ACCOUNT_DELETED',
      timestamp: new Date()
    }
  })

  return NextResponse.json({ 
    success: true,
    message: 'Account deleted successfully' 
  })
}
```

### Data Retention Policy

**Immediately Deleted:**
- User personal information (name, email)
- Profile picture
- Password hash
- DAM connections

**Soft Deleted (Retained):**
- User ID (for referential integrity)
- Order history (marked as deleted)
- Transaction records (for accounting)
- Audit logs (for fraud prevention)

**Retention Period:** 90 days for fraud investigation, then fully purged

---

## Notification Settings

### Email Notification Types

| Notification Type | Default | Description |
|-------------------|---------|-------------|
| Order Completed | ON | When image processing finishes |
| Order Failed | ON | When processing encounters errors |
| Password Changed | ON | Security notification (cannot disable) |
| New Features | ON | Product updates and new features |
| Marketing | OFF | Promotional emails |
| Weekly Summary | OFF | Weekly activity summary |

### API Endpoint

**Endpoint:** `PUT /api/user/notifications`

```typescript
interface NotificationSettings {
  emailNotifications: boolean
  orderCompleted: boolean
  orderFailed: boolean
  newFeatures: boolean
  marketing: boolean
  weeklySummary: boolean
}
```

---

## Testing Checklist

### Profile Management
- [ ] Name field validates correctly (2-50 chars)
- [ ] Avatar upload works (max 5MB)
- [ ] Avatar preview updates immediately
- [ ] Company name saves correctly
- [ ] Notification toggles persist
- [ ] Error messages display properly
- [ ] Success toast appears after save

### Password Management
- [ ] Current password verification works
- [ ] Password strength indicator accurate
- [ ] Password requirements enforced
- [ ] Confirmation password match validation
- [ ] Cannot use same password
- [ ] Email notification sent
- [ ] Success message displayed

### Account Deletion
- [ ] Confirmation dialog appears
- [ ] Password verification required
- [ ] Final confirmation checkbox required
- [ ] Soft delete executed correctly
- [ ] Related data marked as deleted
- [ ] User logged out after deletion
- [ ] Confirmation email sent
- [ ] Cannot login with deleted account

---

**Previous:** [← Authentication](./02-Authentication.md) | **Next:** [Billing →](./04-Billing.md)

