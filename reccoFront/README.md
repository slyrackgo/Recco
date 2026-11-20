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

## Deploy the full app to Vercel

The repository-root `vercel.json` defines two Vercel Services: this frontend and the
Spring Boot API. Both use the existing Dockerfiles and are routed through one
deployment, so the browser can call `/api` on the same origin. Vercel Services
and its Container Runtime are currently in beta.

1. Import the repository into Vercel and set the project root directory to the
   repository root (`.`), not `reccoFront`.
2. Install a PostgreSQL integration from the Vercel Marketplace (Neon is the
   recommended option). In the backend service's runtime environment, make the
   database host, port, name, username, and password available as `PGHOST`,
   `PGPORT`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD`. Alternatively, configure
   `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and
   `SPRING_DATASOURCE_PASSWORD`. Keep credentials in Vercel environment
   variables; never use `VITE_*` for secrets.
3. Deploy and verify both services and database connectivity before changing
   DNS or shutting down the existing API/database.

Vercel hosts the application services, while PostgreSQL is supplied by the
Marketplace provider and connected to Vercel. Deploying this configuration
does not copy existing database records; migrate/verify the old PostgreSQL data
before switching production traffic. The previous Netlify and Render setup can
remain available until the Vercel deployment is verified.
