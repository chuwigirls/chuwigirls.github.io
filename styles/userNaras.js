async function requireLogin() {
  const user = await fetchUserProfile(); // <-- your existing auth/session fetch

  if (!user || !user.discordId) {
    // No session → redirect to login
    window.location.href = "/login.html";
    return null;
  }

  return user;
}

document.addEventListener("DOMContentLoaded", async () => {
  const spinner = document.getElementById("userNaras-spinner");
  if (spinner) spinner.style.display = "block"; // show immediately

  const user = await requireLogin();
  if (!user) return; // stop if not logged in

  renderUserNaras(user.discordId);
});

async function renderUserNaras(discordId) {
  const allNarasEl = document.getElementById("all-naras");
  const backBtn = document.getElementById("backToProfile");
  const spinner = document.getElementById("userNaras-spinner");
  const errorEl = document.getElementById("userNaras-error");

  if (backBtn) {
    backBtn.onclick = () => {
      window.location.href = "/user.html";
    };
  }

  // Reset UI
  allNarasEl.innerHTML = "";
  if (errorEl) errorEl.style.display = "none";

  try {
    const masterlist = await fetchMasterlist();

    const userNaras = masterlist.filter(
      (row) => row["Discord ID"]?.trim() === String(discordId).trim()
    );

    if (spinner) spinner.style.display = "none";

    if (!userNaras.length) {
      allNarasEl.innerHTML = "<p>No Naras found for this user.</p>";
      return;
    }

    allNarasEl.innerHTML = "";
    userNaras.forEach((nara) => {
      const naraName = String(nara["Nara"]).trim();

      const card = document.createElement("div");
      card.className = "narapedia-card";

      const link = document.createElement("a");
      link.href = `/narapedia/masterlist.html?design=${encodeURIComponent(naraName)}`;
      link.style.textDecoration = "none";

      const img = document.createElement("img");
      img.src = nara["URL"] || "../assets/narwhal.png";
      img.alt = naraName;

      const name = document.createElement("h3");
      name.textContent = naraName;

      link.appendChild(img);
      link.appendChild(name);
      card.appendChild(link);
      allNarasEl.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Error fetching Naras:", err);
    if (spinner) spinner.style.display = "none";
    if (errorEl) errorEl.style.display = "block";
  }
}
