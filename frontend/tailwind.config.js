/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./types/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["IBM Plex Sans Arabic", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)",
      },
      colors: {
        brand: {
          50: "#eef8ff",
          100: "#d9eeff",
          200: "#b5dcff",
          300: "#84c3ff",
          400: "#53a2ff",
          500: "#2f7efc",
          600: "#1f5ee0",
          700: "#1e4bb1",
          800: "#1d438d",
          900: "#1e3b73"
        }
      }
    },
  },
  plugins: [],
};
