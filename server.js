const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const { initializeAuth, isAuthenticated, isAuthorized, verifyJWT } = require("./auth");

console.log("isAuthenticated function imported:", typeof isAuthenticated);

const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());

// Initialize OAuth 2.0 authentication
initializeAuth(app);


const db = mysql.createPool({
  host: "database",
  user: "root",
  password: "1234",
  database: "api_tasks",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Utility functions for common patterns
const handleDatabaseError = (err, res, operation) => {
  console.error(`Erro ao ${operation}:`, err);
  res.status(500).json({ error: "Erro interno do servidor" });
};

const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

const validateRequired = (fields, res) => {
  for (const [fieldName, fieldValue] of Object.entries(fields)) {
    if (!fieldValue) {
      res.status(400).json({ error: `${fieldName} é obrigatório` });
      return false;
    }
  }
  return true;
};

const checkDependencies = async (table, field, value, res) => {
  return new Promise((resolve) => {
    db.query(`SELECT COUNT(*) as count FROM ${table} WHERE ${field} = ?`, [value], (err, results) => {
      if (err) {
        handleDatabaseError(err, res, `verificar dependências`);
        resolve(false);
        return;
      }
      
      if (results[0].count > 0) {
        res.status(400).json({ 
          error: `Não é possível deletar porque existem registros associados. Delete os registros primeiro.` 
        });
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
};

// Database connection test and wait
const testConnection = () => {
  return new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
        reject(err);
        return;
      }
      console.log("Conectado ao banco de dados MySQL");
      connection.release();
      resolve();
    });
  });
};

const waitForDatabase = async () => {
  let retries = 0;
  const maxRetries = 30;
  
  while (retries < maxRetries) {
    try {
      await testConnection();
      return;
    } catch (error) {
      retries++;
      console.log(`Tentativa ${retries}/${maxRetries} de conectar ao banco de dados...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.error("Não foi possível conectar ao banco de dados após várias tentativas");
  process.exit(1);
};

// Initialize database connection
waitForDatabase();

// Test route to verify authentication middleware
app.get("/test-auth", isAuthenticated, (req, res) => {
  res.json({ message: "Authentication working!", user: req.user });
});

// Public read-only routes (no authentication required)
app.get("/Users", (req, res) => {
  db.query("SELECT * FROM Users", (err, results) => {
    if (err) return handleDatabaseError(err, res, "buscar usuários");
    res.json(results);
  });
});

app.get("/IdeaCategories", (req, res) => {
  db.query("SELECT * FROM IdeaCategories", (err, results) => {
    if (err) return handleDatabaseError(err, res, "buscar categorias");
    res.json(results);
  });
});

app.get("/IdeaStatus", (req, res) => {
  db.query("SELECT * FROM IdeaStatus", (err, results) => {
    if (err) return handleDatabaseError(err, res, "buscar status");
    res.json(results);
  });
});

// Protected write routes (require JWT)
app.post("/Users", verifyJWT, (req, res) => {
  const { UserID, UserName, Email } = req.body;
  if (!validateRequired({ UserName, Email }, res)) return;
  db.query("INSERT INTO Users (UserID, UserName, Email) VALUES (?, ?, ?)",
    [UserID, UserName, Email], (err, results) => {
    if (err) return handleDatabaseError(err, res, "criar usuário");
    res.json(results);
  });
});
app.put("/Users/:UserID", verifyJWT, (req, res) => {
  const { UserID } = req.params;
  const { UserName, Email } = req.body;
  db.query("UPDATE Users SET UserName = ?, Email = ? WHERE UserID = ?", 
    [UserName, Email, UserID], (err, results) => {
    if (err) return handleDatabaseError(err, res, "atualizar usuário");
    res.json(results);
  });
});
app.delete("/Users/:UserID", verifyJWT, async (req, res) => {
  const { UserID } = req.params;
  const canDelete = await checkDependencies('Ideas', 'UserID', UserID, res);
  if (!canDelete) return;
  db.query("DELETE FROM Users WHERE UserID = ?", [UserID], (err, results) => {
    if (err) return handleDatabaseError(err, res, "deletar usuário");
    res.json({ message: "Usuário deletado com sucesso", results });
  });
});

// IdeaCategories write routes
app.post("/IdeaCategories", verifyJWT, (req, res) => {
  console.log('POST /IdeaCategories handler called');
  const { CategoryName } = req.body;
  if (!validateRequired({ CategoryName }, res)) return;
  const CategoryID = generateId('cat');
  db.query("INSERT INTO IdeaCategories (CategoryID, CategoryName) VALUES (?, ?)", 
    [CategoryID, CategoryName], (err, results) => {
    if (err) return handleDatabaseError(err, res, "criar categoria");
    res.json({ message: "Categoria criada com sucesso", categoryId: CategoryID, results });
  });
});
app.put("/IdeaCategories/:CategoryID", verifyJWT, (req, res) => {
  const { CategoryID } = req.params;
  const { CategoryName } = req.body;
  db.query("UPDATE IdeaCategories SET CategoryName = ? WHERE CategoryID = ?", 
    [CategoryName, CategoryID], (err, results) => {
    if (err) return handleDatabaseError(err, res, "atualizar categoria");
    res.json(results);
  });
});
app.delete("/IdeaCategories/:CategoryID", verifyJWT, async (req, res) => {
  const { CategoryID } = req.params;
  const canDelete = await checkDependencies('Ideas', 'CategoryID', CategoryID, res);
  if (!canDelete) return;
  db.query("DELETE FROM IdeaCategories WHERE CategoryID = ?", [CategoryID], (err, results) => {
    if (err) return handleDatabaseError(err, res, "deletar categoria");
    res.json({ message: "Categoria deletada com sucesso", results });
  });
});

// IdeaStatus write routes
app.post("/IdeaStatus", verifyJWT, (req, res) => {
  const { StatusName } = req.body;
  if (!validateRequired({ StatusName }, res)) return;
  const StatusID = generateId('status');
  db.query("INSERT INTO IdeaStatus (StatusID, StatusName) VALUES (?, ?)", 
    [StatusID, StatusName], (err, results) => {
    if (err) return handleDatabaseError(err, res, "criar status");
    res.json({ message: "Status criado com sucesso", statusId: StatusID, results });
  });
});
app.put("/IdeaStatus/:StatusID", verifyJWT, (req, res) => {
  const { StatusID } = req.params;
  const { StatusName } = req.body;
  db.query("UPDATE IdeaStatus SET StatusName = ? WHERE StatusID = ?", 
    [StatusName, StatusID], (err, results) => {
    if (err) return handleDatabaseError(err, res, "atualizar status");
    res.json(results);
  });
});
app.delete("/IdeaStatus/:StatusID", verifyJWT, async (req, res) => {
  const { StatusID } = req.params;
  const canDelete = await checkDependencies('Ideas', 'StatusID', StatusID, res);
  if (!canDelete) return;
  db.query("DELETE FROM IdeaStatus WHERE StatusID = ?", [StatusID], (err, results) => {
    if (err) return handleDatabaseError(err, res, "deletar status");
    res.json({ message: "Status deletado com sucesso", results });
  });
});

// Protected routes - Ideas require authentication and authorization
app.get("/Ideas", isAuthenticated, isAuthorized, (req, res) => {
  const userId = req.user.id;
  db.query(`
    SELECT i.*, ic.CategoryName, ist.StatusName 
    FROM Ideas i 
    LEFT JOIN IdeaCategories ic ON i.CategoryID = ic.CategoryID 
    LEFT JOIN IdeaStatus ist ON i.StatusID = ist.StatusID 
    WHERE i.UserID = ?
  `, [userId], (err, results) => {
    if (err) return handleDatabaseError(err, res, "buscar ideias");
    res.json(results);
  });
});

app.post("/Ideas", isAuthenticated, isAuthorized, (req, res) => {
  const { Title, Description, DueDate, CategoryID, StatusID } = req.body;
  const UserID = req.user.id;
  
  if (!validateRequired({ Title, CategoryID, StatusID }, res)) return;
  
  const IdeaID = generateId('idea');
  
  db.query("INSERT INTO Ideas (IdeaID, Title, Description, DueDate, UserID, CategoryID, StatusID) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [IdeaID, Title, Description, DueDate, UserID, CategoryID, StatusID], (err, results) => {
      if (err) return handleDatabaseError(err, res, "criar ideia");
      res.json({ message: "Ideia criada com sucesso", ideaId: IdeaID, results });
    });
});

app.put("/Ideas/:IdeaID", isAuthenticated, isAuthorized, (req, res) => {
  const { IdeaID } = req.params;
  const { Title, Description, DueDate, CategoryID, StatusID } = req.body;
  const userId = req.user.id;
  
  // Check ownership
  db.query("SELECT UserID FROM Ideas WHERE IdeaID = ?", [IdeaID], (err, results) => {
    if (err) return handleDatabaseError(err, res, "verificar ideia");
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Ideia não encontrada" });
    }
    
    if (results[0].UserID != userId) {
      return res.status(403).json({ error: "Acesso negado: você só pode modificar suas próprias ideias" });
    }
    
    // Update the idea
    db.query("UPDATE Ideas SET Title = ?, Description = ?, DueDate = ?, CategoryID = ?, StatusID = ? WHERE IdeaID = ? AND UserID = ?",
      [Title, Description, DueDate, CategoryID, StatusID, IdeaID, userId], (err, results) => {
        if (err) return handleDatabaseError(err, res, "atualizar ideia");
        res.json(results);
      });
  });
});

app.delete("/Ideas/:IdeaID", isAuthenticated, isAuthorized, (req, res) => {
  const { IdeaID } = req.params;
  const userId = req.user.id;
  
  // Check ownership
  db.query("SELECT UserID FROM Ideas WHERE IdeaID = ?", [IdeaID], (err, results) => {
    if (err) return handleDatabaseError(err, res, "verificar ideia");
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Ideia não encontrada" });
    }
    
    if (results[0].UserID != userId) {
      return res.status(403).json({ error: "Acesso negado: você só pode excluir suas próprias ideias" });
    }
    
    // Delete the idea
    db.query("DELETE FROM Ideas WHERE IdeaID = ? AND UserID = ?", [IdeaID, userId], (err, results) => {
      if (err) return handleDatabaseError(err, res, "deletar ideia");
      res.json(results);
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`OAuth 2.0 configurado com GitHub`);
});
