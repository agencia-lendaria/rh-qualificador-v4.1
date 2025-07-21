/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          magenta: '#E91E63', // Magenta vivo
          'magenta-light': '#F8BBD9', // Magenta claro
          'magenta-dark': '#AD1457', // Magenta escuro
          purple: '#800080', // Roxo para detalhes
          'purple-light': '#B366B3', // Roxo claro
          'purple-dark': '#4D004D', // Roxo escuro
          gold: '#C5B17F', // Dourado para botões e destaques
          dark: '#1F2937', // Cinza escuro para fundos
          darker: '#111827', // Cinza mais escuro
          gray: '#666666', // Cinza médio para texto
        },
        // Keep legacy colors for backward compatibility
        gold: '#C5B17F',
        dark: '#1F2937',
        darker: '#111827',
        gray: '#666666',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'pulse-magenta': 'pulse-magenta 2s infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'elegant': '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(233, 30, 99, 0.1)',
        'magenta': '0 4px 6px -1px rgba(233, 30, 99, 0.1), 0 2px 4px -1px rgba(233, 30, 99, 0.06)',
        'purple': '0 4px 6px -1px rgba(128, 0, 128, 0.1), 0 2px 4px -1px rgba(128, 0, 128, 0.06)',
        'gold': '0 4px 20px rgba(197, 177, 127, 0.2)',
        'gold-button': '0 4px 6px -1px rgba(197, 177, 127, 0.1), 0 2px 4px -1px rgba(197, 177, 127, 0.06)',
      },
    },
  },
  plugins: [],
};