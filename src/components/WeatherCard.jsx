import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const apiKey = '97346cecd06b6c84eb1355ddbab61853';

export default function WeatherCard() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyTemps, setHourlyTemps] = useState([]);
  const [labels, setLabels] = useState([]);
  const [error, setError] = useState('');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const getWeatherByCity = (cityName) => {
    if (!cityName) {
      setError('Veuillez entrer une ville.');
      return;
    }
    setError('');
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric&lang=fr`)
      .then(res => {
        if (!res.ok) throw new Error('Ville non trouvée');
        return res.json();
      })
      .then(handleWeatherResponse)
      .catch(() => setError('❌ Ville non trouvée.'));
  };

  const handleWeatherResponse = (info) => {
    setData(info);
    getForecast(info.coord.lat, info.coord.lon);
  };

  const getForecast = (lat, lon) => {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        const daily = groupDailyForecast(data.list);
        setForecast(daily);
        const temps = data.list.slice(0, 8);
        setHourlyTemps(temps.map(h => h.main.temp));
        setLabels(temps.map(h => `${new Date(h.dt * 1000).getHours()}h`));
      })
      .catch(() => setError("Erreur lors de la récupération des prévisions."));
  };

  const groupDailyForecast = (list) => {
    const daily = {};
    list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString('fr-FR', { weekday: 'short', timeZone: 'UTC' });
      const hour = date.getUTCHours();
      if (hour >= 11 && hour <= 13) {
        daily[day] = {
          temp_min: item.main.temp_min,
          temp_max: item.main.temp_max,
          icon: item.weather[0].icon,
          description: item.weather[0].description
        };
      }
    });
    return Object.entries(daily).map(([day, data]) => ({ day, ...data }));
  };

  const drawChart = () => {
    if (chartInstance.current) chartInstance.current.destroy();
    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Température (°C)',
          data: hourlyTemps,
          borderColor: '#fcd34d',
          backgroundColor: 'rgba(252, 211, 77, 0.2)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false },
          x: {}
        }
      }
    });
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=fr`)
            .then(res => res.json())
            .then(handleWeatherResponse);
        },
        () => setError("Erreur de localisation.")
      );
    }
  }, []);

  useEffect(() => {
    if (hourlyTemps.length && labels.length) drawChart();
  }, [hourlyTemps, labels]);

  return (
    <div className="card" id="weather">
      <h2>🌦 Météo</h2>
      <div className="search">
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Entrez une ville"
        />
        <button onClick={() => getWeatherByCity(city)}>Rechercher</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && (
        <div>
          <h3>{data.name}, {data.sys.country}</h3>
          <img src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`} alt="icon" />
          <p>{capitalize(data.weather[0].description)}</p>
          <p>🌡 Température : {data.main.temp}°C</p>
          <p>💧 Humidité : {data.main.humidity}%</p>
          <p>🌬 Vent : {data.wind.speed} m/s</p>
          <p>📊 Pression : {data.main.pressure} hPa</p>
        </div>
      )}

      {forecast.length > 0 && (
        <>
          <h3>Prévisions sur 5 jours</h3>
          <div className="forecast-container">
            {forecast.map((f, i) => (
              <div className="forecast-card" key={i}>
                <p>{f.day}</p>
                <img src={`https://openweathermap.org/img/wn/${f.icon}@2x.png`} alt="" />
                <p>{Math.round(f.temp_max)}° / {Math.round(f.temp_min)}°</p>
                <p style={{ fontSize: '12px' }}>{capitalize(f.description)}</p>
              </div>
            ))}
          </div>
        </>
      )}
      <canvas ref={chartRef} width="600" height="200" style={{ marginTop: '20px' }}></canvas>
    </div>
  );
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
