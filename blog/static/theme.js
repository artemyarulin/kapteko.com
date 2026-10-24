// Select the theme before styles load, so a saved choice does not flash on navigation.
(() => {
  const root = document.documentElement;
  root.dataset.theme = "light";
  try {
    if (localStorage.getItem("theme") === "dark") root.dataset.theme = "dark";
  } catch {
    // Light remains the default when browser storage is unavailable.
  }

  document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector(".theme-toggle");
    if (!button) return;

    const updateButton = () => {
      const dark = root.dataset.theme === "dark";
      const label = dark ? "Switch to light theme" : "Switch to dark theme";
      button.setAttribute("aria-pressed", String(dark));
      button.setAttribute("aria-label", label);
      button.title = label;
    };

    button.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      updateButton();
      try {
        localStorage.setItem("theme", root.dataset.theme);
      } catch {
        // The toggle still works for this page without persistent storage.
      }
    });

    updateButton();
    button.hidden = false;
  });
})();
