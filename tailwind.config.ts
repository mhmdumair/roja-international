import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary:   "#D72638",
        "primary-dark": "#A91D2D",
        secondary: "#FF8C00",
        gold:      "#FFD600",
        teal:      "#00B4D8",
        purple:    "#7B2FBE",
        green:     "#06D6A0",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body:    ["var(--font-body)", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        ticker: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        fadeUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        scaleIn: { "0%": { opacity: "0", transform: "scale(0.95)" }, "100%": { opacity: "1", transform: "scale(1)" } },
      },
      animation: {
        ticker: "ticker 30s linear infinite",
        fadeUp: "fadeUp 0.5s ease forwards",
        scaleIn: "scaleIn 0.3s ease forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
