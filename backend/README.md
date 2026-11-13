# School Management Platform – Backend

Secure, role-based Express.js backend for a school management platform with four user roles: Principal, Staff, Prefect, and Student.

## Technology Stack

- Node.js (CommonJS)
- Express.js
- PostgreSQL
- Sequelize ORM (migrations + seeders)
- JWT authentication
- bcrypt password hashing
- dotenv configuration
- Jest + Supertest for testing

## Project Structure

```
backend/
  src/
    config/         # Database configuration
    models/         # Sequelize models + associations
    migrations/     # Database migrations
    seeders/        # Database seeders
    controllers/    # Route controllers
    services/       # Business logic
    routes/         # API route definitions
    middleware/     # Auth, authorization, error handling
    validators/     # Request validation schemas
    utils/          # Helper utilities
    app.js          # Express app factory
    server.js       # Server entry point
  .env              # Environment variables (local, not committed)
  .env.example    # Example environment variables
  package.json
  README.md
```

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 15+
- Two databases: `school_management` (development) and `school_management_test` (testing)

### Installation

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database credentials and JWT secrets

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` / `test` / `production` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Development database name | `school_management` |
| `DB_USER` | Database user | `school_user` |
| `DB_PASSWORD` | Database password | `your_password` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `your_secret_here` |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `BCRYPT_SALT_ROUNDS` | bcrypt salt rounds | `12` |

## Database Management

```bash
# Run migrations
npm run migrate

# Undo last migration
npm run migrate:undo

# Run seeders
npm run seed

# Undo all seeders
npm run seed:undo
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

Tests run against `school_management_test` (configured via `NODE_ENV=test`).

## API Overview

### Authentication
- `POST /api/auth/login` – Login with email/username + password
- `POST /api/auth/logout` – Invalidate token
- `GET /api/auth/me` – Get current user profile
- `POST /api/auth/change-password` – Change password

### Principal (Super Admin)
- `POST /api/principal/staff` – Create staff
- `GET /api/principal/staff` – List staff
- `GET /api/principal/staff/:id` – Get staff detail
- `PATCH /api/principal/staff/:id` – Update staff
- `PATCH /api/principal/staff/:id/deactivate` – Deactivate staff
- `POST /api/principal/prefects` – Create prefect
- `POST /api/principal/students` – Create student
- `GET /api/principal/dashboard` – School dashboard

### Staff
- `POST /api/staff/prefects` – Create prefect
- `GET /api/staff/prefects` – List prefects
- `PATCH /api/staff/prefects/:id` – Update prefect
- `POST /api/staff/students` – Create student
- `GET /api/staff/students` – List students
- `GET /api/staff/students/:id` – Get student detail
- `PATCH /api/staff/students/:id` – Update student

### Prefect
- `GET /api/prefect/students` – View supervised students
- `GET /api/prefect/students/:id` – Student profile
- `POST /api/prefect/tasks` – Create task
- `GET /api/prefect/tasks` – List tasks
- `PATCH /api/prefect/tasks/:id` – Update task
- `POST /api/prefect/tasks/:id/assign` – Assign students
- `GET /api/prefect/attendance` – View attendance
- `POST /api/prefect/attendance` – Record attendance
- `PATCH /api/prefect/attendance/:id` – Update attendance

### Student
- `GET /api/student/profile` – Personal profile
- `GET /api/student/tasks` – View assigned tasks
- `GET /api/student/tasks/:id` – Task detail
- `PATCH /api/student/tasks/:id/status` – Update task status
- `GET /api/student/attendance` – Personal attendance history

### General
- `GET /api/announcements` – List announcements
- `POST /api/announcements` – Create announcement
- `GET /api/health` – Health check

## Role Hierarchy

**Principal** (Super Admin) > **Staff** (Admin) > **Prefect** > **Student**

- Principal: Full administrative access, highest authority
- Staff: Manage prefects and students only
- Prefect: Manage assigned students only
- Student: View own profile, tasks, and attendance

## License

MIT
