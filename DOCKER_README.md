# MindPool Docker Setup Guide

This guide will help you run the MindPool application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed
- Git (to clone the repository)

## Quick Start

1. **Clone the repository:**
```bash
git clone <repository-url>
cd mindpool
```

2. **Create environment file:**
```bash
cp .env.example .env
# Edit .env with your GitHub OAuth credentials
```

3. **Start the application:**
```bash
docker-compose up --build
```

4. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Docker Services

The application consists of three main services:

### 1. Database (MySQL)
- **Container:** mindpool_db
- **Port:** 3306
- **Database:** api_tasks
- **Credentials:** root/1234

### 2. Backend (Node.js/Express)
- **Container:** mindpool_backend
- **Port:** 3001
- **Features:** REST API, OAuth authentication

### 3. Frontend (React)
- **Container:** mindpool_frontend
- **Port:** 3000
- **Features:** Modern UI, responsive design

## Useful Commands

### Start Services
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild and start
docker-compose up --build
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Follow logs in real-time
docker-compose logs -f
```

### Database Access
```bash
# Connect to MySQL database
docker exec -it mindpool_db mysql -u root -p1234 api_tasks

# View database tables
SHOW TABLES;

# View sample data
SELECT * FROM Users;
SELECT * FROM IdeaCategories;
SELECT * FROM IdeaStatus;
SELECT * FROM Ideas;
```

### Container Management
```bash
# List running containers
docker ps

# Stop specific container
docker stop mindpool_backend

# Restart specific container
docker restart mindpool_frontend

# View container details
docker inspect mindpool_db
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001
lsof -i :3306

# Kill the process or change ports in docker-compose.yml
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

# Check database logs
docker-compose logs database
```

4. **Environment variables not loading:**
```bash
# Check .env file exists
ls -la .env

# Verify environment variables
docker-compose config
```

## Development

### Making Changes

1. **Frontend changes:** Edit files in `src/` directory
2. **Backend changes:** Edit `server.js` and `auth.js`
3. **Database changes:** Edit `init.sql`

### Rebuilding After Changes

```bash
# Rebuild specific service
docker-compose build frontend
docker-compose build backend

# Rebuild and restart
docker-compose up --build
```

## Production Deployment

For production deployment, consider:

1. **Environment variables:** Use proper production values
2. **Database:** Use external database service
3. **SSL/TLS:** Configure HTTPS
4. **Domain:** Set up proper domain names
5. **Monitoring:** Add health checks and logging

## Support

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Verify environment setup
3. Ensure all prerequisites are met
4. Check GitHub OAuth configuration 