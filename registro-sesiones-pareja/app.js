/* ==========================================================
   Registro de sesiones de Pair Programming (HU 1)
   Almacenamiento independiente del sistema de control de roles.
   ========================================================== */

const STORAGE_KEY = 'registroSesionesPareja.v1';

const TIPO_LABEL = {
  observacion: 'Observación',
  decision: 'Decisión',
  mejora: 'Mejora identificada'
};

let sessions = loadSessions();
let currentId = null;
let editingEntryId = null;   // entrada que se está editando (o null)
let editingDuration = false; // true mientras se edita la duración de la sesión actual

/* ---------- Utilidades ---------- */

const $ = id => document.getElementById(id);

let toastTimer = null;
function toast(msg, type = '') {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Código de sesión con el mismo formato que usa el módulo de control de roles: PP-AAAAMMDD-XXXX
function makeSessionId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `PP-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtFecha(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

const fmtDateTime = t => new Date(t).toLocaleString('es-MX', {
  dateStyle: 'short', timeStyle: 'short'
});

function fmtDuracion(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h} h ${m} min`;
  if (h) return `${h} h`;
  return `${m} min`;
}

function fmtHMS(ms) {
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ---------- Almacenamiento local ---------- */

function loadSessions() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(data)) return [];
    let changed = false;
    data.forEach(s => { if (!s.codigo) { s.codigo = makeSessionId(); changed = true; } });
    if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch (e) {
    return [];
  }
}

function saveSessions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    alert('No se pudo guardar la información en el navegador.');
  }
}

function getSession(id) {
  return sessions.find(s => s.id === id) || null;
}

/* ---------- Navegación entre vistas ---------- */

function showView(name) {
  const map = { new: 'viewNew', history: 'viewHistory', detail: 'viewDetail' };
  Object.values(map).forEach(id => $(id).classList.add('hidden'));
  $(map[name]).classList.remove('hidden');

  if (name !== 'detail') {
    editingEntryId = null;
    editingDuration = false;
  }

  // La vista de detalle pertenece a la pestaña Historial
  const tabName = name === 'detail' ? 'history' : name;
  document.querySelectorAll('.tab').forEach(t =>
    t.classList.toggle('active', t.dataset.view === tabName));

  if (name === 'history') renderHistory();
  if (name === 'detail') renderDetail();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openSession(id) {
  currentId = id;
  editingEntryId = null;
  editingDuration = false;
  showView('detail');
}

/* ---------- Cronómetro de apoyo ----------
   Solo mide el tiempo. No guarda nada por sí mismo: la duración
   definitiva se introduce manualmente en el formulario. */

const sw = {
  status: 'idle',        // idle | running | paused | stopped
  startedAt: 0,
  accumulated: 0,
  timer: null
};

function swElapsed() {
  return sw.accumulated + (sw.status === 'running' ? Date.now() - sw.startedAt : 0);
}

function swStartTicking() {
  clearInterval(sw.timer);
  sw.timer = setInterval(swRender, 250);
}

function swStopTicking() {
  clearInterval(sw.timer);
  sw.timer = null;
}

function swRender() {
  const elapsed = swElapsed();
  $('swDisplay').textContent = fmtHMS(elapsed);

  $('swStart').textContent = sw.status === 'paused' ? '▶ Reanudar' : '▶ Iniciar cronómetro';
  $('swStart').disabled = !(sw.status === 'idle' || sw.status === 'paused');
  $('swPause').disabled = sw.status !== 'running';
  $('swStop').disabled = !(sw.status === 'running' || sw.status === 'paused');
  $('swReset').disabled = !(sw.status === 'paused' || sw.status === 'stopped');
  $('swUse').disabled = !(sw.status !== 'running' && sw.status !== 'idle' && elapsed > 0);
}

function swStart() {
  if (sw.status !== 'idle' && sw.status !== 'paused') return;
  sw.startedAt = Date.now();
  sw.status = 'running';
  swStartTicking();
  swRender();
}

function swPause() {
  if (sw.status !== 'running') return;
  sw.accumulated += Date.now() - sw.startedAt;
  sw.status = 'paused';
  swStopTicking();
  swRender();
}

function swStop() {
  if (sw.status !== 'running' && sw.status !== 'paused') return;
  if (sw.status === 'running') sw.accumulated += Date.now() - sw.startedAt;
  sw.status = 'stopped';
  swStopTicking();
  swRender();
}

function swReset() {
  sw.status = 'idle';
  sw.accumulated = 0;
  sw.startedAt = 0;
  swStopTicking();
  $('swUseMsg').textContent = '';
  swRender();
}

function swUseTime() {
  const minutes = Math.max(1, Math.round(swElapsed() / 60000));
  $('duracion').value = minutes;
  $('swUseMsg').textContent =
    `Duración establecida en ${minutes} min (cronómetro: ${fmtHMS(swElapsed())}). Revisa el dato y guarda la sesión.`;
}

/* ---------- Formulario de nueva sesión ---------- */

let formBaseline = '';

function formSnapshot() {
  return [$('fecha').value, $('duracion').value, $('ejercicio').value.trim(),
          $('integrante1').value.trim(), $('integrante2').value.trim()].join('|');
}

function prefillForm() {
  $('fecha').value = todayISO();
  const last = [...sessions].sort((a, b) => b.creadaEn - a.creadaEn)[0];
  if (last) {
    $('integrante1').value = last.integrantes[0];
    $('integrante2').value = last.integrantes[1];
  }
  formBaseline = formSnapshot();
}

function onSaveSession(e) {
  e.preventDefault();
  const err = $('formError');
  const fecha = $('fecha').value;
  const duracion = parseInt($('duracion').value, 10);
  const ejercicio = $('ejercicio').value.trim();
  const a = $('integrante1').value.trim();
  const b = $('integrante2').value.trim();

  if (!fecha) return err.textContent = 'Selecciona la fecha de la sesión.';
  if (!(duracion > 0)) return err.textContent = 'Introduce la duración en minutos (mayor que 0).';
  if (!ejercicio) return err.textContent = 'Escribe el nombre o descripción del ejercicio.';
  if (!a || !b) return err.textContent = 'Escribe el nombre de los dos integrantes.';
  if (a.toLowerCase() === b.toLowerCase()) return err.textContent = 'Los integrantes deben tener nombres distintos.';
  err.textContent = '';

  const session = {
    id: uid(),
    codigo: makeSessionId(),
    fecha,
    duracion,
    ejercicio,
    integrantes: [a, b],
    creadaEn: Date.now(),
    entradas: []
  };
  sessions.unshift(session);
  saveSessions();

  $('duracion').value = '';
  $('ejercicio').value = '';
  swReset();
  prefillForm();
  toast(`Sesión guardada. Código: ${session.codigo}`);
  openSession(session.id);
}

/* ---------- Historial y filtros ---------- */

function refreshIntegranteFilter() {
  const select = $('fIntegrante');
  const current = select.value;
  const names = new Set();
  sessions.forEach(s => s.integrantes.forEach(n => names.add(n)));
  select.innerHTML = '<option value="">Todos</option>' +
    [...names].sort((x, y) => x.localeCompare(y)).map(n =>
      `<option value="${esc(n)}">${esc(n)}</option>`).join('');
  if ([...names].includes(current)) select.value = current;
}

function filteredSessions() {
  const texto = $('fTexto').value.trim().toLowerCase();
  const integrante = $('fIntegrante').value;
  const estado = $('fEstado').value;
  const desde = $('fDesde').value;
  const hasta = $('fHasta').value;

  return sessions
    .filter(s => {
      if (desde && s.fecha < desde) return false;
      if (hasta && s.fecha > hasta) return false;
      if (integrante && !s.integrantes.includes(integrante)) return false;

      if (texto) {
        const haystack = [s.ejercicio, ...s.integrantes, ...s.entradas.map(e => e.descripcion)]
          .join(' ').toLowerCase();
        if (!haystack.includes(texto)) return false;
      }

      if (estado !== 'todas') {
        const mejoras = s.entradas.filter(e => e.tipo === 'mejora');
        if (estado === 'pendiente' && !mejoras.some(m => m.estado === 'pendiente')) return false;
        if (estado === 'resuelta' && !mejoras.some(m => m.estado === 'resuelta')) return false;
      }
      return true;
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.creadaEn - a.creadaEn);
}

function renderHistory() {
  refreshIntegranteFilter();
  const list = $('sessionList');
  const total = sessions.length;
  const result = filteredSessions();

  $('resultCount').textContent = total
    ? `Mostrando ${result.length} de ${total} sesión(es).`
    : '';

  if (!total) {
    list.innerHTML = '<li class="empty">Aún no hay sesiones registradas.</li>';
    return;
  }
  if (!result.length) {
    list.innerHTML = '<li class="empty">Ninguna sesión coincide con los filtros.</li>';
    return;
  }

  list.innerHTML = result.map(s => {
    const mejoras = s.entradas.filter(e => e.tipo === 'mejora');
    const pendientes = mejoras.filter(m => m.estado === 'pendiente').length;
    const resueltas = mejoras.length - pendientes;
    return `
      <li class="session-item">
        <div>
          <strong>${esc(s.ejercicio)}</strong>
          <div class="meta">${fmtFecha(s.fecha)} · Código ${esc(s.codigo)} · ${fmtDuracion(s.duracion)} · ${esc(s.integrantes.join(' y '))}</div>
          <div class="counts">
            ${s.entradas.length} entrada(s) ·
            ${mejoras.length} mejora(s): ${pendientes} pendiente(s), ${resueltas} resuelta(s)
          </div>
        </div>
        <button class="small" data-act="open" data-id="${s.id}">Ver detalle</button>
      </li>`;
  }).join('');
}

/* ---------- Exportación ---------- */

function exportJSON() {
  if (!sessions.length) return alert('No hay sesiones para exportar.');
  const data = { version: 1, exportadoEn: new Date().toISOString(), sesiones: sessions };
  downloadFile(`registro-sesiones-${todayISO()}.json`, JSON.stringify(data, null, 2), 'application/json;charset=utf-8');
  toast('Respaldo JSON descargado.');
}

function csvCell(value) {
  const s = value == null ? '' : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCSV() {
  if (!sessions.length) return alert('No hay sesiones para exportar.');
  const rows = [[
    'Código de sesión', 'Fecha', 'Duración (min)', 'Ejercicio', 'Integrante 1', 'Integrante 2',
    'Tipo', 'Descripción', 'Registrado por', 'Fecha de registro', 'Estado (solo mejoras)'
  ]];

  sessions.forEach(s => {
    const base = [s.codigo, s.fecha, s.duracion, s.ejercicio, s.integrantes[0], s.integrantes[1]];
    if (!s.entradas.length) {
      rows.push([...base, '', '', '', '', '']);
      return;
    }
    s.entradas.forEach(e => rows.push([
      ...base,
      TIPO_LABEL[e.tipo],
      e.descripcion,
      e.autor,
      fmtDateTime(e.creadaEn),
      e.tipo === 'mejora' ? (e.estado === 'resuelta' ? 'Resuelta' : 'Pendiente') : ''
    ]));
  });

  const csv = '\uFEFF' + rows.map(r => r.map(csvCell).join(',')).join('\r\n');
  downloadFile(`registro-sesiones-${todayISO()}.csv`, csv, 'text/csv;charset=utf-8');
  toast('Tabla CSV descargada.');
}

/* ---------- Detalle de sesión ---------- */

function entryItem(entry, s) {
  if (entry.id === editingEntryId) return entryEditForm(entry, s);

  const isMejora = entry.tipo === 'mejora';
  const estadoTag = isMejora
    ? `<span class="estado ${entry.estado}">${entry.estado === 'resuelta' ? 'Resuelta' : 'Pendiente'}</span>`
    : '';
  const toggle = isMejora
    ? `<button class="small secondary" data-act="estado" data-id="${entry.id}">
         ${entry.estado === 'resuelta' ? 'Marcar pendiente' : 'Marcar resuelta'}
       </button>`
    : '';
  const edited = entry.editadaEn ? ` · <span class="edited">editada ${fmtDateTime(entry.editadaEn)}</span>` : '';

  return `
    <li class="entry">
      <div class="entry-main">
        <span class="tag tag-${entry.tipo}">${TIPO_LABEL[entry.tipo]}</span>${estadoTag}
        <p>${esc(entry.descripcion)}</p>
        <small>${esc(entry.autor)} · ${fmtDateTime(entry.creadaEn)}${edited}</small>
      </div>
      <div class="entry-actions">
        ${toggle}
        <button class="small secondary" data-act="editEntry" data-id="${entry.id}">Editar</button>
        <button class="small danger" data-act="delEntry" data-id="${entry.id}">Eliminar</button>
      </div>
    </li>`;
}

function entryEditForm(entry, s) {
  const tipos = ['observacion', 'decision', 'mejora'].map(t =>
    `<option value="${t}" ${t === entry.tipo ? 'selected' : ''}>${TIPO_LABEL[t]}</option>`).join('');
  const autores = s.integrantes.map(n =>
    `<option value="${esc(n)}" ${n === entry.autor ? 'selected' : ''}>${esc(n)}</option>`).join('');

  return `
    <li class="entry edit-box">
      <div class="entry-main" style="width:100%">
        <div class="grid2">
          <label>Tipo
            <select id="edit-tipo">${tipos}</select>
          </label>
          <label>Registrado por
            <select id="edit-autor">${autores}</select>
          </label>
        </div>
        <label>Descripción
          <textarea id="edit-desc" rows="3" maxlength="500">${esc(entry.descripcion)}</textarea>
        </label>
        <p id="edit-error" class="error"></p>
        <div class="controls">
          <button class="small" data-act="saveEntry" data-id="${entry.id}">Guardar cambios</button>
          <button class="small secondary" data-act="cancelEdit">Cancelar</button>
        </div>
      </div>
    </li>`;
}

function renderDetail() {
  const s = getSession(currentId);
  if (!s) return showView('history');

  const mejoras = s.entradas.filter(e => e.tipo === 'mejora');
  const pendientes = mejoras.filter(m => m.estado === 'pendiente').length;

  const durationBlock = editingDuration
    ? `<div class="inline-form">
         <label>Duración (minutos)
           <input type="number" id="edit-duracion" min="1" max="1440" step="1" value="${s.duracion}">
         </label>
         <p id="edit-dur-error" class="error"></p>
         <div class="controls">
           <button class="small" data-act="saveDuration">Guardar duración</button>
           <button class="small secondary" data-act="cancelDuration">Cancelar</button>
         </div>
       </div>`
    : `<div class="controls" style="margin:12px 0 0">
         <button class="small secondary" data-act="editDuration">Editar duración</button>
       </div>`;

  $('detailHeader').innerHTML = `
    <h2>${esc(s.ejercicio)}</h2>
    <p class="hint">${fmtFecha(s.fecha)} · Código de sesión: <b>${esc(s.codigo)}</b></p>
    <div class="stats">
      <span>Duración: <b>${fmtDuracion(s.duracion)}</b></span>
      <span>Integrantes: <b>${esc(s.integrantes.join(' y '))}</b></span>
      <span>Entradas: <b>${s.entradas.length}</b></span>
      <span>Mejoras pendientes: <b>${pendientes} de ${mejoras.length}</b></span>
    </div>
    ${durationBlock}`;

  // Opciones de autor para nuevas entradas (conserva la selección actual)
  const autor = $('entryAutor');
  const previous = autor.value;
  autor.innerHTML = s.integrantes.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
  if (s.integrantes.includes(previous)) autor.value = previous;

  const byType = tipo => [...s.entradas]
    .filter(e => e.tipo === tipo)
    .sort((a, b) => a.creadaEn - b.creadaEn);

  const fill = (listId, tipo) => {
    const items = byType(tipo);
    $(listId).innerHTML = items.length
      ? items.map(e => entryItem(e, s)).join('')
      : '<li class="empty">Sin registros.</li>';
  };
  fill('listObs', 'observacion');
  fill('listDec', 'decision');
  fill('listMej', 'mejora');
}

function onAddEntry(e) {
  e.preventDefault();
  const s = getSession(currentId);
  if (!s) return;
  const err = $('entryError');
  const tipo = $('entryTipo').value;
  const descripcion = $('entryDesc').value.trim();
  const autor = $('entryAutor').value;

  if (!descripcion) return err.textContent = 'Escribe la descripción de la entrada.';
  if (!autor) return err.textContent = 'Selecciona quién registra la entrada.';
  err.textContent = '';

  const entry = { id: uid(), tipo, descripcion, autor, creadaEn: Date.now() };
  if (tipo === 'mejora') entry.estado = 'pendiente';

  s.entradas.push(entry);
  saveSessions();
  $('entryDesc').value = '';
  renderDetail();
  toast(`${TIPO_LABEL[tipo]} agregada.`);
}

function saveEditedEntry(id) {
  const s = getSession(currentId);
  const entry = s && s.entradas.find(x => x.id === id);
  if (!entry) return;

  const tipo = document.getElementById('edit-tipo').value;
  const autor = document.getElementById('edit-autor').value;
  const descripcion = document.getElementById('edit-desc').value.trim();

  if (!descripcion) {
    document.getElementById('edit-error').textContent = 'La descripción no puede estar vacía.';
    return;
  }

  entry.tipo = tipo;
  entry.autor = autor;
  entry.descripcion = descripcion;
  if (tipo === 'mejora') entry.estado = entry.estado || 'pendiente';
  else delete entry.estado;
  entry.editadaEn = Date.now();

  editingEntryId = null;
  saveSessions();
  renderDetail();
}

function saveDuration() {
  const s = getSession(currentId);
  if (!s) return;
  const value = parseInt(document.getElementById('edit-duracion').value, 10);
  if (!(value > 0)) {
    document.getElementById('edit-dur-error').textContent = 'Introduce una duración mayor que 0.';
    return;
  }
  s.duracion = value;
  editingDuration = false;
  saveSessions();
  renderDetail();
}

function onDetailClick(e) {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const s = getSession(currentId);
  if (!s) return;
  const id = btn.dataset.id;

  switch (btn.dataset.act) {
    case 'estado': {
      const entry = s.entradas.find(x => x.id === id);
      if (!entry || entry.tipo !== 'mejora') return;
      entry.estado = entry.estado === 'resuelta' ? 'pendiente' : 'resuelta';
      saveSessions();
      renderDetail();
      break;
    }
    case 'delEntry':
      if (!confirm('¿Eliminar esta entrada?')) return;
      s.entradas = s.entradas.filter(x => x.id !== id);
      if (editingEntryId === id) editingEntryId = null;
      saveSessions();
      renderDetail();
      break;
    case 'editEntry':
      editingEntryId = id;
      renderDetail();
      break;
    case 'cancelEdit':
      editingEntryId = null;
      renderDetail();
      break;
    case 'saveEntry':
      saveEditedEntry(id);
      break;
    case 'editDuration':
      editingDuration = true;
      renderDetail();
      break;
    case 'cancelDuration':
      editingDuration = false;
      renderDetail();
      break;
    case 'saveDuration':
      saveDuration();
      break;
  }
}

function onDeleteSession() {
  const s = getSession(currentId);
  if (!s) return;
  if (!confirm(`¿Eliminar la sesión "${s.ejercicio}" y todas sus entradas? Esta acción no se puede deshacer.`)) return;
  sessions = sessions.filter(x => x.id !== currentId);
  saveSessions();
  currentId = null;
  toast('Sesión eliminada.', 'warn');
  showView('history');
}

/* ---------- Confirmación al cerrar ----------
   Avisa si hay datos que todavía no se han guardado:
   formulario de sesión con texto, entrada sin agregar,
   edición abierta o cronómetro en marcha o en pausa. */

function hasUnsaved() {
  const editing = editingEntryId !== null || editingDuration;
  const entryDraft = $('entryDesc').value.trim() !== '';
  const sessionDraft = formSnapshot() !== formBaseline;
  const stopwatch = sw.status === 'running' || sw.status === 'paused';
  return editing || entryDraft || sessionDraft || stopwatch;
}

window.addEventListener('beforeunload', e => {
  if (hasUnsaved()) {
    e.preventDefault();
    e.returnValue = '';
  }
});

/* ---------- Eventos ---------- */

document.querySelectorAll('.tab').forEach(btn =>
  btn.addEventListener('click', () => showView(btn.dataset.view)));

$('sessionForm').addEventListener('submit', onSaveSession);

$('swStart').addEventListener('click', swStart);
$('swPause').addEventListener('click', swPause);
$('swStop').addEventListener('click', swStop);
$('swReset').addEventListener('click', swReset);
$('swUse').addEventListener('click', swUseTime);

['fTexto', 'fIntegrante', 'fEstado', 'fDesde', 'fHasta'].forEach(id =>
  $(id).addEventListener('input', renderHistory));
$('fLimpiar').addEventListener('click', () => {
  $('fTexto').value = '';
  $('fIntegrante').value = '';
  $('fEstado').value = 'todas';
  $('fDesde').value = '';
  $('fHasta').value = '';
  renderHistory();
});

$('exportJsonBtn').addEventListener('click', exportJSON);
$('exportCsvBtn').addEventListener('click', exportCSV);

$('sessionList').addEventListener('click', e => {
  const btn = e.target.closest('button[data-act="open"]');
  if (btn) openSession(btn.dataset.id);
});

$('backBtn').addEventListener('click', () => showView('history'));
$('entryForm').addEventListener('submit', onAddEntry);
$('viewDetail').addEventListener('click', onDetailClick);
$('deleteSessionBtn').addEventListener('click', onDeleteSession);

/* ---------- Inicio ---------- */

prefillForm();
swRender();
renderHistory();
showView('new');
