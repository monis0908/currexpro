/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F172A",
          light: "#16213E",
          muted: "#1E293B",
        },
        paper: "#F7F8FA",
        mint: {
          DEFAULT: "#0EA976",
          light: "#E5F7F0",
        },
        coral: {
          DEFAULT: "#E23B5D",
          light: "#FCE8EC",
        },
        amber: {
          DEFAULT: "#DB8A2C",
          light: "#FBF0DF",
        },
        muted: {
          DEFAULT: "#64748B",
        },
        accent: {
          DEFAULT: "#3B6CF6",
          light: "#EAF0FE",
        },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 10px rgba(15, 23, 42, 0.06)",
        card: "0 4px 20px rgba(15, 23, 42, 0.08)",
        lift: "0 8px 30px rgba(15, 23, 42, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        ticker: "ticker 30s linear infinite",
        fadeIn: "fadeIn 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
