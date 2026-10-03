import React, { useState } from 'react';

const GitHubCard = () => {
  const [username, setUsername] = useState('');
  const [data, setData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState('');

  const githubUsers = [
    "torvalds", "gaearon", "yyx990803", "tj", "ThePrimeagen",
    "octocat", "github", "openai", "facebook", "microsoft"
  ];

  const loadGitHub = () => {
    if (!username) {
      setError("❗ Veuillez entrer un nom d'utilisateur.");
      return;
    }
    setError('');
    fetch(`https://api.github.com/users/${username}`)
      .then(res => {
        if (!res.ok) throw new Error("Utilisateur introuvable");
        return res.json();
      })
      .then(user => {
        setData(user);
        return fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=3`);
      })
      .then(res => res.json())
      .then(repos => setRepos(repos))
      .catch(err => {
        setError("❌ Utilisateur introuvable ou API GitHub non disponible.");
        setData(null);
        setRepos([]);
      });
  };

  const loadRandomUser = () => {
    const random = githubUsers[Math.floor(Math.random() * githubUsers.length)];
    setUsername(random);
    setTimeout(loadGitHub, 0);
  };

  return (
    <div className="card" id="github">
      <h2>🔍 Rechercher un utilisateur GitHub</h2>
      <input
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Ex : torvalds"
      />
      <div>
        <button onClick={loadGitHub}>Voir le profil</button>
        <button onClick={loadRandomUser}>🔄 Aléatoire</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && (
        <div>
          <img
            src={data.avatar_url}
            alt="avatar"
            width="100"
            style={{ borderRadius: '50%', marginTop: '10px' }}
          />
          <h3>📊 Statistiques de {data.login}</h3>
          <p>👥 Followers : {data.followers}</p>
          <p>📦 Dépôts publics : {data.public_repos}</p>
          <p>📍 Localisation : {data.location || 'Non spécifiée'}</p>
          <p>
            <a href={data.html_url} target="_blank" rel="noreferrer">
              Voir le profil GitHub
            </a>
          </p>
          <h4>📁 Derniers dépôts :</h4>
          {repos.length > 0 ? (
            repos.map((repo, i) => (
              <p key={i}>
                <strong>{repo.name}</strong><br />
                ⭐ {repo.stargazers_count} | 🍴 {repo.forks_count}<br />
                <a href={repo.html_url} target="_blank" rel="noreferrer">Voir le dépôt</a>
              </p>
            ))
          ) : (
            <p>Aucun dépôt trouvé.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GitHubCard;
