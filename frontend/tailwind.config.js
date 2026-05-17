/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#fff",
        gray: "#101828",
        dimgray: "#4a5565",
        darkslategray: "#364153",
        whitesmoke: "#f3f3f5",
        lightgray: "#d1d5dc",
        slategray: {
          100: "#717182",
          200: "#6a7282"
        },
        aliceblue: "#eff6ff",
        lightsteelblue: "#bedbff",
        slateblue: "#193cb8",
        mediumslateblue: "#155dfc",
        gainsboro: "#e5e7eb",
        lavender: {
          DEFAULT: "#dbeafe",
          100: "#f3e8ff",
          200: "#dbeafe",
        },
        honeydew: "#dcfce7",
        seagreen: "#016630",
        darkorchid: "#6e11b0",
        mistyrose: "#ffe2e2",
        firebrick: "#9f0712",
        papayawhip: "#ffedd4",
        lemonchiffon: "#fef9c2",
        saddlebrown: "#894b00",
        darkred: "#9f2d00",
      },
      spacing: {
        "num-448": "448px",
        "num-969": "969px",
        "num-944": "944px",
        "num-66": "66px",
        "num-1": "1px"
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"]
      },
      borderRadius: {
        "num-8": "8px"
      },
      padding: {
        "num-2": "2px",
        "num-4": "4px",
        "num-12": "12px"
      },
      fontSize: {
        "num-12": "12px",
        "num-14": "14px"
      },
      lineHeight: {
        "num-14": "14px",
        "num-16": "16px",
        "num-20": "20px"
      },
      boxShadow: {
        "admin-sm": "var(--admin-shadow-sm)",
        "admin-md": "var(--admin-shadow-md)",
        "admin-lg": "var(--admin-shadow-lg)",
        "admin-glow": "var(--admin-shadow-glow)",
      },
      borderRadius: {
        "admin-sm": "var(--admin-radius-sm)",
        "admin-md": "var(--admin-radius-md)",
        "admin-lg": "var(--admin-radius-lg)",
        "admin-xl": "var(--admin-radius-xl)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out forwards",
        "slide-up": "slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scale-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  corePlugins: {
    preflight: false
  },
  plugins: [],
}