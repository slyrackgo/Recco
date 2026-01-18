# Recco JWT Authentication Implementation Guide

## Frontend Setup Complete ✅

Your React frontend has been fully integrated with JWT authentication! Here's what was implemented:

### New Components Added

1. **AuthContext** (`src/context/AuthContext.js`)
   - Global authentication state management
   - Manages JWT tokens and user information
   - Persists authentication across page refreshes

2. **AuthModal** (`src/components/AuthModal.js`)
   - Login and Sign Up modal component
   - Handles user registration and authentication
   - Auto-switches between login/register modes

3. **Updated App.js**
   - Added header with Sign In/Sign Up/Logout buttons
   - Protected routes - only authenticated users can access main features
   - Unauthenticated landing page with CTA buttons

### How to Run

#### 1. Backend Setup
```bash
cd recco
# Rebuild your backend to ensure all changes are compiled
mvn clean install

# Run the backend
mvn spring-boot:run
# Backend will run on http://localhost:8080
```

#### 2. Frontend Setup
```bash
cd reccoFrontend

# Install dependencies (if not already done)
npm install

# Start development server
npm start
# Frontend will run on http://localhost:3000
```

### Features

✅ **Sign Up**
- New users can create accounts with email and password
- Auto-login after successful registration

✅ **Sign In**
- Existing users can login with email and password
- JWT token stored in localStorage (24-hour expiration)

✅ **Protected Features** (Available only after login)
- Register new users
- View all users
- Search users by name
- View user profiles

✅ **Logout**
- Clear JWT token from browser
- Return to login screen

### API Integration

All API requests automatically include the JWT token in the Authorization header:
```
Authorization: Bearer {jwtToken}
```

The token is extracted from localStorage by the axios interceptor in `services/api.js`.

### Troubleshooting

**Issue: "Please sign in to continue" page appears on start**
- This is normal - you need to sign up or sign in
- Click "Sign In Now" or "Create Account"

**Issue: 401 Unauthorized errors**
- Your JWT token may have expired (24-hour limit)
- Sign out and sign in again

**Issue: CORS errors**
- Make sure backend SecurityConfig is properly configured
- Verify `/api/auth/**` endpoints allow unauthenticated access
- Other `/api/**` endpoints require valid JWT token

**Issue: Can't find users after login**
- Ensure backend is running on `http://localhost:8080`
- Check that the `/api/users` endpoint is accessible with your JWT token
- Try clicking "Refresh" button in the Users tab

### File Structure

```
reccoFrontend/
├── src/
│   ├── components/
│   │   ├── AuthModal.js          ← New: Login/Register modal
│   │   ├── AuthModal.css         ← New: Modal styling
│   │   ├── Register.js           ← Updated: User registration
│   │   ├── UserList.js           ← Updated: Clickable user cards
│   │   ├── UserProfile.js        ← Individual user profile page
│   │   └── UserProfile.css
│   ├── context/
│   │   └── AuthContext.js        ← New: Auth state management
│   ├── services/
│   │   └── api.js                ← Updated: JWT token integration
│   ├── App.js                    ← Updated: Header with auth buttons
│   └── App.css                   ← Updated: Header styling
└── index.js                       ← Updated: AuthProvider wrapper
```

### Next Steps

1. Make sure both backend and frontend are running
2. Open http://localhost:3000 in your browser
3. Click "Sign Up" to create your first account
4. After successful registration, you'll be logged in
5. Explore the user management features!

### Support

If you encounter any issues:
1. Check that all dependencies are installed (`npm install`)
2. Verify backend is running (`http://localhost:8080/api/auth/login` should be accessible)
3. Check browser console for error messages (F12 → Console tab)
4. Check backend logs for detailed error information
