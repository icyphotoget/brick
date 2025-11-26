/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brickBlue: "#8FD3FF",
        brickYellow: "#FFD352",
        brickPink: "#FF9BD0",
        brickGreen: "#8BE7B2",
        brickOrange: "#FF9F6E",
        sky: "#CDEBFF"
      },
      borderRadius: {
        brick: "12px"
      }
    }
  },
  plugins: []
};
