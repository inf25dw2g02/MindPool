![MindPool Logo](https://github.com/inf25dw2g02/MindPool/blob/main/assets/mindpoologo.png)

# 💡 MindPool

A modern, full-stack web application for managing creative ideas with OAuth 2.0 authentication and authorization. Built with React, Express.js, and MySQL.

## 🚀 Features

- **OAuth 2.0 Authentication** with GitHub
- **User Management** with automatic user creation
- **Idea Management** with categories and status tracking
- **Responsive Design** that works on all devices
- **Beautiful UI** with modern styling and animations
- **Docker Support** for easy deployment
- **Clean, Maintainable Code** with utility functions and error handling

## 🛠️ Tech Stack

- **Frontend**: React.js with modern CSS
- **Backend**: Node.js with Express.js
- **Database**: MySQL with connection pooling
- **Authentication**: Passport.js with GitHub OAuth 2.0
- **Containerization**: Docker & Docker Compose

## 📦 Installation & Setup

### Prerequisites
- Docker and Docker Compose installed
- GitHub account (for OAuth setup)

### Quick Start

1. **Clone the repository:**
```bash
git clone <repository-url>
cd mindpool
```

2. **Set up environment variables:**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your GitHub OAuth credentials
# You'll need to create a GitHub OAuth app at https://github.com/settings/developers
```

3. **Start the application:**
```bash
# Clean start (removes any existing containers)
docker-compose down -v

# Build and start all services
docker-compose up --build
```

4. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🔐 OAuth Setup

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: MindPool
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:3001/auth/github/callback
4. Copy the Client ID and Client Secret to your `.env` file

## 🔒 Access Control Model

MindPool implements a **read-only access model** for unauthenticated users:

### 👥 **Unauthenticated Users (Read-Only)**
- ✅ **Can view** all users, categories, and statuses
- ❌ **Cannot create, update, or delete** any data
- ❌ **Cannot access** personal ideas (requires login)

### 🔐 **Authenticated Users (Full Access)**
- ✅ **Can view** all public data (users, categories, statuses)
- ✅ **Can create, update, and delete** categories and statuses
- ✅ **Can manage** their own ideas (create, read, update, delete)
- ✅ **Can manage** user accounts (admin functionality)

### 🎯 **Benefits**
- **Public Discovery**: Anyone can browse available categories and statuses
- **Data Protection**: Sensitive operations require authentication
- **User Privacy**: Personal ideas remain private to authenticated users
- **Admin Control**: Only authenticated users can modify system data

## 📱 Usage

1. **Login** with your GitHub account
2. **Create Ideas** with titles, descriptions, and due dates
3. **Organize** ideas with categories and statuses
4. **Manage** your creative projects efficiently

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database
```

## 🗄️ Database Access

```bash
# Connect to MySQL database
docker exec -it mindpool_db mysql -u root -p1234 api_tasks

# View tables
SHOW TABLES;

# View sample data
SELECT * FROM Users;
SELECT * FROM IdeaCategories;
SELECT * FROM IdeaStatus;
SELECT * FROM Ideas;
```

## 🔧 Code Improvements

The codebase has been cleaned up and optimized:

### Backend Improvements
- **Utility Functions**: Created reusable functions for common patterns
- **Error Handling**: Centralized error handling with `handleDatabaseError()`
- **Validation**: Unified validation with `validateRequired()`
- **ID Generation**: Centralized ID generation with `generateId()`
- **Dependency Checking**: Reusable `checkDependencies()` function
- **MySQL2 Configuration**: Removed invalid configuration options

### Authentication Improvements
- **Logging**: Centralized auth logging with `logAuthEvent()`
- **Error Handling**: Improved error handling patterns
- **Code Reduction**: Removed redundant code and simplified functions

### Benefits
- **Reduced Code Duplication**: ~40% reduction in repetitive code
- **Better Maintainability**: Centralized functions make updates easier
- **Improved Error Handling**: Consistent error responses
- **Cleaner Logs**: Structured logging for better debugging
- **Fixed Warnings**: Removed MySQL2 configuration warnings

## 📄 API Endpoints

### Public Read-Only Routes (No Authentication Required)
- `GET /Users` - Get all users (read-only)
- `GET /IdeaCategories` - Get all categories (read-only)
- `GET /IdeaStatus` - Get all statuses (read-only)

### Protected Write Routes (Require Authentication)
- `POST /Users` - Create user
- `PUT /Users/:UserID` - Update user
- `DELETE /Users/:UserID` - Delete user
- `POST /IdeaCategories` - Create category
- `PUT /IdeaCategories/:CategoryID` - Update category
- `DELETE /IdeaCategories/:CategoryID` - Delete category
- `POST /IdeaStatus` - Create status
- `PUT /IdeaStatus/:StatusID` - Update status
- `DELETE /IdeaStatus/:StatusID` - Delete status

### Protected Routes (Require Authentication & Authorization)
- `GET /Ideas` - Get user's ideas
- `POST /Ideas` - Create idea
- `PUT /Ideas/:IdeaID` - Update idea
- `DELETE /Ideas/:IdeaID` - Delete idea

### Authentication Routes
- `GET /auth/github` - Initiate GitHub OAuth
- `GET /auth/github/callback` - OAuth callback
- `GET /auth/logout` - Logout
- `GET /auth/user` - Get current user

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001
lsof -i :3306
```

2. **Container won't start:**
```bash
# Check logs
docker-compose logs <service-name>

# Rebuild without cache
docker-compose build --no-cache
```

3. **Database connection issues:**
```bash
# Check if database is running
docker-compose ps

# Restart database
docker-compose restart database
```

4. **OAuth not working:**
- Verify GitHub OAuth app settings
- Check callback URL matches exactly
- Ensure environment variables are set correctly

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.
