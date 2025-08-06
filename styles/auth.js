// auth.js

const CLIENT_ID = '1319474218550689863';
const REDIRECT_URI = 'https://chuwigirls.github.io/user.html';
const SCOPES = 'identify';

function getStoredUser() {
  return JSON.parse(localStorage.getItem('discordUser'));
}

function setStoredUser(user) {
  localStorage.setItem('discordUser', JSON.stringify(user));
}

function clearStoredUser() {
  localStorage.removeItem('discordUser');
}

function isLoggedIn() {
  return !!getStoredUser();
}

function redirectToDiscordOAuth() {
  const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${SCOPES}`;
  window.location.href = oauthUrl;
}

function fetchDiscordUser(token) {
  return fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(res => res.json());
}

function handleOAuthRedirect() {
  if (window.location.hash.includes('access_token')) {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('access_token');
    if (token) {
      fetchDiscordUser(token).then(user => {
        setStoredUser({ ...user, token });
        updateNavbarUI();
      });
    }
  } else {
    updateNavbarUI(); // In case user already logged in
  }
}

function updateNavbarUI() {
  const loginBtn = document.getElementById('login-btn');
  const userDropdown = document.getElementById('user-dropdown');

  const user = getStoredUser();
  if (user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userDropdown) {
      userDropdown.querySelector('.username').textContent = user.username;
      userDropdown.style.display = 'block';
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'block';
    if (userDropdown) userDropdown.style.display = 'none';
  }
}

function logout() {
  clearStoredUser();
  updateNavbarUI();
}

// Call this on every page that uses login
document.addEventListener('DOMContentLoaded', () => {
  handleOAuthRedirect();

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});
