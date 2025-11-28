/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        turquesa: {
          light: {
            default: '#40e0d0',
            200: '#a0f7f5',
            500: '#48cfcf',
          },
          DEFAULT: '#30d5c8',
          dark: '#20b2aa',
          medium: '#9dbfaf',
        },
        marfim: {
          light: {
            default: '#edebc9',
            200: '#f7f6e8',
            500: '#dcd9a0',},
          DEFAULT: '#f5f1d0',
          dark: '#e0dca8',
          medium: '#d6d2a3',
        }
      }
    }
  },
  plugins: []
};
