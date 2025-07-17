/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
    spacing: {
      ZERO: 0,
      XXS: 2,
      XS: 4,
      S: 8,
      M: 12,
      L: 16,
      XL: 24,
      XXL: 32,
    },
    borderRadius: {
      ZERO: 0,
      XXS: 2,
      XS: 4,
      S: 8,
      M: 12,
      L: 16,
      XL: 24,
      XXL: 32,
    },
  },
  plugins: [],
};
