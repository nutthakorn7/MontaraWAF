import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        imperva: {
          'dark-navy': '#1a1f2e',
          'dark-sidebar': '#0f1419',
          'dark-header': '#1e2530',
          'bg-primary': '#f8f9fa',
          'bg-card': '#ffffff',
          'bg-hover': '#f3f4f6',
          'blue': '#3b82f6',
          'purple': '#8b5cf6',
          'pink': '#ec4899',
          'orange': '#f59e0b',
          'red': '#ef4444',
          'red-dark': '#dc2626',
          'green': '#10b981',
          'yellow': '#fcd34d',
          'text-primary': '#1f2937',
          'text-secondary': '#6b7280',
          'text-muted': '#9ca3af',
          'border': '#e5e7eb',
          'border-dark': '#374151',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
