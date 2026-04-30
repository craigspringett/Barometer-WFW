import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4FC3C5",
          50: "#EAF8F8",
          100: "#D2F1F2",
          200: "#A8E4E5",
          300: "#7DD6D8",
          400: "#5DCFD0",
          500: "#4FC3C5",
          600: "#2FA9AB",
          700: "#23898B",
          800: "#1B6A6C",
          900: "#134B4D",
          950: "#0B2D2E",
        },
        ink: {
          DEFAULT: "#0E1B1C",
          soft: "#1E3133",
        },
        sand: "#FFF6E3",
        coral: "#FF7A59",
        sun: "#FFC857",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        rise: {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" },
        },
        bubble: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.7" },
          "100%": { transform: "translateY(-200px) scale(1.4)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pop: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        confetti: {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(110vh) rotate(720deg)", opacity: "0" },
        },
      },
      animation: {
        rise: "rise 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        bubble: "bubble 3s ease-in infinite",
        shimmer: "shimmer 3s linear infinite",
        pop: "pop 0.4s ease-out forwards",
        confetti: "confetti 4s linear forwards",
      },
    },
  },
  plugins: [],
};

export default config;
