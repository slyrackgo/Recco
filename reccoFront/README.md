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

## Deploy the frontend to Netlify

The repository-root `netlify.toml` configures Netlify to build this Vite app and publish `dist`, including a fallback for React Router routes. Connect the GitHub repository to Netlify and deploy the `main` branch.

In Netlify, open **Site configuration → Environment variables** and add:

- `VITE_API_URL` = `https://YOUR-BACKEND-HOST/api`

Then trigger a new deploy. Do not put database passwords, JWT secrets, or other private credentials in `VITE_*` variables; those are included in the public browser bundle.

Netlify hosts the static frontend only. The Spring Boot API and PostgreSQL database must also be hosted and reachable on the internet. Configure the backend's `FRONTEND_ORIGIN` environment variable to the exact Netlify site origin, such as `https://your-site.netlify.app`, and configure its database connection using `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`.
