import React, { useState, useEffect, useRef } from 'react';

const TIME_LIMIT = 5; // seconds per word

const GameScreen = ({ sequence, inputMode, onFinish }) => {
  const [countdown, setCountdown] = useState(2); // 2-second quick warm-up
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [answers, setAnswers] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(inputMode === 'voice');
  
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // Persistent refs to eliminate stale closure and multi-skip bugs
  const isGameActiveRef = useRef(false);
  const isProcessingRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const currentIndexRef = useRef(0);
  const answersRef = useRef([]);
  const wordStartTimeRef = useRef(Date.now());
  const handleNextWordRef = useRef(null);
  const interimDebounceRef = useRef(null);
  const lastProcessedTextRef = useRef('');

  const handleNextWord = (response) => {
    if (!isGameActiveRef.current || isProcessingRef.current) return;
    isProcessingRef.current = true;
    isTransitioningRef.current = true;

    if (interimDebounceRef.current) {
      clearTimeout(interimDebounceRef.current);
      interimDebounceRef.current = null;
    }

    const idx = currentIndexRef.current;
    const elapsed = (Date.now() - wordStartTimeRef.current) / 1000;
    const timeTaken = Math.min(TIME_LIMIT, Math.max(0.2, Number(elapsed.toFixed(1))));

    const cleanedResponse = (response || '').trim();
    // Cache the processed text so it can never be processed twice
    lastProcessedTextRef.current = cleanedResponse.toLowerCase();

    const newAnswers = [...answersRef.current, { ...sequence[idx], response: cleanedResponse, timeTaken }];
    answersRef.current = newAnswers;
    setAnswers(newAnswers);
    
    if (idx < sequence.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        currentIndexRef.current = idx + 1;
        setCurrentIndex(idx + 1);
        setInput('');
        setTimeLeft(TIME_LIMIT);
        wordStartTimeRef.current = Date.now();
        setIsTransitioning(false);
        isTransitioningRef.current = false;
        isProcessingRef.current = false;
        inputRef.current?.focus();
      }, 350); // 350ms smooth visual transition
    } else {
      isGameActiveRef.current = false;
      setTimeout(() => {
        onFinish(newAnswers);
      }, 50);
    }
  };

  // Keep handleNextWordRef in sync on every render
  handleNextWordRef.current = handleNextWord;

  // Initialize Speech Recognition continuously (never abort mid-game so mic never drops)
  useEffect(() => {
    if (inputMode === 'keyboard') {
      setSpeechSupported(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition API not supported in this browser.");
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setMicActive(true);
    };

    recognition.onend = () => {
      setMicActive(false);
      // Auto-reconnect if the browser drops connection during silence
      if (isGameActiveRef.current && inputMode === 'voice') {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      if (e.error === 'not-allowed') {
        setSpeechSupported(false);
        setMicActive(false);
      }
    };

    recognition.onresult = (event) => {
      // Discard any incoming audio if game is inactive or transitioning between words
      if (!isGameActiveRef.current || isProcessingRef.current || isTransitioningRef.current) return;

      // Discard residual audio from previous word arriving within 250ms of a new card
      const elapsedMs = Date.now() - wordStartTimeRef.current;
      if (elapsedMs < 250) return;

      let latestFinal = '';
      let latestInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0]?.transcript || '';
        if (event.results[i].isFinal) {
          latestFinal += transcript;
        } else {
          latestInterim += transcript;
        }
      }

      const finalCandidate = latestFinal.trim();
      const interimCandidate = latestInterim.trim();

      // Show live feedback immediately so user knows the mic is listening
      if (interimCandidate) {
        setInput(interimCandidate);
      }

      // 1. If finalized, submit immediately
      if (finalCandidate) {
        if (interimDebounceRef.current) clearTimeout(interimDebounceRef.current);
        setInput(finalCandidate);
        handleNextWordRef.current?.(finalCandidate);
        return;
      }

      // 2. If interim transcript arrived, auto-submit after a brief 350ms pause
      if (interimCandidate && interimCandidate.length >= 2) {
        if (interimDebounceRef.current) clearTimeout(interimDebounceRef.current);
        interimDebounceRef.current = setTimeout(() => {
          if (isGameActiveRef.current && !isProcessingRef.current && !isTransitioningRef.current) {
            handleNextWordRef.current?.(interimCandidate);
          }
        }, 350);
      }
    };
    
    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {}
    
    return () => {
      isGameActiveRef.current = false;
      if (interimDebounceRef.current) clearTimeout(interimDebounceRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, [inputMode]);

  // Pre-test Countdown: 2 -> 1 -> START
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished: Game starts NOW
      isGameActiveRef.current = true;
      isProcessingRef.current = false;
      wordStartTimeRef.current = Date.now();
      setTimeLeft(TIME_LIMIT);
    }
  }, [countdown]);

  // Active word timer: 5-second countdown per word
  useEffect(() => {
    if (countdown > 0 || isTransitioning || !isGameActiveRef.current) return;

    inputRef.current?.focus();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - wordStartTimeRef.current) / 1000;
      const remaining = Math.max(0, TIME_LIMIT - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        handleNextWordRef.current?.(inputRef.current?.value || '');
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [countdown, currentIndex, isTransitioning]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      handleNextWordRef.current?.(input);
    }
    // Strict Mode: No correcting your instincts
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
    }
  };

  const progressPercent = (timeLeft / TIME_LIMIT) * 100;
  const currentWord = sequence[currentIndex]?.word || '';

  return (
    <div className="game-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2rem' }}>
      {countdown > 0 ? (
        <div key="countdown-card" className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', textAlign: 'center', padding: '3.5rem 2rem' }}>
          <p style={{ color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>
            {inputMode === 'voice' ? "Calibrating Neural Sensors" : "Preparing Test Matrix"}
          </p>
          
          <h1 style={{ fontSize: '5rem', color: '#fff', margin: '1rem 0', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
            {countdown}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
            {inputMode === 'voice' && (
              <>
                <div style={{ 
                  width: '12px', height: '12px', borderRadius: '50%', 
                  background: micActive ? '#10b981' : '#f59e0b',
                  boxShadow: micActive ? '0 0 12px #10b981' : 'none',
                  animation: micActive ? 'pulse-glow 1.5s infinite' : 'none'
                }} />
                <span style={{ fontSize: '0.95rem', color: micActive ? '#10b981' : 'var(--text-muted)' }}>
                  {micActive ? "Microphone active & listening" : "Waking up audio stream..."}
                </span>
              </>
            )}
            {inputMode === 'keyboard' && (
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                Keep your hands on the keyboard. Do not think—just react.
              </span>
            )}
          </div>
        </div>
      ) : (
        <div key="word-card" className="glass-panel" style={{ width: '100%', maxWidth: '700px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          
          {/* Progress Bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: '100%', background: 'rgba(255,255,255,0.1)' }}>
            <div style={{ 
              height: '100%', 
              width: `${progressPercent}%`, 
              background: progressPercent > 30 ? 'var(--accent-color)' : '#ef4444',
              transition: 'width 0.05s linear, background 0.3s ease'
            }} />
          </div>

          <div style={{ 
            opacity: isTransitioning ? 0 : 1, 
            transform: isTransitioning ? 'scale(0.95)' : 'scale(1)', 
            transition: 'all 0.25s ease' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem', margin: 0 }}>
                Word {currentIndex + 1} of {sequence.length}
              </p>
              
              {/* Mic Indicator */}
              {speechSupported && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '10px', height: '10px', borderRadius: '50%', 
                    background: micActive ? '#10b981' : '#ef4444',
                    boxShadow: micActive ? '0 0 10px #10b981' : 'none',
                    animation: micActive ? 'pulse-glow 1.5s infinite' : 'none'
                  }} />
                  <span style={{ fontSize: '0.75rem', color: micActive ? '#10b981' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {micActive ? 'Listening...' : 'Connecting...'}
                  </span>
                </div>
              )}
            </div>
            
            <h2 style={{ fontSize: '4.5rem', marginBottom: '3rem', letterSpacing: '-0.02em', color: '#fff' }}>
              {currentWord}
            </h2>
            
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={inputMode === 'voice' && speechSupported ? "Speak your thought (or type)..." : "Type your first thought..."}
              disabled={isTransitioning}
              autoComplete="off"
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                fontSize: '1.5rem',
                color: '#fff',
                textAlign: 'center',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-color)';
                e.target.style.boxShadow = '0 0 15px rgba(99, 102, 241, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {inputMode === 'voice' && speechSupported ? "Say the first word out loud, it will auto-advance." : "Press Enter to submit"}
            </p>
          </div>

        </div>
      )}
    </div>
  );
};

export default GameScreen;

