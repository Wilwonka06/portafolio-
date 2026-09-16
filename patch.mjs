import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  'console.error("Firestore write CV error: ", err);',
  'console.error("Firestore write CV error: ", err); alert("Error saving to Firestore: " + err);'
);
fs.writeFileSync('src/App.tsx', code);
