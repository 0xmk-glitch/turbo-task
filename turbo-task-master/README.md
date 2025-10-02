# 🚀 Turbo Task Master API

A comprehensive task management system built with NestJS, TypeORM, and Angular, featuring role-based access control (RBAC), organization hierarchy, and RSA-based JWT authentication.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Deployment](#deployment)

## 🏗️ Architecture Overview

### NX Monorepo Structure
```
turbo-task-master/
├── apps/
│   ├── api/                 # NestJS Backend
│   └── dashboard/           # Angular Frontend
├── libs/
│   ├── auth/               # RBAC & JWT Logic
│   └── data/               # Shared DTOs & Interfaces
└── docs/                   # Documentation
```

### Technology Stack
- **Backend**: NestJS + TypeORM + SQLite/PostgreSQL
- **Frontend**: Angular + TailwindCSS + PrimeNG
- **Authentication**: RSA-based JWT tokens
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Testing**: Jest + Karma

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
   ```bash
# Clone the repository
git clone <repository-url>
   cd turbo-task-master

# Install dependencies
npm install

# Generate RSA keys for JWT
node generate-rsa-keys.js

# Start the API server
npm run start:api

# Start the dashboard (in another terminal)
npm run start:dashboard
```

### Access Points
- **API**: http://localhost:3000
- **Dashboard**: http://localhost:4200
- **API Docs**: http://localhost:3000/docs
- **Swagger UI**: http://localhost:3000/docs

## ⚙️ Environment Setup

### Required Environment Variables
Create `apps/api/.env`:
```env
# JWT Configuration (RSA Keys)
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=turbodb

# Logging Configuration
LOGGING_ENABLED=true
LOG_LEVEL=INFO
AUDIT_LOGGING_ENABLED=true

# API Configuration
PORT=3000
NODE_ENV=development
```

### Generate RSA Keys
```bash
node generate-rsa-keys.js
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000
```

### Authentication Endpoints

#### POST /auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin",
    "organizationId": "440e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### POST /auth/register
Register a new user with existing organization.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "organizationId": "440e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
  "email": "user@example.com",
  "name": "John Doe",
    "role": "admin",
    "organizationId": "440e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### POST /auth/register-with-org
Register a new user and create organization.

**Request:**
```json
{
  "email": "founder@newcompany.com",
  "password": "SecurePass123!",
  "name": "Company Founder",
  "organizationName": "New Company Inc",
  "organizationDescription": "A new startup company",
  "parentId": "440e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "email": "founder@newcompany.com",
    "name": "Company Founder",
    "role": "admin",
    "organizationId": "880e8400-e29b-41d4-a716-446655440003"
  }
}
```

### Organization Endpoints

#### POST /organizations/register
Create a new organization (public endpoint).

**Request:**
```json
{
  "name": "Tech Startup Inc",
  "description": "A technology startup company",
  "parentId": "440e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "id": "440e8400-e29b-41d4-a716-446655440000",
  "name": "Tech Startup Inc",
  "description": "A technology startup company",
  "apiKey": "org_abc123def456",
  "parentId": "440e8400-e29b-41d4-a716-446655440000",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### GET /organizations/public/:apiKey
Get organization by API key (public endpoint).

**Response:**
```json
{
  "id": "440e8400-e29b-41d4-a716-446655440000",
  "name": "Tech Startup Inc",
  "description": "A technology startup company",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

#### GET /organizations
Get organizations (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "440e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Startup Inc",
    "description": "A technology startup company",
    "apiKey": "org_abc123def456",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "admin@example.com",
        "name": "Admin User",
        "role": "admin"
      }
    ]
  }
]
```

#### GET /organizations/:id
Get specific organization.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "440e8400-e29b-41d4-a716-446655440000",
  "name": "Tech Startup Inc",
  "description": "A technology startup company",
  "apiKey": "org_abc123def456",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "parent": null,
  "children": [],
  "users": [...],
  "tasks": [...]
}
```

#### PATCH /organizations/:id
Update organization (requires Admin/Owner role).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "name": "Updated Company Name",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "id": "440e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Company Name",
  "description": "Updated description",
  "apiKey": "org_abc123def456",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:45:00.000Z"
}
```

#### DELETE /organizations/:id
Delete organization (requires Admin role).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Organization deleted successfully"
}
```

#### GET /organizations/:id/users
Get users in organization.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### GET /organizations/:id/children
Get child organizations.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Subsidiary Company",
    "description": "A subsidiary organization",
    "parentId": "440e8400-e29b-41d4-a716-446655440000",
    "isActive": true
  }
]
```

### Task Endpoints

#### POST /tasks
Create a new task (requires Admin/Owner role).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication system",
  "type": "work",
  "priority": 3,
  "assignedTo": "550e8400-e29b-41d4-a716-446655440000",
  "dueDate": "2024-02-15"
}
```

**Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication system",
  "type": "work",
  "status": 0,
  "priority": 3,
  "organizationId": "440e8400-e29b-41d4-a716-446655440000",
  "createdBy": "550e8400-e29b-41d4-a716-446655440000",
  "assignedTo": "550e8400-e29b-41d4-a716-446655440000",
  "dueDate": "2024-02-15T00:00:00.000Z",
  "isDeleted": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "creator": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "assignee": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

#### GET /tasks
Get tasks (filtered by organization).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `user` (optional): Filter by specific user ID (Admin/Owner only)

**Response:**
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication system",
    "type": "work",
    "status": 0,
    "priority": 3,
    "dueDate": "2024-02-15T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "creator": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Admin User"
    },
    "assignee": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Admin User"
    }
  }
]
```

#### GET /tasks/my-tasks
Get current user's tasks.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication system",
    "type": "work",
    "status": 0,
    "priority": 3,
    "dueDate": "2024-02-15T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### GET /tasks/:id
Get specific task.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication system",
  "type": "work",
  "status": 0,
  "priority": 3,
  "dueDate": "2024-02-15T00:00:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "creator": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin User"
  },
  "assignee": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin User"
  }
}
```

#### PATCH /tasks/:id
Update task (requires Admin/Owner role).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "priority": 4
}
```

**Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "Updated task title",
  "description": "Updated description",
  "type": "work",
  "status": 0,
  "priority": 4,
  "dueDate": "2024-02-15T00:00:00.000Z",
  "updatedAt": "2024-01-15T11:45:00.000Z"
}
```

#### PATCH /tasks/:id/status
Update task status.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "status": 1
}
```

**Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "Implement user authentication",
  "status": 1,
  "updatedAt": "2024-01-15T11:45:00.000Z"
}
```

#### DELETE /tasks/:id
Delete task (requires Admin role).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

### User Endpoints

#### POST /users
Create a new user.

**Request:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "SecurePass123!",
  "role": "viewer",
  "organizationId": "440e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "email": "newuser@example.com",
  "name": "New User",
  "role": "viewer",
  "organizationId": "440e8400-e29b-41d4-a716-446655440000",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### GET /users/profile
Get current user's profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "admin",
  "organizationId": "440e8400-e29b-41d4-a716-446655440000",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "organization": {
    "id": "440e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Startup Inc"
  }
}
```

#### GET /users
Get all users.

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin",
    "organizationId": "440e8400-e29b-41d4-a716-446655440000",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### GET /users/:id
Get specific user.

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "admin",
  "organizationId": "440e8400-e29b-41d4-a716-446655440000",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "organization": {
    "id": "440e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Startup Inc"
  }
}
```

#### PATCH /users/:id
Update user.

**Request:**
```json
{
  "name": "Updated Name",
  "role": "admin"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@example.com",
  "name": "Updated Name",
  "role": "admin",
  "organizationId": "440e8400-e29b-41d4-a716-446655440000",
  "isActive": true,
  "updatedAt": "2024-01-15T11:45:00.000Z"
}
```

#### DELETE /users/:id
Delete user (requires Admin role).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

### Audit Log Endpoints

#### GET /audit-log
Get audit logs (requires Admin/Owner role).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 50)
- `offset` (optional): Number of records to skip (default: 0)

**Response:**
```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "action": "CREATE",
    "entityType": "TASK",
    "entityId": "660e8400-e29b-41d4-a716-446655440000",
    "oldValues": null,
    "newValues": {
      "title": "Implement user authentication",
      "status": 0
    },
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "organizationId": "440e8400-e29b-41d4-a716-446655440000",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
]
```

## 🔐 Authentication

### JWT Token Structure
The API uses RSA-signed JWT tokens with the following payload:

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@example.com",
  "orgId": "440e8400-e29b-41d4-a716-446655440000",
  "role": "admin",
  "username": "Admin User",
  "iat": 1642248600,
  "exp": 1642335000
}
```

### Role-Based Access Control (RBAC)

#### Roles Hierarchy
1. **OWNER** - Full system access
2. **ADMIN** - Organization management
3. **VIEWER** - Read-only access

#### Permission Matrix
| Action | OWNER | ADMIN | VIEWER |
|--------|-------|-------|--------|
| Create Tasks | ✅ | ✅ | ❌ |
| Update Tasks | ✅ | ✅ | ❌ |
| Delete Tasks | ✅ | ❌ | ❌ |
| View Tasks | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ✅ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ |
| Manage Organizations | ✅ | ✅ | ❌ |

## 📊 Data Models

### User Entity
```typescript
{
  id: string;           // UUID
  email: string;        // Unique email
  name: string;         // Display name
  password: string;     // Hashed password
  organizationId: string; // Organization UUID
  role: UserRole;       // admin | owner | viewer
  isActive: boolean;    // Account status
  createdAt: Date;
  updatedAt: Date;
}
```

### Organization Entity
```typescript
{
  id: string;           // UUID
  name: string;         // Organization name
  description?: string; // Optional description
  apiKey: string;       // Unique API key
  parentId?: string;    // Parent organization UUID
  isActive: boolean;    // Organization status
  createdAt: Date;
  updatedAt: Date;
}
```

### Task Entity
```typescript
{
  id: string;           // UUID
  title: string;        // Task title
  description?: string; // Task description
  type: string;         // work | personal | home
  status: TaskStatus;   // 0: TODO, 1: IN_PROGRESS, 2: DONE, 3: CANCELLED
  priority: TaskPriority; // 1: LOW, 2: MEDIUM, 3: HIGH, 4: URGENT
  organizationId: string; // Organization UUID
  createdBy: string;    // Creator user UUID
  assignedTo?: string;  // Assignee user UUID
  dueDate?: Date;       // Due date
  isDeleted: boolean;   // Soft delete flag
  createdAt: Date;
  updatedAt: Date;
}
```

## ❌ Error Handling

### Standard Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/tasks"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

### Validation Errors
```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email address",
    "password must be at least 8 characters"
  ],
  "error": "Bad Request"
}
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run API tests only
npm run test:api

# Run dashboard tests only
npm run test:dashboard

# Run e2e tests
npm run test:e2e
```

### Test Authentication
```bash
# Test the complete authentication flow
node test-auth.js
```

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=your-db-name
JWT_PRIVATE_KEY=your-private-key
JWT_PUBLIC_KEY=your-public-key
```

### Docker Deployment
```bash
# Build the application
docker build -t turbo-task-master .

# Run the container
docker run -p 3000:3000 turbo-task-master
```

## 🔮 Future Considerations

- **JWT Refresh Tokens**: Implement token refresh mechanism
- **CSRF Protection**: Add CSRF tokens for web requests
- **RBAC Caching**: Cache role permissions for better performance
- **Advanced Delegation**: Support for temporary role delegation
- **Rate Limiting**: Implement API rate limiting
- **Multi-tenancy**: Enhanced multi-tenant support
- **Real-time Updates**: WebSocket support for real-time notifications
- **File Uploads**: Support for task attachments
- **Advanced Analytics**: Task completion metrics and reporting

## 📞 Support

For questions or issues, please:
1. Check the API documentation at `/docs`
2. Review the test files for usage examples
3. Check the audit logs for debugging information
4. Create an issue in the repository

---

**Built with ❤️ using NestJS, Angular, and TypeORM**