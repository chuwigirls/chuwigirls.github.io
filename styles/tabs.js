function initTabs(container) {
  const tablinks = container.querySelectorAll(".tablink");
  const tabcontent = container.querySelectorAll(".tabcontent");

  if (!tablinks.length || !tabcontent.length) return;

  function openPage(pageName, elmnt) {
    tabcontent.forEach(tc => tc.classList.remove("active"));
    tablinks.forEach(tl => tl.classList.remove("active"));

    const selectedTab = container.querySelector(`#${pageName}`);
    if (selectedTab) selectedTab.classList.add("active");
    if (elmnt) elmnt.classList.add("active");
  }

  tablinks.forEach(link => {
    link.addEventListener("click", function () {
      const pageName = this.getAttribute("data-page");
      openPage(pageName, this);
    });
  });

  // open first tab by default
  tablinks[0].click();
}

document.addEventListener("click", function (e) {
  const tabBtn = e.target.closest(".tablink");
  if (!tabBtn) return;

  const tabContainer = tabBtn.closest(".detail-card");
  if (!tabContainer) return;

  const page = tabBtn.dataset.page;

  // Hide all tab contents in this detail-card
  tabContainer.querySelectorAll(".tabcontent").forEach(tc => tc.classList.remove("active"));
  // Remove active from all buttons
  tabContainer.querySelectorAll(".tablink").forEach(btn => btn.classList.remove("active"));

  // Show selected
  const targetContent = tabContainer.querySelector(`#${page}`);
  if (targetContent) targetContent.classList.add("active");
  tabBtn.classList.add("active");
});
