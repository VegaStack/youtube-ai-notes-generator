/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#ffffff',
            100: '#f5f5f5',
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#c4c4c4',
            500: '#b3b3b3',
            600: '#a3a3a3',
            700: '#999999',
            800: '#808080',
            900: '#666666',
            1000: '#595959',
            1100: '#404040',
            1200: '#262626',
            1300: '#101010',
          },
          blue: {
            50: '#ddf4ff',
            100: '#b6e3ff',
            200: '#80ccff',
            300: '#54aeff',
            400: '#218bff',
            500: '#0969da',
            600: '#0550ae',
            700: '#033d8b',
            800: '#0a3069',
            900: '#002155',
          },
        },
      },
    },
    plugins: [],
  }