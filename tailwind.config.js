/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/**/*.jsx',
    './resources/**/*.js',
    './resources/views/**/*.blade.php',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}