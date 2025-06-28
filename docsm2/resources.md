### API Endpoints & Controllers

MindPool provides a comprehensive RESTful API for managing tasks, categories, statuses, and user authentication. All endpoints (except authentication) require OAuth 2.0 authentication.

### Authentication Endpoints

**OAuth 2.0 Authentication:**
- `GET /auth/github` - Initiate GitHub OAuth 2.0 login
- `GET /auth/github/callback` - GitHub OAuth 2.0 callback handler
- `GET /auth/logout` - Logout and destroy user session
- `GET /auth/status` - Check current authentication status

### Task Management Endpoints

**Tasks Controller:**
- `GET /api/tasks` - Retrieve all tasks for the authenticated user
- `POST /api/tasks` - Create a new task for the authenticated user
- `PUT /api/tasks/:id` - Update a specific task (user must own the task)
- `DELETE /api/tasks/:id` - Delete a specific task (user must own the task)

**Task Categories Controller:**
- `GET /api/categories` - Retrieve all task categories
- `POST /api/categories` - Create a new task category
- `PUT /api/categories/:id` - Update a specific task category
- `DELETE /api/categories/:id` - Delete a specific task category

**Task Status Controller:**
- `GET /api/statuses` - Retrieve all task statuses
- `POST /api/statuses` - Create a new task status
- `PUT /api/statuses/:id` - Update a specific task status
- `DELETE /api/statuses/:id` - Delete a specific task status

### User Management Endpoints

**Users Controller:**
- `GET /api/users/me` - Get current authenticated user profile
- `GET /api/users` - Retrieve all users (admin functionality)
- `POST /api/users` - Create a new user (auto-created via OAuth)
- `PUT /api/users/:id` - Update a specific user
- `DELETE /api/users/:id` - Delete a specific user

### Database Schema

**Users Table:**
- `id` (Primary Key)
- `github_id` (GitHub OAuth ID)
- `username` (GitHub username)
- `email` (GitHub email)
- `created_at` (Timestamp)

**Tasks Table:**
- `id` (Primary Key)
- `title` (Task title)
- `description` (Task description)
- `user_id` (Foreign Key to users)
- `category_id` (Foreign Key to task_categories)
- `status_id` (Foreign Key to task_statuses)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Task Categories Table:**
- `id` (Primary Key)
- `name` (Category name)
- `description` (Category description)
- `created_at` (Timestamp)

**Task Statuses Table:**
- `id` (Primary Key)
- `name` (Status name)
- `description` (Status description)
- `created_at` (Timestamp)

### Security Features

- **Authentication Required:** All API endpoints (except OAuth) require valid session
- **User Isolation:** Users can only access their own tasks
- **Session Management:** Secure session handling with express-session
- **OAuth 2.0:** Secure authentication via GitHub
- **CORS:** Configured for frontend-backend communication
- **Input Validation:** Request validation and sanitization