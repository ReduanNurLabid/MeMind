import React, { useState, useEffect } from 'react';
import { DECKS } from '../decks';

const HomeScreen = ({ onStart, onLoadCache, reports }) => {
  const [step, setStep] = useState(1);
  const [selectedDeck, setSelectedDeck] = useState(DECKS[0].id);
  const [inputMode, setInputMode] = useState('voice');
  const [userName, setUserName] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    document.body.className = `theme-${selectedDeck}`;
  }, [selectedDeck]);

  const handleNextStep1 = () => {
    if (userName.trim().length < 3) {
      setNameError('Please enter a name with at least 3 letters.');
      return;
    }
    setNameError('');
    setStep(2);
  };

  return (
    <div className="home-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '0.5rem', textAlign: 'center', overflowY: 'auto' }}>
      <div className="glass-panel animate-fade-in" key={step} style={{ maxWidth: '850px', width: '100%', margin: 'auto' }}>
        
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '3.5rem', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
              Dr. Freud's <span style={{ color: 'var(--accent-color)', fontStyle: 'italic' }}>Test</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.4 }}>
              A rapid-fire word association game. Speak or type the very first thing that comes to your mind.<br/>
              <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>Don't think. Just react.</span> Break your mental filters.
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <input 
                type="text" 
                placeholder="Enter your name..." 
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  if (e.target.value.trim().length >= 3) setNameError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleNextStep1()}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '0.8rem 1.5rem',
                  fontSize: '1.25rem',
                  color: '#fff',
                  textAlign: 'center',
                  outline: 'none',
                  width: '100%',
                  maxWidth: '350px',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              {nameError && <p style={{ color: '#ef4444', fontSize: '0.95rem', marginTop: '0.75rem' }}>{nameError}</p>}
            </div>

            <button 
              className="btn-primary start-btn" 
              onClick={handleNextStep1} 
              style={{ 
                animation: userName.trim().length >= 3 ? 'pulse-glow 2s infinite' : 'none', 
                fontSize: '1.4rem', 
                padding: '0.8rem 3.5rem',
                fontWeight: '600',
                opacity: userName.trim().length >= 3 ? 1 : 0.5,
                transition: 'all 0.3s ease'
              }}>
              New Session &rarr;
            </button>
            
            {Object.keys(reports || {}).length > 0 && (
              <div style={{ marginTop: '2.5rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>You have existing psychological assessments saved.</p>
                <button 
                  onClick={() => onLoadCache()} 
                  className="btn-primary" 
                  style={{ fontSize: '1rem', padding: '0.6rem 1.5rem', borderColor: 'var(--text-muted)' }}
                >
                  View Master Profile ({Object.values(reports)[0]?.userName})
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Select a Deck</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Choose your psychological theme, {userName}.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
              {DECKS.map(deck => (
                <div 
                  key={deck.id}
                  className="deck-card"
                  onClick={() => setSelectedDeck(deck.id)}
                  style={{
                    background: selectedDeck === deck.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0,0,0,0.2)',
                    border: `2px solid ${selectedDeck === deck.id ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    textAlign: 'left',
                    boxShadow: selectedDeck === deck.id ? '0 0 15px var(--accent-glow)' : 'none'
                  }}
                >
                  <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: selectedDeck === deck.id ? '#fff' : 'var(--text-main)' }}>
                    {deck.name}
                  </h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    {deck.description}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => setStep(1)} style={{ padding: '0.8rem 2rem', fontSize: '1.2rem' }}>
                &larr; Back
              </button>
              <button className="btn-primary start-btn" onClick={() => setStep(3)} style={{ padding: '0.8rem 2.5rem', fontSize: '1.2rem' }}>
                Next &rarr;
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Input Mode</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>How would you like to respond?</p>
            
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '3rem' }}>
              <button 
                className="mode-btn"
                onClick={() => setInputMode('voice')}
                style={{
                  background: inputMode === 'voice' ? 'var(--accent-color)' : 'rgba(0,0,0,0.2)',
                  border: `2px solid ${inputMode === 'voice' ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)'}`,
                  color: inputMode === 'voice' ? 'var(--bg-dark)' : '#fff', 
                  padding: '1rem 2rem', borderRadius: '12px', cursor: 'pointer',
                  fontSize: '1.2rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', fontWeight: '600'
                }}>
                🎙️ Voice (Recommended)
              </button>
              <button 
                className="mode-btn"
                onClick={() => setInputMode('keyboard')}
                style={{
                  background: inputMode === 'keyboard' ? 'var(--accent-color)' : 'rgba(0,0,0,0.2)',
                  border: `2px solid ${inputMode === 'keyboard' ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)'}`,
                  color: inputMode === 'keyboard' ? 'var(--bg-dark)' : '#fff', 
                  padding: '1rem 2rem', borderRadius: '12px', cursor: 'pointer',
                  fontSize: '1.2rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', fontWeight: '600'
                }}>
                ⌨️ Keyboard
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => setStep(2)} style={{ padding: '0.8rem 2rem', fontSize: '1.2rem' }}>
                &larr; Back
              </button>
              <button className="btn-primary start-btn" onClick={() => onStart(selectedDeck, inputMode, userName.trim())} style={{ padding: '0.8rem 3.5rem', fontSize: '1.4rem' }}>
                Begin the Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
