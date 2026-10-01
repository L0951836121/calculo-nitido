const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const out = path.join(__dirname, 'dist');
const indexNowKey = 'a0e8204b4c8e38b7d620c0c2feec8010';
const siteHost = 'calculo-nitido.vercel.app';

function instalarAdSense(carpeta, adsenseCode) {
  for (const elemento of fs.readdirSync(carpeta, { withFileTypes: true })) {
    const archivo = path.join(carpeta, elemento.name);

    if (elemento.isDirectory()) {
      instalarAdSense(archivo, adsenseCode);
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

async function notificarIndexNow() {
  const sitemapPath = path.join(out, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.warn('IndexNow: no se encontró sitemap.xml; se omite el aviso.');
    return;
  }

  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());

  if (!urls.length) {
    console.warn('IndexNow: sitemap.xml no contiene URLs; se omite el aviso.');
    return;
  }

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: siteHost,
        key: indexNowKey,
        keyLocation: `https://${siteHost}/${indexNowKey}.txt`,
        urlList: urls
      })
    });

    console.log(`IndexNow: ${response.status} — ${urls.length} URLs notificadas.`);
  } catch (error) {
    console.warn('IndexNow: no se pudo enviar el aviso durante este despliegue:', error.message);
  }
}

async function main() {
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  new AdmZip(path.join(__dirname, 'site.zip')).extractAllTo(out, true);

  const adsenseCode = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7515408159919408" crossorigin="anonymous"></script>';

  instalarAdSense(out, adsenseCode);

  fs.writeFileSync(
    path.join(out, 'ads.txt'),
    'google.com, pub-7515408159919408, DIRECT, f08c47fec0942fa0\n',
    'utf8'
  );

  console.log('Cálculo Nítido listo en dist/ con Google AdSense.');
  await notificarIndexNow();
}

main().catch(error => {
  console.error('Error de compilación:', error);
  process.exit(1);
});
