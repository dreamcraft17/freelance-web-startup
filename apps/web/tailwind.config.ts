import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"]
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        nw: {
          brand: "hsl(var(--nw-brand) / <alpha-value>)",
          teal: "hsl(var(--nw-teal) / <alpha-value>)",
          orange: "hsl(var(--nw-accent-orange) / <alpha-value>)",
          success: "hsl(var(--nw-success) / <alpha-value>)",
          warning: "hsl(var(--nw-warning) / <alpha-value>)",
          danger: "hsl(var(--nw-danger) / <alpha-value>)",
          info: "hsl(var(--nw-info) / <alpha-value>)",
          ink: "#1A1A1A",
          mist: "#F5F7FA"
        }
      },
      spacing: {
        "nw-xs": "0.25rem",
        "nw-sm": "0.5rem",
        "nw-md": "1rem",
        "nw-lg": "1.5rem",
        "nw-xl": "2rem",
        "nw-2xl": "3rem",
        "nw-3xl": "4rem"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      fontSize: {
        /** Editorial scale — pair with nw-type-* utilities in globals.css */
        "nw-lead": ["1rem", { lineHeight: "1.48", fontWeight: "600" }],
        "nw-body": ["0.8125rem", { lineHeight: "1.52" }],
        "nw-caption": ["0.6875rem", { lineHeight: "1.4" }],
        /** V2 type scale */
        "v2-h1": ["2.5rem", { lineHeight: "3rem", fontWeight: "700" }],
        "v2-h2": ["2rem", { lineHeight: "2.5rem", fontWeight: "700" }],
        "v2-h3": ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
        "v2-body-xl": ["1.125rem", { lineHeight: "1.75rem", fontWeight: "400" }]
      },
      boxShadow: {
        "nw-card": "0 1px 2px rgba(15, 23, 42, 0.05)",
        "nw-card-hover": "0 4px 16px -6px rgba(15, 23, 42, 0.09)",
        "nw-elevated": "0 2px 12px -4px rgba(15, 23, 42, 0.08)"
      },
      transitionDuration: {
        nw: "180ms"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
