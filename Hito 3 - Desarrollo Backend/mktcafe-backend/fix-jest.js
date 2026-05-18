const fs = require('fs');

const polyfill = '\nconst hasFlag = (flag, argv = process.argv) => {\n  const prefix = flag.startsWith(\'-\') ? \'\' : (flag.length === 1 ? \'-\' : \'--\');\n  const position = argv.indexOf(prefix + flag);\n  const terminatorPosition = argv.indexOf(\'--\');\n  return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);\n};\n';

const files = [
  'node_modules/jest-cli/node_modules/supports-color/index.js',
  'node_modules/jest-cli/node_modules/jest-worker/node_modules/supports-color/index.js',
  'node_modules/@jest/core/node_modules/supports-color/index.js',
  'node_modules/@jest/core/node_modules/jest-worker/node_modules/supports-color/index.js',
  'node_modules/@jest/types/node_modules/supports-color/index.js',
];

files.forEach(function(f) {
  if (!fs.existsSync(f)) { console.log('No existe (ok):', f); return; }
  var c = fs.readFileSync(f, 'utf8');
  if (c.includes('hasFlag = (flag')) { console.log('Ya parcheado:', f); return; }
  c = c.replace("const hasFlag = require('has-flag');\n", '');
  c = c.replace("'use strict';\n", "'use strict';\n" + polyfill + '\n');
  fs.writeFileSync(f, c);
  console.log('Parcheado:', f);
});

console.log('\nListo. Ahora corre: npm run test');
