/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#8B7CFF",
        "secondary": "#5DE6FF",
        "soft-cyan": "#5DE6FF",
        "carbon-black": "#0F0C1D",
        "soft-white": "#EDEBFF",
        "box-bg": "#1B1730",
        "card-bg": "#1B1730",
        "background-dark": "#0F0C1D",
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
