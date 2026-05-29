import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        muted: '#64748b',
        panel: '#f8fafc',
        line: '#e2e8f0',
        brand: '#6366f1',
        brand2: '#14b8a6'
      },
      boxShadow: { soft: '0 20px 60px rgba(15, 23, 42, 0.08)' }
    }
  },
  plugins: []
};
export default config;
