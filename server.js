// Servidor local do Sistema de Estudos - Concurso Caruaru 2026 (sem dependências)
// Uso: node server.js   ->  http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const MODULES = path.join(ROOT, 'data', 'modules');
const DOCS = path.join(ROOT, 'data', 'docs');
const PROGRESS = path.join(ROOT, 'data', 'progress.json');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

function loadModules() {
  const merged = {};
  if (!fs.existsSync(MODULES)) return [];
  for (const f of fs.readdirSync(MODULES).filter(f => f.endsWith('.json')).sort()) {
    try {
      const m = JSON.parse(fs.readFileSync(path.join(MODULES, f), 'utf8'));
      if (!m.id) continue;
      if (!merged[m.id]) merged[m.id] = { ...m, topicos: [], questoes: [] };
      const t = merged[m.id];
      (m.topicos || []).forEach(x => t.topicos.push(x));
      (m.questoes || []).forEach(x => t.questoes.push(x));
      ['titulo', 'disciplina', 'descricao'].forEach(k => { if (m[k] && !t[k]) t[k] = m[k]; });
    } catch (e) {
      console.error('Erro lendo módulo', f, e.message);
    }
  }
  // remendos: data/patches/*.json => { "<id-da-questao>": { "resolucao_md": "..." } }
  const PATCHES = path.join(ROOT, 'data', 'patches');
  if (fs.existsSync(PATCHES)) {
    const idx = {};
    Object.values(merged).forEach(m => m.questoes.forEach(q => { idx[q.id] = q; }));
    for (const f of fs.readdirSync(PATCHES).filter(f => f.endsWith('.json')).sort()) {
      try {
        const p = JSON.parse(fs.readFileSync(path.join(PATCHES, f), 'utf8'));
        for (const [qid, v] of Object.entries(p)) if (idx[qid]) Object.assign(idx[qid], v);
      } catch (e) { console.error('Erro lendo remendo', f, e.message); }
    }
  }
  return Object.values(merged);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = '';
    req.on('data', c => { b += c; if (b.length > 20e6) { reject(new Error('grande')); req.destroy(); } });
    req.on('end', () => resolve(b));
    req.on('error', reject);
  });
}

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const p = decodeURIComponent(url.pathname);

    if (p === '/api/modules' || p === '/data/modules.json') return send(res, 200, JSON.stringify(loadModules()));

    if (p === '/api/progress' && req.method === 'GET') {
      const body = fs.existsSync(PROGRESS) ? fs.readFileSync(PROGRESS, 'utf8') : '{}';
      return send(res, 200, body);
    }
    if (p === '/api/progress' && req.method === 'POST') {
      const body = await readBody(req);
      JSON.parse(body); // valida
      if (fs.existsSync(PROGRESS)) fs.copyFileSync(PROGRESS, PROGRESS + '.bak');
      fs.writeFileSync(PROGRESS, body);
      return send(res, 200, '{"ok":true}');
    }

    if (/^\/docs\/[\w-]+\.md$/.test(p)) {
      const f = path.join(DOCS, path.basename(p));
      if (!fs.existsSync(f)) return send(res, 404, '# não encontrado', MIME['.md']);
      return send(res, 200, fs.readFileSync(f, 'utf8'), MIME['.md']);
    }

    if (p.startsWith('/api/doc/')) {
      const name = path.basename(p.slice('/api/doc/'.length));
      const f = path.join(DOCS, name + '.md');
      if (!fs.existsSync(f)) return send(res, 404, '# não encontrado', MIME['.md']);
      return send(res, 200, fs.readFileSync(f, 'utf8'), MIME['.md']);
    }

    // estáticos
    let rel = p === '/' ? '/index.html' : p;
    const file = path.normalize(path.join(PUBLIC, rel));
    if (!file.startsWith(PUBLIC) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      return send(res, 404, 'Não encontrado', 'text/plain; charset=utf-8');
    }
    send(res, 200, fs.readFileSync(file), MIME[path.extname(file)] || 'application/octet-stream');
  } catch (e) {
    send(res, 500, JSON.stringify({ error: e.message }));
  }
});

server.listen(PORT, () => {
  console.log(`\n  Estudos Caruaru 2026 rodando em http://localhost:${PORT}\n  (Ctrl+C para parar)\n`);
});
