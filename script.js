// GITHUB STATISTIQUES
const githubUsers = [
  "torvalds", "gaearon", "yyx990803", "tj", "ThePrimeagen",
  "octocat", "github", "openai", "facebook", "microsoft"
];

function loadRandomUser() {
  const randomUser = githubUsers[Math.floor(Math.random() * githubUsers.length)];
  document.getElementById("githubUser").value = randomUser;
  loadGitHub();
}

function loadGitHub() {
  const username = document.getElementById('githubUser').value.trim();
  const container = document.getElementById('githubStats');

  if (!username) {
    container.innerHTML = "❗ Veuillez entrer un nom d'utilisateur.";
    return;
  }

  fetch(`https://api.github.com/users/${username}`)
    .then(res => {
      if (!res.ok) throw new Error("Utilisateur introuvable");
      return res.json();
    })
    .then(data => {
      container.innerHTML = `
        <img src="${data.avatar_url}" alt="Avatar" width="100" style="border-radius:50%;">
        <h3>📊 Statistiques de ${data.login}</h3>
        <p>👥 Followers : ${data.followers}</p>
        <p>📦 Dépôts publics : ${data.public_repos}</p>
        <p>📍 Localisation : ${data.location || "Non spécifiée"}</p>
        <p><a href="${data.html_url}" target="_blank">Voir le profil GitHub</a></p>
        <h4>📁 Derniers dépôts :</h4>
        <div id="repos">Chargement...</div>
      `;

      return fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=3`);
    })
    .then(res => res.json())
    .then(repos => {
      const repoList = repos.map(repo => `
        <p><strong>${repo.name}</strong><br>
        ⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}<br>
        <a href="${repo.html_url}" target="_blank">Voir le dépôt</a></p>
      `).join('');
      document.getElementById('repos').innerHTML = repoList || "Aucun dépôt trouvé.";
    })
    .catch(error => {
      console.error(error);
      container.innerHTML = "❌ Erreur : utilisateur introuvable ou API non disponible.";
    });
}

// CRYPTO (CoinGecko)
const cryptoList = ["bitcoin", "ethereum", "litecoin", "dogecoin", "solana", "cardano", "ripple", "avalanche-2"];
let cryptoChart = null;
let clockInterval = null;

function updateClock() {
  const timeElement = document.getElementById("cryptoTime");
  if (timeElement) {
    const now = new Date();
    timeElement.textContent = `🕒 ${now.toLocaleString()}`;
  }
}

function loadRandomCrypto() {
  const randomCrypto = cryptoList[Math.floor(Math.random() * cryptoList.length)];
  loadCrypto(randomCrypto);
}

function loadCrypto(crypto) {
  const cryptoContainer = document.getElementById("cryptoContent");
  const chartCanvas = document.getElementById("cryptoChart");

  if (!chartCanvas) {
    console.error("Canvas non trouvé");
    return;
  }

  fetch(`https://api.coingecko.com/api/v3/coins/${crypto}`)
    .then(res => res.json())
    .then(info => {
      const name = info.name;
      const symbol = info.symbol.toUpperCase();
      const price = info.market_data.current_price.usd;
      const marketCap = info.market_data.market_cap.usd;
      const volume = info.market_data.total_volume.usd;
      const rank = info.market_cap_rank;
      const change24h = info.market_data.price_change_percentage_24h;
      const website = info.links.homepage[0];

      const isPositive = change24h >= 0;
      const color = isPositive ? 'green' : 'red';
      const arrow = isPositive ? '⬆️' : '⬇️';
      const formattedChange = `${arrow} ${change24h.toFixed(2)}%`;

      cryptoContainer.innerHTML = `
        <h2>💰 ${name} (${symbol})</h2>
        <p>Prix actuel : $${price.toFixed(2)}</p>
        <p>Classement : #${rank}</p>
        <p>Market Cap : $${marketCap.toLocaleString()}</p>
        <p>Volume 24h : $${volume.toLocaleString()}</p>
        <p style="color:${color}; font-weight: bold;">Variation 24h : ${formattedChange}</p>
        <p><a href="${website}" target="_blank">🔗 Site officiel</a></p>
        <p id="cryptoTime">🕒 Chargement de l’heure...</p>
        <div id="cryptoMessage"><em>Chargement du graphique...</em></div>
      `;

      if (clockInterval) clearInterval(clockInterval);
      updateClock();
      clockInterval = setInterval(updateClock, 1000);

      return fetch(`https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=usd&days=7`);
    })
    .then(res => res.json())
    .then(data => {
      if (!data.prices || !data.prices.length) {
        throw new Error("Données de prix non disponibles");
      }

      document.getElementById("cryptoMessage").innerHTML = "";

      const labels = data.prices.map(p => new Date(p[0]).toLocaleDateString());
      const prices = data.prices.map(p => p[1]);

      if (cryptoChart) cryptoChart.destroy();

      cryptoChart = new Chart(chartCanvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Prix en USD',
            data: prices,
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { display: false },
            y: { beginAtZero: false }
          }
        }
      });
    })
    .catch(err => {
      console.error("Erreur chargement graphique crypto :", err);
      const msg = document.getElementById("cryptoMessage");
      if (msg) msg.innerHTML = "<p class='error'>❌ Impossible d'afficher le graphique.</p>";
    });
    

}

// METEO
const apiKey = "97346cecd06b6c84eb1355ddbab61853";

function getWeatherByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`;

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Ville non trouvée !");
      return response.json();
    })
    .then(handleWeatherResponse)
    .catch(error => {
      document.getElementById("weatherResult").innerHTML = `<p style="color:red">${error.message}</p>`;
    });
}

function getWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      document.getElementById("cityInput").value = data.name;
      handleWeatherResponse(data);
    })
    .catch(() => {
      document.getElementById("weatherResult").innerHTML = `<p style="color:red">Erreur lors de la localisation.</p>`;
    });
}

function handleWeatherResponse(data) {
  displayWeather(data);
  getForecast(data.coord.lat, data.coord.lon);
}

function displayWeather(data) {
  const icon = data.weather[0].icon;
  const html = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icon">
    <p>${capitalize(data.weather[0].description)}</p>
    <p>🌡 Température : ${data.main.temp}°C</p>
    <p>💧 Humidité : ${data.main.humidity}%</p>
    <p>🌬 Vent : ${data.wind.speed} m/s</p>
    <p>📊 Pression : ${data.main.pressure} hPa</p>
  `;
  document.getElementById("weatherResult").innerHTML = html;
}

function getForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const dailyData = groupDailyForecast(data.list);
      displayForecast(dailyData);
      const hourlyData = data.list.slice(0, 8); // Prochaines 24h (~3h x 8)
      displayHourlyChart(hourlyData);
    })
    .catch(err => {
      console.error("Erreur lors du chargement des prévisions", err);
      document.getElementById("forecast").innerHTML = "<p style='color:red'>Erreur lors du chargement des prévisions.</p>";
    });
}

function displayForecast(days) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  days.forEach(day => {
    const card = `
      <div class="forecast-card">
        <p>${day.day}</p>
        <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="">
        <p>${Math.round(day.temp_max)}° / ${Math.round(day.temp_min)}°</p>
        <p style="font-size: 12px;">${capitalize(day.description)}</p>
      </div>
    `;
    forecastContainer.innerHTML += card;
  });
}

function displayHourlyChart(hourlyData) {
  const ctx = document.getElementById("tempChart").getContext("2d");
  const labels = hourlyData.map(h => {
    const d = new Date(h.dt * 1000);
    return d.getHours() + "h";
  });
  const temps = hourlyData.map(h => h.main.temp);

  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Température (°C)",
        data: temps,
        borderColor: "#fcd34d",
        backgroundColor: "rgba(252, 211, 77, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          ticks: { color: "#fff" },
          grid: { color: "#333" }
        },
        x: {
          ticks: { color: "#fff" },
          grid: { color: "#333" }
        }
      }
    }
  });
}

function groupDailyForecast(list) {
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

  return Object.entries(daily).map(([day, data]) => ({
    day,
    ...data
  }));
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    document.getElementById("weatherResult").innerHTML = `<p style="color:red">Veuillez entrer une ville.</p>`;
    return;
  }
  getWeatherByCity(city);
}

function autoDetectLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        document.getElementById("weatherResult").innerHTML = "<p>🌍 Entrez une ville pour voir la météo.</p>";
      }
    );
  }
}

window.addEventListener("load", autoDetectLocation);



// Charger météo avec géolocalisation
window.addEventListener("load", () => {
  autoDetectLocation();   // pour météo
  loadRandomCrypto();     // pour crypto
  loadRandomUser();       // pour GitHub 
});
document.getElementById("toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

