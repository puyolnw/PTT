/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ptt: {
          blue: "#2867E0",
          cyan: "#19B7FF",
          red: "#E41F2B",
        },
        ink: {
          50: "#F7F8FA",
          100: "#EEF1F6",
          800: "#111a2e",
          900: "#0C1220",
          950: "#0A0F1C",
        },
      },
      fontFamily: {
        sans: [
          "Prompt",
          "IBM Plex Sans Thai",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: ["Prompt", "IBM Plex Sans Thai", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1.25rem",
      },
      boxShadow: {
        "ptt-card": "0 10px 24px rgba(2,6,23,.14)",
      },
    },
  },
  plugins: [],
};

