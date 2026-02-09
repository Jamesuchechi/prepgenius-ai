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
    },
  },
  plugins: [],
}