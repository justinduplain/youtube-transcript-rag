// Using StyleDictionary V4
import StyleDictionary from 'style-dictionary';

// 1. TRANSFORM: Handle multi-prefixing
StyleDictionary.registerTransform({
  name: 'name/prefix-path',
  type: 'name',
  transform: (token) => {
    const prefix = token.filePath.includes('tokens/uswds') ? 'uswds' : 'cmm';
    const newName = `${prefix}-${token.path.join('-')}`;
    console.log(`Transform: ${token.path.join('-')} -> ${newName}`); // DEBUG
    return newName;
  }
});

// Format to output NESTED JSON for Tailwind
StyleDictionary.registerFormat({
  name: 'json/tailwind-nested',
  format: async ({ dictionary }) => {
    const nested = {};
    
    const allTokens = dictionary.allTokens; 
    allTokens.forEach(prop => {
      const parts = prop.name.split('-');
      let current = nested;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = prop.value;
        } else {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      });
    });
    
    return JSON.stringify(nested, null, 2);
  }
});

const sd = new StyleDictionary({
  source: ['src/tokens/**/*.json'],
  platforms: {
    css: {
      transforms: ['attribute/cti', 'name/prefix-path', 'color/css'],
      buildPath: 'src/styles/generated/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables'
      }]
    },
    js: {
      transforms: ['name/prefix-path', 'attribute/cti'],
      buildPath: 'src/tokens/build/',
      files: [
        { 
          destination: 'tokens.js',
          format: 'javascript/esm'
        },
        { 
          destination: 'tokens.d.ts',
          format: 'typescript/module-declarations'
        },
        { 
          destination: 'tailwind.tokens.json',
          format: 'json/tailwind-nested' // ← CHANGED FROM 'json/nested'
        }
      ]
    }
  }
});

await sd.buildAllPlatforms();