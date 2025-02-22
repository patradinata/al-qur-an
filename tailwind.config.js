/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "pri-color-light": "var(--pri-color-light)",
        "sec-color-light": "var(--sec-color-light)",
        "thr-color-light": "var(--thr-color-light)",
        "pri-color-dark": "var(--pri-color-dark)",
        "sec-color-dark": "var(--sec-color-dark)",
        "thr-color-dark": "var(--thr-color-dark)",
        "spi-color-spi": "var(--spi-color-spi)",
        "sephia-color-spii": "var(--sephia-color-spii)",
        "sephia-color": "var(--sephia-color)",
        
      },
    },
  },
  plugins: [],
};
