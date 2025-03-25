/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22c55e',
          hover: '#16a34a',
        },
        background: '#111827',
        secondary: '#1f2937',
      },
      animation: {
        'bounce-subtle': 'bounce 1.5s infinite',
        'pulse-subtle': 'pulse-subtle 2s infinite',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.15)',
      },
    },
  },
  plugins: [],
}