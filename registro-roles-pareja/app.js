/* ==========================================================
   Control de roles · Pair Programming (Historia A)
   Lógica de la aplicación: sesiones, roles, tiempos,
   rotaciones, historial y almacenamiento local.
   Los datos se guardan en el navegador; no hay servidor.
   ========================================================== */

/* ---------- Constantes y estado ---------- */
const KEY = 'registroRolesPareja.v2';
const HIST_KEY = 'registroRolesPareja.historial.v2';
const ROLE_NAME = { driver: 'Piloto (Driver)', navigator: 'Navegante (Navigator)' };
const ROLE_DESC = {
  driver: 'Escribe el código y controla el teclado.',
  navigator: 'Revisa, guía y piensa en el siguiente paso.'
};
const REASONS = {
  time: 'Tiempo cumplido',
  decision: 'Decisión de la pareja',
  technical: 'Dificultad técnica',
  other: 'Otro'
};

let state = load();
let history = loadHist();
let ticker = null;
let toastTimer = null;

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- Utilidades: fechas, códigos y formato ---------- */
function toISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
const todayISO = () => toISO(new Date());

function makeSessionId() {
  const ymd = toISO(new Date()).replace(/-/g, '');
  return `PP-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function fmt(ms) {
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
}
const fmtTime = t => new Date(t).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const fmtDateTime = t => new Date(t).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
const fmtFecha = iso => new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
const fmtDuracionMin = min => {
  const h = Math.floor(min / 60), m = min % 60;
  return h && m ? `${h} h ${m} min` : h ? `${h} h` : `${m} min`;
};

/* ---------- Avisos ---------- */
function toast(msg, type = '') {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- Almacenamiento local ---------- */
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY)) || null;
    if (s && !s.codigo) s.codigo = makeSessionId();
    return s;
  } catch (e) { return null; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
}
function loadHist() {
  try {
    const h = JSON.parse(localStorage.getItem(HIST_KEY)) || [];
    let changed = false;
    h.forEach(x => { if (!x.codigo) { x.codigo = makeSessionId(); changed = true; } });
    if (changed) localStorage.setItem(HIST_KEY, JSON.stringify(h));
    return h;
  } catch (e) { return []; }
}
function saveHist() {
  try { localStorage.setItem(HIST_KEY, JSON.stringify(history)); } catch (e) {}
}

/* ---------- Contabilidad del tiempo ----------
   El tiempo del segmento actual se suma a los acumulados en flush().
   flush() se llama antes de pausar, rotar o finalizar, así que las pausas
   no se contabilizan y ningún segmento se cuenta dos veces. */

/* ---------- Contabilidad del tiempo ----------
   El tiempo del segmento actual se suma a los acumulados en flush().
   flush() se llama antes de pausar, rotar o finalizar, así que las pausas
   no se contabilizan y ningún segmento se cuenta dos veces. */
function live() {
  return state.running ? Date.now() - state.segStart : 0;
}

function flush() {
  if (!state.running) return;
  const t = Date.now();
  const d = t - state.segStart;
  state.members.forEach(m => {
    if (m.role === 'driver') m.driverMs += d;
    else m.navigatorMs += d;
  });
  state.totalMs += d;
  state.sinceRotMs += d;
  state.segStart = t;
}

function addLog(text, extra = {}) {
  state.log.unshift({ t: Date.now(), text, ...extra });
}

function findRole(role) {
  return state.members.find(m => m.role === role).name;
}

/* ---------- Ciclo de vida de la sesión ---------- */
function startSession(data) {
  const now = Date.now();
  state = {
    codigo: makeSessionId(),
    name: data.name,
    exercise: data.exercise,
    fecha: data.fecha,
    rotateEvery: data.rotateEvery * 60000,
    members: [0, 1].map(i => ({
      name: data.names[i],
      role: i === data.startDriver ? 'driver' : 'navigator',
      driverMs: 0,
      navigatorMs: 0
    })),
    running: true,
    segStart: now,
    totalMs: 0,
    sinceRotMs: 0,
    rotations: 0,
    ended: false,
    startedAt: now,
    endedAt: null,
    log: []
  };
  addLog(`Sesión iniciada. Piloto inicial: ${findRole('driver')}`);
  save();
  toast(`Sesión iniciada. Código: ${state.codigo}`);
  showView();
}

/* ---------- Rotación con motivo y observaciones ---------- */

/* ---------- Rotación de roles con motivo y observaciones ---------- */
function openRotPanel() {
  if (!state || state.ended) return;
  $('rotPanel').classList.remove('hidden');
  $('rotNotes').focus();
}

function closeRotPanel() {
  $('rotPanel').classList.add('hidden');
  $('rotNotes').value = '';
  $('rotReason').value = 'time';
}

function confirmRotation() {
  if (!state || state.ended) return;
  const reason = $('rotReason').value;
  const notes = $('rotNotes').value.trim();
  const finishedDriver = findRole('driver');

  flush();
  state.members.forEach(m => m.role = m.role === 'driver' ? 'navigator' : 'driver');
  state.rotations++;
  state.sinceRotMs = 0;

  addLog(
    `Fin del turno de ${finishedDriver} como piloto. Rotación #${state.rotations}: ahora ${findRole('driver')} es piloto y ${findRole('navigator')} navegante`,
    { reason, notes }
  );
  closeRotPanel();
  save();
  toast(`Rotación #${state.rotations} registrada.`);
  render();
}

function togglePause() {
  if (!state || state.ended) return;
  if (state.running) {
    flush();
    state.running = false;
    addLog('Sesión en pausa');
  } else {
    state.running = true;
    state.segStart = Date.now();
    addLog('Sesión reanudada');
  }
  save();
  render();
}

function endSession() {
  if (!state || state.ended) return;
  if (!confirm('¿Finalizar la sesión? Ya no se podrá registrar tiempo y se guardará en el historial.')) return;
  flush();
  state.running = false;
  state.ended = true;
  state.endedAt = Date.now();
  addLog('Sesión finalizada');
  closeRotPanel();

  history.unshift({
    id: String(Date.now()),
    codigo: state.codigo,
    name: state.name,
    exercise: state.exercise,
    fecha: state.fecha,
    integrantes: state.members.map(m => m.name),
    startedAt: state.startedAt,
    endedAt: state.endedAt,
    totalMs: state.totalMs,
    rotations: state.rotations,
    summary: buildSummary()
  });
  saveHist();
  save();
  toast('Sesión finalizada y guardada en el historial.');
  showView();
}

function resetAll() {
  if (!confirm('¿Cerrar esta vista y configurar una nueva sesión? La sesión finalizada permanece en el historial.')) return;
  state = null;
  try { localStorage.removeItem(KEY); } catch (e) {}
  showView();
}

/* ---------- Resumen y exportación ---------- */

/* ---------- Resumen y exportación ---------- */
function buildSummary() {
  const lines = [
    `RESUMEN · ${state.name}`,
    `Código de sesión: ${state.codigo}`,
    `Fecha: ${fmtFecha(state.fecha || toISO(new Date(state.startedAt)))}`,
    `Ejercicio: ${state.exercise || '—'}`,
    `Inicio: ${fmtDateTime(state.startedAt)}`,
    `Tiempo activo: ${fmt(state.totalMs)}`,
    `Rotaciones: ${state.rotations}`,
    ''
  ];
  state.members.forEach(m => {
    const tot = m.driverMs + m.navigatorMs;
    const dPct = tot ? Math.round(m.driverMs / tot * 100) : 0;
    const nPct = tot ? 100 - dPct : 0;
    lines.push(`• ${m.name}: piloto ${fmt(m.driverMs)} (${dPct}%) | navegante ${fmt(m.navigatorMs)} (${nPct}%)`);
  });
  lines.push('', 'Bitácora:');
  [...state.log].reverse().forEach(l => {
    let line = `${fmtTime(l.t)}  ${l.text}`;
    if (l.reason) line += `\n      Motivo: ${REASONS[l.reason]}`;
    if (l.notes) line += `\n      Observaciones: ${l.notes}`;
    lines.push(line);
  });
  return lines.join('\n');
}

async function copySummary() {
  const txt = $('summaryText');
  try {
    await navigator.clipboard.writeText(txt.value);
  } catch (e) {
    txt.select();
    document.execCommand('copy');
  }
  $('copyMsg').textContent = 'Copiado';
  setTimeout(() => $('copyMsg').textContent = '', 2000);
}

function downloadText(name, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${name.replace(/\s+/g, '_')}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ---------- Render ---------- */

/* ---------- Pantalla ---------- */
function render() {
  if (!state) return;
  const lv = live();

  $('sessName').textContent = state.name;
  $('exName').textContent = `Ejercicio: ${state.exercise || 'sin especificar'}`;
  $('sessMeta').textContent = `Fecha: ${fmtFecha(state.fecha || toISO(new Date(state.startedAt)))} · Código: ${state.codigo}`;
  $('clock').textContent = fmt(state.totalMs + lv);

  const st = $('status');
  if (state.ended) { st.textContent = 'Finalizada'; st.className = 'status end'; }
  else if (state.running) { st.textContent = 'En curso'; st.className = 'status run'; }
  else { st.textContent = 'En pausa'; st.className = 'status pause'; }

  $('rotateBtn').disabled = state.ended;
  $('pauseBtn').disabled = state.ended;
  $('endBtn').disabled = state.ended;
  $('pauseBtn').textContent = state.running ? 'Pausar' : 'Reanudar';

  const sinceRot = state.sinceRotMs + lv;
  const needRotate = state.running && !state.ended && sinceRot >= state.rotateEvery;
  const alertEl = $('alert');
  alertEl.classList.toggle('hidden', !needRotate);
  if (needRotate) {
    alertEl.textContent = `Tiempo de rotar: llevan ${Math.floor(sinceRot / 60000)} min con los mismos roles.`;
  }

  $('roleCards').innerHTML = state.members.map(m => {
    const d = m.driverMs + (m.role === 'driver' ? lv : 0);
    const n = m.navigatorMs + (m.role === 'navigator' ? lv : 0);
    return `
      <div class="role-card ${m.role}">
        <span class="badge ${m.role}">${ROLE_NAME[m.role]}</span>
        <h3>${esc(m.name)}</h3>
        <p class="desc">${ROLE_DESC[m.role]}</p>
        <div class="stats">
          <div>Como piloto<b>${fmt(d)}</b></div>
          <div>Como navegante<b>${fmt(n)}</b></div>
        </div>
      </div>`;
  }).join('');

  $('balance').innerHTML = state.members.map(m => {
    const d = m.driverMs + (m.role === 'driver' ? lv : 0);
    const n = m.navigatorMs + (m.role === 'navigator' ? lv : 0);
    const tot = d + n;
    const dPct = tot ? Math.round(d / tot * 100) : 0;
    const nPct = tot ? 100 - dPct : 0;
    const label = tot ? `piloto ${dPct}% · navegante ${nPct}%` : 'sin tiempo registrado';
    return `
      <div class="bar-row">
        <div class="bar-label"><span>${esc(m.name)}</span><span>${label}</span></div>
        <div class="bar">
          <span class="driver" style="width:${dPct}%"></span>
          <span class="navigator" style="width:${nPct}%"></span>
        </div>
      </div>`;
  }).join('');

  $('log').innerHTML = state.log.map(l => {
    const reason = l.reason ? `<div class="meta">Motivo: ${esc(REASONS[l.reason])}</div>` : '';
    const notes = l.notes ? `<div class="meta">Observaciones: ${esc(l.notes)}</div>` : '';
    return `<li><time>${fmtTime(l.t)}</time><div><span>${esc(l.text)}</span>${reason}${notes}</div></li>`;
  }).join('') || '<li class="empty">Sin eventos</li>';
}

/* ---------- Historial ---------- */
function renderHistory() {
  const list = $('histList');
  if (!history.length) {
    list.innerHTML = '<li class="empty">Aún no hay sesiones finalizadas.</li>';
    return;
  }
  list.innerHTML = history.map(h => {
    const fecha = h.fecha || toISO(new Date(h.startedAt));
    return `
    <li class="hist-item">
      <div>
        <strong>${esc(h.name)}</strong>${h.exercise ? ` · ${esc(h.exercise)}` : ''}
        <small>${fmtFecha(fecha)} · Código ${esc(h.codigo || '—')} · activo ${fmt(h.totalMs)} · ${h.rotations} rotación(es)</small>
      </div>
      <div class="hist-actions">
        <button class="small" data-act="view" data-id="${h.id}">Ver</button>
        <button class="small danger" data-act="del" data-id="${h.id}">Eliminar</button>
      </div>
    </li>`;
  }).join('');
}

/* ---------- Navegación entre vistas ---------- */
function showView() {
  const hasSession = !!state;
  $('setup').classList.toggle('hidden', hasSession);
  $('historyCard').classList.toggle('hidden', hasSession && !state.ended);
  $('session').classList.toggle('hidden', !hasSession);
  const showSummary = hasSession && state.ended;
  $('summary').classList.toggle('hidden', !showSummary);
  if (showSummary) $('summaryText').value = buildSummary();

  clearInterval(ticker);
  if (hasSession) {
    render();
    ticker = setInterval(render, 1000);
  } else {
    $('sessionDate').value = todayISO();
    const last = history[0];
    if (last && last.integrantes && !$('member1').value && !$('member2').value) {
      $('member1').value = last.integrantes[0];
      $('member2').value = last.integrantes[1];
      syncStartOptions();
    }
  }
  renderHistory();
}

function syncStartOptions() {
  const sel = $('startDriver');
  sel.options[0].textContent = $('member1').value.trim() || 'Integrante 1';
  sel.options[1].textContent = $('member2').value.trim() || 'Integrante 2';
}

/* ---------- Eventos ---------- */

$('member1').addEventListener('input', syncStartOptions);
$('member2').addEventListener('input', syncStartOptions);

$('setupForm').addEventListener('submit', e => {
  e.preventDefault();
  const err = $('setupError');
  const name = $('sessionName').value.trim();
  const fecha = $('sessionDate').value;
  const exercise = $('exerciseName').value.trim();
  const a = $('member1').value.trim();
  const b = $('member2').value.trim();
  const rot = parseInt($('rotateEvery').value, 10);

  if (!name) return err.textContent = 'Escribe un nombre para la sesión.';
  if (!fecha) return err.textContent = 'Selecciona la fecha de la sesión.';
  if (!a || !b) return err.textContent = 'Escribe el nombre de ambos integrantes.';
  if (a.toLowerCase() === b.toLowerCase()) return err.textContent = 'Los integrantes deben tener nombres distintos.';
  if (!(rot >= 1 && rot <= 120)) return err.textContent = 'La rotación debe estar entre 1 y 120 minutos.';

  err.textContent = '';
  startSession({
    name, exercise, fecha,
    names: [a, b],
    startDriver: $('startDriver').value === '1' ? 1 : 0,
    rotateEvery: rot
  });
});

$('rotateBtn').addEventListener('click', openRotPanel);
$('rotConfirm').addEventListener('click', confirmRotation);
$('rotCancel').addEventListener('click', closeRotPanel);
$('pauseBtn').addEventListener('click', togglePause);
$('endBtn').addEventListener('click', endSession);
$('copyBtn').addEventListener('click', copySummary);
$('dlBtn').addEventListener('click', () => downloadText(`resumen-${state.codigo}`, buildSummary()));
$('newBtn').addEventListener('click', resetAll);

$('histClose').addEventListener('click', () => $('histDetail').classList.add('hidden'));
$('histList').addEventListener('click', e => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const h = history.find(x => x.id === btn.dataset.id);
  if (!h) return;
  if (btn.dataset.act === 'view') {
    $('histText').value = h.summary;
    $('histDetail').classList.remove('hidden');
  } else if (btn.dataset.act === 'del') {
    if (!confirm(`¿Eliminar "${h.name}" del historial?`)) return;
    history = history.filter(x => x.id !== h.id);
    saveHist();
    $('histDetail').classList.add('hidden');
    renderHistory();
    toast('Sesión eliminada del historial.', 'warn');
  }
});

document.addEventListener('keydown', e => {
  if (!state || state.ended) return;
  if (e.target.matches('input, textarea, select')) return;
  if (!$('rotPanel').classList.contains('hidden')) return;
  if (e.key.toLowerCase() === 'r') openRotPanel();
  if (e.key === ' ') { e.preventDefault(); togglePause(); }
});

/* ---------- Inicio ---------- */
// Al recargar no se sabe cuánto tiempo pasó: la sesión queda en pausa
if (state && !state.ended && state.running) {
  state.running = false;
  addLog('Sesión en pausa: la página se recargó. Pulsa Reanudar para continuar.');
  save();
}

syncStartOptions();
showView();
