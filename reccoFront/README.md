# Recco frontend

React UI for the Recco Spring Boot API.

## Run locally

1. Start the backend on `http://localhost:8080`.
2. From this folder:

```bash
npm install
npm start
```

The app runs at `http://localhost:3000` and proxies `/api` to the backend, so you do not need CORS for local development.

Set `VITE_API_URL` (see `.env.example`) only if the API is on a different origin.
