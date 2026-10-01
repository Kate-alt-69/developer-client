"use client";

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const current = root.dataset.theme === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("rbe-developer-theme", next);
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark theme"
      title="Toggle theme"
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-icon theme-icon-sun">☀</span>
        <span className="theme-icon theme-icon-moon">☾</span>
        <span className="theme-toggle-thumb" />
      </span>
    </button>
  );
}
