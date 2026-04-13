import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, Download, Loader, File, Trash, Lock } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/storage';

function Storage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setFiles(data);
    } catch (error) {
      console.error('Failed to fetch files');
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/upload`, formData, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      });
      fetchFiles();
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/download/${filename}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename.replace(/^\\d+_/, ''));
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert('Download failed');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 className="header-title">Object Storage</h2>
          <p className="header-subtitle"><Lock size={16} /> All objects are AES-256 encrypted before landing in MinIO buckets.</p>
        </div>
        
        <div>
          <input type="file" id="fileUpload" style={{ display: 'none' }} onChange={handleUpload} />
          <label htmlFor="fileUpload" className="btn-primary" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
            {uploading ? <Loader className="animate-spin" /> : <UploadCloud size={20} />}
            {uploading ? 'Encrypting & Uploading...' : 'Upload File'}
          </label>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>File Name</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Size</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.name} style={{ borderTop: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <File size={20} color="var(--accent-color)" />
                  {file.name.replace(/^\d+_/, '')}
                </td>
                <td style={{ padding: '16px 24px' }}>{(file.size / 1024).toFixed(2)} KB</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button onClick={() => handleDownload(file.name)} className="btn-primary" style={{ padding: '8px 12px', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-color)' }}>
                    <Download size={16} /> Download
                  </button>
                </td>
              </tr>
            ))}
            {files.length === 0 && (
              <tr>
                <td colSpan="3" style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No objects found. Upload your first encrypted object.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Storage;
