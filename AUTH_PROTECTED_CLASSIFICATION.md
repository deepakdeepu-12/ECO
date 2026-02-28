# 🔐 Protected AI Waste Classification

## Overview
The AI waste classification feature is now **authentication-protected**. Users must be signed in to scan and classify waste items.

---

## ✅ Changes Made

### 1. **Backend - Protected Route**
Updated `backend/src/features/classify/classify.routes.ts`:
```typescript
import { protect } from '../../middleware/auth.middleware';

// Protected route - requires authentication
router.post('/classify', protect, classify);
```

**What this does:**
- Verifies JWT token in `Authorization: Bearer <token>` header
- Returns `401 Unauthorized` if no token provided
- Returns `403 Forbidden` if email not verified
- Attaches authenticated user to `req.user` for tracking

### 2. **Frontend - Auth Headers**
Updated `src/components/WasteScanner.tsx`:
```typescript
import { getAuthHeaders } from '../lib/auth';

// Send auth token with classify request
const response = await fetch(`${BACKEND_URL}/api/classify`, {
    method: 'POST',
    headers: getAuthHeaders(),  // Includes Authorization: Bearer <token>
    body: JSON.stringify({ image: imageData }),
});
```

**What this does:**
- Automatically includes JWT token from localStorage
- Sends token with every classification request
- Shows clear error message if not authenticated

### 3. **Error Handling**
Enhanced error messages:
```typescript
// Handle authentication errors
if (response.status === 401 || response.status === 403) {
    throw new Error('Please sign in to use the waste scanner');
}
```

**User Experience:**
- Clear message: "Please sign in to use the waste scanner"
- Friendly error modal instead of technical errors
- Users directed to sign in if not authenticated

### 4. **Server Documentation**
Updated `backend/server.ts`:
```
🔍 Classify:  POST /api/classify  [protected]
```

---

## 🔒 How Authentication Works

### Flow Diagram
```
User opens Scanner
    ↓
Check if logged in (localStorage.ecosync_token)
    ↓
    ├─ YES → Capture image
    │         ↓
    │         Send to /api/classify with Bearer token
    │         ↓
    │         Backend verifies token
    │         ↓
    │         ├─ Valid → Process classification
    │         │          ↓
    │         │          Return results + award points
    │         │
    │         └─ Invalid → 401 Unauthorized
    │                     ↓
    │                     Show "Please sign in" message
    │
    └─ NO → Show "Please sign in to use the waste scanner"
```

### JWT Token Storage
- **Location:** `localStorage.ecosync_token`
- **Format:** `Bearer <jwt_token>`
- **Set on:** Login, Signup (verified), OTP verification
- **Removed on:** Logout, Token expiration

### Auth Middleware Logic
Located in `backend/src/middleware/auth.middleware.ts`:

1. **Extract Token:**
   ```typescript
   const authHeader = req.headers.authorization;
   // Expected: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

2. **Verify Token:**
   ```typescript
   jwt.verify(token, process.env.JWT_SECRET)
   ```

3. **Check User:**
   ```typescript
   const user = await User.findById(decoded.userId);
   if (!user.isVerified) return 403;
   ```

4. **Attach User:**
   ```typescript
   req.user = user;  // Available in classify controller
   next();
   ```

---

## 🎯 Benefits

### Security
- ✅ Prevents anonymous usage
- ✅ Ensures only verified users can classify
- ✅ Tracks which user performed classification
- ✅ Protects against API abuse

### User Tracking
- ✅ Award points to authenticated users
- ✅ Track user's recycling history
- ✅ Personalize recommendations
- ✅ Generate user-specific analytics

### Data Integrity
- ✅ Link classifications to user accounts
- ✅ Prevent duplicate/spam classifications
- ✅ Enable user-specific rate limiting
- ✅ Better analytics and insights

---

## 🧪 Testing

### Test 1: Authenticated User
```bash
# Login first
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Response will include: "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Use token in classify request
curl -X POST http://localhost:3001/api/classify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,..."}'

# Expected: 200 OK with classification results
```

### Test 2: Unauthenticated User
```bash
curl -X POST http://localhost:3001/api/classify \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,..."}'

# Expected: 401 Unauthorized
# Response: {"success": false, "message": "Access denied. No token provided."}
```

### Test 3: Invalid Token
```bash
curl -X POST http://localhost:3001/api/classify \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,..."}'

# Expected: 401 Unauthorized
# Response: {"success": false, "message": "Invalid token. Please sign in again."}
```

### Test 4: Unverified Email
```bash
# Use token from user who hasn't verified email

curl -X POST http://localhost:3001/api/classify \
  -H "Authorization: Bearer UNVERIFIED_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,..."}'

# Expected: 403 Forbidden
# Response: {"success": false, "message": "Email not verified. Please verify your account."}
```

---

## 🚀 User Experience

### Logged In Users
1. Open app → Automatically authenticated
2. Click "Scan Item" → Camera opens immediately
3. Capture image → Classification works instantly
4. View results → Points awarded to account

### Not Logged In Users
1. Open app → See landing page
2. Click "Scan Item" → See "Please sign in" message
3. Sign in/Sign up → Create account
4. Verify email (if required)
5. Return to scanner → Now works!

### Error Messages

| Scenario | Message |
|----------|---------|
| No token | "Please sign in to use the waste scanner" |
| Invalid token | "Please sign in to use the waste scanner" |
| Expired token | "Please sign in to use the waste scanner" |
| Email not verified | "Please sign in to use the waste scanner" |
| Network error | "Cannot connect to server. Please check your internet connection." |

---

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
JWT_SECRET=ecosync_super_secret_jwt_key_change_this_in_production_2026
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3001
```

### Token Settings

Located in `backend/src/features/auth/auth.service.ts`:
```typescript
// Token expires in 30 days
jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' })
```

---

## 📱 Mobile App (Capacitor)

The authentication works identically in the mobile app:
- Token stored in device storage (localStorage equivalent)
- Same backend API endpoints
- Same error handling
- Persistent login across app restarts

---

## 🔮 Future Enhancements

### Potential Features:
1. **Rate Limiting:** Limit classifications per user per day
2. **Premium Tiers:** Different limits for free vs premium users
3. **Classification History:** Store user's past classifications
4. **Personalized Tips:** AI learns from user's classification patterns
5. **Social Features:** Share classifications with friends
6. **Achievements:** Unlock badges for classification milestones
7. **Analytics Dashboard:** View personal recycling statistics

### Database Tracking (Future)
Create a `classifications` collection:
```typescript
{
  userId: ObjectId,
  wasteType: String,
  category: String,
  recyclable: Boolean,
  points: Number,
  timestamp: Date,
  image?: String  // Optional: store for later review
}
```

---

## 🐛 Troubleshooting

### "Please sign in to use the waste scanner"

**Cause:** User not authenticated or token expired

**Solution:**
1. Sign in to your account
2. If already signed in, try logging out and back in
3. Check browser console for token errors

### Network Request Failed

**Cause:** Backend not running or CORS issue

**Solution:**
1. Verify backend is running: `curl http://localhost:3001/api/health`
2. Check CORS_ORIGIN in backend/.env includes your frontend URL
3. Restart both servers: `.\start.bat`

### Token Invalid After Login

**Cause:** JWT_SECRET mismatch or token corruption

**Solution:**
1. Clear localStorage: `localStorage.clear()`
2. Sign in again
3. Verify JWT_SECRET matches in backend/.env

---

## 📊 Security Best Practices

✅ **Implemented:**
- JWT tokens with expiration (30 days)
- Bearer token authentication
- Email verification required
- HTTPS in production (recommended)
- Token stored in localStorage (secure for web apps)

⚠️ **Recommended for Production:**
- Use HTTPS only (prevents token interception)
- Shorter token expiration (7 days)
- Refresh token mechanism
- Rate limiting on classify endpoint
- Token rotation on password change
- IP-based suspicious activity detection

---

## 📖 Related Documentation

- [CLASSIFICATION_GUIDE.md](CLASSIFICATION_GUIDE.md) - Complete classification system guide
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick reference for developers
- [APK_BUILD_GUIDE.md](APK_BUILD_GUIDE.md) - Mobile app build guide

---

## ✨ Summary

The AI waste classification feature is now **fully protected** and requires user authentication. This ensures:

1. ✅ **Security** - Only verified users can classify
2. ✅ **Tracking** - Points awarded to correct accounts
3. ✅ **Quality** - Better data integrity
4. ✅ **UX** - Clear error messages for users
5. ✅ **Scalability** - Ready for advanced features

**All set!** Users must now sign in before they can scan and classify waste items. 🎉♻️
