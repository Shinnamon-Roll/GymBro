/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./views/**/*.ejs",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0C2C55',
        secondary: '#296374',
        accent: '#629FAD',
        contrast: '#EDEDCE',
      },
      borderRadius: {
        DEFAULT: '0px',
        'none': '0px',
        'sm': '0px',
        'md': '0px',
        'lg': '0px',
        'xl': '0px',
        '2xl': '0px',
        '3xl': '0px',
        'full': '0px',
      }
    },
  },
  plugins: [],
}
