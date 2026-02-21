import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        retro: {
          black: "#050505",
          navy: "#0a0a0f",
          lavender: "#a855f7",
          cyan: "#06b6d4",
          pink: "#ec4899",
          slate: "#e2e8f0",
          gold: "#fbbf24",
        },
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(168, 85, 247, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
