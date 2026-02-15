import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#4285F4',      // Your brand blue
          'blue-light': '#669DF6',
          'blue-dark': '#1A73E8',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
