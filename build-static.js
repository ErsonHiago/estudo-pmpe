// Gera o site estático em docs/ (para o GitHub Pages): node build-static.js
const fs = require('fs'), path = require('path');
const R = __dirname, OUT = path.join(R, 'docs');
const read = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const merged = {};
for (const f of fs.readdirSync(path.join(R, 'data/modules')).filter(f => f.endsWith('.json')).sort()) {
  const m = read(path.join(R, 'data/modules', f));
  const t = merged[m.id] = merged[m.id] || { ...m, topicos: [], questoes: [] };
  t.topicos.push(...(m.topicos || [])); t.questoes.push(...(m.questoes || []));
  ['titulo', 'disciplina', 'descricao'].forEach(k => { if (m[k] && !t[k]) t[k] = m[k]; });
}
const idx = {}; Object.values(merged).forEach(m => m.questoes.forEach(q => { idx[q.id] = q; }));
const PT = path.join(R, 'data/patches');
if (fs.existsSync(PT)) for (const f of fs.readdirSync(PT).filter(f => f.endsWith('.json')).sort())
  for (const [id, v] of Object.entries(read(path.join(PT, f)))) if (idx[id]) Object.assign(idx[id], v);
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'data'), { recursive: true }); fs.mkdirSync(path.join(OUT, 'docs'), { recursive: true });
for (const f of ['index.html', 'style.css', 'app.js']) fs.copyFileSync(path.join(R, 'public', f), path.join(OUT, f));
fs.writeFileSync(path.join(OUT, 'data/modules.json'), JSON.stringify(Object.values(merged)));
for (const f of fs.readdirSync(path.join(R, 'data/docs'))) fs.copyFileSync(path.join(R, 'data/docs', f), path.join(OUT, 'docs', f));
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log('site gerado em docs/ (' + Object.values(merged).length + ' módulos)');
