import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'Arial', 'sans-serif'], display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'] },
      colors: { night: '#0B0F17', panel: '#171D27', acid: '#C3F400', aqua: '#00E5ED', muted: '#9BA5B5' },
      boxShadow: { glow: '0 0 32px rgba(195,244,0,.18)' },
    },
  },
  plugins: [],
} satisfies Config;
