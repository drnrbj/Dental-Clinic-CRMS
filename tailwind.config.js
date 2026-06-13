/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/**/*.jsx',   // ✓ already there
    './resources/**/*.js',
    './resources/views/**/*.blade.php',
    // add these too:
    './resources/**/*.blade.php',
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}