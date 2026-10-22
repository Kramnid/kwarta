/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B1220',
          dark: '#0B1220',
        },
        surface: {
          DEFAULT: '#151F30',
          elevated: '#1E293B',
        },
        emerald: {
          DEFAULT: '#10B981',
          primary: '#10B981',
          dark: '#059669',
          light: '#34D399',
        },
        primary: {
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        border: {
          DEFAULT: '#334155',
          subtle: '#1E293B',
        },
        expense: '#F87171',
        danger: '#F87171',
        warning: '#FBBF24',
      },
    },
  },
  plugins: [],
};
