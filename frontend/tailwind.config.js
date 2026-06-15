/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        heritage: {
          terracotta: '#B84A2C',
          gold: '#C9A03D',
          sand: '#F5F0E8',
          ivory: '#FFFDF9',
          brown: '#2C2418',
          charcoal: '#5C5543',
          green: '#3A6B4B',
          indigo: '#2F4F6F',
        },
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: ['Merriweather', 'serif'],
        hausa: ['Noto Sans Arabic', 'sans-serif'],
        ui: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}