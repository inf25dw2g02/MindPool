const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');

// GitHub OAuth 2.0 Configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'your_github_client_id';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'your_github_client_secret';
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:3001/auth/github/callback';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Log configuration for debugging
console.log('OAuth Configuration:');
console.log('GITHUB_CLIENT_ID:', GITHUB_CLIENT_ID);
console.log('GITHUB_CLIENT_SECRET:', GITHUB_CLIENT_SECRET ? '***SET***' : '***NOT SET***');
console.log('CALLBACK_URL:', CALLBACK_URL);

// Database connection - removed invalid options
const db = mysql.createPool({
  host: "database",
  user: "root",
  password: "1234",
  database: "api_tasks",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Utility functions
const handleDatabaseError = (err, operation) => {
  console.error(`Erro ao ${operation}:`, err);
  throw err;
};

const logAuthEvent = (event, details = '') => {
  console.log(`Auth: ${event}${details ? ` - ${details}` : ''}`);
};

// Function to create or get user
const createOrGetUser = (githubUser) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM Users WHERE UserID = ?", [githubUser.id], (err, results) => {
      if (err) {
        handleDatabaseError(err, "buscar usuário");
        return reject(err);
      }
      
      if (results.length > 0) {
        logAuthEvent("Usuário encontrado", results[0].UserName);
        return resolve(results[0]);
      }
      
      // Create new user
      const newUser = {
        UserID: githubUser.id,
        UserName: githubUser.displayName || githubUser.username,
        Email: githubUser.email || `${githubUser.username}@github.com`
      };
      
      db.query("INSERT INTO Users (UserID, UserName, Email) VALUES (?, ?, ?)", 
        [newUser.UserID, newUser.UserName, newUser.Email], (err, results) => {
        if (err) {
          handleDatabaseError(err, "criar usuário");
          return reject(err);
        }
        logAuthEvent("Novo usuário criado", newUser.UserName);
        resolve(newUser);
      });
    });
  });
};

// Passport configuration
const configurePassport = () => {
  passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    logAuthEvent('GitHub OAuth callback received', profile.username);
    
    try {
      const dbUser = await createOrGetUser(profile);
      
      const user = {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value || null,
        avatar: profile.photos?.[0]?.value || null,
        accessToken: accessToken,
        dbUser: dbUser
      };
      
      logAuthEvent('User authenticated', user.username);
      return done(null, user);
    } catch (error) {
      console.error('Error creating/getting user:', error);
      return done(error, null);
    }
  }));

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
};

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  console.log(`Auth check for ${req.method} ${req.path} - isAuthenticated: ${req.isAuthenticated()}`);
  if (req.isAuthenticated()) {
    console.log(`User authenticated: ${req.user?.username || 'unknown'}`);
    return next();
  }
  console.log(`Authentication required for ${req.method} ${req.path}`);
  res.status(401).json({ error: 'Authentication required' });
};

// Authorization middleware - ensure user can only access their own resources
const isAuthorized = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // For Ideas endpoint, ensure user can only access their own ideas
  if (req.path.startsWith('/Ideas')) {
    const userId = req.user.id;
    
    // For GET requests, filter by user ID
    if (req.method === 'GET') {
      req.userFilter = { UserID: userId };
    }
    
    // For POST requests, ensure the idea is created for the authenticated user
    if (req.method === 'POST') {
      req.body.UserID = userId;
    }
    
    // For PUT/DELETE requests, ensure the idea belongs to the authenticated user
    if (req.method === 'PUT' || req.method === 'DELETE') {
      const ideaId = req.params.IdeaID;
      req.userIdeaId = ideaId;
      req.userId = userId;
    }
  }
  
  next();
};

// Issue JWT after successful OAuth login
const issueJWT = (user) => {
  return jwt.sign({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    avatar: user.avatar
  }, JWT_SECRET, { expiresIn: '2h' });
};

// Middleware to verify JWT in Authorization header
const verifyJWT = (req, res, next) => {
  console.log('verifyJWT middleware called for', req.method, req.path);
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'JWT required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.jwtUser = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Add a /auth/token endpoint to get a JWT after login
const addTokenEndpoint = (app) => {
  app.get('/auth/token', (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const token = issueJWT(req.user);
    res.json({ token });
  });
};

// Initialize authentication
const initializeAuth = (app) => {
  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());
  
  configurePassport();
  addTokenEndpoint(app);
  
  // GitHub OAuth routes
  app.get('/auth/github', (req, res, next) => {
    logAuthEvent('GitHub OAuth login initiated');
    passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
  });
  
  app.get('/auth/github/callback', 
    (req, res, next) => {
      logAuthEvent('GitHub OAuth callback received');
      passport.authenticate('github', { failureRedirect: '/login' })(req, res, next);
    },
    (req, res) => {
      logAuthEvent('GitHub OAuth authentication successful, redirecting to frontend');
      res.redirect('http://localhost:3000');
    }
  );
  
  // Logout route
  app.get('/auth/logout', (req, res) => {
    logAuthEvent('User logout requested');
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      logAuthEvent('User logged out successfully');
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  // Get current user
  app.get('/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      logAuthEvent('User info requested', req.user.username);
      res.json({
        authenticated: true,
        user: {
          id: req.user.id,
          username: req.user.username,
          displayName: req.user.displayName,
          email: req.user.email,
          avatar: req.user.avatar
        }
      });
    } else {
      logAuthEvent('No authenticated user found');
      res.json({ authenticated: false });
    }
  });
};

module.exports = {
  initializeAuth,
  isAuthenticated,
  isAuthorized,
  sessionConfig,
  verifyJWT
}; 