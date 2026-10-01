import React from 'react';
import { DECKS } from '../decks';

const DashboardScreen = ({ reports, userName, onStartTest, onViewReport, onBack }) => {
  const completedCount = Object.keys(reports).length;
  const isComplete = completedCount === DECKS.length;

  const generateMasterSynthesis = () => {
    return `Dr. Freud notes that you have completed ${completedCount} out of ${DECKS.length} psychological assessments. 
    ${isComplete 
      ? "Your complete profile indicates a complex interplay between your career anxieties (Znmd), your repressed shadow elements (Jungian), modern existential dread (Anxiety), and formative family dynamics (Childhood). Your psyche is highly guarded but demonstrates profound depths when pushed."
      : "Complete all remaining assessments to unlock your Master Psychological Synthesis."}`;
  };

  return (
    <div className="home-screen" style={{ overflowY: 'auto', padding: '2rem 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', flex: 1 }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '2.5rem' }}>{userName || 'Patient'}'s Profile</h1>
          <button className="action-btn" onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.6rem 1.2rem' }}>
             <span className="material-symbols-outlined">arrow_back</span>
             <span>Back to Menu</span>
          </button>
        </div>

        <div className="glass-panel" style={{ 
          background: isComplete ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)', 
          borderColor: isComplete ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)', 
          marginBottom: '3rem' 
        }}>
          <h2 style={{ color: isComplete ? 'var(--accent-color)' : '#fff', marginBottom: '1rem', fontSize: '1.8rem' }}>
            {isComplete ? 'Master Psychological Synthesis' : 'Overall Progress'}
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#e4e4e7' }}>
            {generateMasterSynthesis()}
          </p>
        </div>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#a1a1aa' }}>Assessment Domains</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', paddingBottom: '3rem' }}>
          {DECKS.map(deck => {
            const report = reports[deck.id];
            return (
              <div key={deck.id} className="glass-panel trigger-analysis-card" style={{ 
                borderLeft: report ? '4px solid #10b981' : '4px solid rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column',
                transition: 'transform 0.2s',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem' }}>{deck.name}</h3>
                    {report && <span className="material-symbols-outlined" style={{ color: '#10b981' }}>check_circle</span>}
                  </div>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{deck.description}</p>
                </div>
                
                {report ? (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button className="btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.95rem', flex: 1 }} onClick={() => onViewReport(deck.id)}>View Analysis</button>
                    <button className="btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.95rem', background: 'transparent', borderColor: 'rgba(255,255,255,0.2)', flex: 1 }} onClick={() => onStartTest(deck.id)}>Retake</button>
                  </div>
                ) : (
                  <button className="btn-primary start-btn" style={{ padding: '0.6rem 1rem', fontSize: '1rem', width: '100%' }} onClick={() => onStartTest(deck.id)}>Take Test</button>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default DashboardScreen;
