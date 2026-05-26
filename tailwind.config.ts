import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        union: {
          navy: "#102A43",
          steel: "#5B6C80",
          gold: "#C79A3B",
          mist: "#F4F7FB",
          slate: "#D8E1EB"
        }
      },
      boxShadow: {
        card: "0 18px 40px rgba(16, 42, 67, 0.12)"
      },
      backgroundImage: {
        "union-grid":
          "linear-gradient(rgba(16,42,67,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(16,42,67,0.06) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
