/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#5D5CDE',
      },
      fontFamily: {
        sans: ['Cairo', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}