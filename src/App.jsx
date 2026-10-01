import React, { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import AnalysisScreen from './components/AnalysisScreen';
import DashboardScreen from './components/DashboardScreen';
import { generateSequence } from './decks';
import './index.css';

function App() {
  const [gameState, setGameState] = useState('home');
  const [answers, setAnswers] = useState([]);
  const [sequence, setSequence] = useState([]);
  const [inputMode, setInputMode] = useState('voice');
  const [userName, setUserName] = useState('');

  const [activeDeck, setActiveDeck] = useState(null);
  const [reports, setReports] = useState(() => {
    try {
      const cached = localStorage.getItem('memind_reports');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const startGame = (deckId, mode, name) => {
    const newSeq = generateSequence(deckId);
    setSequence(newSeq);
    setAnswers([]);
    setInputMode(mode);
    setUserName(name);
    setActiveDeck(deckId);
    document.body.className = `theme-${deckId}`;
    setGameState('playing');
  };

  const handleFinish = (results) => {
    setAnswers(results);
    setGameState('analysis');
    
    // Save report to master profile
    const newReports = {
      ...reports,
      [activeDeck]: {
        answers: results,
        userName,
        inputMode,
        timestamp: Date.now()
      }
    };
    setReports(newReports);
    localStorage.setItem('memind_reports', JSON.stringify(newReports));
  };

  const loadCachedReport = (cacheData) => {
    setGameState('dashboard');
  };

  const handleViewReport = (deckId) => {
    const rep = reports[deckId];
    if (rep) {
      setAnswers(rep.answers);
      setUserName(rep.userName);
      setInputMode(rep.inputMode);
      setActiveDeck(deckId);
      document.body.className = `theme-${deckId}`;
      setGameState('analysis');
    }
  };

  const restartGame = () => {
    setGameState('dashboard');
    setAnswers([]);
    setSequence([]);
  };

  return (
    <>
      {gameState === 'home' && <HomeScreen onStart={startGame} onLoadCache={loadCachedReport} reports={reports} />}
      {gameState === 'dashboard' && (
        <DashboardScreen 
          reports={reports} 
          userName={userName || Object.values(reports)[0]?.userName} 
          onStartTest={(id) => startGame(id, 'voice', userName || Object.values(reports)[0]?.userName)} 
          onViewReport={handleViewReport} 
          onBack={() => setGameState('home')} 
        />
      )}
      {gameState === 'playing' && <GameScreen sequence={sequence} inputMode={inputMode} onFinish={handleFinish} />}
      {gameState === 'analysis' && <AnalysisScreen answers={answers} inputMode={inputMode} userName={userName} onRestart={restartGame} />}
    </>
  );
}

export default App;
