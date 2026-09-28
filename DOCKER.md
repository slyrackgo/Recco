# Docker deployment

This repository has separate Docker images for the Spring Boot API and the Vite frontend. Docker itself is free; hosting availability, sleep behavior, resource limits, and database pricing depend on the provider. Netlify can continue hosting the frontend, while the backend image must run on a host that supports Java/Docker containers and can reach a PostgreSQL database.

## Run the full app locally

1. Copy `.env.docker.example` to `.env` in the repository root and replace `DB_PASSWORD` with a strong local password.
2. From the repository root, run `docker compose up --build`.
3. Open `http://localhost:3000`. The API is published at `http://localhost:8080/api` and PostgreSQL data persists in the `postgres-data` volume.
4. Stop the services with `docker compose down`. To also delete the local database, use `docker compose down -v` (this permanently deletes the volume data).

## Deploy the backend container

Use a container-capable Java host (for example, a provider's Docker web service). Configure its build context/root directory as `recco` and Dockerfile as `Dockerfile`; the app listens on the host-provided `PORT` (default 8080).

Set these runtime environment variables on the backend host:

- `SPRING_DATASOURCE_URL`: JDBC URL for a reachable PostgreSQL database, such as `jdbc:postgresql://HOST:5432/DATABASE`
- `DB_USERNAME`: database user
- `DB_PASSWORD`: database password
- `FRONTEND_ORIGIN`: exact public Netlify origin, such as `https://your-site.netlify.app`
- `PORT`: set by the host, or use `8080` if the host requires you to choose it

Do not use `localhost` as the hosted database hostname; inside a container it refers to that same container. Use the database host's private/public connection hostname. Check whether a free database plan provides persistent storage and allows connections from the app host before relying on it.

After the backend is live, verify its API host responds at `/api` paths. Then in Netlify set `VITE_API_URL` to the backend origin ending in `/api`, for example `https://your-api-host.example/api`, and trigger a fresh frontend deploy. `VITE_API_URL` is public client configuration; never put passwords or tokens in it.

## Build images manually

From the repository root, build the backend with context `./recco` and Dockerfile `Dockerfile`. Build the frontend with context `./reccoFront` and Dockerfile `Dockerfile`, passing `VITE_API_URL=https://your-api-host.example/api` as a build argument. The Vite API URL is embedded in the frontend during the image build.
