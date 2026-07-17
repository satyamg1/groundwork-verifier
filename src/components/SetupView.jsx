import React, { useState, useEffect } from 'react';
import * as amplitude from '@amplitude/analytics-browser';

export default function SetupView({ initialDraft, initialSources, onComplete }) {
  const [matter, setMatter] = useState(initialDraft?.matter || '');
  const [section, setSection] = useState(initialDraft?.section || '');
  const [text, setText] = useState(initialDraft?.text || '');
  const [sources, setSources] = useState(initialSources || []);

  const [editingSourceId, setEditingSourceId] = useState(null);
  const [newSourceId, setNewSourceId] = useState('');
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceContent, setNewSourceContent] = useState('');

  const [startTime] = useState(Date.now());
  const [hasActivated, setHasActivated] = useState(false);

  useEffect(() => {
    amplitude.track('Feature Discovered', {
      feature_name: 'setup_workspace',
      feature_category: 'onboarding',
      source: 'initial_load'
    });
  }, []);

  const triggerActivate = () => {
    if (!hasActivated) {
      amplitude.track('Feature Activated', {
        feature_name: 'setup_workspace',
        feature_category: 'onboarding'
      });
      setHasActivated(true);
    }
  };

  const handleAddSource = () => {
    const trimmedId = newSourceId.trim();
    if (!trimmedId || !newSourceContent.trim()) return;

    if (editingSourceId) {
      if (trimmedId !== editingSourceId && sources.some(s => s.id === trimmedId)) {
        alert("A source with this ID already exists.");
        return;
      }
      setSources(prev => prev.map(s => 
        s.id === editingSourceId 
          ? { id: trimmedId, title: newSourceTitle.trim() || trimmedId, content: newSourceContent.trim() } 
          : s
      ));
      setEditingSourceId(null);
    } else {
      if (sources.some(s => s.id === trimmedId)) {
        alert("A source with this ID already exists.");
        return;
      }
      setSources(prev => [...prev, {
        id: trimmedId,
        title: newSourceTitle.trim() || trimmedId,
        content: newSourceContent.trim()
      }]);
    }

    amplitude.track('Feature Used', {
      feature_name: 'setup_workspace',
      feature_category: 'onboarding',
      action_type: 'add_source'
    });

    setNewSourceId('');
    setNewSourceTitle('');
    setNewSourceContent('');
  };

  const handleEditSource = (source) => {
    setEditingSourceId(source.id);
    setNewSourceId(source.id);
    setNewSourceTitle(source.title);
    setNewSourceContent(source.content);
  };

  const handleCancelEdit = () => {
    setEditingSourceId(null);
    setNewSourceId('');
    setNewSourceTitle('');
    setNewSourceContent('');
  };

  const handleRemoveSource = (id) => {
    setSources(prev => prev.filter(s => s.id !== id));
    if (editingSourceId === id) {
      handleCancelEdit();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || sources.length === 0) {
      alert("Please provide draft text and at least one source document.");
      return;
    }
    
    amplitude.track('Feature Completed', {
      feature_name: 'setup_workspace',
      feature_category: 'onboarding',
      duration_seconds: (Date.now() - startTime) / 1000
    });

    onComplete(
      { matter: matter || 'Untitled Matter', section: section || 'Draft', text },
      sources
    );
  };

  return (
    <div className="setup-view" style={{ maxWidth: 1000, margin: '40px auto', padding: 20 }}>
      <h1 style={{ marginBottom: 8 }}>Groundwork Verifier Setup</h1>
      <p className="text-muted" style={{ marginBottom: 32 }}>Enter your draft text and upload the source documents it cites.</p>
      
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="panel">
            <div className="panel-header">1. Draft Document</div>
            <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <input 
                  type="text" 
                  placeholder="Matter Name (e.g. Meridian SEC Inv.)" 
                  value={matter}
                  onChange={e => setMatter(e.target.value)}
                  onFocus={triggerActivate}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 4 }}
                />
                <input 
                  type="text" 
                  placeholder="Section (e.g. Factual Background)" 
                  value={section}
                  onChange={e => setSection(e.target.value)}
                  onFocus={triggerActivate}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 4 }}
                />
              </div>
              <textarea 
                placeholder="Paste your draft text here. Ensure it contains citations matching your source IDs (e.g. (Ex. 14))."
                value={text}
                onChange={e => setText(e.target.value)}
                onFocus={triggerActivate}
                style={{ width: '100%', height: 300, padding: 12, border: '1px solid var(--border)', borderRadius: 4, fontFamily: 'var(--font-serif)', resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="panel">
            <div className="panel-header">2. Source Repository</div>
            <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 6, border: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>{editingSourceId ? 'Edit Source' : 'Add Source'}</h4>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <input 
                    type="text" 
                    placeholder="Citation ID (e.g. Ex. 14)" 
                    value={newSourceId}
                    onChange={e => setNewSourceId(e.target.value)}
                    onFocus={triggerActivate}
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 4 }}
                  />
                  <input 
                    type="text" 
                    placeholder="Document Title (Optional)" 
                    value={newSourceTitle}
                    onChange={e => setNewSourceTitle(e.target.value)}
                    onFocus={triggerActivate}
                    style={{ flex: 2, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 4 }}
                  />
                </div>
                <textarea 
                  placeholder="Paste the full text of the source document here..."
                  value={newSourceContent}
                  onChange={e => setNewSourceContent(e.target.value)}
                  onFocus={triggerActivate}
                  style={{ width: '100%', height: 120, padding: 12, border: '1px solid var(--border)', borderRadius: 4, marginBottom: 12, resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                    onClick={handleAddSource}
                    disabled={!newSourceId.trim() || !newSourceContent.trim()}
                  >
                    {editingSourceId ? 'Update Source' : 'Add Source Document'}
                  </button>
                  {editingSourceId && (
                    <button className="btn" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>Added Sources ({sources.length})</h4>
                {sources.length === 0 ? (
                  <div className="text-muted text-sm">No sources added yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                    {sources.map(s => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f1f5f9', borderRadius: 4, fontSize: 13 }}>
                        <div>
                          <strong>{s.id}</strong> — {s.title}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            className="btn btn-sm" 
                            style={{ padding: '4px 8px', color: 'var(--accent)' }}
                            onClick={() => handleEditSource(s)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm" 
                            style={{ padding: '4px 8px', color: '#dc2626' }}
                            onClick={() => handleRemoveSource(s.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <button 
          className="btn btn-primary" 
          style={{ padding: '12px 32px', fontSize: 16 }}
          onClick={handleSubmit}
          disabled={!text.trim() || sources.length === 0}
        >
          Enter Workspace &rarr;
        </button>
      </div>
    </div>
  );
}
