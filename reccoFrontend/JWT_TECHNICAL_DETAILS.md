# JWT Authentication - Technical Details

## Overview

The frontend now implements complete JWT (JSON Web Token) authentication with the following flow:

```
User Input
    ↓
AuthModal (Sign Up/Sign In)
    ↓
API Call (axios POST to /auth/login or /auth/register)
    ↓
Backend Validates & Returns JWT Token
    ↓
Frontend Stores Token in localStorage
    ↓
AuthContext Updates Global State
    ↓
Protected Routes & Components Render
    ↓
All Subsequent Requests Include Token in Authorization Header
```

## Component Architecture

### 1. AuthContext (`src/context/AuthContext.js`)

**Purpose**: Global state management for authentication

**State Variables**:
- `token`: JWT token string (or null if not authenticated)
- `user`: Object with user email from JWT `sub` claim
- `loading`: Boolean indicating if auth state is being loaded
- `isAuthenticated`: Boolean flag (true if token exists)

**Methods**:
```javascript
login(jwtToken)     // Store token & extract user info
logout()            // Clear token & reset state
```

**Token Persistence**:
- Token is stored in `localStorage` with key `jwtToken`
- Token is extracted from localStorage on app initialization
- Token is cleared on logout

### 2. AuthModal (`src/components/AuthModal.js`)

**Purpose**: Modal component for user authentication (Sign Up/Sign In)

**Features**:
- Toggles between login and register modes
- Form validation (email format, required fields)
- Error handling with user-friendly messages
- Auto-login after successful registration

**API Calls**:
```javascript
POST /api/auth/login       // { email, password } → { token }
POST /api/auth/register    // { name, surname, email, password } → { user object }
```

### 3. Updated App.js

**Changes**:
- Wraps content with authentication check
- Header displays different buttons based on auth state:
  - **Not Authenticated**: "Sign In" + "Sign Up" buttons
  - **Authenticated**: User email + "Logout" button
- Protected routes: Users can only access main features when authenticated
- Unauthenticated landing page with CTA buttons

**Conditional Rendering**:
```javascript
{isAuthenticated ? (
  // Show main app (Users, Register tabs)
) : (
  // Show auth message asking to sign in
)}
```

### 4. API Interceptor (`src/services/api.js`)

**Purpose**: Automatically attach JWT token to all requests

**Interceptor Configuration**:
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Effect**: Every API request automatically includes:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## JWT Token Structure

The backend generates JWT tokens with:
- **Algorithm**: HS256 (HMAC SHA-256)
- **Subject (sub)**: User's email address
- **Issued At (iat)**: Token creation timestamp
- **Expiration (exp)**: 24 hours from creation (86400000 ms)
- **Signing Key**: Secret key stored in backend

**Token Payload Example**:
```json
{
  "sub": "user@example.com",
  "iat": 1705631234,
  "exp": 1705717634
}
```

**Token Storage**:
- Stored in browser's `localStorage` with key `jwtToken`
- Automatically appended to all requests via axios interceptor
- Cleared from localStorage on logout

## Authentication Flow Diagrams

### 1. User Sign Up Flow

```
User clicks "Sign Up"
    ↓
AuthModal opens in register mode
    ↓
User fills in: name, surname, email, password
    ↓
POST /api/auth/register
    ↓
Backend validates & creates user (if email not in use)
    ↓
Auto-login: POST /api/auth/login with same credentials
    ↓
Backend returns { token: "..." }
    ↓
Frontend: login(token)
    ↓
AuthContext updated with token and user email
    ↓
localStorage.jwtToken = "..."
    ↓
App redirects to main page (Users tab)
```

### 2. User Sign In Flow

```
User clicks "Sign In"
    ↓
AuthModal opens in login mode
    ↓
User fills in: email, password
    ↓
POST /api/auth/login
    ↓
Backend validates credentials
    ↓
If valid: return { token: "..." }
If invalid: return 401 error
    ↓
Frontend: login(token) or show error
    ↓
AuthContext updated with token
    ↓
localStorage.jwtToken = "..."
    ↓
App renders protected features
```

### 3. Accessing Protected Features

```
User clicks "Users" tab
    ↓
GET /api/users (with Authorization header)
    ↓
Axios interceptor adds: Authorization: Bearer {token}
    ↓
Backend receives request with JWT
    ↓
AuthTokenFilter validates JWT
    ↓
If valid: process request
If invalid/expired: return 401 Unauthorized
    ↓
Frontend shows users or error message
```

### 4. Logout Flow

```
User clicks "Logout"
    ↓
logout() called from AuthContext
    ↓
localStorage.removeItem('jwtToken')
    ↓
token = null
    ↓
user = null
    ↓
App re-renders with auth message
    ↓
User sees "Sign In" button again
```

## Security Considerations

### Token Storage

**Choice**: localStorage (Browser Storage)
- ✅ Persists across page refreshes
- ✅ Simple to implement
- ⚠️ Vulnerable to XSS attacks (mitigated by secure backend)

**Recommendation**: Only use HTTPS in production

### Token Transmission

**Method**: Authorization Header
```
Authorization: Bearer {token}
```
- ✅ Prevents CSRF attacks (not sent with regular form submissions)
- ✅ Standard HTTP authentication method
- ✅ Works with CORS

### Token Expiration

**Duration**: 24 hours
- Users must re-authenticate daily
- Prevents long-lived tokens from being compromised
- Token expiration handled by backend JWT validation

## Error Handling

### Common Error Scenarios

1. **Invalid Credentials**
   ```
   POST /api/auth/login
   Response: 401 "Error: Invalid email or password"
   Frontend: Show error in AuthModal
   ```

2. **Email Already Registered**
   ```
   POST /api/auth/register
   Response: 400 "Error: Email is already in use!"
   Frontend: Show error in AuthModal
   ```

3. **Expired Token**
   ```
   GET /api/users (with expired token)
   Response: 401 Unauthorized
   Frontend: Could trigger logout and show re-auth prompt
   ```

4. **Network Error**
   ```
   POST /api/auth/login (no connection)
   Error: Network Error
   Frontend: Show error message
   ```

## Testing the Authentication

### Test Case 1: Sign Up
```
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill in:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: password123
4. Click "Sign Up"
5. Should be logged in, see "Users" tab
```

### Test Case 2: Sign In
```
1. Click "Logout"
2. Click "Sign In"
3. Fill in:
   - Email: john@example.com
   - Password: password123
4. Click "Sign In"
5. Should see users list
```

### Test Case 3: Protected Routes
```
1. Sign out
2. Type http://localhost:3000/profile/123 in URL bar
3. Should redirect to auth message (not show profile)
4. Sign in again
5. Now profile page should be accessible
```

### Test Case 4: Token Expiration
```
1. Sign in
2. Open Developer Tools (F12)
3. Go to Application → localStorage
4. Find and manually delete "jwtToken"
5. Try to access protected features
6. Should show error or redirect to login
```

## Debugging Tips

### Check Stored Token

In browser console (F12):
```javascript
localStorage.getItem('jwtToken')  // Returns token or null
```

### Decode JWT Token

In browser console:
```javascript
const token = localStorage.getItem('jwtToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);  // Shows { sub: "email@...", iat, exp }
```

### Monitor API Requests

In browser DevTools (F12):
1. Go to Network tab
2. Perform an action (fetch users, login, etc.)
3. Click on the request
4. Check Headers tab for "Authorization: Bearer ..."
5. Check Response tab for server response

### Check Auth State

In browser console:
```javascript
// React DevTools Console
// Navigate to App component and check AuthContext value
```

## Production Deployment Checklist

- [ ] Use HTTPS only (JWT vulnerable over HTTP)
- [ ] Change backend secret key in JwtUtils (not "your_very_secret_key_...")
- [ ] Set appropriate token expiration time (24 hours may be too long)
- [ ] Implement refresh token mechanism (optional but recommended)
- [ ] Add rate limiting to /api/auth endpoints
- [ ] Add CSRF protection for state-changing operations
- [ ] Monitor for suspicious authentication patterns
- [ ] Keep dependencies updated (axios, react, etc.)
