import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff4f0",
          100: "#ffe5dc",
          500: "#f4511e",
          600: "#df3d12",
          700: "#bb2e0c"
        }
      },
      boxShadow: {
        card: "0 12px 30px rgba(34, 25, 20, 0.07)"
      }
    }
  },
  plugins: []
} satisfies Config;
