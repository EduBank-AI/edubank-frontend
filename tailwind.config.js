/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#0b082e',
      },
    },
  },
  plugins: [
    function ({addUtilities}) {
      const newUtilities = {
        ".scrollbar-thin" : {
          scrollbarWidth: "auto",
          scrollbarColor: "rgb(43 54 71) transparent"
        },
        ".scrollbar-webkit": {
          "&::-webkit-scrollbar": {
            width: "16px",
            height: "16px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgb(43 54 71)",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-button": {
            display: "none",
          }
        }
      }
      addUtilities(newUtilities, ["responsive", "hover"])
    }
  ],
}

