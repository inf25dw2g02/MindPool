### Project Architecture Overview

MindPool is a full-stack idea management application built with modern web technologies and best practices. The project demonstrates a complete development workflow from authentication to deployment.

### Technology Stack

**Frontend:**
- React.js for the user interface
- Modern CSS with gradients and responsive design
- RESTful API integration with the backend

**Backend:**
- Node.js with Express.js framework
- Passport.js for OAuth 2.0 authentication
- MySQL database with connection pooling
- Session management with express-session

**Database:**
- MySQL relational database
- Tables: users, tasks, task_categories, task_statuses
- Foreign key relationships for data integrity

**DevOps:**
- Docker containers for all services
- Docker Compose for orchestration
- Environment variable configuration
- Automated database initialization

### Key Components

**Authentication System:**
- GitHub OAuth 2.0 integration
- Secure session management
- User authorization middleware
- Protected API endpoints

**Task Management:**
- CRUD operations for tasks, categories, and statuses
- User-specific data isolation
- Real-time status tracking
- Flexible categorization system

**User Interface:**
- Responsive design with modern styling
- Conditional rendering based on auth status
- Intuitive forms and navigation
- Professional card-based layout

### Deployment & Containerization

The application uses Docker Compose to orchestrate three main services:
- Frontend container (React app on port 3000)
- Backend container (Express API on port 3001)
- Database container (MySQL on port 3306)

This containerized approach ensures consistent deployment across different environments and simplifies the development workflow.
