/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Bricolage Grotesque', 'sans-serif'],
      },
      colors: {
        orange: {
          DEFAULT: '#FF6B35',
          light: '#FF8C61',
          dark: '#E5522A',
        },
        blue: {
          DEFAULT: '#0A4D8C',
          light: '#1E6BB8',
          dark: '#083A6B',
        },
      },
      animation: {
        slideDown: 'slideDown 0.6s ease-out',
        float: 'float 20s ease-in-out infinite',
        fadeInUp: 'fadeInUp 0.8s ease-out backwards',
        progressGrow: 'progressGrow 2s ease-out',
        fadeInSection: 'fadeInSection 0.6s ease-out',
      },
      keyframes: {
        slideDown: {
          from: {
            transform: 'translateY(-100%)',
            opacity: '0',
          },
          to: {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translate(0, 0) rotate(0deg)',
          },
          '33%': {
            transform: 'translate(50px, -50px) rotate(5deg)',
          },
          '66%': {
            transform: 'translate(-30px, 30px) rotate(-3deg)',
          },
        },
        fadeInUp: {
          from: {
            opacity: '0',
            transform: 'translateY(40px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        progressGrow: {
          from: {
            width: '0%',
          },
          to: {
            width: '65%',
          },
        },
        fadeInSection: {
          from: {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}
