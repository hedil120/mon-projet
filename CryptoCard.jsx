import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const cryptoList = [
  "bitcoin", "ethereum", "litecoin", "dogecoin",
  "solana", "cardano", "ripple", "avalanche-2"
];

export default function CryptoCard() {
  const [crypto, setCrypto] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const updateClock = () => {
    const now = new Date();
    return now.toLocaleString();
  };

  const loadCrypto = (name) => {
    setLoading(true);
    setError('');
    fetch(`https://api.coingecko.com/api/v3/coins/${name}`)
      .then(res => res.json())
      .then(data => {
        const info = {
          name: data.name,
          symbol: data.symbol.toUpperCase(),
          price: data.market_data.current_price.usd,
          marketCap: data.market_data.market_cap.usd,
          volume: data.market_data.total_volume.usd,
          rank: data.market_cap_rank,
          change24h: data.market_data.price_change_percentage_24h,
          website: data.links.homepage[0],
          time: updateClock()
        };
        setCrypto(info);
        return fetch(`https://api.coingecko.com/api/v3/coins/${name}/market_chart?vs_currency=usd&days=7`);
      })
      .then(res => res.json())
      .then(chartData => {
        const labels = chartData.prices.map(p => new Date(p[0]).toLocaleDateString());
        const prices = chartData.prices.map(p => p[1]);

        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(chartRef.current, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Prix (USD)',
              data: prices,
              borderColor: '#2ecc71',
              backgroundColor: 'rgba(46, 204, 113, 0.2)',
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: { display: false },
              y: { beginAtZero: false }
            }
          }
        });
        setLoading(false);
      })
      .catch(() => {
        setError("❌ Impossible de charger les données.");
        setLoading(false);
      });
  };

  useEffect(() => {
    const random = cryptoList[Math.floor(Math.random() * cryptoList.length)];
    loadCrypto(random);
  }, []);

  const loadRandomCrypto = () => {
    const random = cryptoList[Math.floor(Math.random() * cryptoList.length)];
    loadCrypto(random);
  };

  return (
    <div className="card" id="crypto">
      {loading ? (
        <h2>Chargement...</h2>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div>
          <h2>💰 {crypto.name} ({crypto.symbol})</h2>
          <p>Prix actuel : ${crypto.price.toFixed(2)}</p>
          <p>Classement : #{crypto.rank}</p>
          <p>Market Cap : ${crypto.marketCap.toLocaleString()}</p>
          <p>Volume 24h : ${crypto.volume.toLocaleString()}</p>
          <p style={{
            color: crypto.change24h >= 0 ? 'green' : 'red',
            fontWeight: 'bold'
          }}>
            {crypto.change24h >= 0 ? '⬆️' : '⬇️'} {crypto.change24h.toFixed(2)}%
          </p>
          <p><a href={crypto.website} target="_blank" rel="noreferrer">🔗 Site officiel</a></p>
          <p id="cryptoTime">🕒 {crypto.time}</p>
        </div>
      )}
      <p><button onClick={loadRandomCrypto}>🔄 Nouvelle Crypto</button></p>
      <canvas id="cryptoChart" ref={chartRef} width="300" height="150"></canvas>
    </div>
  );
}
