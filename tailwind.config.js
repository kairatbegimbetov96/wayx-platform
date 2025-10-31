/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class", // 🌙 Поддержка темной темы
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 🎨 Фирменная палитра WayX (уровень Kaspi / Indriver)
      colors: {
        primary: {
          DEFAULT: "#2563eb", // WayX Blue
          light: "#3b82f6",
          dark: "#1e40af",
          gradient: "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)",
        },
        secondary: {
          DEFAULT: "#0f172a", // глубокий Slate Blue
          light: "#1e293b",
          dark: "#020617",
        },
        accent: {
          DEFAULT: "#22d3ee", // голубой акцент
          soft: "#67e8f9",
          dark: "#0e7490",
        },
        success: {
          DEFAULT: "#22c55e",
          light: "#4ade80",
          dark: "#15803d",
        },
        warning: {
          DEFAULT: "#eab308",
          light: "#facc15",
          dark: "#ca8a04",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#f87171",
          dark: "#b91c1c",
        },
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9",
          300: "#cbd5e1",
          500: "#64748b",
          700: "#334155",
          900: "#0f172a",
        },
      },

      // ✨ Шрифты
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        display: ["Poppins", ...defaultTheme.fontFamily.sans],
      },

      // 🪄 Анимации и переходы
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(40px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".6" },
        },
        "logo-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-in-out both",
        "slide-up": "slide-up 0.8s ease-out both",
        "pulse-soft": "pulse-soft 2s infinite ease-in-out",
        "logo-spin": "logo-spin 5s linear infinite",
      },

      // 🧱 Тени, радиусы, эффекты
      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,0.06)",
        button: "0 4px 12px rgba(37,99,235,0.4)",
        smooth: "0 2px 10px rgba(0,0,0,0.08)",
        glow: "0 0 20px rgba(37,99,235,0.3)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        full: "9999px",
      },

      // 📱 Медиа-запросы (тонкая адаптация)
      screens: {
        xs: "480px",
        ...defaultTheme.screens,
      },

      // 🌈 Фоновые градиенты
      backgroundImage: {
        "wayx-gradient": "linear-gradient(90deg, #2563eb 0%, #22d3ee 100%)",
        "wayx-dark":
          "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
