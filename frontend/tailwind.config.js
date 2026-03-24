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
        lavender: "#dbeafe"
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
        "num-4": "4px",
        "num-12": "12px"
      },
      fontSize: {
        "num-14": "14px"
      },
      lineHeight: {
        "num-14": "14px",
        "num-20": "20px"
      }
    },
  },
  corePlugins: {
    preflight: false
  },
  plugins: [],
}