# School Management Platform – Backend

Secure, role-based Express.js backend for a school management platform with four user roles: **Principal**, **Staff**, **Prefect**, and **Student**.

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| Node.js (CommonJS) | Runtime |
| Express.js | Web framework |
| PostgreSQL | Relational database |
| Sequelize ORM | Database ORM (migrations + seeders) |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| dotenv | Environment variables |
| helmet | Security headers |
| cors | Cross-origin resource sharing |
| express-validator | Request validation |
| Jest + Supertest | Testing |

---

## Project Structure

```
backend/
  src/
    config/
      database.js        # Sequelize instance (dev/test/prod)
      config.js          # Sequelize CLI config
    models/
      index.js           # All model definitions
      associations.js    # Model associations (setupAssociations)
    migrations/          # Database migrations (11 timestamped)
    seeders/             # Database seeders (3)
    controllers/
      authController.js
      userController.js
      principalController.js
      staffController.js
      prefectController.js
      studentController.js
      taskController.js
      attendanceController.js
      announcementController.js
    services/
      authService.js
      userService.js
      auditService.js
      prefectService.js
      studentService.js
      taskService.js
      attendanceService.js
      announcementService.js
    routes/
      authRoutes.js
      userRoutes.js
      principalRoutes.js
      staffRoutes.js
      prefectRoutes.js
      studentRoutes.js
      taskRoutes.js
      attendanceRoutes.js
      announcementRoutes.js
      auditLogRoutes.js
      healthRoutes.js
    middleware/
      authenticate.js    # JWT verification
      authorize.js       # Role-based access control
      errorHandler.js    # Centralized error handling
    validators/
      authValidators.js
      userValidators.js
      taskValidators.js
      attendanceValidators.js
      announcementValidators.js
    utils/
      AppError.js
      asyncHandler.js
      sendResponse.js
      generateToken.js
      tokenBlacklist.js
    app.js               # Express app factory
    server.js            # Server entry point
  tests/
    setup.js             # Test database initialization
    teardown.js          # Test data cleanup
    helpers.js           # Test helper functions
    auth.test.js         # Authentication tests
    roles.test.js        # Role-based access control tests
    tasks.test.js        # Task management tests
    attendance.test.js   # Attendance management tests
    validation.test.js   # Validation and error handling tests
  .env                   # Environment variables (local)
  .env.example           # Environment variables template
  .gitignore             # Git ignore rules
  .sequelizerc           # Sequelize CLI configuration
  package.json           # Dependencies and scripts
  jest.config.js         # Jest configuration
  README.md              # This file
```

---

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
nano .env

# Run migrations
npm run migrate

# Run seeders
npm run seed

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
| `DB_NAME` | Development database | `school_management` |
| `DB_USER` | Database user | `school_user` |
| `DB_PASSWORD` | Database password | `your_password` |
| `TEST_DB_NAME` | Testing database | `school_management_test` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `your_secret_here` |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_SECRET` | JWT refresh secret | `your_refresh_secret` |
| `BCRYPT_SALT_ROUNDS` | bcrypt salt rounds | `12` |

---

## Database Management

```bash
# Run all migrations
npm run migrate

# Undo last migration
npm run migrate:undo

# Run all seeders
npm run seed

# Undo all seeders
npm run seed:undo
```

**Important:** Schema is managed exclusively through Sequelize migrations and seeders. Do not use `sync({ alter: true })`.

---

## Testing

Tests run against the dedicated test database (`school_management_test`) when `NODE_ENV=test`.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

The test suite covers all required scenarios:

| Test Category | Scenarios |
|---------------|-----------|
| **Authentication** | Successful login, login by username, wrong password, non-existent user, missing fields, deactivated user rejection, logout/token revocation, token validation, password change, wrong current password, password mismatch |
| **Role-Based Access Control** | Principal full access, principal cannot modify another principal, staff cannot create staff, staff cannot access principal endpoints, staff cannot change own role, staff can create prefects/students, prefect cannot create users, prefect cannot access staff management, prefect cannot access principal endpoints, student cannot access admin endpoints, student cannot create tasks |
| **Task Management** | Prefect creates task for their class, prefect cannot create task for other class, staff creates task for any class, prefect assigns students, duplicate assignment prevention, assignment outside supervision prevention, student updates own task status, student marks task completed, student cannot update another's task, staff completion report, prefect views own tasks, staff views all tasks, student cannot create tasks |
| **Attendance Management** | Prefect records attendance, staff records attendance, duplicate attendance prevention, student cannot record attendance, prefect views attendance, staff views all attendance, student views own attendance, date filtering, prefect updates own attendance, staff updates any attendance, prefect cannot update staff's attendance, student cannot update attendance |
| **Validation & Error Handling** | Login validation, user creation validation, task validation, attendance validation, announcement validation, 404 handling, consistent error structure, health check |

---

## API Reference

### Base URL
`http://localhost:5000/api`

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/login` | Login with email/username + password | Public |
| POST | `/auth/logout` | Revoke token | Authenticated |
| GET | `/auth/me` | Get current user profile | Authenticated |
| POST | `/auth/change-password` | Change password | Authenticated |

### User Management (Role-filtered)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/users` | List users (role-filtered) | All roles |
| GET | `/users/:id` | Get user by ID | All roles |
| PATCH | `/users/:id` | Update user (role not changeable) | All roles |
| PATCH | `/users/:id/deactivate` | Deactivate user | Principal, Staff |
| PATCH | `/users/:id/reset-password` | Reset user password | Principal, Staff |
| POST | `/users` | Create user (role enforced) | Principal, Staff |

### Principal Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/principal/staff` | Create staff | Principal |
| GET | `/principal/staff` | List staff | Principal |
| GET | `/principal/staff/:id` | Get staff detail | Principal |
| PATCH | `/principal/staff/:id` | Update staff | Principal |
| PATCH | `/principal/staff/:id/deactivate` | Deactivate staff | Principal |
| POST | `/principal/prefects` | Create prefect | Principal |
| GET | `/principal/prefects` | List prefects | Principal |
| PATCH | `/principal/prefects/:id` | Update prefect | Principal |
| PATCH | `/principal/prefects/:id/deactivate` | Deactivate prefect | Principal |
| POST | `/principal/students` | Create student | Principal |
| GET | `/principal/students` | List students | Principal |
| GET | `/principal/students/:id` | Get student detail | Principal |
| PATCH | `/principal/students/:id` | Update student | Principal |
| GET | `/principal/dashboard` | School dashboard | Principal |

### Staff Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/staff/prefects` | Create prefect | Principal, Staff |
| GET | `/staff/prefects` | List prefects | Principal, Staff |
| PATCH | `/staff/prefects/:id` | Update prefect | Principal, Staff |
| PATCH | `/staff/prefects/:id/deactivate` | Deactivate prefect | Principal, Staff |
| POST | `/staff/students` | Create student | Principal, Staff |
| GET | `/staff/students` | List students | Principal, Staff |
| GET | `/staff/students/:id` | Get student detail | Principal, Staff |
| PATCH | `/staff/students/:id` | Update student | Principal, Staff |

### Prefect Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/prefect/students` | List supervised students | Principal, Staff, Prefect |
| GET | `/prefect/students/:id` | Get student profile | Principal, Staff, Prefect |

### Student Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/student/profile` | Get own profile | All roles |
| GET | `/student/tasks` | List assigned tasks | All roles |
| GET | `/student/tasks/:id` | Get task detail | All roles |
| PATCH | `/student/tasks/:id/status` | Update task status | All roles |
| GET | `/student/attendance` | View own attendance | All roles |

### Tasks

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/tasks` | Create task | Principal, Staff, Prefect |
| GET | `/tasks` | List tasks (role-filtered) | Principal, Staff, Prefect |
| GET | `/tasks/:id` | Get task detail | Principal, Staff, Prefect |
| PATCH | `/tasks/:id` | Update task | Principal, Staff, Prefect |
| PATCH | `/tasks/:id/cancel` | Cancel task | Principal, Staff, Prefect |
| POST | `/tasks/:id/assign` | Assign students to task | Principal, Staff, Prefect |
| GET | `/tasks/report/completion` | Task completion report | Principal, Staff, Prefect |

### Attendance

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/attendance` | Record attendance | Principal, Staff, Prefect |
| GET | `/attendance` | List attendance (role-filtered) | All roles |
| GET | `/attendance/:id` | Get attendance detail | All roles |
| PATCH | `/attendance/:id` | Update attendance | Principal, Staff, Prefect |

### Announcements

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/announcements` | Create announcement | Principal, Staff, Prefect |
| GET | `/announcements` | List announcements (role-filtered) | All roles |
| GET | `/announcements/:id` | Get announcement detail | All roles |
| PATCH | `/announcements/:id` | Update announcement | Principal, Staff, Prefect |
| DELETE | `/announcements/:id` | Delete announcement | Principal, Staff, Prefect |

### Audit Logs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/audit-logs` | List audit logs (with pagination) | Principal, Staff |
| GET | `/audit-logs/:id` | Get audit log detail | Principal, Staff |

### General

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/health` | Health check | Public |

---

## Role Hierarchy

```
Principal (Super Admin)
    │
    ├─ Full administrative access
    ├─ Can create/manage staff, prefects, students
    ├─ Can access all endpoints
    └─ Only one principal account allowed
    │
Staff (Admin)
    │
    ├─ Can create/manage prefects and students
    ├─ Cannot manage other staff
    └─ Cannot access principal-only endpoints
    │
Prefect
    │
    ├─ Can manage assigned students only
    ├─ Can create/manage tasks for their class
    └─ Cannot create users or access admin endpoints
    │
Student
    │
    ├─ Can view own profile, tasks, attendance
    └─ Cannot perform any administrative operations
```

---

## Security Features

- **Password hashing**: bcrypt with configurable salt rounds (default 12)
- **JWT authentication**: Access tokens with 15-minute expiry and JTI claim
- **Token revocation**: In-memory blacklist for logout
- **Deactivated accounts**: Cannot authenticate (`isActive = false`)
- **Role-based authorization**: Separate `authenticate` and `authorize` middleware
- **No privilege escalation**: Users cannot change their own role
- **Single principal**: Only one principal account can exist
- **Input validation**: express-validator on all endpoints
- **SQL injection protection**: Sequelize parameterized queries
- **Security headers**: helmet middleware
- **CORS**: Configurable cross-origin sharing
- **Duplicate prevention**: Unique DB constraints on `(studentId, date)` for Attendance and `(taskId, studentId)` for TaskAssignment
- **Historical records preserved**: Soft deactivation (no hard deletes of users)
- **Audit logging**: All administrative actions logged with user, action, entity, and IP address

---

## Database Models

### User
id, firstName, lastName, username, email, password, role (principal/staff/prefect/student), phoneNumber, isActive, lastLogin, createdAt, updatedAt

### StudentProfile
id, userId, admissionNumber, classId, gender, dateOfBirth, guardianName, guardianPhone, address, assignedPrefectId, createdAt, updatedAt

### StaffProfile
id, userId, staffNumber, department, designation, createdAt, updatedAt

### PrefectProfile
id, userId, prefectNumber, classId, prefectType, createdAt, updatedAt

### Class
id, name, section, classTeacherId, createdAt, updatedAt

### AcademicSession
id, name, startDate, endDate, isActive, createdAt, updatedAt

### Task
id, title, description, category, assignedBy, classId, dueDate, priority, status, createdAt, updatedAt

### TaskAssignment
id, taskId, studentId, assignedAt, status, completedAt, remarks, createdAt, updatedAt

### Attendance
id, studentId, classId, recordedBy, date, status, remarks, createdAt, updatedAt

### Announcement
id, title, content, createdBy, targetAudience, classId, createdAt, updatedAt

### AuditLog
id, userId, action, entity, entityId, description, ipAddress, createdAt

---

## License

MIT
