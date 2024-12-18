import animated from 'tailwindcss-animated';
// import daisyui from 'daisyui'; // Uncomment if needed

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',  
  ],
  theme: {
    extend: {},
  },
  plugins: [
    animated,
    // daisyui, // Uncomment if needed
  ],
};

