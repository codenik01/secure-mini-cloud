import React, { useState } from 'react';
import axios from 'axios';
import { ShieldAlert } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/auth';

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await axios.post(`${API_URL}/register`, { username, password, role: 'Admin' }); // For demo, defaulting to Admin to test container routes easily
        setIsRegister(false);
        setError('Registration successful! Please login.');
      } else {
        const { data } = await axios.post(`${API_URL}/login`, { username, password });
        onLogin(data.token, data.role);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="glass-panel animate-fade-in" style={{ width: 400, textAlign: 'center' }}>
        <ShieldAlert size={48} color="#3b82f6" style={{ marginBottom: 20 }} />
        <h2>{isRegister ? 'Create Account' : 'Welcome to IAM'}</h2>
        <p className="header-subtitle" style={{ marginBottom: 24, marginTop: 8 }}>SecureMiniCloud Identity Authentication</p>
        
        {error && <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Username" 
            className="input-field" 
            value={username} onChange={e => setUsername(e.target.value)} required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="input-field" 
            value={password} onChange={e => setPassword(e.target.value)} required 
          />
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {isRegister ? 'Register' : 'Access Platform'}
          </button>
        </form>
        
        <p style={{ marginTop: 24, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isRegister ? 'Already have access? ' : 'Need access? '}
          <span 
            style={{ color: 'var(--accent-color)', cursor: 'pointer' }} 
            onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? 'Login here' : 'Register Admin'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
