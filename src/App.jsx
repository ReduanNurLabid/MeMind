import React, { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import AnalysisScreen from './components/AnalysisScreen';
import { generateSequence } from './decks';
import './index.css';

function App() {
  const [gameState, setGameState] = useState('home');
  const [answers, setAnswers] = useState([]);
  const [sequence, setSequence] = useState([]);
  const [inputMode, setInputMode] = useState('voice');
  const [userName, setUserName] = useState('');

  const startGame = (deckId, mode, name) => {
    const newSeq = generateSequence(deckId);
    setSequence(newSeq);
    setAnswers([]);
    setInputMode(mode);
    setUserName(name);
    setGameState('playing');
  };

  const handleFinish = (results) => {
    setAnswers(results);
    setGameState('analysis');
  };

  const restartGame = () => {
    setGameState('home');
    setAnswers([]);
    setSequence([]);
  };

  return (
    <>
      {gameState === 'home' && <HomeScreen onStart={startGame} />}
      {gameState === 'playing' && <GameScreen sequence={sequence} inputMode={inputMode} onFinish={handleFinish} />}
      {gameState === 'analysis' && <AnalysisScreen answers={answers} inputMode={inputMode} userName={userName} onRestart={restartGame} />}
    </>
  );
}

export default App;
