import React, { useState, useEffect } from 'react';
import * as amplitude from '@amplitude/analytics-browser';
import Header from './components/Header';
import Footer from './components/Footer';
import DraftPanel from './components/DraftPanel';
import ClaimsQueue from './components/ClaimsQueue';
import EvidenceView from './components/EvidenceView';
import DocumentModal from './components/DocumentModal';
import SetupView from './components/SetupView';
import MetaAnalysisModal from './components/MetaAnalysisModal';
import initialDraftData from './data/draft.json';
import initialSourcesData from './data/sources.json';

function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [draftData, setDraftData] = useState(initialDraftData);
  const [sourcesData, setSourcesData] = useState(initialSourcesData);

  const [status, setStatus] = useState('idle'); // idle | running | done | error
  const [progress, setProgress] = useState('');
  const [claims, setClaims] = useState([]);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [filter, setFilter] = useState('all');
  const [viewingDoc, setViewingDoc] = useState(null);
  const [metaAnalysis, setMetaAnalysis] = useState(null);
  const [viewingMeta, setViewingMeta] = useState(false);

  useEffect(() => {
    const identifyEvent = new amplitude.Identify();
    identifyEvent.set('signup_date', new Date().toISOString().split('T')[0]);
    identifyEvent.set('user_type', 'prototype_tester');
    amplitude.identify(identifyEvent);
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      amplitude.track('Feature Discovered', {
        feature_name: 'verify_section',
        feature_category: 'core_workflow',
        source: 'setup_complete'
      });
    }
  }, [isSetupComplete]);

  const addAudit = (message) => {
    setAuditLog(prev => [...prev, { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), message }]);
  };

  const handleVerify = async () => {
    amplitude.track('Feature Activated', {
      feature_name: 'verify_section',
      feature_category: 'core_workflow'
    });

    setStatus('running');
    setProgress('Extracting claims');
    setMetaAnalysis(null);
    
    // Simulate staging for visual feedback
    setTimeout(() => setProgress('Matching sources'), 800);
    setTimeout(() => setProgress('Checking support'), 1600);

    const startTime = Date.now();
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: draftData,
          sources: sourcesData
        })
      });

      if (!res.ok) throw new Error('Verification failed');
      const data = await res.json();
      
      // Parse data.claims defensively
      if (!data || !data.claims || !Array.isArray(data.claims)) {
        throw new Error('Invalid response schema');
      }

      setClaims(data.claims);
      if (data.meta_analysis) {
        setMetaAnalysis(data.meta_analysis);
      }
      setStatus('done');
      setProgress('');
      addAudit('Verification run completed.');
      
      amplitude.track('Feature Completed', {
        feature_name: 'verify_section',
        feature_category: 'core_workflow',
        duration_seconds: (Date.now() - startTime) / 1000
      });
    } catch (err) {
      console.error(err);
      setStatus('error');
      setProgress('');
      
      amplitude.track('Feature Abandoned', {
        feature_name: 'verify_section',
        feature_category: 'core_workflow',
        step_abandoned: 'api_fetch_error'
      });
    }
  };

  const handleResolve = (claimId, newStatus, reason) => {
    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: newStatus } : c));
    addAudit(`Claim ${claimId} marked as ${newStatus} by analyst — note: '${reason}'`);
  };

  const handleOverrideLabel = (claimId, newLabel) => {
    amplitude.track('Feature Activated', {
      feature_name: 'override_ai_label',
      feature_category: 'manual_review',
      new_label: newLabel
    });
    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: newLabel } : c));
    addAudit(`Claim ${claimId} AI label manually overridden to ${newLabel}`);
  };

  if (!isSetupComplete) {
    return (
      <SetupView 
        initialDraft={draftData}
        initialSources={sourcesData}
        onComplete={(draft, sources) => {
          setDraftData(draft);
          setSourcesData(sources);
          setIsSetupComplete(true);
        }}
      />
    );
  }

  return (
    <>
      <Header 
        matter={draftData.matter}
        section={draftData.section}
        status={status}
        progress={progress}
        onVerify={handleVerify}
        onViewRepo={() => setViewingDoc('all')}
        hasMeta={!!metaAnalysis}
        onViewMeta={() => setViewingMeta(true)}
        onBackToSetup={() => {
          setIsSetupComplete(false);
          setClaims([]);
          setStatus('idle');
          setAuditLog([]);
          setSelectedClaimId(null);
          setMetaAnalysis(null);
        }}
      />
      
      <div className="workspace">
        <div className="panel" style={{ flex: 1.2 }}>
          <div className="panel-header">Draft Document</div>
          <div className="panel-content">
            <DraftPanel 
              draft={draftData} 
              claims={claims} 
              selectedClaimId={selectedClaimId}
              onSelectClaim={setSelectedClaimId}
              onViewDoc={setViewingDoc}
              sources={sourcesData}
            />
          </div>
        </div>

        <div className="panel" style={{ flex: 1 }}>
          <div className="panel-header">
            Claims Queue
          </div>
          <div className="panel-content" style={{ padding: 0 }}>
            <ClaimsQueue 
              claims={claims}
              selectedClaimId={selectedClaimId}
              onSelectClaim={setSelectedClaimId}
              filter={filter}
              onFilterChange={setFilter}
            />
          </div>
        </div>

        <div className="panel" style={{ flex: 1.2 }}>
          <div className="panel-header">Evidence View</div>
          <div className="panel-content">
            {selectedClaimId ? (
              <EvidenceView 
                claim={claims.find(c => c.id === selectedClaimId)}
                sources={sourcesData}
                onResolve={handleResolve}
                onOverrideLabel={handleOverrideLabel}
              />
            ) : (
              <div className="text-muted" style={{ textAlign: 'center', marginTop: 40 }}>
                {claims.length > 0 ? "Select a claim to view evidence." : "Run verification to see claims."}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer claims={claims} auditLog={auditLog} />

      <DocumentModal 
        docId={viewingDoc} 
        sources={sourcesData} 
        onClose={() => setViewingDoc(null)} 
      />

      {viewingMeta && (
        <MetaAnalysisModal 
          metaAnalysis={metaAnalysis}
          onClose={() => setViewingMeta(false)}
        />
      )}
    </>
  );
}

export default App;
