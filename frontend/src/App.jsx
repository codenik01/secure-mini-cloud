import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, Server, Shield, LogOut } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Storage from './pages/Storage';
import Containers from './pages/Containers';
import './index.css';

function Sidebar({ onLogout }) {
  const location = useLocation();
  
  return (
    <nav className="sidebar">
      <h1>SecureMiniCloud</h1>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link to="/storage" className={`nav-link ${location.pathname === '/storage' ? 'active' : ''}`}>
          <Database size={20} /> Storage
        </Link>
        <Link to="/containers" className={`nav-link ${location.pathname === '/containers' ? 'active' : ''}`}>
          <Server size={20} /> Containers
        </Link>
      </div>
      <div style={{ marginTop: 'auto' }}>
        <button className="nav-link" style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }} onClick={onLogout}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </nav>
  );
}

function Layout({ children, onLogout }) {
  return (
    <div className="app-container">
      <Sidebar onLogout={onLogout} />
      <main className="main-content header-title">
        {children}
      </main>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleLogin = (newToken, newRole) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setRole(newRole);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/containers" element={<Containers role={role} />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
