/** @type {import('tailwindcss').Config} */
// Monochrome design tokens. See docs/DECISIONS.md (D1) for why there are no accent colours yet.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0A0A0A', // primary text, primary buttons, urgent chips
          soft: '#3F3F46',    // pressed / secondary dark surfaces
        },
        muted: {
          DEFAULT: '#5F5F67', // supporting text (passes 4.5:1 on white and on canvas)
          light: '#A1A1AA',   // placeholders, disabled
        },
        line: '#E4E4E7',      // hairlines and outlines
        canvas: '#F4F4F5',    // app background behind cards
        card: '#FFFFFF',      // cards, sheets, inputs
        fill: '#EDEDEF',      // quiet fills: other people's chat bubbles, segmented track
      },
      borderRadius: {
        card: '22px',
      },
      boxShadow: {
        // The 1px ring is a subtle outline so white cards don't melt into the canvas.
        card: '0 0 0 1px #E4E4E7,0 1px 2px rgba(10,10,10,0.04), 0 4px 16px rgba(10,10,10,0.04)',
        sheet: '0 -8px 32px rgba(10,10,10,0.12)',
      },
    },
  },
  plugins: [],
}
