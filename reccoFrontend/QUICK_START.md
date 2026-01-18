# 🚀 Quick Start Guide

## Prerequisites
- ✅ Node.js installed (v14 or higher)
- ✅ Backend running on `http://localhost:8080`

## Start Frontend (5 minutes)

### Step 1: Navigate to frontend folder
```bash
cd C:\Users\Atai\Desktop\recco\reccoFrontend
```

### Step 2: Install dependencies (first time only)
```bash
npm install
```

### Step 3: Start development server
```bash
npm start
```

The app will automatically open at `http://localhost:3000`

## First Time User Flow

### 1️⃣ You'll see: "Please sign in to continue"
```
Sign In Now  |  Create Account
```

### 2️⃣ Click "Create Account"
```
Enter:
- First Name: Your name
- Last Name: Your surname  
- Email: your@email.com
- Password: your password

Click: Sign Up
```

### 3️⃣ You're in! 🎉
You can now:
- **Users Tab**: See all registered users
- **Register Tab**: Register more users
- Click on user cards to view profiles
- Search for users by name
- **Logout**: Sign out in top right

## Troubleshooting

### ❌ "Failed to fetch users" error
1. Check if backend is running on `http://localhost:8080`
2. Verify you're signed in (token exists)
3. Open DevTools (F12) → Network tab to see the error

### ❌ Can't sign in
1. Make sure backend is running
2. Check email and password are correct
3. Try signing up with a new account

### ❌ Blank screen or errors
1. Check browser console (F12 → Console)
2. Make sure `npm install` ran successfully
3. Try: `npm start` again
4. Clear browser cache (Ctrl+Shift+Delete)

### ❌ Port 3000 already in use
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID {PID} /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

## Common Tasks

### View browser console errors
1. Press `F12` on your keyboard
2. Go to "Console" tab
3. Look for red error messages
4. Screenshot and share if needed

### Check network requests
1. Press `F12` 
2. Go to "Network" tab
3. Perform an action (login, fetch users, etc.)
4. Click on requests to see details
5. Check "Authorization" header in request headers

### Check stored token
1. Press `F12`
2. Go to "Application" tab
3. Click "localStorage" on left
4. Look for "jwtToken" key
5. Copy value to decode it:
   ```
   Base64 decode middle part of token to see payload
   ```

### Clear all data and start fresh
1. Press `F12`
2. Go to "Application" tab
3. Click "Clear site data" button
4. Reload page
5. Sign up again

## File Changes Summary

**New Files:**
- `src/context/AuthContext.js` - Authentication state
- `src/components/AuthModal.js` - Login/Register modal
- `JWT_SETUP_GUIDE.md` - Detailed setup guide
- `JWT_TECHNICAL_DETAILS.md` - Technical documentation

**Updated Files:**
- `src/App.js` - Added auth logic and routing
- `src/App.css` - Updated header styling
- `src/index.js` - Added AuthProvider wrapper
- `src/services/api.js` - Added JWT token support
- `package.json` - Added react-router-dom dependency

**Unchanged but working:**
- `src/components/Register.js` - User registration form
- `src/components/UserList.js` - User listing (now clickable)
- `src/components/UserProfile.js` - Individual user profiles

## Architecture

```
Frontend (React)
    ↓ [Sign In/Sign Up]
    ↓ [Authorization Header: Bearer {JWT}]
Backend (Spring Boot)
    ↓ [Validates JWT]
    ↓ [Returns Data]
Frontend [Stores JWT in localStorage]
```

## API Endpoints Used

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---|
| `/api/auth/register` | POST | Create account | ❌ No |
| `/api/auth/login` | POST | Sign in | ❌ No |
| `/api/users` | GET | List all users | ✅ Yes |
| `/api/users/id/{id}` | GET | Get user by ID | ✅ Yes |
| `/api/users/name/{name}` | GET | Get user by name | ✅ Yes |
| `/api/user` | POST | Register new user | ✅ Yes |

## Tips & Tricks

💡 **Tip 1**: Your login persists across page refreshes
- Close tab and reopen - you'll still be logged in
- Token stored in browser localStorage

💡 **Tip 2**: Token expires after 24 hours
- If you see 401 errors, sign in again
- Don't worry, this is normal!

💡 **Tip 3**: Use email-like text for testing
- Good: `test@example.com`, `john@mail.com`
- Avoid: Special characters in passwords

💡 **Tip 4**: Production deployment
- Change backend JWT secret key
- Use HTTPS always
- Enable database persistence

## Need Help?

1. **Check the docs**
   - `IMPLEMENTATION_SUMMARY.md` - Overview
   - `JWT_SETUP_GUIDE.md` - Detailed setup
   - `JWT_TECHNICAL_DETAILS.md` - Technical info
   - `README.md` - General features

2. **Debug mode**
   - Open DevTools (F12)
   - Check Console for errors
   - Check Network for API calls
   - Check Application → localStorage for token

3. **Restart everything**
   ```bash
   # Kill frontend
   Ctrl+C
   
   # Kill backend (if running in terminal)
   Ctrl+C
   
   # Restart both
   npm start          # In frontend folder
   mvn spring-boot:run  # In backend folder
   ```

---

**Happy coding! 🎉**

For more details, see the documentation files in the `reccoFrontend` folder.
