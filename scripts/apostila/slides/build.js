// Gera Capitulo-NN-infografico.pptx (pôster + quatro slides) para cada JSON de scripts/apostila/infograficos.
const fs = require('fs'), path = require('path'); const fgv = require(process.env.FGV_LIB || './scripts/fgv');
const DIR = require('path').join(__dirname, '..', '..', '..', 'content', 'infograficos');
const caps = process.argv[2] ? process.argv[2].split(',').map(Number) : [1,2,3,4,5,6,7,8,9,10,11];
(async () => {
  for (const n of caps) {
    const o = JSON.parse(fs.readFileSync(path.join(DIR, `c${String(n).padStart(2, '0')}.json`), 'utf8'));
    const d = fgv.newDeck({ footer: `FGV | Laboratório de Decisão de Crédito | Capítulo ${n}` });
    fgv.infografico(d, o); fgv.infograficoBlocos(d, o);
    const f = path.join(__dirname, `Capitulo-${String(n).padStart(2, '0')}-infografico.pptx`); await fgv.save(d, f); console.log('pptx:', path.basename(f));
  }
})();
