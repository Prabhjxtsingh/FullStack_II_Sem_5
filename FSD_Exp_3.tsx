import React, { useState, createContext, useContext, useEffect } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { LogOut, User, Shield, FileText, Settings, AlertTriangle, LayoutDashboard, Eye } from 'lucide-react';

// Define available roles
const ROLES = {
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
};

// Mock user database
const MOCK_USERS = [
  { id: 1, username: 'admin_user', password: 'password', role: ROLES.ADMIN, name: 'Alice Admin' },
  { id: 2, username: 'editor_user', password: 'password', role: ROLES.EDITOR, name: 'Bob Editor' },
  { id: 3, username: 'viewer_user', password: 'password', role: ROLES.VIEWER, name: 'Charlie Viewer' },
];

// Create Authentication Context
const AuthContext = createContext(null);

// Auth Provider Component to manage authentication state
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate loading user from local storage on initial render
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('mock_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn("localStorage is not available in this sandbox environment.");
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = MOCK_USERS.find(
          (u) => u.username === username && u.password === password
        );
        if (foundUser) {
          // In a real app, you would store a JWT token, not user details in local storage
          const userWithoutPassword = { id: foundUser.id, username: foundUser.username, role: foundUser.role, name: foundUser.name };
          setUser(userWithoutPassword);
          try {
            localStorage.setItem('mock_user', JSON.stringify(userWithoutPassword));
          } catch (e) {
            console.warn("Failed to save to localStorage.");
          }
          resolve(userWithoutPassword);
        } else {
          reject(new Error('Invalid username or password'));
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('mock_user');
    } catch (e) {
      console.warn("Failed to remove from localStorage.");
    }
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
const useAuth = () => useContext(AuthContext);

// Protected Route Component to handle authorization
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading authentication state...</div>;
  }

  if (!user) {
    // Redirect to login if not authenticated, saving the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    // Redirect to unauthorized page if authenticated but missing roles
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// --- Pages ---

const LoginPage = () => {
  const [username, setUsername] = useState('admin_user');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to redirect after successful login
  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-indigo-600">
          <Shield size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to RBAC Demo
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Use the mock credentials provided below to test roles.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200 flex items-center gap-2">
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Available Test Accounts:</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center justify-between p-2 bg-indigo-50 rounded cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => {setUsername('admin_user'); setPassword('password')}}>
                <div><strong>admin_user</strong> (pwd: password)</div>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">Admin</span>
              </li>
              <li className="flex items-center justify-between p-2 bg-green-50 rounded cursor-pointer hover:bg-green-100 transition-colors" onClick={() => {setUsername('editor_user'); setPassword('password')}}>
                <div><strong>editor_user</strong> (pwd: password)</div>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Editor</span>
              </li>
              <li className="flex items-center justify-between p-2 bg-blue-50 rounded cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => {setUsername('viewer_user'); setPassword('password')}}>
                <div><strong>viewer_user</strong> (pwd: password)</div>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Viewer</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Layout Component for authenticated routes
const AppLayout = ({ children }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Shield className="text-indigo-600 mr-2" />
          <span className="text-xl font-bold text-gray-800">RBAC System</span>
        </div>
        
        <div className="p-4 flex-1">
          <div className="mb-6 px-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Logged in as</p>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            <Link to="/dashboard" className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <LayoutDashboard className="mr-3 h-5 w-5 text-gray-400" />
              Dashboard (All)
            </Link>
            
            {/* Conditional Navigation based on roles */}
            {hasRole([ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER]) && (
              <Link to="/content" className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                <FileText className="mr-3 h-5 w-5 text-gray-400" />
                Content (Viewers+)
              </Link>
            )}

            {hasRole([ROLES.ADMIN, ROLES.EDITOR]) && (
              <Link to="/editor-tools" className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                <FileText className="mr-3 h-5 w-5 text-gray-400" />
                Editor Tools (Editors+)
              </Link>
            )}

            {hasRole([ROLES.ADMIN]) && (
              <Link to="/settings" className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                <Settings className="mr-3 h-5 w-5 text-gray-400" />
                System Settings (Admin)
              </Link>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        {children}
      </div>
    </div>
  );
};

// --- Protected Pages ---

const DashboardPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <p className="text-gray-700 mb-4">
          Welcome to the dashboard, <strong>{user.name}</strong>. Your current role is <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{user.role}</span>.
        </p>
        <p className="text-gray-500 text-sm">
          This page is accessible to all authenticated users regardless of their specific role.
        </p>
      </div>
    </div>
  );
};

const ContentPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Content Viewer</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4 text-indigo-600">
            <Eye />
            <h2 className="text-xl font-semibold text-gray-900">Public Content</h2>
          </div>
          <p className="text-gray-700 mb-4">
            This page represents content that can be viewed by anyone who is logged in (Viewer, Editor, or Admin).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
             <div className="border border-gray-200 rounded p-4 bg-gray-50">
               <h3 className="font-medium text-gray-900">Article 1</h3>
               <p className="text-sm text-gray-500 mt-1">Introduction to RBAC principles and implementation strategies.</p>
             </div>
             <div className="border border-gray-200 rounded p-4 bg-gray-50">
               <h3 className="font-medium text-gray-900">Article 2</h3>
               <p className="text-sm text-gray-500 mt-1">Best practices for securing React applications using context.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditorToolsPage = () => {
  const { hasRole } = useAuth();
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Editor Workspace</h1>
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md mb-6 flex items-start gap-3">
           <Shield className="mt-0.5 text-green-600" size={20} />
           <div>
             <h3 className="font-semibold text-sm">Editor Privileges Active</h3>
             <p className="text-sm mt-1 text-green-700">You have access to this route because your role is either Editor or Admin.</p>
           </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Management Tools</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Draft Article: React Routing</p>
              <p className="text-sm text-gray-500">Last edited 2 hours ago</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700">Preview</button>
              <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">Edit</button>
              
              {/* Conditional UI Element within a page based on role */}
              {hasRole([ROLES.ADMIN]) && (
                <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 ml-2" title="Only Admins can delete">Delete</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">System Settings</h1>
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-4 rounded-md mb-6 flex items-start gap-3">
           <AlertTriangle className="mt-0.5 text-indigo-600" size={20} />
           <div>
             <h3 className="font-semibold text-sm">Administrator Access Only</h3>
             <p className="text-sm mt-1 text-indigo-700">This highly sensitive area is restricted to Admin roles only.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-5">
             <div className="flex items-center gap-2 mb-3">
               <User className="text-gray-500" size={20}/>
               <h3 className="font-semibold text-gray-900">User Management</h3>
             </div>
             <p className="text-sm text-gray-600 mb-4">Add, remove, or modify user roles and permissions across the system.</p>
             <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-medium text-sm transition-colors">Manage Users</button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-5">
             <div className="flex items-center gap-2 mb-3">
               <Settings className="text-gray-500" size={20}/>
               <h3 className="font-semibold text-gray-900">Global Configuration</h3>
             </div>
             <p className="text-sm text-gray-600 mb-4">Adjust application-wide settings, security policies, and integrations.</p>
             <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-medium text-sm transition-colors">System Preferences</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-600">You do not have the required permissions to view this page.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Routes enclosed in AppLayout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                   <Navigate to="/dashboard" replace />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/content"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER]}>
                <AppLayout>
                  <ContentPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/editor-tools"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EDITOR]}>
                <AppLayout>
                  <EditorToolsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}