/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },
      colors: {
        // Cores personalizadas para um ar mais premium
        dashboard: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          accent: '#3B82F6'
        }
      }
    },
  },
  plugins: [],
}
