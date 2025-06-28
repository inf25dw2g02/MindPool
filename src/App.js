import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const baseURL = "http://localhost:3001"; // Backend URL

export default function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken'));

  // States for tables
  const [Users, setUsers] = useState([]);
  const [IdeaCategories, setIdeaCategories] = useState([]);
  const [IdeaStatus, setIdeaStatus] = useState([]);
  const [Ideas, setIdeas] = useState([]);

  // States for new records
  const [newUsers, setNewUsers] = useState({ UserID: "", UserName: "", Email: "" });
  const [newIdeaCategories, setNewIdeaCategories] = useState({ CategoryName: "" });
  const [newIdeaStatus, setNewIdeaStatus] = useState({ StatusName: "" });
  const [newIdeas, setNewIdeas] = useState({ Title: "", Description: "", DueDate: "", CategoryID: "", StatusID: "" });

  const [newPutUsers, setNewPutUsers] = useState({ UserID: "", UserName: "", Email: "" });
  const [newPutIdeaCategories, setNewPutIdeaCategories] = useState({ CategoryID: "", CategoryName: "" });
  const [newPutIdeaStatus, setNewPutIdeaStatus] = useState({ StatusID: "", StatusName: "" });
  const [newPutIdeas, setNewPutIdeas] = useState({ IdeaID: "", Title: "", Description: "", DueDate: "", CategoryID: "", StatusID: "" });

  // Configure axios to include credentials
  axios.defaults.withCredentials = true;

  // Create axios instance with JWT interceptor
  const api = axios.create({
    baseURL: baseURL,
    withCredentials: true
  });

  // Add JWT token to requests if available
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${baseURL}/auth/user`);
      if (response.data.authenticated) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        // Get JWT token if user is authenticated
        await getJWTToken();
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('jwtToken');
        setJwtToken(null);
      }
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('jwtToken');
      setJwtToken(null);
    } finally {
      setLoading(false);
    }
  };

  const getJWTToken = async () => {
    try {
      const response = await axios.get(`${baseURL}/auth/token`);
      const token = response.data.token;
      localStorage.setItem('jwtToken', token);
      setJwtToken(token);
    } catch (error) {
      console.error("Error getting JWT token:", error);
    }
  };

  const handleLogin = () => {
    window.location.href = `${baseURL}/auth/github`;
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${baseURL}/auth/logout`);
      setUser(null);
      setIsAuthenticated(false);
      setIdeas([]); // Clear ideas when logging out
      localStorage.removeItem('jwtToken');
      setJwtToken(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // CRUD functions for Users
  const fetchUsers = () => {
    axios.get(`${baseURL}/Users`).then(response => {
      setUsers(response.data);
    });
  };

  const createUsers = () => {
    api.post(`${baseURL}/Users`, newUsers).then(() => {
      fetchUsers();
      setNewUsers({ UserID: "", UserName: "", Email: "" });
    }).catch(error => {
      if (error.response?.status === 401) {
        alert("Authentication required. Please log in.");
      } else {
        console.error("Error creating user:", error);
        alert("Error creating user. Please try again.");
      }
    });
  };

  const updateUsers = () => {
    const { UserID, UserName, Email } = newPutUsers;
    if (!UserID || !UserName || !Email) {
      alert("All fields are required.");
      return;
    }

    api.put(`${baseURL}/Users/${UserID}`, { UserName, Email })
      .then(() => {
        fetchUsers();
        setNewPutUsers({ UserID: "", UserName: "", Email: "" });
      })
      .catch(error => {
        if (error.response?.status === 401) {
          alert("Authentication required. Please log in.");
        } else {
          console.error("An error occurred while updating the user!", error);
        }
      });
  };

  const deleteUsers = (UserID) => {
    api.delete(`${baseURL}/Users/${UserID}`)
      .then(() => {
        fetchUsers();
      })
      .catch(error => {
        if (error.response?.status === 401) {
          alert("Authentication required. Please log in.");
        } else if (error.response?.status === 400) {
          alert(error.response.data.error);
        } else {
          console.error("Error deleting user:", error);
          alert("Error deleting user. Please try again.");
        }
      });
  };

  // CRUD functions for IdeaCategories
  const fetchIdeaCategories = () => {
    axios.get(`${baseURL}/IdeaCategories`).then(response => {
      setIdeaCategories(response.data);
    });
  };

  const createIdeaCategories = () => {
    const { CategoryName } = newIdeaCategories;
    if (!CategoryName) {
      alert("Category name is required.");
      return;
    }

    api.post(`${baseURL}/IdeaCategories`, { CategoryName })
      .then(() => {
        fetchIdeaCategories();
        setNewIdeaCategories({ CategoryName: "" });
      })
      .catch(error => {
        if (error.response?.status === 401) {
          alert("Authentication required. Please log in.");
        } else if (error.response?.status === 400) {
          alert(error.response.data.error);
        } else {
          console.error("Error creating category:", error);
          alert("Error creating category. Please try again.");
        }
      });
  };

  const updateIdeaCategories = () => {
    const { CategoryID, CategoryName } = newPutIdeaCategories;
    if (!CategoryID || !CategoryName) {
      alert("All fields are required.");
      return;
    }

    api.put(`${baseURL}/IdeaCategories/${CategoryID}`, { CategoryName })
      .then(() => {
        fetchIdeaCategories();
        setNewPutIdeaCategories({ CategoryID: "", CategoryName: "" });
      })
      .catch(error => {
        if (error.response?.status === 401) {
          alert("Authentication required. Please log in.");
        } else {
          console.error("An error occurred while updating IdeaCategories!", error);
        }
      });
  };

  const deleteIdeaCategories = (CategoryID) => {
    api.delete(`${baseURL}/IdeaCategories/${CategoryID}`)
      .then(() => {
        fetchIdeaCategories();
      })
      .catch(error => {
        if (error.response?.status === 401) {
          alert("Authentication required. Please log in.");
        } else if (error.response?.status === 400) {
          alert(error.response.data.error);
        } else {
          console.error("Error deleting category:", error);
          alert("Error deleting category. Please try again.");
        }
      });
  };

  // CRUD functions for IdeaStatus
  const fetchIdeaStatus = () => {
    axios.get(`${baseURL}/IdeaStatus`).then(response => {
      setIdeaStatus(response.data);
    });
  };

  const createIdeaStatus = () => {
    const { StatusName } = newIdeaStatus;
    if (!StatusName) {
      alert("Status name is required.");
      return;
    }

    api.post(`${baseURL}/IdeaStatus`, { StatusName })
      .then(() => {
        fetchIdeaStatus();
        setNewIdeaStatus({ StatusName: "" });
      })
      .catch(error => {
        if (error.response?.status === 401) {
          alert("Authentication required. Please log in.");
        } else if (error.response?.status === 400) {
          alert(error.response.data.error);
        } else {
          console.error("Error creating status:", error);
          alert("Error creating status. Please try again.");
        }
      });
  };

  const updateIdeaStatus = () => {
    const { StatusID, StatusName } = newPutIdeaStatus;
    if (!StatusID || !StatusName) {
      alert("All fields are required.");
      return;
    }

    api.put(`${baseURL}/IdeaStatus/${StatusID}`, { StatusName })
      .then(() => {
        fetchIdeaStatus();
        setNewPutIdeaStatus({ StatusID: "", StatusName: "" });
      })
      .catch(error => {
        if (error.response?.status === 401) {
          alert("Authentication required. Please log in.");
        } else {
          console.error("An error occurred while updating the Status!", error);
        }
      });
  };

  const deleteIdeaStatus = (StatusID) => {
    api.delete(`${baseURL}/IdeaStatus/${StatusID}`)
      .then(() => {
        fetchIdeaStatus();
      })
      .catch(error => {
        if (error.response?.status === 401) {
          alert("Authentication required. Please log in.");
        } else if (error.response?.status === 400) {
          alert(error.response.data.error);
        } else {
          console.error("Error deleting status:", error);
          alert("Error deleting status. Please try again.");
        }
      });
  };

  // CRUD functions for Ideas (require authentication)
  const fetchIdeas = () => {
    if (!isAuthenticated) {
      alert("You need to be logged in to view your ideas.");
      return;
    }
    
    axios.get(`${baseURL}/Ideas`).then(response => {
      setIdeas(response.data);
    }).catch(error => {
      if (error.response?.status === 401) {
        alert("Authentication required. Please log in.");
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('jwtToken');
        setJwtToken(null);
      } else {
        console.error("Error fetching ideas:", error);
      }
    });
  };

  const createIdeas = () => {
    if (!isAuthenticated) {
      alert("You need to be logged in to create ideas.");
      return;
    }

    const { Title, Description, DueDate, CategoryID, StatusID } = newIdeas;
    if (!Title || !CategoryID || !StatusID) {
      alert("Title, Category and Status are required.");
      return;
    }

    api.post(`${baseURL}/Ideas`, { Title, Description, DueDate, CategoryID, StatusID })
      .then(() => {
        fetchIdeas();
        setNewIdeas({ Title: "", Description: "", DueDate: "", CategoryID: "", StatusID: "" });
      })
      .catch(error => {
        if (error.response?.status === 401) {
          alert("Authentication required. Please log in.");
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('jwtToken');
          setJwtToken(null);
        } else if (error.response?.status === 400) {
          alert(error.response.data.error);
        } else {
          console.error("Error creating idea:", error);
          alert("Error creating idea. Please try again.");
        }
      });
  };

  const updateIdeas = () => {
    if (!isAuthenticated) {
      alert("You need to be logged in to update ideas.");
      return;
    }

    const { IdeaID, Title, Description, DueDate, CategoryID, StatusID } = newPutIdeas;
    if (!IdeaID || !Title || !Description || !DueDate || !CategoryID || !StatusID) {
      alert("All fields are required.");
      return;
    }

    api.put(`${baseURL}/Ideas/${IdeaID}`, { Title, Description, DueDate, CategoryID, StatusID })
      .then(() => {
        fetchIdeas();
        setNewPutIdeas({ IdeaID: "", Title: "", Description: "", DueDate: "", CategoryID: "", StatusID: "" });
      })
      .catch(error => {
        if (error.response?.status === 401) {
          alert("Authentication required. Please log in.");
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('jwtToken');
          setJwtToken(null);
        } else if (error.response?.status === 403) {
          alert("Access denied: you can only modify your own ideas.");
        } else {
          console.error("Error updating idea:", error);
        }
      });
  };

  const deleteIdeas = (IdeaID) => {
    if (!isAuthenticated) {
      alert("You need to be logged in to delete ideas.");
      return;
    }

    api.delete(`${baseURL}/Ideas/${IdeaID}`).then(() => {
      fetchIdeas();
    }).catch(error => {
      if (error.response?.status === 401) {
        alert("Authentication required. Please log in.");
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('jwtToken');
        setJwtToken(null);
      } else if (error.response?.status === 403) {
        alert("Access denied: you can only delete your own ideas.");
      } else {
        console.error("Error deleting idea:", error);
      }
    });
  };

  useEffect(() => {
    fetchUsers();
    fetchIdeaCategories();
    fetchIdeaStatus();
    if (isAuthenticated) {
      fetchIdeas();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="App">
        <div className="app-header">
          <h1>💡 MindPool</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Header */}
      <div className="app-header">
        <h1>💡 MindPool</h1>
        <p>Manage your creative ideas efficiently and organized</p>
        
        {/* Authentication Section */}
        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-info">
              <img 
                src={user?.avatar} 
                alt="Avatar" 
                className="user-avatar"
                style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
              />
              <span className="user-name">Hello, {user?.displayName || user?.username}!</span>
              <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="login-section">
              <p>Login with GitHub to manage your ideas</p>
              <button className="btn btn-primary" onClick={handleLogin}>
                🔑 Login with GitHub
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Users Section */}
      <div className="section-container">
        <h2 className="section-title">👥 Users</h2>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              {isAuthenticated && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {Users.map(User => (
              <tr key={User.UserID}>
                <td>{User.UserID}</td>
                <td>{User.UserName}</td>
                <td>{User.Email}</td>
                {isAuthenticated && (
                  <td>
                    <button className="btn btn-danger" onClick={() => deleteUsers(User.UserID)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {isAuthenticated ? (
          <>
            <div className="form-section">
              <h3>➕ Create New User</h3>
              <div className="input-group">
                <div className="input-field">
                  <input
                    placeholder="User ID"
                    value={newUsers.UserID}
                    onChange={e => setNewUsers({ ...newUsers, UserID: e.target.value })}
                  />
                </div>
                <div className="input-field">
                  <input
                    placeholder="User Name"
                    value={newUsers.UserName}
                    onChange={e => setNewUsers({ ...newUsers, UserName: e.target.value })}
                  />
                </div>
                <div className="input-field">
                  <input
                    placeholder="Email"
                    value={newUsers.Email}
                    onChange={e => setNewUsers({ ...newUsers, Email: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn btn-success" onClick={createUsers}>Create User</button>
            </div>

            <div className="form-section">
              <h3>✏️ Update User</h3>
              <div className="input-group">
                <div className="input-field">
                  <input
                    placeholder="User ID"
                    value={newPutUsers.UserID}
                    onChange={e => setNewPutUsers({ ...newPutUsers, UserID: e.target.value })}
                  />
                </div>
                <div className="input-field">
                  <input
                    placeholder="New Name"
                    value={newPutUsers.UserName}
                    onChange={e => setNewPutUsers({ ...newPutUsers, UserName: e.target.value })}
                  />
                </div>
                <div className="input-field">
                  <input
                    placeholder="New Email"
                    value={newPutUsers.Email}
                    onChange={e => setNewPutUsers({ ...newPutUsers, Email: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn btn-primary" onClick={updateUsers}>Update User</button>
            </div>
          </>
        ) : (
          <div className="auth-notice">
            <p>🔒 Login required to create, update, or delete users</p>
          </div>
        )}
      </div>

      {/* Idea Categories Section */}
      <div className="section-container">
        <h2 className="section-title">📂 Idea Categories</h2>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category Name</th>
              {isAuthenticated && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {IdeaCategories.map(category => (
              <tr key={category.CategoryID}>
                <td>{category.CategoryID}</td>
                <td>{category.CategoryName}</td>
                {isAuthenticated && (
                  <td>
                    <button className="btn btn-danger" onClick={() => deleteIdeaCategories(category.CategoryID)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {isAuthenticated ? (
          <>
            <div className="form-section">
              <h3>➕ Create New Category</h3>
              <div className="input-group">
                <div className="input-field">
                  <input
                    placeholder="Category Name"
                    value={newIdeaCategories.CategoryName}
                    onChange={e => setNewIdeaCategories({ ...newIdeaCategories, CategoryName: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn btn-success" onClick={createIdeaCategories}>Create Category</button>
            </div>

            <div className="form-section">
              <h3>✏️ Update Category</h3>
              <div className="input-group">
                <div className="input-field">
                  <input
                    placeholder="Category ID"
                    value={newPutIdeaCategories.CategoryID}
                    onChange={e => setNewPutIdeaCategories({ ...newPutIdeaCategories, CategoryID: e.target.value })}
                  />
                </div>
                <div className="input-field">
                  <input
                    placeholder="New Name"
                    value={newPutIdeaCategories.CategoryName}
                    onChange={e => setNewPutIdeaCategories({ ...newPutIdeaCategories, CategoryName: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn btn-primary" onClick={updateIdeaCategories}>Update Category</button>
            </div>
          </>
        ) : (
          <div className="auth-notice">
            <p>🔒 Login required to create, update, or delete categories</p>
          </div>
        )}
      </div>

      {/* Idea Status Section */}
      <div className="section-container">
        <h2 className="section-title">📊 Idea Status</h2>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status Name</th>
              {isAuthenticated && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {IdeaStatus.map(status => (
              <tr key={status.StatusID}>
                <td>{status.StatusID}</td>
                <td>{status.StatusName}</td>
                {isAuthenticated && (
                  <td>
                    <button className="btn btn-danger" onClick={() => deleteIdeaStatus(status.StatusID)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {isAuthenticated ? (
          <>
            <div className="form-section">
              <h3>➕ Create New Status</h3>
              <div className="input-group">
                <div className="input-field">
                  <input
                    placeholder="Status Name"
                    value={newIdeaStatus.StatusName}
                    onChange={e => setNewIdeaStatus({ ...newIdeaStatus, StatusName: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn btn-success" onClick={createIdeaStatus}>Create Status</button>
            </div>

            <div className="form-section">
              <h3>✏️ Update Status</h3>
              <div className="input-group">
                <div className="input-field">
                  <input
                    placeholder="Status ID"
                    value={newPutIdeaStatus.StatusID}
                    onChange={e => setNewPutIdeaStatus({ ...newPutIdeaStatus, StatusID: e.target.value })}
                  />
                </div>
                <div className="input-field">
                  <input
                    placeholder="New Name"
                    value={newPutIdeaStatus.StatusName}
                    onChange={e => setNewPutIdeaStatus({ ...newPutIdeaStatus, StatusName: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn btn-primary" onClick={updateIdeaStatus}>Update Status</button>
            </div>
          </>
        ) : (
          <div className="auth-notice">
            <p>🔒 Login required to create, update, or delete statuses</p>
          </div>
        )}
      </div>

      {/* Ideas Section - Only visible when authenticated */}
      {isAuthenticated ? (
        <div className="section-container">
          <h2 className="section-title">💡 My Ideas</h2>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Due Date</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Ideas.map(idea => (
                <tr key={idea.IdeaID}>
                  <td>{idea.IdeaID}</td>
                  <td>{idea.Title}</td>
                  <td>{idea.Description}</td>
                  <td>{idea.DueDate}</td>
                  <td>{idea.CategoryName || idea.CategoryID}</td>
                  <td>{idea.StatusName || idea.StatusID}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => deleteIdeas(idea.IdeaID)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="form-section">
            <h3>➕ Create New Idea</h3>
            <div className="input-group">
              <div className="input-field">
                <input
                  placeholder="Title"
                  value={newIdeas.Title}
                  onChange={e => setNewIdeas({ ...newIdeas, Title: e.target.value })}
                />
              </div>
              <div className="input-field">
                <input
                  placeholder="Description"
                  value={newIdeas.Description}
                  onChange={e => setNewIdeas({ ...newIdeas, Description: e.target.value })}
                />
              </div>
              <div className="input-field">
                <input
                  type="date"
                  placeholder="Due Date"
                  value={newIdeas.DueDate}
                  onChange={e => setNewIdeas({ ...newIdeas, DueDate: e.target.value })}
                />
              </div>
              <div className="input-field">
                <select
                  value={newIdeas.CategoryID}
                  onChange={e => setNewIdeas({ ...newIdeas, CategoryID: e.target.value })}
                >
                  <option value="">Select a Category</option>
                  {IdeaCategories.map(category => (
                    <option key={category.CategoryID} value={category.CategoryID}>
                      {category.CategoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-field">
                <select
                  value={newIdeas.StatusID}
                  onChange={e => setNewIdeas({ ...newIdeas, StatusID: e.target.value })}
                >
                  <option value="">Select a Status</option>
                  {IdeaStatus.map(status => (
                    <option key={status.StatusID} value={status.StatusID}>
                      {status.StatusName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button className="btn btn-success" onClick={createIdeas}>Create Idea</button>
          </div>

          <div className="form-section">
            <h3>✏️ Update Idea</h3>
            <div className="input-group">
              <div className="input-field">
                <input
                  placeholder="Idea ID"
                  value={newPutIdeas.IdeaID}
                  onChange={e => setNewPutIdeas({ ...newPutIdeas, IdeaID: e.target.value })}
                />
              </div>
              <div className="input-field">
                <input
                  placeholder="Title"
                  value={newPutIdeas.Title}
                  onChange={e => setNewPutIdeas({ ...newPutIdeas, Title: e.target.value })}
                />
              </div>
              <div className="input-field">
                <input
                  placeholder="Description"
                  value={newPutIdeas.Description}
                  onChange={e => setNewPutIdeas({ ...newPutIdeas, Description: e.target.value })}
                />
              </div>
              <div className="input-field">
                <input
                  type="date"
                  placeholder="Due Date"
                  value={newPutIdeas.DueDate}
                  onChange={e => setNewPutIdeas({ ...newPutIdeas, DueDate: e.target.value })}
                />
              </div>
              <div className="input-field">
                <select
                  value={newPutIdeas.CategoryID}
                  onChange={e => setNewPutIdeas({ ...newPutIdeas, CategoryID: e.target.value })}
                >
                  <option value="">Select a Category</option>
                  {IdeaCategories.map(category => (
                    <option key={category.CategoryID} value={category.CategoryID}>
                      {category.CategoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-field">
                <select
                  value={newPutIdeas.StatusID}
                  onChange={e => setNewPutIdeas({ ...newPutIdeas, StatusID: e.target.value })}
                >
                  <option value="">Select a Status</option>
                  {IdeaStatus.map(status => (
                    <option key={status.StatusID} value={status.StatusID}>
                      {status.StatusName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" onClick={updateIdeas}>Update Idea</button>
          </div>
        </div>
      ) : (
        <div className="section-container">
          <h2 className="section-title">🔒 Protected Ideas</h2>
          <div className="auth-message">
            <p>To access and manage your ideas, you need to login with your GitHub account.</p>
            <button className="btn btn-primary" onClick={handleLogin}>
              🔑 Login with GitHub
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
