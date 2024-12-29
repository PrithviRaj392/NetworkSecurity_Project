// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',  // Scan all React files for Tailwind classes
    './public/index.html',         // Scan index.html file for Tailwind classes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
