/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas-bg)",
        surface: {
          DEFAULT: "var(--surface-card)",
          card: "var(--surface-card)",
          elevated: "var(--surface-elevated)",
          inset: "var(--surface-inset)",
          hover: "var(--surface-hover)",
        },
        tprimary: "var(--text-primary)",
        tsecondary: "var(--text-secondary)",
        tmuted: "var(--text-muted)",
        bsubtle: "var(--border-subtle)",
        bstrong: "var(--border-strong)",
        brand: {
          50: '#f0f3ff',
          100: '#e1e7fe',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#1e1b4b',
        },
      },
    },
  },
  plugins: [],
};
