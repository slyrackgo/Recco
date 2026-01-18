# Recco Frontend

A minimalistic React.js frontend for the Recco user management application.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

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
npm run build
```

This creates an optimized production build in the `build` folder.

## Features

- **User Registration**: Simple form to register new users
- **User Listing**: View all registered users
- **User Search**: Search users by name
- **Responsive Design**: Works on desktop and mobile devices
- **Minimalistic UI**: Clean and simple interface

## API Endpoints

The frontend communicates with the following backend endpoints:

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
│   │   ├── Register.js
│   │   ├── Register.css
│   │   ├── UserList.js
│   │   └── UserList.css
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── .env.example
├── .gitignore
└── package.json
```
