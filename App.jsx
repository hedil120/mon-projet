import React from 'react';
import GitHubCard from './components/GitHubCard';
import CryptoCard from './components/CryptoCard';
import WeatherCard from './components/WeatherCard';
import './style.css';

export default function App() {
  return (
    <div>
      <h1>🌐 Mon Dashboard</h1>
      <button
        id="toggleTheme"
        onClick={() => document.body.classList.toggle('dark')}
        style={{ marginBottom: '20px' }}
      >
        🌓 Thème
      </button>
      <div className="dashboard">
        <GitHubCard />
        <CryptoCard />
        <WeatherCard />
      </div>
    </div>
  );
}
