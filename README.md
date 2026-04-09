# FinTrack API

A Node.js REST API for financial dashboard management with role-based access control (RBAC). Built with Express.js, Prisma ORM, and Supabase PostgreSQL. Features JWT authentication, schema validation, rate limiting, and comprehensive API documentation via Swagger UI.

## Features

- **JWT Authentication**: Secure token-based authentication with password hashing (bcryptjs).
- **Role-Based Access Control (RBAC)**: Three user roles with granular permissions:
  - **VIEWER**: Access dashboard overview.
  - **ANALYST**: View financial records and dashboard insights.
  - **ADMIN**: Full CRUD on records, user management.
- **Schema Validation**: Input validation using Zod for users and transactions.
- **Rate Limiting**: Global rate limit of 10 requests per minute per IP to prevent abuse.
- **Database**: Prisma ORM with Supabase PostgreSQL for data persistence.
- **API Documentation**: Interactive Swagger UI at `/api-docs` for testing and exploring endpoints.
- **Middleware**: Authentication, role authorization, CORS, and error handling.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL) via Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **Rate Limiting**: express-rate-limit
- **CORS**: Enabled
- **Documentation**: Swagger UI (swagger-ui-express)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

### 1. Clone and Install

```bash
git clone <repository-url>
cd FinTrack_API
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory by copying the provided `.env.example`:

```bash
cp .env.example .env
```

Then update the values in `.env` to match your local setup.

Example `.env` structure:

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/fintrack"
DIRECT_URL="postgresql://postgres:postgres@db:5432/fintrack"
JWT_SECRET="Secret_Key_For_JWT"
PORT=3000
```

> If you are not using a `db` host alias, replace `db` with the hostname or IP address of your PostgreSQL server.

### 3. Local Container Run

This project includes a `docker-compose.yml` that builds the API container and loads environment variables from `.env`.

1. Build and start the container:

```bash
docker compose up --build
```

2. Visit the API at:

```text
http://localhost:3000
```

3. For API docs, open:

```text
http://localhost:3000/api-docs
```

4. To stop the container, press `Ctrl+C` in the terminal or run:

```bash
docker compose down
```

### 4. Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com), or use a local PostgreSQL instance.
2. Run Prisma migrations to set up the database schema:

```bash
npm run prisma:migrate
npm run prisma:generate
```

3. (Optional) Seed the database:

```bash
npm run prisma:seed
```

### 5. Start the Server Locally

If you want to run the app outside Docker, use one of the commands below:

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server runs on `http://localhost:3000`.

## API Endpoints

All endpoints return JSON responses with `success` (boolean) and `message` (string) fields. Protected routes require a Bearer token in the `Authorization` header.

### Authentication

- **POST /api/auth/register**
  - Body: `{ "name": "string", "email": "string", "password": "string" }`
  - Response: User creation confirmation.
  - Public endpoint.

- **POST /api/auth/login**
  - Body: `{ "email": "string", "password": "string" }`
  - Response: JWT token and user info.
  - Public endpoint.

### Financial Records

- **GET /api/records** (ANALYST, ADMIN)
  - Query params: `type` (INCOME/EXPENSE), `category`, `from` (date), `to` (date)
  - Response: List of records (filtered).

- **POST /api/records** (ADMIN)
  - Body: `{ "amount": number, "description": "string", "category": "string" }`
  - Response: Record creation confirmation.

- **PATCH /api/records/:id** (ADMIN)
  - Body: Partial update fields (amount, description, category).
  - Response: Update confirmation.

- **DELETE /api/records/:id** (ADMIN)
  - Response: Soft delete confirmation.

### User Management (ADMIN only)

- **GET /api/users**
  - Response: List of all users.

- **PATCH /api/users/:id/role**
  - Body: `{ "role": "VIEWER" | "ANALYST" | "ADMIN" }`
  - Response: Role update confirmation.

- **PATCH /api/users/:id/status**
  - Body: `{ "status": "ACTIVE" | "INACTIVE" }`
  - Response: Status update confirmation.

### Dashboard

- **GET /api/dashboard/overview** (VIEWER, ANALYST, ADMIN)
  - Query: `trendType` ("monthly" | "weekly")
  - Response: Global financial overview with trends.

- **GET /api/dashboard/summary** (ANALYST, ADMIN)
  - Response: User-specific financial summary.

### Home

- **GET /**
  - Response: Basic server status.
  - Public endpoint.

## Role Permissions

| Endpoint                         | VIEWER | ANALYST | ADMIN |
| -------------------------------- | ------ | ------- | ----- |
| /api/auth/\*                     | ✅     | ✅      | ✅    |
| /api/records (GET)               | ❌     | ✅      | ✅    |
| /api/records (POST/PATCH/DELETE) | ❌     | ❌      | ✅    |
| /api/users/\*                    | ❌     | ❌      | ✅    |
| /api/dashboard/overview          | ✅     | ✅      | ✅    |
| /api/dashboard/summary           | ❌     | ✅      | ✅    |

## Security & Validation

- **Authentication**: JWT tokens expire in 1 day. Inactive users are blocked.
- **Authorization**: Role-based middleware enforces permissions.
- **Validation**: Zod schemas validate all inputs (users: name, email, password; transactions: amount, type, category, etc.).
- **Rate Limiting**: 10 requests/minute/IP to mitigate abuse.
- **CORS**: Enabled for cross-origin requests.
- **Error Handling**: Centralized error middleware with consistent JSON responses.

## API Documentation

Access interactive API docs at `http://localhost:3000/api-docs`. Includes endpoint details, request/response schemas, and a built-in tester.

### Using Swagger with Authentication

1. Create an account using `POST /api/auth/register`.
2. Login using `POST /api/auth/login` and copy the returned JWT token.
3. Open the Swagger UI and click the `Authorize` button.
4. Paste the token in the authorization field as `Bearer <token>`.
5. Click `Authorize` and then `Close`.
6. You can now call protected endpoints directly from Swagger.

## Database Schema

### Users Table

- `id` (UUID, PK)
- `name` (string)
- `email` (string, unique)
- `passwordHash` (string)
- `role` (enum: VIEWER, ANALYST, ADMIN)
- `status` (enum: ACTIVE, INACTIVE)
- `createdAt` (timestamp)

### Financial Records Table

- `id` (UUID, PK)
- `userId` (UUID, FK to users)
- `amount` (decimal)
- `description` (text)
- `category` (string)
- `createdAt` (timestamp)

## Scripts

- `npm start`: Start production server.
- `npm run dev`: Start development server with auto-reload.
- `npm run prisma:generate`: Generate Prisma client.
- `npm run prisma:migrate`: Run database migrations.
- `npm run prisma:studio`: Open Prisma Studio for DB management.

## Directory Structure

```
└── arjung352-fintrack_api/
    ├── README.md
    ├── package.json
    └── src/
        ├── index.js
        ├── swagger.js
        ├── middleware/
        │   ├── authMiddleware.js
        │   ├── rateLimitMiddleware.js
        │   └── roleMiddleware.js
        ├── modules/
        │   ├── auth/
        │   │   ├── authController.js
        │   │   └── authRoute.js
        │   ├── dashboard/
        │   │   ├── dashboardController.js
        │   │   └── dashboardRoutes.js
        │   ├── record/
        │   │   ├── recordController.js
        │   │   └── recordRoutes.js
        │   └── user/
        │       ├── userController.js
        │       └── userRoutes.js
        ├── prisma/
        │   ├── prismaClient.js
        │   ├── schema.prisma
        │   ├── seed.js
        │   └── migrations/
        │       ├── migration_lock.toml
        │       └── 20260405073824_init/
        │           └── migration.sql
        └── schemaValidation/
            ├── transactionSchema.js
            ├── userAuthSchema.js
            └── userUpdationValidation.js
```

### File Descriptions

- **README.md**: This file, containing project documentation and setup instructions.
- **package.json**: Node.js project configuration with dependencies and scripts.
- **src/index.js**: Main entry point of the application, sets up the Express server.
- **src/swagger.js**: Configuration for Swagger UI API documentation.
- **src/middleware/authMiddleware.js**: Middleware for JWT authentication verification.
- **src/middleware/rateLimitMiddleware.js**: Middleware for implementing rate limiting.
- **src/middleware/roleMiddleware.js**: Middleware for role-based access control.
- **src/modules/auth/authController.js**: Controller handling authentication logic (register, login).
- **src/modules/auth/authRoute.js**: Routes for authentication endpoints.
- **src/modules/dashboard/dashboardController.js**: Controller for dashboard-related logic.
- **src/modules/dashboard/dashboardRoutes.js**: Routes for dashboard endpoints.
- **src/modules/record/recordController.js**: Controller for financial record operations.
- **src/modules/record/recordRoutes.js**: Routes for record management endpoints.
- **src/modules/user/userController.js**: Controller for user management operations.
- **src/modules/user/userRoutes.js**: Routes for user-related endpoints.
- **src/prisma/prismaClient.js**: Prisma client instance for database interactions.
- **src/prisma/schema.prisma**: Prisma schema defining the database models.
- **src/prisma/seed.js**: Script to seed the database with initial data.
- **src/prisma/migrations/migration_lock.toml**: Prisma migration lock file.
- **src/prisma/migrations/20260405073824_init/migration.sql**: Initial database migration SQL.
- **src/schemaValidation/transactionSchema.js**: Zod schema for transaction validation.
- **src/schemaValidation/userAuthSchema.js**: Zod schema for user validation.
- **src/schemaValidation/userUpdationValidation.js**: Additional user validation logic.

## Contributing

1. Fork the repo.
2. Create a feature branch.
3. Commit changes.
4. Push and open a PR.

## License

ISC
