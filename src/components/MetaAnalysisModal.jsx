import React, { useEffect } from 'react';
import * as amplitude from '@amplitude/analytics-browser';

export default function MetaAnalysisModal({ metaAnalysis, onClose }) {
  useEffect(() => {
    if (metaAnalysis) {
      amplitude.track('Feature Discovered', {
        feature_name: 'meta_analysis',
        feature_category: 'core_workflow',
        source: 'header_button'
      });
      amplitude.track('Feature Activated', {
        feature_name: 'meta_analysis',
        feature_category: 'core_workflow'
      });
    }
  }, [metaAnalysis]);

  if (!metaAnalysis) return null;

  const getRiskColor = (score) => {
    switch (score?.toLowerCase()) {
      case 'high': return '#dc2626'; // red
      case 'medium': return '#d97706'; // orange
      case 'low': return '#059669'; // green
      default: return 'var(--text)';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2>Verification Meta-Analysis</h2>
          <button className="btn btn-sm" onClick={() => {
            amplitude.track('Feature Completed', {
              feature_name: 'meta_analysis',
              feature_category: 'core_workflow',
              action_type: 'close_modal'
            });
            onClose();
          }}>Close</button>
        </div>
        
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px 0' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Overall Risk Score</div>
            <div style={{ 
              fontWeight: 700, 
              fontSize: 18, 
              color: getRiskColor(metaAnalysis.overall_risk_score),
              textTransform: 'uppercase'
            }}>
              {metaAnalysis.overall_risk_score}
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: 8 }}>Executive Summary</h4>
            <p style={{ lineHeight: 1.6 }}>{metaAnalysis.summary}</p>
          </div>

          {metaAnalysis.key_issues && metaAnalysis.key_issues.length > 0 && (
            <div>
              <h4 style={{ marginBottom: 8 }}>Key Issues</h4>
              <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {metaAnalysis.key_issues.map((issue, idx) => (
                  <li key={idx} style={{ lineHeight: 1.5 }}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
