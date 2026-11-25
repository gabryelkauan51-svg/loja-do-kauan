import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B0F',
        card: '#13131A',
        line: '#1F1F2E',
        brand: { DEFAULT: '#7C3AED', light: '#8B5CF6' },
        pix: { DEFAULT: '#10B981', dark: '#059669' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 28px rgba(124, 58, 237, 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;
