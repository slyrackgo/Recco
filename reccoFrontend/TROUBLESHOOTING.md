# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: "Please sign in to continue" appears after restarting

**Problem**: You were logged in, refreshed the page, and now need to sign in again.

**Cause**: Token in localStorage expired or was cleared.

**Solution**:
1. Check if token exists: DevTools (F12) → Application → localStorage → "jwtToken"
2. If empty, the 24-hour session expired → Sign in again
3. If it exists but you can't access features, token may be invalid → Sign in again

**Prevention**: Token lasts 24 hours. Set a reminder if needed.

---

### Issue 2: "Failed to fetch users" error

**Problem**: Users tab shows error when trying to load users.

**Cause**: 
- Backend not running
- Wrong API URL
- Invalid JWT token
- CORS issue

**Solutions**:

**Step 1**: Check if backend is running
```bash
# In another terminal, check if this works
curl http://localhost:8080/api/auth/login -X OPTIONS
# Should return 200 OK
```

**Step 2**: Check backend is on port 8080
```bash
# Backend should output something like:
# Started ReccoApplication in X seconds
```

**Step 3**: Verify you're logged in
- Check localStorage for "jwtToken"
- If missing, sign in again

**Step 4**: Check browser console
- Press F12 → Console tab
- Look for red error messages
- Screenshot and share the error

**Step 5**: Check network request
- Press F12 → Network tab
- Click "Users" tab in app
- Look for /api/users request
- Click it and check:
  - Status code (should be 200)
  - Authorization header (should say "Bearer ...")
  - Response (should show user data)

---

### Issue 3: Can't sign in with correct email/password

**Problem**: Sign in fails even with correct credentials.

**Cause**:
- User account not created yet
- Wrong email/password
- Backend not running
- Database issue

**Solutions**:

**Option 1**: Create new account instead
- Click "Sign Up"
- Fill in all fields with new email
- Click "Sign Up"
- Should auto-login

**Option 2**: Verify account exists
- Sign in with different device/browser
- If works there, localStorage issue locally
- Clear localStorage and try again

**Option 3**: Check backend logs
- Look for error messages in backend terminal
- Errors starting with "Error:" show what went wrong
- Common: "Invalid email or password", "Email is already in use!"

**Option 4**: Database check
- Make sure PostgreSQL is running
- Check database connection in application.yaml
- Verify DB_USERNAME and DB_PASSWORD environment variables

---

### Issue 4: 401 Unauthorized errors

**Problem**: Getting 401 errors when trying to access features.

**Cause**:
- JWT token expired (24 hours old)
- Token invalid or corrupted
- Token not being sent in request
- Backend secret key mismatch

**Solutions**:

**Step 1**: Sign in again
- Click Logout
- Click Sign In
- Enter credentials
- Should work now

**Step 2**: Verify token in header
- Press F12 → Network tab
- Make request (click Users tab)
- Click /api/users request
- Go to Request Headers tab
- Look for "Authorization: Bearer ..."
- If not there, axios interceptor isn't working

**Step 3**: Check token format
- Press F12 → Console tab
- Paste: `localStorage.getItem('jwtToken')`
- Should return something like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI...`
- If empty, token doesn't exist → sign in again

**Step 4**: Decode and check token
- Press F12 → Console tab
- Paste:
```javascript
const token = localStorage.getItem('jwtToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
```
- Check "exp" field (expiration)
- If less than current time, token expired

---

### Issue 5: Modal won't open / Sign In button doesn't work

**Problem**: Clicking Sign In or Sign Up button doesn't open modal.

**Cause**:
- JavaScript error
- Component not rendered
- Event handler not working

**Solutions**:

**Step 1**: Check browser console
- Press F12 → Console tab
- Look for red error messages
- Screenshot any errors you see

**Step 2**: Check if components loaded
- Open DevTools
- Go to React tab (if React DevTools installed)
- Look for App → AuthModal in component tree
- If not there, something is wrong with imports

**Step 3**: Check file structure
- Verify these files exist:
  - `src/components/AuthModal.js`
  - `src/components/AuthModal.css`
  - `src/context/AuthContext.js`
- If files missing, run: `npm install` again

**Step 4**: Restart frontend
```bash
# Stop the app
Ctrl+C

# Restart it
npm start
```

---

### Issue 6: Styling looks wrong / buttons not styled

**Problem**: UI doesn't look like the guide, buttons not styled.

**Cause**:
- CSS files not loading
- CSS not compiled
- Browser cache issue

**Solutions**:

**Step 1**: Clear browser cache
- Press Ctrl+Shift+Delete
- Clear "Cached images and files"
- Reload page

**Step 2**: Check CSS files exist
- Verify `src/App.css` is updated
- Verify `src/components/AuthModal.css` exists
- Verify `src/components/UserList.css` has cursor: pointer

**Step 3**: Hard refresh
- Press Ctrl+F5 (or Cmd+Shift+R on Mac)
- Forces full reload including CSS

**Step 4**: Restart frontend
```bash
Ctrl+C
npm start
```

---

### Issue 7: Can't register new user / Error on signup

**Problem**: Sign up form doesn't work or shows error.

**Cause**:
- Email already exists
- Network error
- Backend validation failing
- Database error

**Solutions**:

**Step 1**: Use different email
- Use email format: `test+{time}@example.com`
- Changes every refresh for testing

**Step 2**: Check error message
- Read the red error text
- "Email is already in use!" → Use different email
- "Error: ..." → See what the specific error is

**Step 3**: Verify all fields filled
- First Name: Required
- Last Name: Required
- Email: Required, must be valid email
- Password: Required, no length limit but use secure password

**Step 4**: Check backend logs
- Look for errors in backend terminal
- Should show validation errors
- Common: Email constraints, null pointer exceptions

---

### Issue 8: Clicking user card doesn't go to profile

**Problem**: Clicking user card in Users tab doesn't navigate to profile.

**Cause**:
- React Router not working
- onClick handler not firing
- Navigation not configured

**Solutions**:

**Step 1**: Check console
- Press F12 → Console
- Click user card
- Check for any error messages

**Step 2**: Verify file changes
- Check `src/components/UserList.js` has cursor: pointer style
- Check it calls `navigate('/profile/' + userId)`
- Check `src/App.js` has route configured for `/profile/:userId`

**Step 3**: Restart frontend
```bash
Ctrl+C
npm start
```

---

### Issue 9: Backend won't start / Port 8080 in use

**Problem**: Backend fails to start or port 8080 already in use.

**Cause**:
- Another service using port 8080
- Previous instance still running
- Port binding issue

**Solutions**:

**Option 1**: Kill existing process
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID {PID_NUMBER} /F

# macOS/Linux
lsof -ti:8080 | xargs kill -9
```

**Option 2**: Use different port
```bash
# Set custom port
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

**Option 3**: Check backend code
```bash
cd recco
mvn clean install
mvn spring-boot:run
```

---

### Issue 10: Frontend won't start / Port 3000 in use

**Problem**: Frontend fails to start or port 3000 already in use.

**Cause**:
- Another service using port 3000
- Previous React instance still running
- Port binding issue

**Solutions**:

**Option 1**: Kill existing process
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID {PID_NUMBER} /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**Option 2**: Use different port
```bash
set PORT=3001 && npm start
# or
PORT=3001 npm start
```

**Option 3**: Install dependencies and restart
```bash
cd reccoFrontend
npm install
npm start
```

---

### Issue 11: Database connection error

**Problem**: Backend shows "Cannot get a connection" error.

**Cause**:
- PostgreSQL not running
- Wrong database credentials
- Database doesn't exist

**Solutions**:

**Step 1**: Check PostgreSQL is running
```bash
# Windows: Check Services
# macOS: brew services list
# Linux: sudo systemctl status postgresql
```

**Step 2**: Check database exists
```bash
# Connect to PostgreSQL and verify "userDB" exists
```

**Step 3**: Check environment variables
- Verify `DB_USERNAME` is set correctly
- Verify `DB_PASSWORD` is set correctly
- Verify `application.yaml` database URL is correct

**Step 4**: Create database if missing
```bash
# In PostgreSQL
CREATE DATABASE userDB;
```

---

### Issue 12: localStorage quota exceeded

**Problem**: Error about localStorage being full.

**Cause**:
- Too much data stored
- Corrupted localStorage
- Browser quota exceeded

**Solutions**:

**Step 1**: Clear localStorage
```bash
# In browser console
localStorage.clear()
```

**Step 2**: Reload page
- Refresh the page
- Sign in again
- Should work now

**Step 3**: Clear browser data
- Press Ctrl+Shift+Delete
- Clear "Cookies and other site data"
- Reload page

---

### Issue 13: CORS errors

**Problem**: Getting CORS (Cross-Origin) errors in console.

**Cause**:
- Backend CORS not properly configured
- Wrong frontend origin
- Credentials not allowed

**Solutions**:

**Step 1**: Verify backend CORS config
- Check `SecurityConfig.java` has:
```java
.corsConfigurationSource(corsConfigurationSource)
```

**Step 2**: Check allowed origins
- Should include `http://localhost:3000`
- Should include production domain when deployed

**Step 3**: Verify CorsConfigurationSource bean
- Look for CorsConfigurationSource in backend
- Should have `setAllowedOrigins()` including localhost:3000

**Step 4**: Check console error details
- Error will say something about "CORS policy"
- Extract which origin is being rejected
- Add it to backend CORS config

---

### Issue 14: "undefined is not a function" errors

**Problem**: Console shows "xyz is not a function" errors.

**Cause**:
- Import missing
- Function not exported
- Wrong function name

**Solutions**:

**Step 1**: Check all imports
- Verify `src/App.js` imports AuthProvider
- Verify `src/components/AuthModal.js` exists
- Verify `src/context/AuthContext.js` exists

**Step 2**: Check exports
- All components should export default
- AuthContext should export both AuthProvider and useAuth

**Step 3**: Restart frontend
```bash
Ctrl+C
npm install
npm start
```

---

### Issue 15: Token not persisting across page reload

**Problem**: After refresh, you're logged out even though token is in localStorage.

**Cause**:
- AuthContext not initializing properly
- Token validation failing
- localStorage being cleared

**Solutions**:

**Step 1**: Check token exists
- DevTools → Application → localStorage
- Look for "jwtToken" key
- If missing, token wasn't saved

**Step 2**: Check token is valid
- Paste in console:
```javascript
const token = localStorage.getItem('jwtToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expires:', new Date(payload.exp * 1000));
console.log('Now:', new Date());
```
- If "Expires" is before "Now", token expired

**Step 3**: Check loading state
- App might not be done initializing
- Wait a moment for AuthContext to load
- Check browser console for errors

---

## General Debugging Steps

### When something doesn't work:

1. **Check Browser Console (F12)**
   - Red errors show problems
   - Warning show potential issues
   - Screenshot errors for help

2. **Check Network Tab (F12)**
   - See all API requests
   - Check response status codes
   - Verify request headers

3. **Check localStorage (F12)**
   - DevTools → Application → localStorage
   - Look for "jwtToken"
   - Check it exists and isn't empty

4. **Check Backend Logs**
   - Terminal where backend runs
   - Shows errors and debug info
   - Screenshot any error messages

5. **Try These in Order**
   - Page refresh
   - Clear browser cache (Ctrl+Shift+Delete)
   - Restart frontend (Ctrl+C, npm start)
   - Restart backend
   - Clear localStorage and start fresh

6. **Check File Existence**
   - Verify all files created/updated
   - Run `npm install` to ensure dependencies
   - Check no files were deleted

7. **Ask for Help**
   - Screenshot the error
   - Share console output
   - Share network request details
   - Describe what you did before error

---

## Quick Reference

### Files to Check
- `src/context/AuthContext.js` - Auth state
- `src/components/AuthModal.js` - Login/Register
- `src/App.js` - Main app logic
- `src/services/api.js` - API calls
- `package.json` - Dependencies

### Common Commands
```bash
npm install                    # Install dependencies
npm start                      # Start frontend
npm run build                  # Build for production
Ctrl+C                         # Stop running app
```

### Debug Shortcuts
```javascript
// Check token
localStorage.getItem('jwtToken')

// Decode token
JSON.parse(atob(localStorage.getItem('jwtToken').split('.')[1]))

// Clear data
localStorage.clear()
sessionStorage.clear()
```

### Browser Tools
- F12 - Open DevTools
- Ctrl+Shift+Delete - Clear browser data
- Ctrl+F5 - Hard refresh
- Ctrl+Shift+I - Inspect element

---

## When All Else Fails

1. **Nuclear Option - Start Fresh**
   ```bash
   # Backend
   cd recco
   mvn clean install
   mvn spring-boot:run
   
   # Frontend (new terminal)
   cd reccoFrontend
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```

2. **Check Git Status**
   ```bash
   git status
   git log --oneline -5
   # Makes sure no accidental changes
   ```

3. **Ask for Help**
   - Include terminal logs
   - Include browser console errors
   - Include network request details
   - Include file listing of reccoFrontend/src

---

**Remember**: Most issues are solved by:
1. Restarting the app
2. Clearing cache
3. Checking logs
4. Signing in again

You've got this! 💪
