import React from 'react';

export default function DocumentModal({ docId, sources, onClose }) {
  if (!docId) return null;

  // If 'all', show repository
  const isAll = docId === 'all';
  
  const displaySources = isAll 
    ? sources 
    : sources.filter(s => s.id === docId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isAll ? 'Source Repository' : `Document Viewer: ${docId}`}</h3>
          <button className="btn btn-sm" onClick={onClose}>Close</button>
        </div>
        
        <div className="modal-body">
          {displaySources.length === 0 ? (
            <div className="text-muted">Document not found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {displaySources.map(doc => (
                <div key={doc.id} className="repo-doc">
                  <div className="repo-doc-header">
                    <strong>{doc.id}</strong> — {doc.title}
                  </div>
                  <div className="repo-doc-content">
                    {doc.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
