@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800;900&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Space Grotesk", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  
  --color-brand-red: #ff3333;
  --color-brand-red-dark: #cc0000;
  --color-gog-dark: #0a0a0a;
  --color-gog-surface: #121212;
  --color-gog-card: #1e1e1e;
}

/* Custom scrollbars for a premium, clean dark-mode experience */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #0a0a0a;
}

::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #dc2626;
}

body {
  background-color: #0a0a0a;
  color: #f4f4f5;
  font-family: var(--font-sans);
  overflow-x: hidden;
}

/* Custom utility styles */
.gradient-overlay {
  background: linear-gradient(to top, rgba(10, 10, 10, 1) 0%, rgba(10, 10, 10, 0.4) 50%, rgba(10, 10, 10, 0.1) 100%);
}

.glow-red {
  box-shadow: 0 0 15px rgba(220, 38, 38, 0.4);
}

.glow-red-heavy {
  box-shadow: 0 0 25px rgba(220, 38, 38, 0.6);
}

.text-glow-red {
  text-shadow: 0 0 30px rgba(220, 38, 38, 0.8);
}

.text-stroke-red {
  -webkit-text-stroke: 1px #dc2626;
}

