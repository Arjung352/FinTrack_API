# FinTrack API - Role-Based Access Control System

A Node.js API for financial dashboard with role-based access control (RBAC) using Supabase PostgreSQL.

## Features

- **Authentication**: JWT-based authentication with secure password hashing
- **Role-Based Access Control**: Three roles with granular permissions
  - **Viewer**: Can only view dashboard data
  - **Analyst**: Can view records and access insights
  - **Admin**: Can create, update, and manage records and users
- **Financial Records Management**: CRUD operations with role-based filtering
- **User Management**: Admin-only user and role management
- **Insights**: Financial analytics for analysts and admins

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **CORS**: Enabled for cross-origin requests

## Setup Instructions

### 1. Environment Setup

1. Clone or navigate to the project directory
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a Supabase project at [supabase.com](https://supabase.com)

4. Update `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret_key_here
   PORT=3000
   ```

### 2. Database Setup

Create the following tables in your Supabase database:

#### Users Table

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Roles Table

```sql
CREATE TABLE roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Insert default roles
INSERT INTO roles (name) VALUES ('viewer'), ('analyst'), ('admin');
```

#### Permissions Table

```sql
CREATE TABLE permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Insert default permissions
INSERT INTO permissions (name) VALUES
  ('view_records'),
  ('view_insights'),
  ('create_records'),
  ('update_records'),
  ('delete_records'),
  ('manage_users');
```

#### Role Permissions Table (Many-to-Many)

```sql
CREATE TABLE role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE(role_id, permission_id)
);

-- Assign permissions to roles
-- Viewer: view_records
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'viewer' AND p.name = 'view_records';

-- Analyst: view_records, view_insights
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'analyst' AND p.name IN ('view_records', 'view_insights');

-- Admin: all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin';
```

#### Financial Records Table

```sql
CREATE TABLE financial_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Row Level Security (Optional but Recommended)

Enable RLS in Supabase for additional security:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data (except admins)
CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Financial records: users can only see their own, admins see all
CREATE POLICY "Users can view own financial records" ON financial_records
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### User Management (Admin Only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Role Management (Admin Only)

- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get role by ID
- `PUT /api/roles/assign/:userId/:roleId` - Assign role to user
- `GET /api/roles/permissions/:name` - Get role permissions

### Financial Records

- `GET /api/financial-records` - Get records (role-based)
- `GET /api/financial-records/:id` - Get record by ID
- `POST /api/financial-records` - Create record
- `PUT /api/financial-records/:id` - Update record
- `DELETE /api/financial-records/:id` - Delete record
- `GET /api/financial-records/insights` - Get insights

### Health Check

- `GET /api/health` - Server health status

## Usage Examples

### Register a new user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","role":"viewer"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Create financial record (with JWT token)

```bash
curl -X POST http://localhost:3000/api/financial-records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"amount":100.50,"description":"Coffee purchase","category":"Food"}'
```

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control with granular permissions
- Input validation with Joi
- CORS enabled
- Row Level Security in database

## Development

- Use `npm run dev` for development with auto-restart
- All source code in `src/` directory
- Environment variables in `.env` file
- Database models in `src/models/`
- Controllers in `src/controllers/`
- Middleware in `src/middleware/`
- Routes in `src/routes/`

## License

ISC
