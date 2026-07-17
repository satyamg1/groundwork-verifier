import React, { useState, useEffect } from 'react';
import * as amplitude from '@amplitude/analytics-browser';

export default function EvidenceView({ claim, sources, onResolve, onOverrideLabel }) {
  const [dismissReason, setDismissReason] = useState('');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    if (claim) {
      setStartTime(Date.now());
      setIsEditingLabel(false);
      amplitude.track('Feature Discovered', {
        feature_name: 'resolve_claim',
        feature_category: 'manual_review',
        source: 'evidence_view'
      });
    }
  }, [claim?.id]);

  if (!claim) return null;

  const getSourceText = (sourceId) => {
    const s = sources.find(src => src.id === sourceId);
    return s ? s.content : "Source document not found in bundle.";
  };

  const citedText = getSourceText(claim.cited_source);
  const bestText = claim.best_source && claim.best_source !== claim.cited_source ? getSourceText(claim.best_source) : null;

  const renderHighlightedText = (text, quote) => {
    if (!quote || !text.includes(quote)) return text;
    const parts = text.split(quote);
    return (
      <>
        {parts[0]}
        <span className="quote-highlight">{quote}</span>
        {parts.slice(1).join(quote)}
      </>
    );
  };

  const handleResolveAction = (status, reason) => {
    amplitude.track('Feature Completed', {
      feature_name: 'resolve_claim',
      feature_category: 'manual_review',
      duration_seconds: (Date.now() - startTime) / 1000
    });
    onResolve(claim.id, status, reason);
  };

  return (
    <div className="evidence-split">
      <div className="evidence-box">
        <h4>Claim from Draft</h4>
        <div className="source-text">{claim.claim_text}</div>
        <div style={{ marginTop: 8 }} className="text-sm">
          <strong>Cited Source:</strong> {claim.cited_source || 'None'}
          {claim.best_source && claim.best_source !== claim.cited_source && (
             <span style={{ marginLeft: 16 }}><strong>Best Source:</strong> {claim.best_source}</span>
          )}
        </div>
      </div>

      <div className="explanation-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <strong>AI Status Label: </strong>
            {isEditingLabel ? (
              <select 
                value={claim.status} 
                onChange={(e) => {
                  onOverrideLabel(claim.id, e.target.value);
                  setIsEditingLabel(false);
                }}
                style={{ marginLeft: 8, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', fontSize: 13 }}
              >
                <option value="supported">supported</option>
                <option value="misgrounded">misgrounded</option>
                <option value="numeric_mismatch">numeric_mismatch</option>
                <option value="unsupported">unsupported</option>
              </select>
            ) : (
              <span className={`status-icon ${claim.status}`} style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 12, fontSize: 12, marginLeft: 8, border: '1px solid currentColor', background: 'transparent' }}>
                {claim.status}
              </span>
            )}
          </div>
          {!isEditingLabel && claim.status !== 'resolved' && (
            <button className="btn btn-sm" onClick={() => setIsEditingLabel(true)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}>
              Edit Label
            </button>
          )}
        </div>
        <div>
          <strong>Explanation:</strong> {claim.explanation}
        </div>
      </div>

      <div className="evidence-box">
        <h4>Source Evidence ({claim.cited_source})</h4>
        <div className="source-text">
          {renderHighlightedText(citedText, claim.evidence_quote)}
        </div>
      </div>

      {bestText && (
        <div className="evidence-box" style={{ borderLeft: '4px solid var(--accent)' }}>
          <h4>Alternative Source ({claim.best_source})</h4>
          <div className="source-text">
            {renderHighlightedText(bestText, claim.evidence_quote)}
          </div>
        </div>
      )}

      {claim.status !== 'resolved' && (
        <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <h4>Manual Resolution</h4>
          <div className="resolution-actions">
            {claim.status !== 'supported' && (
              <button className="btn btn-primary" onClick={() => handleResolveAction('resolved', 'Confirmed fix needed')}>
                Confirm fix needed
              </button>
            )}
            <button className="btn" onClick={() => handleResolveAction('supported', 'Manually accepted as supported')}>
              Accept as supported
            </button>
            <div style={{ display: 'flex', gap: 8, flex: 1 }}>
              <input 
                type="text" 
                placeholder="Reason to dismiss..." 
                className="dismiss-input" 
                style={{ marginTop: 0 }}
                value={dismissReason}
                onFocus={() => {
                  amplitude.track('Feature Activated', {
                    feature_name: 'resolve_claim',
                    feature_category: 'manual_review',
                    action_type: 'focus_dismiss_input'
                  });
                }}
                onChange={e => setDismissReason(e.target.value)}
              />
              <button 
                className="btn" 
                disabled={!dismissReason.trim()}
                onClick={() => {
                  handleResolveAction('resolved', `Dismissed: ${dismissReason}`);
                  setDismissReason('');
                }}
              >
                Dismiss flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
