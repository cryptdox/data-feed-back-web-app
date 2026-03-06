/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          blue: '#00a8ff',
          purple: '#9c88ff',
          gold: '#fbc531',
          green: '#4cd137',
          navy: '#487eb0',
        },
      },
    },
  },
  plugins: [],
};
