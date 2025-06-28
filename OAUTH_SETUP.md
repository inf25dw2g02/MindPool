# OAuth 2.0 Setup Guide for MindPool

This guide will help you set up GitHub OAuth 2.0 authentication for the MindPool application.

## Prerequisites

1. A GitHub account
2. Docker and Docker Compose installed
3. The MindPool application running

## Step 1: Create GitHub OAuth App

1. **Go to GitHub Settings:**
   - Log in to your GitHub account
   - Go to Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"

2. **Fill in the OAuth App details:**
   - **Application name:** MindPool
   - **Homepage URL:** `http://localhost:3000`
   - **Application description:** MindPool - Idea Management Application
   - **Authorization callback URL:** `http://localhost:3001/auth/github/callback`

3. **Register the application:**
   - Click "Register application"
   - Note down your **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

Create a `.env` file in the root directory of your project:

```bash
# GitHub OAuth 2.0 Configuration
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
CALLBACK_URL=http://localhost:3001/auth/github/callback

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here

# Environment
NODE_ENV=development
```

**Replace the placeholder values:**
- `your_github_client_id_here` with your actual GitHub Client ID
- `your_github_client_secret_here` with your actual GitHub Client Secret
- `your-super-secret-session-key-here` with a strong random string

## Step 3: Update Docker Configuration

Update your `docker-compose.yml` to include the environment variables:

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.server
    container_name: mindpool_backend
    restart: always
    ports:
      - "3001:3001"
    depends_on:
      - database
    env_file:
      - .env
    environment:
      - NODE_ENV=development
      - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID:-your_github_client_id}
      - GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET:-your_github_client_secret}
      - CALLBACK_URL=${CALLBACK_URL:-http://localhost:3001/auth/github/callback}
      - SESSION_SECRET=${SESSION_SECRET:-your-session-secret-key}
    networks:
      - mindpool_network
```

## Step 4: Rebuild and Start the Application

```bash
# Stop existing containers
docker-compose down

# Rebuild with new configuration
docker-compose up --build
```

## Step 5: Test the Authentication

1. **Access the application:** Go to `http://localhost:3000`
2. **Click "Entrar com GitHub":** You'll be redirected to GitHub for authorization
3. **Authorize the application:** Click "Authorize MindPool"
4. **Return to the app:** You'll be redirected back and logged in
5. **Test protected features:** Try creating, viewing, and managing tasks

## How OAuth 2.0 Works in This Application

### Authentication Flow

1. **User clicks "Login with GitHub"**
2. **Redirect to GitHub:** User is redirected to GitHub's authorization page
3. **User authorizes:** User grants permission to the application
4. **GitHub redirects back:** GitHub redirects to the callback URL with an authorization code
5. **Server exchanges code:** The server exchanges the code for an access token
6. **User profile retrieved:** The server gets the user's profile information
7. **Session created:** A session is created and the user is logged in

### Authorization Features

- **Protected Routes:** Tasks endpoints require authentication
- **User Isolation:** Users can only access their own tasks
- **Session Management:** Sessions persist across browser restarts
- **Secure Logout:** Proper session cleanup on logout

### Security Features

- **CORS Configuration:** Proper CORS setup for cross-origin requests
- **Session Security:** Secure session configuration with proper secrets
- **Authorization Checks:** Server-side verification of user permissions
- **Input Validation:** Proper validation of all user inputs

## API Endpoints

### Public Endpoints (No Authentication Required)
- `GET /Users` - Get all users
- `POST /Users` - Create a new user
- `PUT /Users/:UserID` - Update a user
- `DELETE /Users/:UserID` - Delete a user
- `GET /TaskCategories` - Get all categories
- `POST /TaskCategories` - Create a new category
- `PUT /TaskCategories/:CategoryID` - Update a category
- `DELETE /TaskCategories/:CategoryID` - Delete a category
- `GET /TaskStatus` - Get all statuses
- `POST /TaskStatus` - Create a new status
- `PUT /TaskStatus/:StatusID` - Update a status
- `DELETE /TaskStatus/:StatusID` - Delete a status

### Protected Endpoints (Authentication Required)
- `GET /Tasks` - Get user's own tasks only
- `POST /Tasks` - Create a new task (automatically assigned to user)
- `PUT /Tasks/:TaskID` - Update user's own task only
- `DELETE /Tasks/:TaskID` - Delete user's own task only

### Authentication Endpoints
- `GET /auth/github` - Initiate GitHub OAuth login
- `GET /auth/github/callback` - GitHub OAuth callback
- `GET /auth/logout` - Logout user
- `GET /auth/user` - Get current user information

## Troubleshooting

### Common Issues

1. **"Invalid client" error:**
   - Check that your GitHub Client ID and Secret are correct
   - Ensure the callback URL matches exactly

2. **"Redirect URI mismatch" error:**
   - Verify the callback URL in your GitHub OAuth app settings
   - Make sure it matches the CALLBACK_URL environment variable

3. **Session not persisting:**
   - Check that SESSION_SECRET is set
   - Ensure cookies are enabled in your browser

4. **CORS errors:**
   - Verify the CORS configuration in server.js
   - Check that the frontend URL is correct

### Debug Mode

To enable debug logging, add this to your `.env` file:

```bash
DEBUG=passport:*
```

## Security Considerations

1. **Environment Variables:** Never commit your `.env` file to version control
2. **Session Secret:** Use a strong, random session secret
3. **HTTPS in Production:** Always use HTTPS in production environments
4. **Token Storage:** Access tokens are stored in session, not in the database
5. **User Data:** Only necessary user information is stored in the session

## Production Deployment

For production deployment:

1. **Update URLs:** Change all URLs to your production domain
2. **HTTPS:** Ensure all communication uses HTTPS
3. **Session Store:** Consider using Redis or another session store
4. **Environment Variables:** Set all environment variables in your production environment
5. **GitHub App Settings:** Update your GitHub OAuth app with production URLs

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Check the server logs for detailed error messages
3. Verify all environment variables are set correctly
4. Ensure your GitHub OAuth app is configured properly 