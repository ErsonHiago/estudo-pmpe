/* PMPE */
/* Sistema de Estudos - Concurso PMPE 2027 (Soldado, Praça PM - QPMG, cód. 201) */
'use strict';

// ---------- utilidades ----------
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => fmt(new Date());
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return fmt(d); };
const diffDays = (a, b) => Math.round((parseD(b) - parseD(a)) / 864e5);
const br = s => { const [, m, d] = s.split('-'); return `${d}/${m}`; };
const DOW = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
const hh = s => { s = Math.max(0, Math.floor(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' : '') + String(m).padStart(h ? 2 : 1, '0') + ':' + String(x).padStart(2, '0'); };

const EXAM = '2027-02-28';
const INSCR_END = '2026-11-05';
const BOLETO_END = '2026-11-06';
const ISENCAO_END = '2026-10-08';
const TAF_START = '2027-07-23';
const STATUS = ['Não visto', 'Estudado', 'Revisado', 'Dominado'];
const INTERVALS = [0, 1, 3, 7, 14, 30];
const MOD_ORDER = ['constitucional', 'dh', 'portugues', 'historia-pe', 'raciocinio', 'informatica', 'redacao', 'taf'];
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const DISC = { portugues: 'Português', historia: 'História de PE', raciocinio: 'Raciocínio Lógico', informatica: 'Informática', constitucional: 'Dir. Constitucional', dh: 'DH e Leg. Extravagante' };
const DISC_ALL = { ...DISC, redacao: 'Redação', fisico: 'Treino físico (TAF)' };
const BLOCOS = { I: ['portugues', 'historia'], II: ['raciocinio', 'informatica'], III: ['constitucional', 'dh'] };
const WEIGHT = { portugues: 1, historia: 1, raciocinio: 1, informatica: 1, constitucional: 1, dh: 1 };

// ---------- markdown mínimo ----------
function md(src) {
  src = String(src || '').replace(/\r/g, '');
  const lines = src.split('\n');
  const inline = t => {
    t = esc(t);
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^*\w])\*([^*\s][^*]*)\*(?!\w)/g, '$1<em>$2</em>');
    t = t.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return t;
  };
  const cells = l => l.trim().replace(/^\|/, '').replace(/\|$/, '').replace(/\\\|/g, '\u0001').split('|').map(c => c.replace(/\u0001/g, '|').trim());
  const out = []; let i = 0;
  const isBlock = l => /^(#{1,4}\s|```|>\s?|---+$|\s*([-*]|\d+\.)\s+|\s*\|.*\|\s*$)/.test(l);
  while (i < lines.length) {
    const l = lines[i];
    if (/^```/.test(l)) { const b = []; i++; while (i < lines.length && !/^```/.test(lines[i])) b.push(lines[i++]); i++; out.push('<pre><code>' + esc(b.join('\n')) + '</code></pre>'); continue; }
    if (/^\s*\|.*\|\s*$/.test(l) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const head = cells(l); i += 2; const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      out.push('<div style="overflow:auto"><table><thead><tr>' + head.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>' +
        rows.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>');
      continue;
    }
    const m = l.match(/^(#{1,4})\s+(.*)/);
    if (m) { out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); i++; continue; }
    if (/^---+$/.test(l)) { out.push('<hr>'); i++; continue; }
    if (/^>\s?/.test(l)) { const b = []; while (i < lines.length && /^>\s?/.test(lines[i])) b.push(lines[i++].replace(/^>\s?/, '')); out.push('<blockquote>' + b.map(inline).join('<br>') + '</blockquote>'); continue; }
    if (/^\s*([-*]|\d+\.)\s+/.test(l)) {
      const ordered = /^\s*\d+\./.test(l); const items = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        const mm = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
        items.push(`<li style="margin-left:${Math.min(mm[1].length, 8) * 7}px">${inline(mm[3])}</li>`); i++;
      }
      out.push((ordered ? '<ol>' : '<ul>') + items.join('') + (ordered ? '</ol>' : '</ul>')); continue;
    }
    if (!l.trim()) { i++; continue; }
    const b = [l]; i++;
    while (i < lines.length && lines[i].trim() && !isBlock(lines[i])) b.push(lines[i++]);
    out.push('<p>' + inline(b.join(' ')) + '</p>');
  }
  return `<div class="md">${out.join('\n')}</div>`;
}

// ---------- estado ----------
let MODS = [], P = {}, TIDX = {}, QIDX = {};
let saveTimer = null;
function defaults() {
  P.start = P.start || (today() < '2026-10-01' ? '2026-10-01' : today());
  P.topics = P.topics || {}; P.cards = P.cards || {}; P.answers = P.answers || {};
  P.tasks = P.tasks || {}; P.sims = P.sims || []; P.study = P.study || {}; P.diss = P.diss || [];
}
function save() {
  try { localStorage.setItem('estudo-caruaru', JSON.stringify(P)); } catch (e) { }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => fetch('api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(P) }).catch(() => { }), 400);
}
const modOrder = m => { const i = MOD_ORDER.indexOf(m.id); return i >= 0 ? i : 50; };
const byDisc = d => MODS.filter(m => m.disciplina === d);
const topicStatus = id => (P.topics[id] || {}).status || 0;
function setStatus(id, s) {
  P.topics[id] = { ...(P.topics[id] || {}), status: s, ts: today() };
  if (s >= 1) addCards(id);
  save();
}
function addCards(tid) {
  const t = TIDX[tid]; if (!t) return;
  (t.t.flashcards || []).forEach((c, i) => { const id = tid + '#' + i; if (!P.cards[id]) P.cards[id] = { box: 0, due: today() }; });
}
function cardData(id) { const [tid, i] = id.split('#'); const t = TIDX[tid]; return t && t.t.flashcards ? t.t.flashcards[+i] : null; }
function dueCards() { const t = today(); return Object.entries(P.cards).filter(([id, c]) => c.due <= t && cardData(id)).map(([id]) => id); }
function errorList() { return Object.entries(P.answers).filter(([id, r]) => r.ok === false && !r.cleared && QIDX[id]).map(([id]) => id); }
function logStudy(min) { P.study[today()] = (P.study[today()] || 0) + min; save(); }
function recordAnswer(qid, ok) {
  const r = P.answers[qid] || { n: 0, wrong: 0 };
  r.n++; if (!ok) r.wrong++; r.ok = ok; r.cleared = false; r.ts = today(); P.answers[qid] = r; save();
}
function topicAcc(tid) {
  const m = TIDX[tid]?.m; const qs = (m?.questoes || []).filter(q => q.topico === tid);
  let a = 0, ok = 0; qs.forEach(q => { const r = P.answers[q.id]; if (r) { a++; if (r.ok) ok++; } });
  return { total: qs.length, answered: a, ok };
}
function streak() {
  let s = 0, d = today();
  if (!(P.study[d] > 0)) d = addDays(d, -1);
  while (P.study[d] > 0) { s++; d = addDays(d, -1); }
  return s;
}

// ---------- plano ----------
function allocate(days, list, f, capFn, idxs, type) {
  if (!list.length || !idxs.length) return;
  const hrs = t => Math.max(0.5, Math.round((t.horas || 1.5) * f * 2) / 2);
  const chunks = [], parts = {};
  let ti = 0, remaining = hrs(list[0]);
  for (let p = 0; p < idxs.length && ti < list.length; p++) {
    let space = capFn(idxs[p]);
    while (space > 0.01 && ti < list.length) {
      const t = list[ti], take = Math.min(remaining, space);
      chunks.push({ day: idxs[p], t, hours: take }); parts[t.id] = (parts[t.id] || 0) + 1;
      remaining -= take; space -= take;
      if (remaining <= 0.01) { ti++; if (ti < list.length) remaining = hrs(list[ti]); }
    }
  }
  while (ti < list.length) { // sobra: vai para o último dia disponível
    const t = list[ti]; chunks.push({ day: idxs[idxs.length - 1], t, hours: remaining }); parts[t.id] = (parts[t.id] || 0) + 1;
    ti++; if (ti < list.length) remaining = hrs(list[ti]);
  }
  const seen = {};
  chunks.forEach(c => {
    seen[c.t.id] = (seen[c.t.id] || 0) + 1; const n = parts[c.t.id];
    days[c.day].tasks.push({
      key: `${c.t.id}#p${seen[c.t.id]}`, type, topic: c.t.id,
      label: c.t.titulo + (n > 1 ? ` (parte ${seen[c.t.id]}/${n})` : ''), hours: Math.round(c.hours * 100) / 100, last: seen[c.t.id] === n,
    });
  });
}

function tafWeek(date) {
  const start = (P.taf && P.taf.start) || P.start;
  return Math.min(42, Math.max(1, Math.floor(diffDays(start, date) / 7) + 1));
}
function genPlan(from) {
  if (from < P.start) from = P.start;
  const days = [];
  for (let d = from; d < EXAM; d = addDays(d, 1)) days.push({ date: d, dow: parseD(d).getDay(), tasks: [] });
  const N = days.length;
  if (!N) return [];
  const simStart = Math.max(Math.floor(N * 0.75), N - 37);
  const left = ids => ids.flatMap(id => MODS.filter(m => m.id === id)).flatMap(m => m.topicos).filter(t => topicStatus(t.id) < 1);
  const range = (a, b) => { const r = []; for (let i = a; i < b; i++) r.push(i); return r; };
  const evenStream = (list, idxs, type) => {
    if (!list.length || !idxs.length) return;
    const totalH = list.reduce((s, t) => s + (t.horas || 2), 0);
    const cap = Math.max(0.5, Math.min(3, totalH / idxs.length * 1.05));
    allocate(days, list, Math.min(1, idxs.length * cap / (totalH || 1)), () => cap, idxs, type);
  };
  const learnEnd = Math.floor(N * 0.72), porEnd = Math.floor(N * 0.8), thinEnd = Math.floor(N * 0.78);
  const onDow = (a, b, set) => range(a, b).filter(i => set.includes(days[i].dow));

  // Direitos (Constitucional e Direitos Humanos/Legislação): todos os dias, menos domingo
  evenStream(left(['constitucional', 'dh']), onDow(0, learnEnd, [1, 2, 3, 4, 5, 6]), 'estudo');
  // Português: todos os dias (ponto fraco)
  evenStream(left(['portugues']), range(0, porEnd), 'portugues');
  // História de Pernambuco: segundas e quintas
  evenStream(left(['historia-pe']), onDow(0, thinEnd, [1, 4]), 'estudo');
  // Raciocínio Lógico: terças e sábados
  evenStream(left(['raciocinio']), onDow(0, thinEnd, [2, 6]), 'raciocinio');
  // Informática: quartas e sextas
  evenStream(left(['informatica']), onDow(0, thinEnd, [3, 5]), 'estudo');

  // Redação: sábados (técnica e modelos)
  const rm = MODS.find(m => m.id === 'redacao');
  const rt = rm ? rm.topicos.filter(t => topicStatus(t.id) < 1) : [];
  onDow(0, simStart, [6]).forEach((di, k) => {
    const t = rt[k];
    if (t) days[di].tasks.push({ key: t.id + '#p1', type: 'topic', topic: t.id, label: 'Redação: ' + t.titulo, hours: 0.75, last: true });
    days[di].tasks.push({ key: `red:${days[di].date}`, type: 'red', label: 'Escrever 1 redação de 15–20 linhas (tema sorteado) e se autoavaliar', hours: 0.75, link: '#/redacao' });
  });

  const simDates = [35, 28, 21, 14, 8, 3].map(k => addDays(EXAM, -k));
  const hasTaf = MODS.some(m => m.id === 'taf');
  days.forEach((d, i) => {
    const sim = i >= simStart;
    d.tasks.unshift({ key: `fc:${d.date}`, type: 'fc', label: 'Revisão espaçada: flashcards vencidos', hours: 0.4, link: '#/flashcards' });
    if (!sim && d.tasks.some(t => t.type === 'estudo')) d.tasks.push({ key: `q:${d.date}`, type: 'q', label: 'Questões do conteúdo estudado hoje (registre os erros)', hours: 0.6, link: '#/questoes' });
    if (!d.tasks.some(t => t.type === 'portugues')) d.tasks.push({ key: `pq:${d.date}`, type: 'pq', label: 'Português: 15–20 questões comentadas', hours: 0.67, link: '#/questoes?disc=portugues' });
    // treino físico: segunda, quarta, sexta e sábado
    if ([1, 3, 5, 6].includes(d.dow)) {
      const w = tafWeek(d.date), wid = 'taf-semana-' + String(w).padStart(2, '0');
      d.tasks.push({ key: `taf:${d.date}`, type: 'taf', topic: TIDX[wid] ? wid : '', link: TIDX[wid] ? '' : '#/fisico', label: `Treino físico (semana ${w} do plano de TAF)`, hours: 1 });
    }
    if (d.dow === 0 && !sim) {
      d.tasks.push({ key: `wk:${d.date}`, type: 'wk', label: 'Revisão semanal: refazer o caderno de erros e reler as pegadinhas da semana', hours: 1, link: '#/erros' });
      if (i > N * 0.3) d.tasks.push({ key: `sb:${d.date}`, type: 'sb', label: 'Simulado de bloco (alterne I, II e III): 20 questões', hours: 1.7, link: '#/simulado' });
    }
    if (sim) {
      if (simDates.includes(d.date)) d.tasks.push({ key: `sim:${d.date}`, type: 'sim', label: 'SIMULADO COMPLETO (5h: 60 questões + redação)', hours: 5, link: '#/simulado' });
      else {
        d.tasks.push({ key: `er:${d.date}`, type: 'er', label: 'Refazer erros do caderno e revisar os tópicos mais fracos', hours: 1.2, link: '#/erros' });
        if ((i - simStart) % 3 === 1) d.tasks.push({ key: `red:${d.date}`, type: 'red', label: 'Redação cronometrada de 15–20 linhas (tema sorteado)', hours: 0.75, link: '#/redacao' });
      }
    }
    if (d.date === addDays(EXAM, -1)) d.tasks = [
      { key: `fc:${d.date}`, type: 'fc', label: 'Revisão leve: flashcards vencidos (sem conteúdo novo)', hours: 0.4, link: '#/flashcards' },
      { key: `last1:${d.date}`, type: 'misc', label: 'Reler as pegadinhas dos tópicos de prioridade 1 (só leitura)', hours: 1, link: '#/escopo' },
      { key: `last2:${d.date}`, type: 'misc', label: 'Separar documento original com foto e caneta esferográfica transparente azul ou preta; conferir o trajeto. Dormir cedo.', hours: 0.5, link: '#/doc/estrategia' },
    ];
  });
  const put = (date, key, label, link) => { const d = days.find(x => x.date === date); if (d) d.tasks.unshift({ key, type: 'admin', label, hours: 0.3, link: link || '#/doc/edital' }); };
  const first = days[0].date;
  put(first <= ISENCAO_END ? first : '', 'adm:requisitos', 'Conferir os requisitos do cargo 201: ensino médio, 18 a 30 anos na inscrição, CNH categoria B, altura mínima (1,65 m homem / 1,60 m mulher)');
  put(first <= ISENCAO_END ? first : '', 'adm:isencao', 'Isenção da taxa (CadÚnico): pedido até 08/10 às 13h, documentos até as 14h. Só se você se enquadrar.');
  put(first <= INSCR_END ? (first > '2026-10-05' ? first : '2026-10-06') : '', 'adm:inscricao', 'INSCRIÇÃO no site do Instituto AOCP (cargo 201, Soldado): até 05/11. Boleto pago até 06/11. Escolha a cidade da prova.');
  put(BOLETO_END, 'adm:boleto', 'Confirmar o pagamento do boleto (a inscrição só vale após a compensação)');
  put('2026-11-19', 'adm:deferida', 'Conferir se a inscrição foi DEFERIDA no site do Instituto AOCP');
  put('2027-02-09', 'adm:local', 'Ver o edital de horário e local da prova');
  put('2027-02-22', 'adm:cartao', 'Baixar o Cartão de Informação do Candidato e imprimir');
  return days;
}
function ensurePlan(force) {
  if (!P.plan || force) {
    const keep = ((P.plan && P.plan.days) || []).filter(d => d.date < today());
    const fresh = genPlan(today() < P.start ? P.start : today());
    P.plan = { gen: today(), days: [...keep, ...fresh] };
    save();
  }
}
function pendingPast() {
  const t = today(); let n = 0;
  (P.plan?.days || []).filter(d => d.date < t).forEach(d => d.tasks.forEach(k => { if (!P.tasks[k.key] && !['fc', 'pq', 'q'].includes(k.type)) n++; }));
  return n;
}

// ---------- widgets compartilhados ----------
function bar(v, max, cls = '') { return `<div class="bar ${cls}"><i style="width:${Math.min(100, pct(v, max))}%"></i></div>`; }
function statusSel(id) {
  return `<select onchange="A.setStatus('${id}',+this.value)">${STATUS.map((s, i) => `<option value="${i}" ${topicStatus(id) === i ? 'selected' : ''}>${s}</option>`).join('')}</select>`;
}
function taskRow(t) {
  const done = !!P.tasks[t.key];
  const title = t.topic ? `<a href="#/topico/${t.topic}">${esc(t.label)}</a>` : t.link ? `<a href="${t.link}">${esc(t.label)}</a>` : esc(t.label);
  return `<div class="task ${done ? 'done' : ''}"><input type="checkbox" ${done ? 'checked' : ''} onchange="A.toggleTask('${t.key}',this.checked,'${t.topic || ''}',${!!t.last})">
    <div class="tl" style="flex:1">${title}</div><span class="tag">${t.hours}h</span></div>`;
}

// ---------- views ----------
const V = {};

V.home = () => {
  ensurePlan();
  const t = today(), dE = diffDays(t, EXAM);
  const tps = MODS.flatMap(m => m.topicos), studied = tps.filter(x => topicStatus(x.id) >= 1).length;
  const answered = Object.keys(P.answers).filter(id => QIDX[id]), okN = answered.filter(id => P.answers[id].ok).length;
  const day = P.plan.days.find(d => d.date === t);
  const minToday = Math.round(P.study[t] || 0), minTotal = Math.round(Object.values(P.study).reduce((a, b) => a + b, 0));
  const lastSim = P.sims[P.sims.length - 1];
  const byD = {}; answered.forEach(id => { const d = QIDX[id].m.disciplina; (byD[d] = byD[d] || { a: 0, ok: 0 }).a++; if (P.answers[id].ok) byD[d].ok++; });
  return `<h1>Painel</h1><p class="muted">Concurso PMPE · Soldado (Praça PM, QPMG, cód. 201) · Instituto AOCP · prova em 28/02/2027</p>
  ${t <= BOLETO_END ? `<div class="warnbox" style="margin:10px 0"><strong>Inscrição:</strong> site do Instituto AOCP (www.institutoaocp.org.br), até 05/11/2026 (boleto pago até 06/11). ${t <= ISENCAO_END ? 'Pedido de isenção pelo CadÚnico: até 08/10 às 13h.' : ''} Faltam ${diffDays(t, INSCR_END)} dia(s) para fechar a inscrição.</div>` : ''}
  <div class="grid g4": ''}
  <div class="grid g4" style="margin:12px 0">
    <div class="card kpi"><div class="n">${dE}</div><div class="l">dias para a prova (28/02/27)</div></div>
    <div class="card kpi"><div class="n">${studied}/${tps.length}</div><div class="l">tópicos estudados</div>${bar(studied, tps.length)}</div>
    <div class="card kpi"><div class="n">${pct(okN, answered.length)}%</div><div class="l">acerto em ${answered.length} questões</div>${bar(okN, answered.length, 'ok')}</div>
    <div class="card kpi"><div class="n">${dueCards().length}</div><div class="l">flashcards para revisar hoje</div></div>
    <div class="card kpi"><div class="n">${errorList().length}</div><div class="l">questões no caderno de erros</div></div>
    <div class="card kpi"><div class="n">${(minToday / 60).toFixed(1)}h</div><div class="l">estudadas hoje · total ${(minTotal / 60).toFixed(0)}h · sequência ${streak()} dia(s)</div></div>
  </div>
  <div class="grid g2">
    <div class="card"><h3 style="margin-top:0">Hoje (${DOW[parseD(t).getDay()]} ${br(t)})</h3>
      ${day ? day.tasks.map(taskRow).join('') : '<p class="muted">Sem tarefas para hoje.</p>'}
      ${pendingPast() > 5 ? `<p class="warnbox">Você tem ${pendingPast()} tarefas atrasadas. <a href="#/plano">Replaneje</a> a partir de hoje.</p>` : ''}
    </div>
    <div class="card"><h3 style="margin-top:0">Cobertura por módulo</h3>
      ${[...MODS].sort((a, b) => modOrder(a) - modOrder(b)).map(m => { const s = m.topicos.filter(x => topicStatus(x.id) >= 1).length; return `<div style="margin:8px 0"><div class="row" style="justify-content:space-between"><span>${esc(m.titulo)}</span><span class="muted">${s}/${m.topicos.length}</span></div>${bar(s, m.topicos.length)}</div>`; }).join('') || '<p class="muted">Nenhum módulo carregado.</p>'}
    </div>
    <div class="card"><h3 style="margin-top:0">Acerto por disciplina</h3>
      ${Object.keys(DISC).map(d => { const x = byD[d] || { a: 0, ok: 0 }; return `<div style="margin:8px 0"><div class="row" style="justify-content:space-between"><span>${DISC[d]}</span><span class="muted">${x.ok}/${x.a} · ${pct(x.ok, x.a)}%</span></div>${bar(x.ok, x.a, 'ok')}</div>`; }).join('')}
    </div>
    <div class="card"><h3 style="margin-top:0">Último simulado</h3>
      ${lastSim ? `<p><strong>${lastSim.total} pontos</strong> de ${lastSim.max} (${lastSim.mode}) em ${lastSim.date.split('-').reverse().join('/')}<br>${lastSim.minOk === null ? '' : lastSim.minOk ? '<span class="tag s2">atingiu os mínimos</span>' : '<span class="tag p1">abaixo dos mínimos</span>'}</p><a href="#/simulado">Ver histórico</a>` : '<p class="muted">Nenhum simulado feito ainda. Os completos estão no plano a partir de ' + br(addDays(EXAM, -14)) + '.</p>'}
    </div>
  </div>`;
};

V.plano = () => {
  ensurePlan();
  const t = today(), days = P.plan.days;
  const past = days.filter(d => d.date < t), cur = days.filter(d => d.date >= t);
  const pend = pendingPast();
  const weeks = []; cur.forEach((d, i) => { const w = Math.floor(i / 7); (weeks[w] = weeks[w] || []).push(d); });
  const dayHtml = d => { const hrs = d.tasks.reduce((s, k) => s + k.hours, 0); return `<div class="day ${d.date === t ? 'today' : ''}"><div class="row" style="justify-content:space-between"><strong>${DOW[d.dow]} ${br(d.date)}${d.date === t ? ' · HOJE' : ''}</strong><span class="muted">${hrs.toFixed(1)}h · faltam ${diffDays(d.date, EXAM)} dias</span></div>${d.tasks.map(taskRow).join('')}</div>`; };
  return `<h1>Plano de estudos</h1>
  <p class="muted">Gerado a partir do escopo do edital, ajustado ao tempo que falta. Tributário e finanças públicas primeiro (é o que você ainda não domina), depois TI, e as últimas duas semanas são de simulados e revisão.</p>
  <div class="row" style="margin:10px 0"><button class="pri" onclick="A.replan()">Replanejar a partir de hoje</button><span class="muted">Use quando atrasar ou quando terminar um tópico antes do previsto. O que você já marcou como estudado sai do plano.</span></div>
  ${pend ? `<div class="warnbox">${pend} tarefa(s) de dias anteriores sem marcar.</div>` : ''}
  ${weeks.map((w, i) => `<details ${i === 0 ? 'open' : ''}><summary style="cursor:pointer;margin:14px 0 4px;font-weight:600">Semana ${i + 1}: ${br(w[0].date)} a ${br(w[w.length - 1].date)}</summary>${w.map(dayHtml).join('')}</details>`).join('')}
  <div class="day"><strong>29/11 · DIA DA PROVA</strong><p class="muted" style="margin:6px 0 0">Portões 8h00–9h00 (fecham às 9h). Prova às 9h10, duração de 4h. Leve documento original com foto e 2 canetas azul/preta.</p></div>
  ${past.length ? `<details><summary style="cursor:pointer;margin:14px 0 4px;font-weight:600">Dias anteriores (${past.length})</summary>${past.slice().reverse().map(dayHtml).join('')}</details>` : ''}`;
};

let ES = { disc: '', mod: '', st: '', prio: '', q: '' };
V.escopo = () => {
  let rows = MODS.flatMap(m => m.topicos.map(t => ({ t, m })));
  rows.sort((a, b) => modOrder(a.m) - modOrder(b.m));
  const all = rows.length;
  rows = rows.filter(r => (!ES.disc || r.m.disciplina === ES.disc) && (!ES.mod || r.m.id === ES.mod) && (ES.st === '' || topicStatus(r.t.id) === +ES.st) && (!ES.prio || String(r.t.prioridade) === ES.prio) && (!ES.q || r.t.titulo.toLowerCase().includes(ES.q.toLowerCase())));
  const hrs = rows.reduce((s, r) => s + (r.t.horas || 0), 0);
  return `<h1>Escopo completo</h1><p class="muted">Tudo o que o edital cobre para o seu cargo, dividido em tópicos. Prioridade 1 = cai muito. Mostrando ${rows.length} de ${all} tópicos (~${hrs.toFixed(0)}h).</p>
  <div class="row" style="margin:10px 0">
    <select onchange="ES.disc=this.value;route()"><option value="">Todas as disciplinas</option>${Object.entries(DISC_ALL).map(([k, v]) => `<option value="${k}" ${ES.disc === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
    <select onchange="ES.mod=this.value;route()"><option value="">Todos os módulos</option>${MODS.map(m => `<option value="${m.id}" ${ES.mod === m.id ? 'selected' : ''}>${esc(m.titulo)}</option>`).join('')}</select>
    <select onchange="ES.st=this.value;route()"><option value="">Qualquer status</option>${STATUS.map((s, i) => `<option value="${i}" ${ES.st === String(i) ? 'selected' : ''}>${s}</option>`).join('')}</select>
    <select onchange="ES.prio=this.value;route()"><option value="">Qualquer prioridade</option>${[1, 2, 3].map(p => `<option value="${p}" ${ES.prio === String(p) ? 'selected' : ''}>Prioridade ${p}</option>`).join('')}</select>
    <input type="text" placeholder="buscar…" value="${esc(ES.q)}" onchange="ES.q=this.value;route()">
  </div>
  <div class="card" style="padding:0;overflow:auto"><table style="margin:0"><thead><tr><th>Tópico</th><th>Módulo</th><th>Prio</th><th>Horas</th><th>Acerto</th><th>Status</th></tr></thead><tbody>
  ${rows.map(({ t, m }) => { const a = topicAcc(t.id); return `<tr><td><a href="#/topico/${t.id}">${esc(t.titulo)}</a></td><td class="muted">${esc(m.titulo)}</td><td><span class="tag p${t.prioridade || 2}">${t.prioridade || 2}</span></td><td>${t.horas || '-'}</td><td>${a.answered ? pct(a.ok, a.answered) + '% (' + a.answered + '/' + a.total + ')' : a.total ? '0/' + a.total : '-'}</td><td>${statusSel(t.id)}</td></tr>`; }).join('')}
  </tbody></table></div>`;
};

let TS = { tab: 'resumo' };
V.topico = id => {
  const x = TIDX[id]; if (!x) return '<p>Tópico não encontrado. <a href="#/escopo">Voltar ao escopo</a></p>';
  const { t, m } = x; const a = topicAcc(id);
  const all = MODS.flatMap(mm => mm.topicos), idx = all.findIndex(z => z.id === id);
  const tabs = [['resumo', 'Resumo'], ['dicas', 'Dicas e pegadinhas'], ['cards', `Flashcards (${(t.flashcards || []).length})`], ['quiz', `Questões (${a.total})`]];
  let body = '';
  if (TS.tab === 'resumo') body = md(t.resumo_md);
  else if (TS.tab === 'dicas') body = `<h3>Dicas</h3>${(t.dicas || []).map(d => `<div class="okbox" style="margin:6px 0">${esc(d)}</div>`).join('') || '<p class="muted">Sem dicas.</p>'}<h3>Pegadinhas de banca</h3>${(t.pegadinhas || []).map(d => `<div class="warnbox" style="margin:6px 0">${esc(d)}</div>`).join('') || '<p class="muted">Sem pegadinhas.</p>'}`;
  else if (TS.tab === 'cards') body = `<p class="muted">Clique no cartão para ver a resposta. Para entrar na revisão espaçada, marque o tópico como estudado (ou use o botão).</p><button onclick="A.addCards('${id}')">Adicionar à revisão espaçada</button>${(t.flashcards || []).map(c => `<details class="card" style="margin:8px 0"><summary style="cursor:pointer"><strong>${esc(c.q)}</strong></summary><p style="margin:8px 0 0">${esc(c.a)}</p></details>`).join('')}`;
  else body = quizStart(m.questoes.filter(q => q.topico === id).map(q => q.id), 'topico:' + id);
  return `<div class="row" style="justify-content:space-between"><div><a href="#/escopo">← Escopo</a> <span class="tag">${esc(m.titulo)}</span><span class="tag p${t.prioridade || 2}">prioridade ${t.prioridade || 2}</span><span class="tag">~${t.horas || '?'}h</span></div>
    <div class="row">${all[idx - 1] ? `<a href="#/topico/${all[idx - 1].id}">← anterior</a>` : ''}${all[idx + 1] ? `<a href="#/topico/${all[idx + 1].id}">próximo →</a>` : ''}</div></div>
  <h1 style="margin-top:8px">${esc(t.titulo)}</h1>
  <div class="row"><span>Status:</span>${statusSel(id)}<span class="muted">Acerto neste tópico: ${a.answered ? pct(a.ok, a.answered) + '% (' + a.ok + '/' + a.answered + ')' : 'sem respostas'}</span></div>
  <div class="tabs">${tabs.map(([k, l]) => `<button class="${TS.tab === k ? 'on' : ''}" onclick="TS.tab='${k}';route()">${l}</button>`).join('')}</div>
  <div class="card">${body}</div>`;
};

function resolHTML(q) {
  if (q.resolucao_md) return `<div class="expl" style="border-left:4px solid var(--brand)"><strong>Passo a passo da resolução</strong>${md(q.resolucao_md)}</div>`;
  return '';
}
// ----- quiz genérico (feedback imediato) -----
let QZ = null;
function quizStart(ids, ctx) {
  if (!QZ || QZ.ctx !== ctx) QZ = { ctx, ids: shuffle(ids), i: 0, sel: null, right: 0, done: 0, finished: false, base: ids };
  return quizHTML();
}
function quizHTML() {
  if (!QZ.ids.length) return '<p class="muted">Nenhuma questão disponível para este filtro.</p>';
  if (QZ.finished) return `<h3>Fim da sessão</h3><p><strong>${QZ.right}</strong> acertos em <strong>${QZ.done}</strong> (${pct(QZ.right, QZ.done)}%).</p><button class="pri" onclick="A.quizRestart()">Refazer</button> <a href="#/erros" class="btn">Ver caderno de erros</a>`;
  const q = QIDX[QZ.ids[QZ.i]].q, m = QIDX[QZ.ids[QZ.i]].m, rev = QZ.sel !== null;
  const t = TIDX[q.topico]?.t;
  return `<div class="muted" style="margin-bottom:6px">Questão ${QZ.i + 1}/${QZ.ids.length} · ${esc(m.titulo)}${t ? ' · ' + esc(t.titulo) : ''}${q.dificuldade ? ' · dificuldade ' + q.dificuldade : ''}</div>
  ${md(q.enunciado)}
  ${LETTERS.filter(k => q.alternativas[k] !== undefined).map(k => `<button class="opt ${rev ? (k === q.gabarito ? 'right' : k === QZ.sel ? 'wrong' : '') : ''}" ${rev ? 'disabled' : ''} onclick="A.quizPick('${k}')"><strong>${k})</strong> ${esc(q.alternativas[k])}</button>`).join('')}
  ${rev ? `<div class="expl"><strong>${QZ.sel === q.gabarito ? 'Correto!' : 'Errado. Gabarito: ' + q.gabarito}</strong>${md(q.explicacao || '')}</div>
  ${resolHTML(q)}
  <div class="row" style="margin-top:10px"><button class="pri" onclick="A.quizNext()">${QZ.i + 1 >= QZ.ids.length ? 'Concluir' : 'Próxima'}</button>${t ? `<a class="btn" href="#/topico/${q.topico}">Rever o resumo deste tópico</a>` : ''}<button class="sm" onclick="A.doubt('${q.id}')">${P.doubts && P.doubts[q.id] ? 'Dúvida marcada ✓' : 'Marcar dúvida'}</button></div>` : `<div class="row" style="margin-top:8px"><button class="sm" onclick="A.quizNext(true)">Pular</button></div>`}`;
}

let QF = { disc: '', mod: '', topic: '', dif: '', mode: 'novas', n: '20' };
V.questoes = (query) => {
  if (query && query.disc && QF.disc !== query.disc) { QF = { ...QF, disc: query.disc, mod: '', topic: '' }; QZ = null; }
  const mods = MODS.filter(m => (!QF.disc || m.disciplina === QF.disc));
  const topics = QF.mod ? (MODS.find(m => m.id === QF.mod)?.topicos || []) : [];
  const running = QZ && QZ.ctx.startsWith('pratica');
  const totalQ = MODS.reduce((s, m) => s + m.questoes.length, 0);
  return `<h1>Questões</h1><p class="muted">Banco com ${totalQ} questões no estilo da banca. Feedback imediato com explicação de cada alternativa. Erros vão automaticamente para o Caderno de Erros.</p>
  <div class="card"><div class="row">
    <select onchange="QF.disc=this.value;QF.mod='';QF.topic='';route()"><option value="">Todas as disciplinas</option>${Object.entries(DISC_ALL).map(([k, v]) => `<option value="${k}" ${QF.disc === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
    <select onchange="QF.mod=this.value;QF.topic='';route()"><option value="">Todos os módulos</option>${mods.map(m => `<option value="${m.id}" ${QF.mod === m.id ? 'selected' : ''}>${esc(m.titulo)} (${m.questoes.length})</option>`).join('')}</select>
    <select onchange="QF.topic=this.value" ${QF.mod ? '' : 'disabled'}><option value="">Todos os tópicos</option>${topics.map(t => `<option value="${t.id}" ${QF.topic === t.id ? 'selected' : ''}>${esc(t.titulo)}</option>`).join('')}</select>
    <select onchange="QF.dif=this.value"><option value="">Qualquer dificuldade</option>${[1, 2, 3].map(d => `<option value="${d}" ${QF.dif === String(d) ? 'selected' : ''}>Dificuldade ${d}</option>`).join('')}</select>
    <select onchange="QF.mode=this.value"><option value="novas" ${QF.mode === 'novas' ? 'selected' : ''}>Ainda não respondidas</option><option value="erradas" ${QF.mode === 'erradas' ? 'selected' : ''}>Só as que errei</option><option value="todas" ${QF.mode === 'todas' ? 'selected' : ''}>Todas</option></select>
    <select onchange="QF.n=this.value">${['10', '20', '40', '9999'].map(n => `<option value="${n}" ${QF.n === n ? 'selected' : ''}>${n === '9999' ? 'Todas' : n + ' questões'}</option>`).join('')}</select>
    <button class="pri" onclick="A.startPractice()">Iniciar</button></div></div>
  <div class="card" style="margin-top:12px">${running ? quizHTML() : '<p class="muted">Escolha os filtros e clique em Iniciar.</p>'}</div>`;
};

V.erros = () => {
  const errs = errorList();
  const byM = {}; errs.forEach(id => { const k = QIDX[id].m.titulo; byM[k] = (byM[k] || 0) + 1; });
  return `<h1>Caderno de erros</h1><p class="muted">Toda questão que você errou fica aqui até acertar. Refaça antes de cada simulado: as bancas repetem as mesmas pegadinhas.</p>
  <div class="row" style="margin:10px 0"><button class="pri" onclick="A.practiceErrors()" ${errs.length ? '' : 'disabled'}>Praticar os ${errs.length} erros</button>${Object.entries(byM).map(([k, v]) => `<span class="tag">${esc(k)}: ${v}</span>`).join('')}</div>
  ${errs.length ? errs.map(id => { const { q, m } = QIDX[id]; const r = P.answers[id]; return `<details class="card" style="margin:8px 0"><summary style="cursor:pointer"><span class="tag">${esc(m.titulo)}</span> ${esc(q.enunciado.slice(0, 140))}${q.enunciado.length > 140 ? '…' : ''} <span class="muted">(erros: ${r.wrong})</span></summary>${md(q.enunciado)}${LETTERS.filter(k => q.alternativas[k] !== undefined).map(k => `<div class="opt ${k === q.gabarito ? 'right' : ''}" style="cursor:default"><strong>${k})</strong> ${esc(q.alternativas[k])}</div>`).join('')}<div class="expl">${md(q.explicacao || '')}</div>${resolHTML(q)}<div class="row" style="margin-top:8px"><a class="btn" href="#/topico/${q.topico}">Rever o resumo</a><button class="sm" onclick="A.doubt('${id}')">${P.doubts && P.doubts[id] ? 'Dúvida marcada ✓' : 'Marcar dúvida'}</button><button class="sm" onclick="A.clearError('${id}')">Entendi, dispensar</button></div></details>`; }).join('') : '<div class="okbox">Nenhum erro pendente.</div>'}
  ${Object.keys(P.doubts || {}).filter(id => QIDX[id]).length ? `<h2>Dúvidas marcadas (${Object.keys(P.doubts).filter(id => QIDX[id]).length})</h2><p class="muted">Peça para o Claude no chat: "explique as minhas dúvidas marcadas". Ele lê esta lista no arquivo de progresso.</p>${Object.keys(P.doubts).filter(id => QIDX[id]).map(id => `<div class="card" style="margin:6px 0">${esc(QIDX[id].q.enunciado.slice(0, 180))} <span class="muted">(${id})</span> <button class="sm" onclick="A.doubt('${id}')">remover</button></div>`).join('')}` : ''}`;
};

// ----- flashcards -----
let FC = null;
V.flashcards = () => {
  if (!FC) {
    const due = shuffle(dueCards()).slice(0, 120);
    FC = { q: due, i: 0, flip: false, ok: 0, bad: 0, again: {} };
  }
  const total = Object.keys(P.cards).filter(id => cardData(id)).length;
  if (FC.i >= FC.q.length) {
    const r = `<h1>Flashcards</h1><div class="card"><h3 style="margin-top:0">${FC.q.length ? 'Sessão concluída' : 'Nada vencido hoje'}</h3><p>${FC.q.length ? `Acertos: <strong>${FC.ok}</strong> · Erros: <strong>${FC.bad}</strong>. ` : ''}Você tem ${total} cards na revisão. Os cards entram quando você marca um tópico como estudado.</p><button class="pri" onclick="FC=null;route()">Recarregar fila</button></div>`;
    return r;
  }
  const id = FC.q[FC.i], c = cardData(id), tid = id.split('#')[0], box = P.cards[id]?.box || 0;
  return `<h1>Flashcards</h1><p class="muted">Card ${FC.i + 1}/${FC.q.length} · ${esc(TIDX[tid].t.titulo)} · caixa ${box}</p>
  <div class="card fc" onclick="FC.flip=!FC.flip;route()">${FC.flip ? `<div><div class="muted" style="font-size:13px;margin-bottom:6px">${esc(c.q)}</div><strong>${esc(c.a)}</strong></div>` : esc(c.q)}</div>
  <div class="row" style="margin-top:12px">${FC.flip ? `<button class="bad" onclick="A.grade('${id}',false)">Errei</button><button class="ok" onclick="A.grade('${id}',true)">Acertei</button>` : `<button class="pri" onclick="FC.flip=true;route()">Mostrar resposta</button>`}</div>
  <p class="muted" style="margin-top:12px">Intervalos: acertou sobe de caixa (1, 3, 7, 14 e 30 dias). Errou volta à caixa 0 e reaparece amanhã.</p>`;
};

// ----- simulado -----
let SM = null; let simTimer = null;
function simPick(mods, n) {
  const pool = mods.flatMap(m => m.questoes.map(q => q.id));
  const rank = id => { const r = P.answers[id]; return r ? (r.ok ? 2 : 0) : 1; };
  return shuffle(pool).sort((a, b) => rank(a) - rank(b)).slice(0, n);
}
V.simulado = () => {
  if (!SM && P.simRun) SM = P.simRun;
  if (SM && !SM.finished) return simRun();
  if (SM && SM.finished) return simResult();
  const hist = P.sims.slice().reverse();
  const areas = Object.keys(DISC);
  return `<h1>Simulados</h1><p class="muted">Réplica da prova: 60 questões de 5 alternativas (1 ponto cada), sem feedback até o fim e cronometrado. Mínimos do edital: 30% em cada bloco (6 de 20), pelo menos 1 ponto em cada área e 30% do total (18 de 60).</p>
  <div class="grid g2">
    <div class="card"><h3 style="margin-top:0">Simulado completo</h3><p>Bloco I (Português + História de PE), Bloco II (Raciocínio + Informática) e Bloco III (Constitucional + DH/Legislação): 10 questões de cada área. 5 horas (a prova real inclui a redação nesse tempo). Prioriza questões que você errou ou nunca viu.</p><button class="pri" onclick="A.startSim('full')">Iniciar (5h)</button></div>
    <div class="card"><h3 style="margin-top:0">Simulados menores</h3><div class="row"><button onclick="A.startSim('b1')">Bloco I (20 q)</button><button onclick="A.startSim('b2')">Bloco II (20 q)</button><button onclick="A.startSim('b3')">Bloco III (20 q)</button></div>
    <p class="muted" style="margin:10px 0 4px">Uma área só (10 questões, 50 min):</p><div class="row">${areas.map(a => `<button class="sm" onclick="A.startSim('${a}')">${DISC[a]}</button>`).join('')}</div></div>
  </div>
  <h2>Histórico</h2>${hist.length ? `<div class="card" style="padding:0;overflow:auto"><table style="margin:0"><thead><tr><th>Data</th><th>Tipo</th><th>Pontos</th>${areas.map(a => `<th>${DISC[a].slice(0, 6)}</th>`).join('')}<th>Mínimos</th></tr></thead><tbody>${hist.map(s => `<tr><td>${s.date.split('-').reverse().join('/')}</td><td>${s.mode}</td><td><strong>${s.total}</strong>/${s.max}</td>${areas.map(a => `<td>${s.d && s.d[a] !== undefined ? s.d[a] : '-'}</td>`).join('')}<td>${s.minOk === null ? '-' : s.minOk ? 'ok' : 'abaixo'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Sem simulados ainda.</p>'}`;
};
function simRun() {
  clearInterval(simTimer);
  const left = Math.max(0, SM.dur - (Date.now() - SM.start) / 1000);
  simTimer = setInterval(() => {
    const el = $('#simclock'); if (!el) return clearInterval(simTimer);
    const l = Math.max(0, SM.dur - (Date.now() - SM.start) / 1000); el.textContent = hh(l);
    if (l <= 0) { clearInterval(simTimer); A.finishSim(); }
  }, 1000);
  const q = QIDX[SM.ids[SM.i]].q;
  const ans = SM.ans[SM.i];
  return `<div class="sticky-timer row" style="justify-content:space-between"><h2 style="margin:0">Simulado ${SM.mode}</h2><div class="row"><span class="tag" style="font-size:15px">Restante: <b id="simclock">${hh(left)}</b></span><button class="bad sm" onclick="if(confirm('Finalizar o simulado agora?'))A.finishSim()">Finalizar</button></div></div>
  <div class="row" style="margin:8px 0">${SM.ids.map((id, i) => `<button class="sm ${i === SM.i ? 'pri' : ''}" style="min-width:34px;${SM.ans[i] ? 'border-color:var(--ok);' : ''}${SM.flag[i] ? 'outline:2px solid var(--warn);' : ''}" onclick="A.simGo(${i})">${i + 1}</button>`).join('')}</div>
  <div class="card"><div class="muted" style="margin-bottom:6px">Questão ${SM.i + 1}/${SM.ids.length} · ${DISC[QIDX[SM.ids[SM.i]].m.disciplina]}</div>${md(q.enunciado)}
  ${LETTERS.filter(k => q.alternativas[k] !== undefined).map(k => `<button class="opt ${ans === k ? 'sel' : ''}" onclick="A.simPick('${k}')"><strong>${k})</strong> ${esc(q.alternativas[k])}</button>`).join('')}
  <div class="row" style="margin-top:10px"><button onclick="A.simGo(${SM.i - 1})" ${SM.i === 0 ? 'disabled' : ''}>Anterior</button><button onclick="A.simGo(${SM.i + 1})" ${SM.i + 1 >= SM.ids.length ? 'disabled' : ''}>Próxima</button><button onclick="A.simFlag()">${SM.flag[SM.i] ? 'Desmarcar dúvida' : 'Marcar dúvida'}</button><button class="sm" onclick="A.simClear()">Limpar resposta</button></div></div>`;
}
function checkMins(byD, mode) {
  // devolve null se o simulado não tem todas as áreas; senão {ok, blocos}
  const pts = a => (byD[a] ? byD[a].pts : 0);
  const blocos = {};
  Object.entries(BLOCOS).forEach(([b, as]) => { if (as.every(a => byD[a])) blocos[b] = as.reduce((s, a) => s + pts(a), 0); });
  if (mode === 'Completo') {
    const total = Object.keys(byD).reduce((s, a) => s + pts(a), 0);
    const ok = Object.values(blocos).length === 3 && Object.values(blocos).every(v => v >= 6) && Object.keys(DISC).every(a => pts(a) >= 1) && total >= 18;
    return { ok, blocos, total };
  }
  if (/^Bloco/.test(mode)) { const v = Object.values(blocos)[0]; return { ok: v >= 6, blocos, total: v }; }
  return null;
}
function simResult() {
  const r = SM.result;
  const rows = Object.keys(DISC).filter(d => r.byD[d]).map(d => { const x = r.byD[d]; return `<tr><td>${DISC[d]}</td><td>${x.ok}/${x.n}</td><td>${x.pts}</td><td>${x.pts >= 1 ? '<span class="tag s2">ok</span>' : '<span class="tag p1">zerou</span>'}</td></tr>`; }).join('');
  const chk = checkMins(r.byD, SM.mode);
  const blocoRows = chk ? Object.entries(chk.blocos).map(([b, v]) => `<tr><td>Bloco ${b}</td><td colspan="2">${v}/20</td><td>${v >= 6 ? '<span class="tag s2">ok (mín. 6)</span>' : '<span class="tag p1">abaixo de 6</span>'}</td></tr>`).join('') : '';
  const wrong = SM.ids.map((id, i) => ({ id, i })).filter(x => SM.ans[x.i] !== QIDX[x.id].q.gabarito);
  return `<h1>Resultado do simulado</h1>
  <div class="grid g4"><div class="card kpi"><div class="n">${r.total}/${r.max}</div><div class="l">pontos</div></div><div class="card kpi"><div class="n">${pct(r.hits, SM.ids.length)}%</div><div class="l">${r.hits}/${SM.ids.length} acertos</div></div><div class="card kpi"><div class="n">${hh((SM.endTs - SM.start) / 1000)}</div><div class="l">tempo usado</div></div></div>
  ${SM.mode === 'Completo' ? (r.minOk ? '<div class="okbox" style="margin:12px 0">Você atingiu todos os mínimos (6 em cada bloco, 1 em cada área e 18 no total). Agora o que decide é a posição no ranking e a redação.</div>' : '<div class="badbox" style="margin:12px 0">Abaixo dos mínimos em pelo menos um critério. No dia real isso significa eliminação.</div>') : ''}
  <div class="card" style="padding:0;overflow:auto"><table style="margin:0"><thead><tr><th>Área</th><th>Acertos</th><th>Pontos</th><th>Mínimo</th></tr></thead><tbody>${rows}${blocoRows}</tbody></table></div>
  <h2>Questões erradas ou em branco (${wrong.length})</h2>
  ${wrong.map(({ id, i }) => { const { q, m } = QIDX[id]; return `<details class="card" style="margin:8px 0"><summary style="cursor:pointer">${i + 1}. <span class="tag">${esc(m.titulo)}</span> ${esc(q.enunciado.slice(0, 120))}… <span class="muted">(você: ${SM.ans[i] || 'em branco'} · gabarito: ${q.gabarito})</span></summary>${md(q.enunciado)}${LETTERS.filter(k => q.alternativas[k] !== undefined).map(k => `<div class="opt ${k === q.gabarito ? 'right' : k === SM.ans[i] ? 'wrong' : ''}" style="cursor:default"><strong>${k})</strong> ${esc(q.alternativas[k])}</div>`).join('')}<div class="expl">${md(q.explicacao || '')}</div>${resolHTML(q)}<div class="row" style="margin-top:8px"><a class="btn" href="#/topico/${q.topico}">Rever o resumo</a><button class="sm" onclick="A.doubt('${id}')">${P.doubts && P.doubts[id] ? 'Dúvida marcada ✓' : 'Marcar dúvida'}</button></div></details>`; }).join('')}
  <div class="row" style="margin-top:12px"><button class="pri" onclick="A.simClose()">Concluir e voltar</button></div>`;
}

// ----- redação -----
let DS = { theme: null, start: null, text: '', timer: null };
const TEMAS = [
  'O papel da sociedade na construção da segurança pública',
  'Os desafios do enfrentamento à violência contra a mulher no Brasil',
  'O uso de tecnologia no combate ao crime',
  'A relação entre polícia e comunidade',
  'Drogas e saúde pública: prevenção ou repressão?',
  'A juventude e a violência urbana',
  'A importância da educação para a redução da criminalidade',
  'Os impactos das redes sociais na disseminação de crimes e de notícias falsas',
  'O sistema prisional brasileiro e a ressocialização',
  'Direitos humanos e atuação policial: conciliar é possível?',
  'A violência no trânsito e a responsabilidade coletiva',
  'Os desafios da saúde mental dos profissionais de segurança pública',
  'Crimes cibernéticos e a necessidade de educação digital',
  'A desigualdade social como fator de risco para a violência',
  'O combate ao racismo e à discriminação no Brasil',
  'A proteção de crianças e adolescentes contra a violência',
  'Preservação do meio ambiente e crimes ambientais',
  'O uso da força e o policiamento comunitário',
  'A importância da participação cidadã na prevenção de crimes',
  'Os efeitos da violência doméstica sobre as famílias',
  'A valorização do policial e a confiança da população nas instituições',
  'Cultura de paz e resolução pacífica de conflitos',
  'Segurança em grandes eventos: Carnaval, festas populares e a responsabilidade de todos',
  'Os riscos do uso de armas de fogo e o desarmamento',
  'O idoso e a proteção contra a violência e o abandono',
  'A importância da denúncia e o combate à subnotificação de crimes',
  'Inteligência e prevenção: a polícia moderna',
  'O acesso à justiça e a cidadania',
  'A convivência entre a liberdade de expressão e o combate ao discurso de ódio',
  'O combate ao crime organizado e a cooperação entre instituições',
];
V.redacao = () => {
  const th = DS.theme;
  const words = DS.text.trim() ? DS.text.trim().split(/\s+/).length : 0;
  const estLines = Math.ceil(words / 10);
  const rm = MODS.find(m => m.id === 'redacao');
  return `<h1>Redação</h1><p class="muted">Dissertação-argumentativa de <strong>15 a 20 linhas</strong>, à caneta azul ou preta, valendo <strong>40 pontos</strong> (mínimo de 12 para não ser eliminado). 4 critérios de 10 pontos: tema e argumentação, coesão e coerência, estrutura textual, modalidade gramatical. Só é corrigida para os melhores classificados na objetiva.</p>
  <div class="badbox" style="margin:10px 0"><strong>Zero e eliminação:</strong> fugir do tema · não ser dissertação · texto desestruturado · lápis ou tinta de outra cor · folha errada, em branco ou letra ilegível · espaçamento excessivo entre letras, palavras, parágrafos e margens · qualquer identificação (nome, número, letra, sinal, desenho). Fora das 15–20 linhas há perda de pontos, e o que passa do limite é desconsiderado.</div>
  <div class="card">
    <div class="row"><button class="pri" onclick="A.newTheme()">Sortear tema</button>${th ? `<button onclick="A.startDiss()">${DS.start ? 'Reiniciar cronômetro' : 'Iniciar cronômetro (40 min)'}</button>` : ''}${DS.start ? `<span class="tag" style="font-size:15px">Tempo: <b id="dsclock">0:00</b></span>` : ''}</div>
    ${th ? `<h3>Proposta</h3><p><strong>Redija um texto dissertativo-argumentativo (15 a 20 linhas) sobre: ${esc(th)}.</strong> Apresente tese, dois argumentos desenvolvidos e uma conclusão. Não se identifique.</p>
    <textarea id="dstext" rows="14" placeholder="Escreva aqui para treinar a estrutura. No treino de verdade, escreva à mão em folha de 20 linhas." oninput="A.dissInput(this.value)">${esc(DS.text)}</textarea>
    <p id="dscount" class="muted">${words} palavras · ≈ ${estLines} linhas manuscritas (estimativa: 10 palavras por linha)</p>
    <h3>Autoavaliação (0 a 40)</h3>
    <div class="row">${['Tema e argumentação', 'Coesão e coerência', 'Estrutura textual', 'Modalidade gramatical'].map((n, i) => `<label>${n} (0–10) <input type="number" min="0" max="10" value="0" id="rb${i}" style="width:64px"></label>`).join('')}<button class="ok" onclick="A.saveDiss()">Salvar tentativa</button></div>` : '<p class="muted">Sorteie um tema para começar.</p>'}
  </div>
  <h2>Tentativas anteriores (${P.diss.length})</h2>
  ${P.diss.slice().reverse().map(d => `<details class="card" style="margin:8px 0"><summary style="cursor:pointer"><strong>${d.score}/40</strong> ${d.score >= 12 ? '' : '<span class="tag p1">abaixo de 12</span>'} · ${esc(d.theme)} <span class="muted">${d.date.split('-').reverse().join('/')} · ${d.words} palavras · ${d.min} min</span></summary><p style="white-space:pre-wrap">${esc(d.text)}</p></details>`).join('') || '<p class="muted">Nada salvo.</p>'}
  ${rm ? `<h2>Técnica e modelos</h2><div class="card">${rm.topicos.map(t => `<div><a href="#/topico/${t.id}">${esc(t.titulo)}</a></div>`).join('')}</div>` : ''}`;
};

// ----- treino físico (TAF) -----
const TAF_TESTS = [
  { id: 'barra', nome: 'Flexão na barra fixa', m: { txt: '≥ 5 repetições', cmp: 'min', v: 5, unit: 'reps' }, f: { txt: '≥ 25" (isometria)', cmp: 'min', v: 25, unit: 's' }, topic: 'taf-barra' },
  { id: 'salto', nome: 'Salto em distância', m: { txt: '≥ 3,60 m', cmp: 'min', v: 3.6, unit: 'm' }, f: { txt: '≥ 2,80 m', cmp: 'min', v: 2.8, unit: 'm' }, topic: 'taf-salto' },
  { id: 'natacao', nome: 'Natação 50 m', m: { txt: '≤ 1\'00"', cmp: 'max', v: 60, unit: 'tempo' }, f: { txt: '≤ 1\'10"', cmp: 'max', v: 70, unit: 'tempo' }, topic: 'taf-natacao' },
  { id: 'abd', nome: 'Abdominal remador (1 min)', m: { txt: '≥ 40 repetições', cmp: 'min', v: 40, unit: 'reps' }, f: { txt: '≥ 36 repetições', cmp: 'min', v: 36, unit: 'reps' }, topic: 'taf-abdominal' },
  { id: 'corrida', nome: 'Corrida 2.400 m', m: { txt: '≤ 11\'30"', cmp: 'max', v: 690, unit: 'tempo' }, f: { txt: '≤ 13\'30"', cmp: 'max', v: 810, unit: 'tempo' }, topic: 'taf-corrida' },
];
function parseVal(s, unit) {
  s = String(s).trim().replace(',', '.');
  if (unit === 'tempo') { const m = s.match(/^(\d+)[:'](\d{1,2})/); if (m) return +m[1] * 60 + +m[2]; const n = parseFloat(s); return isNaN(n) ? null : n; }
  const n = parseFloat(s); return isNaN(n) ? null : n;
}
function showVal(v, unit) { if (unit === 'tempo') return Math.floor(v / 60) + ':' + String(Math.round(v % 60)).padStart(2, '0'); return String(v).replace('.', ','); }
V.fisico = () => {
  P.taf = P.taf || { sex: '', log: [], start: P.start };
  const sex = P.taf.sex, wk = tafWeek(today()), wid = 'taf-semana-' + String(wk).padStart(2, '0');
  const weeksLeft = Math.max(0, Math.ceil(diffDays(today(), TAF_START) / 7));
  const best = t => { const es = P.taf.log.filter(l => l.test === t.id); if (!es.length || !sex) return null; const c = t[sex]; return es.reduce((b, e) => (c.cmp === 'min' ? e.v > b.v : e.v < b.v) ? e : b, es[0]); };
  const ok = (t, e) => e && (t[sex].cmp === 'min' ? e.v >= t[sex].v : e.v <= t[sex].v);
  return `<h1>Treino físico (TAF)</h1><p class="muted">O TAF vem depois da prova escrita: entre <strong>23/07 e 01/08/2027</strong> (faltam cerca de ${weeksLeft} semanas), em 2 dias consecutivos. Todos os 5 testes são eliminatórios e obrigatórios. É preciso levar atestado de cardiologista com RQE, emitido nos 30 dias anteriores. Este plano é orientação geral e não substitui médico ou educador físico: <strong>procure avaliação médica antes de começar</strong>.</p>
  <div class="card"><div class="row"><strong>Tabela de índices:</strong>
    <button class="${sex === 'm' ? 'pri' : ''}" onclick="A.tafSex('m')">Masculino</button><button class="${sex === 'f' ? 'pri' : ''}" onclick="A.tafSex('f')">Feminino</button><span class="muted">Escolha a tabela que vale para você.</span></div>
    ${sex ? `<table style="margin-top:10px"><thead><tr><th>Teste</th><th>Índice mínimo</th><th>Seu melhor</th><th>Situação</th><th></th></tr></thead><tbody>${TAF_TESTS.map(t => { const b = best(t); return `<tr><td><a href="#/topico/${t.topic}">${t.nome}</a></td><td>${t[sex].txt}</td><td>${b ? showVal(b.v, t[sex].unit) : '-'}</td><td>${b ? (ok(t, b) ? '<span class="tag s2">atingiu</span>' : '<span class="tag p1">abaixo</span>') : '<span class="muted">sem registro</span>'}</td><td>${bar(b ? (t[sex].cmp === 'min' ? b.v : t[sex].v / b.v * t[sex].v) : 0, t[sex].v, ok(t, b) ? 'ok' : '')}</td></tr>`; }).join('')}</tbody></table>` : '<p class="muted">Escolha a tabela acima para ver os índices e registrar seus testes.</p>'}
  </div>
  <div class="card" style="margin-top:12px"><h3 style="margin-top:0">Semana ${wk} do plano</h3><p>Seu plano de 42 semanas começou em ${P.taf.start.split('-').reverse().join('/')}. ${TIDX[wid] ? `<a href="#/topico/${wid}">Abrir o treino desta semana</a>` : 'O plano semanal ainda não foi carregado.'}</p></div>
  ${sex ? `<div class="card" style="margin-top:12px"><h3 style="margin-top:0">Registrar teste</h3>
    <div class="row"><select id="tfT">${TAF_TESTS.map(t => `<option value="${t.id}">${t.nome} (${t[sex].unit === 'tempo' ? 'mm:ss' : t[sex].unit})</option>`).join('')}</select><input type="text" id="tfV" placeholder="valor (ex.: 7, 3,45 ou 1:05)" style="width:190px"><button class="ok" onclick="A.tafLog()">Salvar</button></div></div>
  <h2>Histórico</h2>${P.taf.log.length ? `<div class="card" style="padding:0;overflow:auto"><table style="margin:0"><thead><tr><th>Data</th><th>Teste</th><th>Resultado</th><th>Índice</th><th></th></tr></thead><tbody>${P.taf.log.slice().reverse().map((l, i) => { const t = TAF_TESTS.find(x => x.id === l.test); return `<tr><td>${l.date.split('-').reverse().join('/')}</td><td>${t.nome}</td><td>${showVal(l.v, t[sex].unit)}</td><td>${ok(t, l) ? '<span class="tag s2">atingiu</span>' : '<span class="tag p1">abaixo</span>'}</td><td><button class="sm" onclick="A.tafDel(${P.taf.log.length - 1 - i})">apagar</button></td></tr>`; }).join('')}</tbody></table></div>` : '<p class="muted">Nada registrado. Faça um teste inicial na semana 1 e registre aqui.</p>'}` : ''}`;
};

// ----- documentos -----
V.doc = async name => {
  const r = await fetch('docs/' + name + '.md'); const txt = await r.text();
  return md(txt);
};

// ---------- ações ----------
const A = {
  setStatus(id, s) { setStatus(id, s); updateNav(); },
  toggleTask(key, on, topic, last) {
    P.tasks[key] = on; if (!on) delete P.tasks[key];
    if (on && topic && last && topicStatus(topic) < 1) setStatus(topic, 1);
    save(); route();
  },
  replan() { ensurePlan(true); route(); },
  addCards(id) { addCards(id); save(); alert('Cards adicionados à revisão de hoje.'); },
  quizPick(k) {
    const q = QIDX[QZ.ids[QZ.i]].q; if (QZ.sel !== null) return;
    QZ.sel = k; QZ.done++; const ok = k === q.gabarito; if (ok) QZ.right++; recordAnswer(q.id, ok); route();
  },
  quizNext(skip) {
    if (QZ.sel === null && !skip) return;
    if (QZ.i + 1 >= QZ.ids.length) { QZ.finished = true; } else { QZ.i++; QZ.sel = null; }
    route();
  },
  quizRestart() { const c = QZ.ctx, b = QZ.base; QZ = null; QZ = { ctx: c, ids: shuffle(b), i: 0, sel: null, right: 0, done: 0, finished: false, base: b }; route(); },
  startPractice() {
    let list = MODS.filter(m => (!QF.disc || m.disciplina === QF.disc) && (!QF.mod || m.id === QF.mod)).flatMap(m => m.questoes);
    if (QF.topic) list = list.filter(q => q.topico === QF.topic);
    if (QF.dif) list = list.filter(q => String(q.dificuldade) === QF.dif);
    if (QF.mode === 'novas') list = list.filter(q => !P.answers[q.id]);
    if (QF.mode === 'erradas') list = list.filter(q => P.answers[q.id] && P.answers[q.id].ok === false);
    const ids = shuffle(list.map(q => q.id)).slice(0, +QF.n);
    QZ = null; QZ = { ctx: 'pratica:' + Date.now(), ids, i: 0, sel: null, right: 0, done: 0, finished: false, base: ids };
    if (!ids.length) alert('Nenhuma questão com esses filtros.');
    route();
  },
  practiceErrors() { QF.mode = 'erradas'; const ids = shuffle(errorList()); QZ = { ctx: 'pratica:erros', ids, i: 0, sel: null, right: 0, done: 0, finished: false, base: ids }; location.hash = '#/questoes'; },
  clearError(id) { P.answers[id].cleared = true; save(); route(); },
  doubt(id) { P.doubts = P.doubts || {}; if (P.doubts[id]) delete P.doubts[id]; else P.doubts[id] = today(); save(); route(); },
  grade(id, ok) {
    const c = P.cards[id] || { box: 0 };
    if (ok) { c.box = Math.min(5, (c.box || 0) + 1); c.due = addDays(today(), INTERVALS[c.box]); FC.ok++; }
    else { c.box = 0; c.due = addDays(today(), 1); FC.bad++; if (!FC.again[id]) { FC.again[id] = 1; FC.q.push(id); } }
    P.cards[id] = c; FC.i++; FC.flip = false; save(); route();
  },
  startSim(mode) {
    const mods = ids => MODS.filter(m => ids.includes(m.disciplina));
    const pick = a => simPick(mods([a]), 10);
    let ids = [], dur = 18000, label = 'Completo';
    if (mode === 'full') ids = Object.keys(DISC).flatMap(pick);
    else if (/^b[123]$/.test(mode)) { const b = { b1: 'I', b2: 'II', b3: 'III' }[mode]; ids = BLOCOS[b].flatMap(pick); dur = 6000; label = 'Bloco ' + b; }
    else { ids = pick(mode); dur = 3000; label = DISC[mode]; }
    if (!ids.length) return alert('Sem questões suficientes para este simulado.');
    SM = { mode: label, ids, ans: {}, flag: {}, i: 0, start: Date.now(), dur, finished: false };
    P.simRun = SM; save(); route();
  },
  simPick(k) { SM.ans[SM.i] = k; P.simRun = SM; save(); route(); },
  simClear() { delete SM.ans[SM.i]; save(); route(); },
  simFlag() { SM.flag[SM.i] = !SM.flag[SM.i]; save(); route(); },
  simGo(i) { if (i >= 0 && i < SM.ids.length) { SM.i = i; route(); } },
  finishSim() {
    clearInterval(simTimer);
    const byD = {}; let hits = 0;
    SM.ids.forEach((id, i) => {
      const { q, m } = QIDX[id]; const d = m.disciplina; const x = byD[d] = byD[d] || { n: 0, ok: 0, pts: 0 };
      x.n++; const ok = SM.ans[i] === q.gabarito; if (ok) { x.ok++; x.pts += WEIGHT[d]; hits++; }
      if (SM.ans[i]) recordAnswer(id, ok);
    });
    const total = Object.values(byD).reduce((s, x) => s + x.pts, 0);
    const max = Object.keys(byD).reduce((s, d) => s + byD[d].n * WEIGHT[d], 0);
    const chk = checkMins(byD, SM.mode), minOk = chk ? chk.ok : null;
    SM.result = { byD, total, max, hits, minOk }; SM.finished = true; SM.endTs = Date.now();
    P.sims.push({ date: today(), mode: SM.mode, total, max, minOk, d: Object.fromEntries(Object.keys(byD).map(d => [d, byD[d].pts])) });
    logStudy(Math.round((SM.endTs - SM.start) / 60000));
    delete P.simRun; save(); route();
  },
  simClose() { SM = null; route(); },
  newTheme() { DS.theme = TEMAS[Math.floor(Math.random() * TEMAS.length)]; DS.text = ''; DS.start = null; clearInterval(DS.timer); route(); },
  startDiss() {
    DS.start = Date.now(); clearInterval(DS.timer); route();
    DS.timer = setInterval(() => { const el = $('#dsclock'); if (!el) return clearInterval(DS.timer); el.textContent = hh((Date.now() - DS.start) / 1000); }, 1000);
  },
  dissInput(v) {
    DS.text = v; const w = v.trim() ? v.trim().split(/\s+/).length : 0, l = Math.ceil(w / 10);
    $('#dscount').textContent = `${w} palavras · ≈ ${l} linhas manuscritas (estimativa: 10 palavras por linha)` + (w && (l < 15 || l > 20) ? ' · fora da faixa de 15–20 linhas' : '');
  },
  saveDiss() {
    const sc = [0, 1, 2, 3].reduce((s, i) => s + (+$('#rb' + i).value || 0), 0);
    const words = DS.text.trim() ? DS.text.trim().split(/\s+/).length : 0;
    P.diss.push({ date: today(), theme: DS.theme, text: DS.text, score: sc, words, min: DS.start ? Math.round((Date.now() - DS.start) / 60000) : 0 });
    logStudy(DS.start ? Math.round((Date.now() - DS.start) / 60000) : 0);
    save(); clearInterval(DS.timer); DS = { theme: null, start: null, text: '', timer: null }; route();
  },
  tafSex(s) { P.taf = P.taf || { sex: '', log: [], start: P.start }; P.taf.sex = s; save(); route(); },
  tafLog() {
    const t = TAF_TESTS.find(x => x.id === $('#tfT').value), sex = P.taf.sex;
    const v = parseVal($('#tfV').value, t[sex].unit);
    if (v === null) return alert('Digite um número (ex.: 7, 3,45) ou um tempo (ex.: 1:05).');
    P.taf.log.push({ date: today(), test: t.id, v }); save(); route();
  },
  tafDel(i) { P.taf.log.splice(i, 1); save(); route(); },
};
// handlers inline enxergam as variáveis `let` globais (TS, ES, QF, FC) e a função route() diretamente
window.A = A;

// ---------- navegação ----------
const NAV = [['home', 'Painel'], ['plano', 'Plano de estudos'], ['escopo', 'Escopo completo'], ['flashcards', 'Flashcards'], ['questoes', 'Questões'], ['simulado', 'Simulados'], ['erros', 'Caderno de erros'], ['redacao', 'Redação'], ['fisico', 'Treino físico (TAF)'], ['doc/edital', 'Edital resumido'], ['doc/estrategia', 'Classificação e desempate'], ['doc/exames-medicos', 'Exames médicos'], ['doc/avaliacao-psicologica', 'Avaliação psicológica'], ['doc/investigacao-social', 'Investigação social'], ['doc/curso-formacao', 'Curso de formação'], ['doc/metodo', 'Método de estudo']];
function updateNav() {
  const cur = location.hash.replace(/^#\//, '').split('?')[0] || 'home';
  $('#nav').innerHTML = NAV.map(([k, l]) => {
    const bdg = k === 'flashcards' ? dueCards().length : k === 'erros' ? errorList().length : 0;
    const on = cur === k || (k === 'escopo' && cur.startsWith('topico')) || (k === 'home' && cur === 'home');
    return `<a class="${on ? 'on' : ''}" href="#/${k === 'home' ? '' : k}">${l}${bdg ? `<span class="bdg">${bdg}</span>` : ''}</a>`;
  }).join('');
}
async function route() {
  clearInterval(simTimer);
  const raw = location.hash.replace(/^#\/?/, ''); const [path, qs] = raw.split('?'); const query = Object.fromEntries(new URLSearchParams(qs || ''));
  const parts = path.split('/'); const main = $('#main');
  let html = '';
  try {
    if (!MODS.length && parts[0] !== 'doc' && parts[0] !== 'fisico') html = '<h1>Aguardando conteúdo</h1><p class="muted">Nenhum módulo encontrado em <code>data/modules</code>.</p>';
    else if (parts[0] === 'plano') html = V.plano();
    else if (parts[0] === 'escopo') html = V.escopo();
    else if (parts[0] === 'topico') html = V.topico(parts[1]);
    else if (parts[0] === 'flashcards') html = V.flashcards();
    else if (parts[0] === 'questoes') html = V.questoes(query);
    else if (parts[0] === 'simulado') html = V.simulado();
    else if (parts[0] === 'erros') html = V.erros();
    else if (parts[0] === 'redacao') html = V.redacao();
    else if (parts[0] === 'fisico') html = V.fisico();
    else if (parts[0] === 'doc') html = await V.doc(parts[1]);
    else html = V.home();
  } catch (e) { html = `<h1>Erro</h1><pre>${esc(e.stack)}</pre>`; console.error(e); }
  const y = window.scrollY; main.innerHTML = html; updateNav();
  clearInterval(DS.timer);
  if (parts[0] === 'redacao' && DS.start) DS.timer = setInterval(() => { const el = $('#dsclock'); if (!el) return clearInterval(DS.timer); el.textContent = hh((Date.now() - DS.start) / 1000); }, 1000);
  if (['plano', 'escopo', 'flashcards', 'questoes', 'erros'].includes(parts[0])) window.scrollTo(0, y); else window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);

// ---------- pomodoro ----------
const PO = { sec: 25 * 60, run: false, mode: 'foco', iv: null, acc: 0 };
function poRender() {
  $('#pomo').innerHTML = `<div class="muted">Pomodoro · ${PO.mode}</div><div class="t">${hh(PO.sec)}</div><div class="row" style="margin-top:6px"><button class="sm" onclick="poToggle()">${PO.run ? 'Pausar' : 'Iniciar'}</button><button class="sm" onclick="poReset()">Zerar</button></div><div class="muted" style="margin-top:6px">Hoje: ${(Math.round(P.study[today()] || 0))} min</div>`;
}
window.poToggle = () => {
  PO.run = !PO.run; clearInterval(PO.iv);
  if (PO.run) PO.iv = setInterval(() => {
    PO.sec--; if (PO.mode === 'foco') { PO.acc++; if (PO.acc >= 60) { PO.acc = 0; logStudy(1); } }
    if (PO.sec <= 0) { PO.mode = PO.mode === 'foco' ? 'pausa' : 'foco'; PO.sec = PO.mode === 'foco' ? 25 * 60 : 5 * 60; try { new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YQAAAAA=').play(); } catch (e) { } alert(PO.mode === 'pausa' ? 'Foco concluído! Pausa de 5 min.' : 'Pausa acabou. Voltar ao foco.'); }
    poRender();
  }, 1000);
  poRender();
};
window.poReset = () => { PO.run = false; clearInterval(PO.iv); PO.mode = 'foco'; PO.sec = 25 * 60; poRender(); };

// ---------- inicialização ----------
(async function init() {
  try { MODS = await (await fetch('data/modules.json')).json(); } catch (e) { MODS = []; }
  try { P = await (await fetch('api/progress')).json(); } catch (e) { P = {}; }
  if (!P || !Object.keys(P).length) { try { P = JSON.parse(localStorage.getItem('estudo-caruaru') || '{}'); } catch (e) { P = {}; } }
  defaults();
  MODS.sort((a, b) => modOrder(a) - modOrder(b));
  MODS.forEach(m => { m.topicos = m.topicos || []; m.questoes = m.questoes || []; m.topicos.forEach(t => TIDX[t.id] = { t, m }); m.questoes.forEach(q => QIDX[q.id] = { q, m }); });
  save(); poRender(); route();
})();
