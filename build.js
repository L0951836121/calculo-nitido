const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const out = path.join(__dirname, 'dist');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

new AdmZip(path.join(__dirname, 'site.zip')).extractAllTo(out, true);

const adsenseCode = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7515408159919408" crossorigin="anonymous"></script>';

function instalarAdSense(carpeta) {
  for (const elemento of fs.readdirSync(carpeta, { withFileTypes: true })) {
    const archivo = path.join(carpeta, elemento.name);

    if (elemento.isDirectory()) {
      instalarAdSense(archivo);
    } else if (elemento.isFile() && elemento.name.endsWith('.html')) {
      let html = fs.readFileSync(archivo, 'utf8');

      if (!html.includes('ca-pub-7515408159919408')) {
        html = html.replace(
          /<head([^>]*)>/i,
          '<head$1>\n  ' + adsenseCode
        );

        fs.writeFileSync(archivo, html, 'utf8');
      }
    }
  }
}

instalarAdSense(out);
fs.writeFileSync(path.join(out, 'ads.txt'), 'google.com, pub-7515408159919408, DIRECT, f08c47fec0942fa0\n', 'utf8');
console.log('Cálculo Nítido listo en dist/ con Google AdSense.');
