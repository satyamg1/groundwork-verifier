import React from 'react';

export default function ClaimsQueue({ claims, selectedClaimId, onSelectClaim, filter, onFilterChange }) {
  if (!claims || claims.length === 0) {
    return <div className="text-muted" style={{ padding: 16 }}>No claims found. Run verification.</div>;
  }

  // Sort: problems first (misgrounded, numeric_mismatch, unsupported, then supported, then resolved)
  const order = {
    numeric_mismatch: 1,
    misgrounded: 2,
    unsupported: 3,
    supported: 4,
    resolved: 5
  };

  const filteredClaims = claims.filter(c => filter === 'all' || c.status === filter);
  const sortedClaims = [...filteredClaims].sort((a, b) => order[a.status] - order[b.status]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, overflowX: 'auto' }}>
        <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : ''}`} onClick={() => onFilterChange('all')}>All</button>
        <button className={`btn btn-sm ${filter === 'misgrounded' ? 'btn-primary' : ''}`} onClick={() => onFilterChange('misgrounded')}>Misgrounded</button>
        <button className={`btn btn-sm ${filter === 'numeric_mismatch' ? 'btn-primary' : ''}`} onClick={() => onFilterChange('numeric_mismatch')}>Numeric</button>
        <button className={`btn btn-sm ${filter === 'unsupported' ? 'btn-primary' : ''}`} onClick={() => onFilterChange('unsupported')}>Unsupported</button>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {sortedClaims.map(claim => (
          <div 
            key={claim.id} 
            className={`claim-card ${selectedClaimId === claim.id ? 'selected' : ''}`}
            onClick={() => onSelectClaim(claim.id)}
          >
            <div className="claim-card-header">
              <span className={`badge status-${claim.status}`}>{claim.status.replace('_', ' ')}</span>
              <span className="text-xs text-muted">{claim.confidence} conf</span>
            </div>
            <div className="claim-text-snippet">{claim.claim_text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
