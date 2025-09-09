// Replace this with your deployed GAS web app URL
const GAS_URL = "https://script.google.com/macros/s/AKfycbzO5xAQ9iUtJWgkeYYfhlIZmHQSj4kHjs5tnfQLvuU6L5HGyguUMU-9tTWTi8KGJ69U3A/exec";

// Example user info (replace with your actual auth/session values)
const discordId = "1234567890";
const username = "TestUser";

const tapImage = document.getElementById("tapImage");
const statusEl = document.getElementById("status");
let countdownInterval = null;

function saveState(state) {
  localStorage.setItem("springTapState", JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem("springTapState");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearState() {
  localStorage.removeItem("springTapState");
}

function setDisabled(disabled) {
  if (disabled) {
    tapImage.classList.add("disabled");
  } else {
    tapImage.classList.remove("disabled");
  }
}

async function attemptTap() {
  statusEl.textContent = "Checking...";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "springTap",
        discordId,
        username
      })
    });

    const data = await res.json();
    console.log("Response:", data);

    if (data.success) {
      // Success: show reward and save state
      setDisabled(true);
      statusEl.textContent = `You found ${data.amount} Crystals! Come back tomorrow.`;

      const waitUntil = Date.now() + 24 * 60 * 60 * 1000; // fallback
      saveState({
        tappedAt: new Date().toISOString(),
        waitUntil,
        reward: data.amount
      });
    } else {
      // Already tapped today: show countdown
      setDisabled(true);
      statusEl.textContent = `Already tapped! Reset in ${data.wait}.`;

      // Estimate reset time from GAS wait string
      const parts = data.wait.match(/(\d+)h (\d+)m/);
      let waitUntil = Date.now();
      if (parts) {
        const hours = parseInt(parts[1], 10);
        const minutes = parseInt(parts[2], 10);
        waitUntil += (hours * 60 + minutes) * 60 * 1000;
      }

      saveState({
        tappedAt: new Date().toISOString(),
        waitUntil,
        reward: null
      });

      startCountdown(waitUntil);
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error connecting to server.";
  }
}

function startCountdown(waitUntil) {
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    const diff = waitUntil - Date.now();
    if (diff <= 0) {
      clearInterval(countdownInterval);
      clearState();
      setDisabled(false);
      statusEl.textContent = "Tap is available again!";
      return;
    }
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    statusEl.textContent = `Already tapped! Reset in ${h}h ${m}m ${s}s.`;
  }, 1000);
}

function init() {
  const saved = loadState();
  if (saved && saved.waitUntil > Date.now()) {
    // Still locked
    setDisabled(true);
    if (saved.reward) {
      statusEl.textContent = `You found ${saved.reward} Crystals! Come back tomorrow.`;
    } else {
      startCountdown(saved.waitUntil);
    }
  } else {
    // Available
    clearState();
    setDisabled(false);
    statusEl.textContent = "Tap the crystal to collect your daily reward!";
  }
}

tapImage.addEventListener("click", () => {
  if (!tapImage.classList.contains("disabled")) {
    attemptTap();
  }
});

// On page load
init();
