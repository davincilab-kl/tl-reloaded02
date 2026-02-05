/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6', // Standard Blue 500
          foreground: '#FFFFFF',
          dark: '#1D4ED8', // Blue 700
          light: '#EFF6FF', // Blue 50
        },
        secondary: {
          DEFAULT: '#64748B', // Slate 500
          foreground: '#FFFFFF',
          light: '#F1F5F9', // Slate 100
        },
        accent: {
          DEFAULT: '#60A5FA', // Blue 400
          foreground: '#FFFFFF',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.8)',
          dark: 'rgba(15, 23, 42, 0.6)',
        }
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'glass-sm': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.05)',
        'glass-md': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};
