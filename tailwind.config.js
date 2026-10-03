/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canhoes: {
          gold: '#C8A46B',
        },
        'neon-green': '#00FF88',
        jungle: {
          500: "#22c55e",
          600: "#16a34a",
        },
      },
      boxShadow: {
        'neon':         '0 0 12px rgba(234,179,8,0.25)',
      },
      backgroundImage: {
        'neon-glow':    'linear-gradient(180deg, rgba(234,179,8,0.18), rgba(234,179,8,0.12))',
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "scale(0.96) translateY(4px)" },
          to:   { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "stagger-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in":         "fade-in 0.18s ease-out",
        "slide-up":        "slide-up 0.2s ease-out",
        "stagger-in":      "stagger-in 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};
