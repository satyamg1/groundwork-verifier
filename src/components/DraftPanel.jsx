import React from 'react';

export default function DraftPanel({ draft, claims, selectedClaimId, onSelectClaim, onViewDoc, sources }) {
  
  const renderTextWithCitations = (text, statusClass = '', isSelected = false, claimId = null) => {
    // Regex matches text inside parentheses or brackets, e.g., (Ex. 14) or [Source A]
    const parts = text.split(/(\([^)]+\)|\[[^\]]+\])/g);
    
    return (
      <span 
        key={claimId || text}
        className={`draft-claim ${statusClass} ${isSelected ? 'selected' : ''}`}
        onClick={() => {
          if (claimId) onSelectClaim(claimId);
        }}
        title={claimId ? statusClass.replace('status-', '') : ''}
      >
        {parts.map((part, i) => {
          if (part.match(/^(\([^)]+\)|\[[^\]]+\])$/)) {
            const docIdRaw = part.replace(/[()[\]]/g, '').trim().toLowerCase();
            // Check if docIdRaw loosely matches any source ID
            const matchedSource = sources && sources.find(s => 
              docIdRaw.includes(s.id.toLowerCase()) || s.id.toLowerCase().includes(docIdRaw)
            );
            
            if (matchedSource) {
              return (
                <span 
                  key={i} 
                  className="citation-link" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDoc(matchedSource.id);
                  }}
                >
                  {part}
                </span>
              );
            }
          }
          return part;
        })}
      </span>
    );
  };

  if (!claims || claims.length === 0) {
    return (
      <div className="draft-text">
        <p>{renderTextWithCitations(draft.text)}</p>
        <div style={{ marginTop: 40, padding: 16, background: '#f8fafc', borderRadius: 4, color: 'var(--text-secondary)' }} className="text-sm">
          Click "Verify section" to cross-check this draft against the source repository.
        </div>
      </div>
    );
  }

  // Split text into chunks by periods, question marks, or exclamation marks 
  // followed by a space and an uppercase letter to avoid splitting on decimals (like 18.4%).
  const sentences = draft.text.split(/(?<=[.!?])\s+(?=[A-Z])/);

  return (
    <div className="draft-text">
      {sentences.map((sentence, idx) => {
        const text = sentence.trim();
        if (!text) return null;
        
        const normalize = (s) => (s || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const normalizedText = normalize(text);
        
        const matchedClaim = claims.find(c => {
          const normClaim = normalize(c.claim_text);
          return normClaim.length > 5 && normalizedText.includes(normClaim);
        });
        
        const statusClass = matchedClaim ? `status-${(matchedClaim.status || '').toLowerCase()}` : '';
        const claimId = matchedClaim ? matchedClaim.id : null;
        const isSelected = matchedClaim && matchedClaim.id === selectedClaimId;

        if (matchedClaim) {
          return renderTextWithCitations(
            text + ' ', 
            statusClass, 
            isSelected, 
            claimId
          );
        } else {
          return renderTextWithCitations(text + ' ');
        }
      })}
    </div>
  );
}
