import React, { useState } from 'react';

export default function Footer({ claims, auditLog }) {
  const [showLog, setShowLog] = useState(false);

  const supported = claims.filter(c => c.status === 'supported').length;
  const misgrounded = claims.filter(c => c.status === 'misgrounded').length;
  const unsupported = claims.filter(c => c.status === 'unsupported').length;
  const numeric = claims.filter(c => c.status === 'numeric_mismatch').length;
  const resolved = claims.filter(c => c.status === 'resolved').length;
  
  const total = claims.length;
  const resolvedPercent = total === 0 ? 0 : Math.round(((supported + resolved) / total) * 100);

  const exportLog = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLog, null, 2));
    const node = document.createElement('a');
    node.setAttribute("href", dataStr);
    node.setAttribute("download", "audit-log.json");
    document.body.appendChild(node);
    node.click();
    node.remove();
  };

  return (
    <div className="app-footer">
      <div style={{ display: 'flex', gap: 16 }}>
        {total > 0 ? (
          <>
            <span>{supported} supported &middot; {misgrounded} misgrounded &middot; {unsupported} unsupported &middot; {numeric} numeric mismatch &middot; {resolved} manually resolved</span>
            <span style={{ color: 'var(--text-tertiary)' }}>|</span>
            <span className="font-semibold">{resolvedPercent}% resolved</span>
          </>
        ) : (
          <span className="text-muted">No claims verified yet</span>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <button className="btn btn-sm" onClick={() => setShowLog(!showLog)}>
          Audit Log ({auditLog.length})
        </button>
        <button className="btn btn-sm" onClick={exportLog} style={{ marginLeft: 8 }}>
          Export
        </button>

        {showLog && (
          <div className="audit-log-modal">
            <div className="audit-log-header">
              Audit Trail
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowLog(false)}>✕</button>
            </div>
            <div className="audit-log-content">
              {auditLog.length === 0 ? (
                <div className="text-muted" style={{ textAlign: 'center', padding: 20 }}>No actions logged yet.</div>
              ) : (
                auditLog.map((entry, idx) => (
                  <div key={idx} className="audit-entry">
                    <span style={{ color: 'var(--text-tertiary)', marginRight: 8 }}>{entry.time}</span>
                    {entry.message}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
