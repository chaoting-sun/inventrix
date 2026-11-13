# Inventrix

A full-stack e-commerce platform with inventory management, order processing, and analytics.

## Features

- Virtual storefront for browsing and ordering products
- Product catalog management with pricing and descriptions
- Order processing and fulfillment tracking
- Real-time inventory management and stock control
- User authentication and role-based authorization (Admin/Customer)
- Business reporting and analytics

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 17

## Getting Started

### Prerequisites

- Node.js 22
- pnpm
- Docker (or Podman) for a local PostgreSQL
- AWS credentials configured

### Installation

```bash
pnpm install
```

### Database

The API reads its PostgreSQL connection string from the `DATABASE_URL` environment variable only. It does not start without it.

The `db` service in `docker-compose.yml` does not publish a port. To run the API or the tests on your machine, start a separate local PostgreSQL:

```bash
docker run -d --name inventrix-db -p 5432:5432 \
  -e POSTGRES_USER=inventrix -e POSTGRES_PASSWORD=inventrix -e POSTGRES_DB=inventrix \
  postgres:17-alpine
export DATABASE_URL=postgres://inventrix:inventrix@localhost:5432/inventrix
```

On startup the API creates the tables, adds missing columns to an existing database, and seeds the default users and products when the `users` table is empty.

To remove the local database and its data:

```bash
docker rm -f inventrix-db
```

### AWS Configuration

For AI image generation, configure AWS credentials:

```bash
# Set environment variables
export AWS_REGION=your_region
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key

# Or use AWS CLI
aws configure
```

### Development

Start the local PostgreSQL and set `DATABASE_URL` first (see [Database](#database)).

```bash
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Tests

```bash
# Unit tests only. The PostgreSQL tests are skipped.
pnpm --filter api test

# Also runs the PostgreSQL tests. They add rows, so use a throwaway database.
DATABASE_URL=postgres://inventrix:inventrix@localhost:5432/inventrix pnpm --filter api test
```

### Production Build

```bash
pnpm build
pnpm start
```

### Docker

```bash
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
docker compose up --build
```

- App: http://localhost:8080

### Deploying to AWS (ECS Fargate + RDS, us-east-1)

The CDK app in `infra/` defines one Fargate service (nginx + API) behind an ALB and CloudFront (HTTPS), RDS for PostgreSQL (single AZ), and Secrets Manager secrets for the database and `JWT_SECRET`.

See [infra/README.md](infra/README.md) for prerequisites, deploy, smoke test and rollback.

### Deploying to AWS (legacy EC2 script)

```bash
chmod +x deploy.sh
./deploy.sh
```

## Default Users

- **Admin**: admin@inventrix.com / admin123
- **Customer**: customer@inventrix.com / customer123

## Project Structure

```
inventrix/
├── packages/
│   ├── api/          # Express backend
│   └── frontend/     # React frontend
```

# License

This library is licensed under the MIT-0 License. See the LICENSE file.