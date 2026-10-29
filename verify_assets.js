// verify_assets.js
const http = require('http');

const urls = [
  'http://localhost:3000/',
  'http://localhost:3000/assets/css/main.css',
  'http://localhost:3000/assets/js/store.js',
  'http://localhost:3000/assets/js/app.js',
  'http://localhost:3000/assets/img/cad_assembly.jpg',
  'http://localhost:3000/assets/img/pcb_schematic.jpg',
  'http://localhost:3000/assets/img/iot_prototype.jpg'
];

async function check() {
  console.log('--- Memeriksa Endpoint Server KerjaIN (localhost:3000) ---');
  let allOk = true;
  for (const url of urls) {
    await new Promise((resolve) => {
      http.get(url, (res) => {
        const ok = res.statusCode === 200;
        if (!ok) allOk = false;
        console.log(`${ok ? '✓' : '✗'} [${res.statusCode}] ${url} (${res.headers['content-type']})`);
        resolve();
      }).on('error', (e) => {
        allOk = false;
        console.error(`✗ [ERROR] ${url}: ${e.message}`);
        resolve();
      });
    });
  }
  if (allOk) {
    console.log('--- Semua Endpoint Web Berhasil Mengembalikan HTTP 200 OK! ---');
  }
}
check();
