/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        card: 'var(--card)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        signal: 'var(--signal)',
      },
      fontFamily: {
        sans: ['"Noto Sans HK"', '"PingFang HK"', '"Microsoft JhengHei"', 'system-ui', 'sans-serif'],
        display: ['"Noto Serif HK"', '"PingFang HK"', '"Microsoft JhengHei"', 'serif'],
      },
    },
  },
  plugins: [],
};
