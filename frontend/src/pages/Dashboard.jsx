import React from 'react';
import { Activity, Server, FileText } from 'lucide-react';

function Dashboard() {
  return (
    <div className="animate-fade-in">
      <h2 className="header-title">Infrastructure Overview</h2>
      <p className="header-subtitle">Real-time metrics from your private cloud deployment.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 12, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 8 }}>
              <Server color="#3b82f6" />
            </div>
            <h3>Containers Running</h3>
          </div>
          <h1 style={{ fontSize: '3rem' }}>3</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Active EC2 equivalents</p>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 12, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8 }}>
              <FileText color="#10b981" />
            </div>
            <h3>Storage Objects</h3>
          </div>
          <h1 style={{ fontSize: '3rem' }}>14</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Encrypted files in MinIO</p>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 }}>
              <Activity color="#ef4444" />
            </div>
            <h3>Security Events</h3>
          </div>
          <h1 style={{ fontSize: '3rem' }}>2</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Suspicious login attempts blocked</p>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: 32 }}>
        <h3>Grafana Monitoring Preview</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>View system performance metrics routed through Prometheus.</p>
        <div style={{ height: 300, background: 'rgba(0,0,0,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Metrics stream mapped to localhost:3000</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
