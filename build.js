const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const out = path.join(__dirname, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
new AdmZip(path.join(__dirname, 'site.zip')).extractAllTo(out, true);
console.log('Cálculo Nítido listo en dist/');
