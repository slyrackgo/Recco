# Recco Frontend

A minimalistic React.js frontend for the Recco user management application with JWT authentication.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend API running on `http://localhost:8080`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Update `.env` with your backend API URL (default is `http://localhost:8080/api`)

### Running the Application

Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

### Building for Production

```bash
npm build
```

This creates an optimized production build in the `build` folder.

## Features

### Authentication
- **Sign Up**: Create a new account with email and password
- **Sign In**: Login with existing credentials
- **JWT Tokens**: Secure authentication with JWT tokens stored in localStorage
- **Logout**: Safely exit the application

### User Management (Requires Authentication)
- **User Registration**: Create new user accounts (after signing up)
- **User Listing**: View all registered users
- **User Profiles**: Click on any user to view their detailed profile
- **User Search**: Search users by name
- **Responsive Design**: Works on desktop and mobile devices

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in and get JWT token

### Protected Endpoints (Require Authentication)
- `POST /api/user` - Register a new user
- `GET /api/users` - Get all users
- `GET /api/users/name/{name}` - Get user by name
- `GET /api/users/id/{id}` - Get user by ID

## Project Structure

```
reccoFrontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── AuthModal.js        # Login/Register modal
│   │   ├── AuthModal.css
│   │   ├── Register.js         # User registration form
│   │   ├── Register.css
│   │   ├── UserList.js         # Display all users
│   │   ├── UserList.css
│   │   ├── UserProfile.js      # Individual user profile
│   │   └── UserProfile.css
│   ├── context/
│   │   └── AuthContext.js      # Authentication state management
│   ├── services/
│   │   └── api.js              # API calls with JWT handling
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── .env.example
├── .gitignore
└── package.json
```

## How It Works

### Authentication Flow

1. **Sign Up/In**: User submits credentials through `AuthModal`
2. **JWT Token**: Backend returns JWT token on successful authentication
3. **Token Storage**: Token is stored in `localStorage` with key `jwtToken`
4. **Protected Requests**: All API requests automatically include `Authorization: Bearer {token}` header
5. **Logout**: Token is removed from localStorage

### State Management

- **AuthContext**: Manages authentication state globally
  - `token`: JWT token from localStorage
  - `user`: Current user email from JWT payload
  - `isAuthenticated`: Boolean flag for protected routes
  - `login()`: Store token and update user state
  - `logout()`: Clear token and reset state

### JWT Token Structure

The JWT token contains a `sub` claim with the user's email:
```json
{
  "sub": "user@example.com",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## Environment Variables

```env
REACT_APP_API_URL=http://localhost:8080/api
```

## Troubleshooting

### "Failed to fetch users" error
- Ensure backend is running on `http://localhost:8080`
- Check CORS configuration in backend SecurityConfig
- Verify JWT token is valid (not expired)

### Authentication not persisting after refresh
- Check if `jwtToken` exists in browser localStorage
- Verify token is still valid (24-hour expiration)

### 401 Unauthorized errors
- Token may have expired - sign in again
- Check if Authorization header is being sent correctly
- Verify backend is properly validating JWT

## Technologies Used

- React 18.2.0
- React Router DOM 6.20.0
- Axios (HTTP client)
- CSS3 (Vanilla CSS, no external frameworks)

