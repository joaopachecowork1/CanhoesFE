/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design system tokens — Canhões do Ano
        canhoes: {
          forest:    '#0F1712',
          moss:      '#4F6336',
          gold:      '#C8A46B',
          parchment: '#F1E6D2',
          amethyst:  '#7A628A',
        },
        'neon-green':   '#00FF88',
        'neon-teal':    '#00D4AA',
        'surface-card': 'rgba(255,255,255,0.04)',
        'surface-hover':'rgba(255,255,255,0.08)',
        // Keep jungle/moss for Canhões theme compatibility
        jungle: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        moss: {
          50:  "#f2f7f0",
          100: "#dfeedd",
          200: "#c0debb",
          300: "#93c58f",
          400: "#62a85c",
          500: "#408d3a",
          600: "#2e712a",
          700: "#255922",
          800: "#1e471c",
          900: "#193b18",
          950: "#0a200b",
        },
      },
      fontSize: {
        'display': ['clamp(1.75rem, 5vw, 2.5rem)', { lineHeight: '1.15', fontWeight: '700' }],
        'heading':  ['clamp(1.25rem, 3vw, 1.75rem)', { lineHeight: '1.3' }],
        'body':     ['clamp(0.875rem, 2vw, 1rem)',   { lineHeight: '1.6' }],
      },
      boxShadow: {
        'neon':         '0 0 12px rgba(0,255,136,0.25)',
        'neon-lg':      '0 0 24px rgba(0,255,136,0.4)',
        'card':         '0 4px 24px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'neon-glow':    'linear-gradient(180deg, rgba(0,255,136,0.18), rgba(0,212,170,0.12))',
        'card-subtle':  'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
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
        "slide-in-bottom": {
          from: { opacity: "0", transform: "translateY(100%)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px oklch(0.68 0.22 280 / 20%)" },
          "50%":       { boxShadow: "0 0 20px oklch(0.68 0.22 280 / 50%)" },
        },
        "ambient-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-4px)" },
        },
        "xp-count": {
          from: { opacity: "0", transform: "translateY(6px) scale(0.9)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "nav-indicator": {
          from: { transform: "scaleX(0)" },
          to:   { transform: "scaleX(1)" },
        },
        "stagger-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "canhoes-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-6px)" },
        },
        "canhoes-pulse": {
          "0%, 100%": { boxShadow: "0 0 12px oklch(0.72 0.19 152 / 25%)" },
          "50%":       { boxShadow: "0 0 28px oklch(0.72 0.19 152 / 45%), 0 0 8px oklch(0.72 0.19 152 / 30%)" },
        },
      },
      animation: {
        "fade-in":         "fade-in 0.18s ease-out",
        "slide-up":        "slide-up 0.2s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        "glow-pulse":      "glow-pulse 2.5s ease-in-out infinite",
        "ambient-float":   "ambient-float 3s ease-in-out infinite",
        "xp-count":        "xp-count 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        "nav-indicator":   "nav-indicator 0.2s ease-out",
        "stagger-in":      "stagger-in 0.25s ease-out both",
        "canhoes-float":   "canhoes-float 3s ease-in-out infinite",
        "canhoes-pulse":   "canhoes-pulse 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
