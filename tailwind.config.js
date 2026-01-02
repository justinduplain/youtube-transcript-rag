import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const twTokens = require('./src/tokens/build/tailwind.tokens.json');

/**
 * Flattens a nested token object into a single-level object.
 * @param {object} obj - The token object to flatten.
 * @param {string} prefix - The prefix to use for the flattened keys.
 * @returns {object} - The flattened token object.
 */
function flattenTokens(obj, prefix = '') {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}-${key}` : key;
    
    if (typeof value === 'string') {
      result[newKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenTokens(value, newKey));
    }
  }
  
  return result;
}

const flatColors = flattenTokens(twTokens.uswds.color);
const cmmColors = flattenTokens(twTokens.cmm.color);
const fontFamilies = flattenTokens(twTokens.cmm.font.family);
const fontWeights = flattenTokens(twTokens.cmm.font.weight);
const fontSizes = flattenTokens(twTokens.cmm.size);
const lineHeights = flattenTokens(twTokens.cmm.line.height);

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
      colors: { ...flatColors, ...cmmColors },
      fontFamily: fontFamilies,
      fontSize: fontSizes,
      fontWeight: fontWeights,
      lineHeight: lineHeights,
    },
  },
  plugins: [],
}