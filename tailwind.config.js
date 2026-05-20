/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Slate-based palette: code-editor vibe (background, surfaces, borders).
        ink: {
          950: "#0F172A", // background — slate-900
          900: "#1E293B", // primary surface — slate-800
          850: "#272F42", // muted
          800: "#334155", // secondary surface — slate-700
          700: "#475569", // border-strong — slate-600
          600: "#64748B", // border-soft — slate-500
        },
        // Run/active accent: green-500. Reservado para CTAs y signal.
        accent: {
          DEFAULT: "#22C55E",
          light: "#4ADE80",
          dark: "#16A34A",
          soft: "#14532D",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "system-ui", "sans-serif"],
        mono: ["'Space Mono'", "ui-monospace", "monospace"],
      },
      maxWidth: {
        content: "76rem",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(34, 197, 94, 0.35)",
        card: "0 18px 50px -20px rgba(0, 0, 0, 0.8)",
        brut: "8px 8px 0 0 rgba(34, 197, 94, 0.9)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.85" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.8s ease both",
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 5s ease-in-out infinite",
        marquee: "marquee 32s linear infinite",
        "gradient-shift": "gradient-shift 6s ease infinite",
        blink: "blink 1.1s steps(1) infinite",
      },
    },
  },
  plugins: [],
};
