import React from 'react';

export default function Header({ matter, section, status, progress, onVerify, onViewRepo, hasMeta, onViewMeta, onBackToSetup }) {
  const mode = import.meta.env.VITE_APP_MODE || 'MOCK';
  
  return (
    <div className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontWeight: 600 }}>Groundwork Verifier</div>
        <div className="text-muted text-sm">{matter} / {section}</div>
        <span className={`badge badge-mode ${mode.toLowerCase()}`}>{mode} MODE</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {status === 'running' && (
          <div className="progress-container">
            <span className={`progress-stage ${progress === 'Extracting claims' ? 'active' : ''}`}>Extracting claims</span> &rarr;
            <span className={`progress-stage ${progress === 'Matching sources' ? 'active' : ''}`}>Matching sources</span> &rarr;
            <span className={`progress-stage ${progress === 'Checking support' ? 'active' : ''}`}>Checking support</span>
          </div>
        )}
        
        {status === 'error' && (
          <span style={{ color: '#dc2626', fontSize: 13 }}>Failed to verify. Please try again.</span>
        )}
        
        <button className="btn btn-outline" onClick={onBackToSetup} style={{ marginRight: 8, background: 'transparent', border: '1px solid var(--border)' }}>
          &larr; Setup
        </button>

        {hasMeta && (
          <button className="btn" onClick={onViewMeta} style={{ background: '#f8fafc', color: 'var(--text)', border: '1px solid var(--border)' }}>
            View Meta-Analysis
          </button>
        )}

        <button className="btn" onClick={onViewRepo}>
          Source Repository
        </button>
        
        <button 
          className="btn btn-primary" 
          onClick={onVerify} 
          disabled={status === 'running'}
        >
          {status === 'error' ? 'Retry Verification' : 'Verify section'}
        </button>
      </div>
    </div>
  );
}
