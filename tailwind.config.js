/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		colors: {
  			brand: {
  				magenta: '#E91E63',
  				'magenta-light': '#F8BBD9',
  				'magenta-dark': '#AD1457',
  				purple: '#800080',
  				'purple-light': '#B366B3',
  				'purple-dark': '#4D004D',
  				gold: '#C5B17F',
  				dark: '#1F2937',
  				darker: '#111827',
  				gray: '#666666'
  			},
  			gold: '#C5B17F',
  			dark: '#1F2937',
  			darker: '#111827',
  			gray: '#666666',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'sans-serif'
  			]
  		},
  		fontWeight: {
  			normal: '400',
  			medium: '500',
  			semibold: '600',
  			bold: '700'
  		},
  		animation: {
  			'fade-in': 'fade-in 0.4s ease-out',
  			'slide-up': 'slide-up 0.5s ease-out',
  			'pulse-magenta': 'pulse-magenta 2s infinite'
  		},
  		backdropBlur: {
  			xs: '2px'
  		},
  		boxShadow: {
  			elegant: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(233, 30, 99, 0.1)',
  			magenta: '0 4px 6px -1px rgba(233, 30, 99, 0.1), 0 2px 4px -1px rgba(233, 30, 99, 0.06)',
  			purple: '0 4px 6px -1px rgba(128, 0, 128, 0.1), 0 2px 4px -1px rgba(128, 0, 128, 0.06)',
  			gold: '0 4px 20px rgba(197, 177, 127, 0.2)',
  			'gold-button': '0 4px 6px -1px rgba(197, 177, 127, 0.1), 0 2px 4px -1px rgba(197, 177, 127, 0.06)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};