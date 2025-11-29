/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        accent2: 'var(--accent-2)',
        bg1: 'var(--bg-1)',
        bg2: 'var(--bg-2)',
        muted: 'var(--muted)',
      },
      boxShadow: {
        glass: 'var(--glass-shadow)',
      },
      backgroundImage: {
        panel: 'var(--panel-bg)',
      },
      borderColor: {
        panel: 'var(--panel-border)',
      },
      backdropBlur: {
        panel: 'var(--panel-blur)',
      },
    },
  },
  plugins: [],
}
