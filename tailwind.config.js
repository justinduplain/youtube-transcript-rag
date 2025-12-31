import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const twTokens = require('./src/tokens/build/tailwind.tokens.json');

function flattenColors(obj, prefix = '') {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}-${key}` : key;
    
    if (typeof value === 'string' && value.startsWith('#')) {
      result[newKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenColors(value, newKey));
    }
  }
  
  return result;
}

const flatColors = flattenColors(twTokens);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@trussworks/react-uswds/lib/**/*.{js,ts,jsx,tsx}",
    "./.storybook/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: flatColors,
    },
  },
  plugins: [],
}