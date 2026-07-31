/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F4B400", // Main Gold
        "primary-dark": "#E0A800",
        "primary-light": "#FFF6D8",
        "primary-text": "#C58A00",

        secondary: "#1F2937", // Dark text

        success: "#59C98C", // Mint Green
        info: "#6EA8FE", // Sky Blue
        purple: "#B692F6", // Lavender
        peach: "#FFA45B", // Peach
        pink: "#F78FB3", // Pink

        background: "#FFFDF8",
        surface: "#FFFFFF",

        border: "#E5E7EB",

        muted: "#6B7280",
      },
    },
  },
  plugins: [],
};
