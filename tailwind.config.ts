import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark luxury palette (conservada para landing)
        dark: {
          950: '#020204',
          900: '#06060d',
          850: '#0a0a15',
          800: '#0f0f1a',
          750: '#141420',
          700: '#1a1a2e',
          600: '#252545',
        },
        green: {
          trading: '#00d084',
          light: '#00ff9d',
          dark: '#00a866',
          glow: '#00d08440',
        },
        gold: {
          DEFAULT: '#f5c842',
          light: '#ffd97d',
          dark: '#c9a227',
        },
        // Apple-style Light Theme Palette
        apple: {
          bg: '#fbfbfd',
          surface: '#ffffff',
          card: '#ffffff',
          border: '#e5e5ea',
          borderSubtle: '#f2f2f7',
          text: '#1d1d1f',
          textSecondary: '#6e6e73',
          textMuted: '#86868b',
          hover: '#f5f5f7',
          tag: '#f5f5f7',
        },
        // Apple soft orange accents
        softOrange: {
          50: '#fff8f4',
          100: '#ffede4',
          200: '#ffd8c4',
          300: '#ffba95',
          400: '#f9925e',
          500: '#f26a2e', // soft vibrant
          DEFAULT: '#ff6f3c',
          text: '#e35824', // soft elegant contrast on white
          light: '#ff8a5c',
          glow: 'rgba(242, 106, 46, 0.15)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'apple-sm': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'apple': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'apple-lg': '0 12px 36px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'orange-soft': '0 4px 14px 0 rgba(242, 106, 46, 0.25)',
      },
    },
  },
  plugins: [],
}
export default config
