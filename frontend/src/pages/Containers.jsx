import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Square, Trash2, Server } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/containers';

function Containers({ role }) {
  const [containers, setContainers] = useState([]);
  const [selectedImage, setSelectedImage] = useState('node');

  useEffect(() => {
    if (role === 'Admin') fetchContainers();
  }, [role]);

  const fetchContainers = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setContainers(data);
    } catch (error) {
      console.error('Failed to fetch containers');
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/create`, { imageType: selectedImage }, { headers: { Authorization: `Bearer ${token}` } });
      fetchContainers();
    } catch (error) {
      alert('Failed to start container (Ensure Docker is running)');
    }
  };

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      if (action === 'delete') {
        await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_URL}/${id}/${action}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchContainers();
    } catch (error) {
      // Ignore errors for now
    }
  };

  if (role !== 'Admin') {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: 60, color: 'var(--danger)' }}>
        <h2>Access Denied</h2>
        <p>Your RBAC role does not permit Container Management. Upgrade to Admin.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 className="header-title">Mini EC2 Orchestration</h2>
          <p className="header-subtitle">Spin up Node, Python, or Nginx micro-servers instantly.</p>
        </div>
        
        <div className="glass-panel" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '16px' }}>
          <select 
            className="input-field" 
            style={{ marginBottom: 0, width: 150 }}
            value={selectedImage}
            onChange={(e) => setSelectedImage(e.target.value)}
          >
            <option value="node">Node.js Server</option>
            <option value="python">Python Server</option>
            <option value="nginx">Nginx Web Server</option>
          </select>
          <button onClick={handleCreate} className="btn-primary">
            <Play size={20} /> Launch Instance
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {containers.map(c => {
          const isUp = c.State === 'running';
          return (
            <div key={c.Id} className="glass-panel" style={{ position: 'relative' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                 <Server color={isUp ? 'var(--success)' : 'var(--text-secondary)'} />
                 <h3 style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {c.Names[0].replace('/', '')}
                 </h3>
               </div>
               
               <p style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: '0.9rem' }}>
                 <strong>Image:</strong> {c.Image}
               </p>
               <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
                 <strong>Status:</strong> {c.Status}
               </p>

               <div style={{ display: 'flex', gap: 12 }}>
                 {isUp && (
                   <button onClick={() => handleAction(c.Id, 'stop')} className="btn-primary" style={{ background: '#f59e0b', flex: 1, justifyContent: 'center' }}>
                     <Square size={16} /> Stop
                   </button>
                 )}
                 <button onClick={() => handleAction(c.Id, 'delete')} className="btn-danger" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                   <Trash2 size={16} /> Terminate
                 </button>
               </div>
            </div>
          );
        })}
        {containers.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            No containers running. Start a new instance above.
          </div>
        )}
      </div>
    </div>
  );
}

export default Containers;
