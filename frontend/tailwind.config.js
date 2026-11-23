/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          950: "#06090e",
          900: "#0a0f18",
          850: "#0f1726",
          800: "#131d2e",
          700: "#1e293b",
          600: "#334155",
          muted: "#94a3b8",
          red: "#e50914",
          "red-hover": "#f40612",
          cyan: "#06b6d4",
          amber: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      aspectRatio: {
        poster: "2 / 3",
        backdrop: "16 / 9",
      },
    },
  },
  plugins: [],
};
