/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0a0a0a',
        graphite: '#171717',
        neon: '#39ff14',
        electric: '#bf00ff',
      },
      boxShadow: {
        glow: '0 0 32px rgba(57, 255, 20, 0.18)',
        purpleGlow: '0 0 36px rgba(191, 0, 255, 0.2)',
      },
    },
  },
  plugins: [],
};
