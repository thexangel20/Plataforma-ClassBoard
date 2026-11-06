import { GestorEntregas } from './entrega.mjs';
const $ = (id) => document.getElementById(id);
const isoDesdeAhora = (dias) => new Date(Date.now() + dias * 86400000).toISOString();
const gestor = new GestorEntregas({
  materias: [
    { codigo: 'M01', nombre: 'Sistemas', docenteId: 'D01', inscritos: ['E01', 'E02'] },
    { codigo: 'M02', nombre: 'Estadística', docenteId: 'D02', inscritos: ['E02'] }
  ],
  tareas: [
    { codigo: 'T01', titulo: 'Ensayo de sistemas', materiaId: 'M01', limiteUTC: isoDesdeAhora(3) },
    { codigo: 'T02', titulo: 'Práctica vencida', materiaId: 'M02', limiteUTC: isoDesdeAhora(-1) }
  ]
});
function mostrar(id, texto, error = false) {
  $(id).textContent = typeof texto === 'string' ? texto : JSON.stringify(texto, null, 2);
  $(id).classList.toggle('error', error);
}
function actualizarTareas() {
  const tareas = gestor.listarTareas($('estudiante').value);
  $('tarea').replaceChildren();
  for (const t of tareas) {
    const opcion = document.createElement('option');
    opcion.value = t.codigo;
    opcion.textContent = `${t.codigo} · ${t.titulo} (límite ${new Date(t.limiteUTC).toLocaleString()})`;
    $('tarea').append(opcion);
  }
  $('tarea').disabled = tareas.length === 0;
  mostrar('salida-estudiante', tareas.length ? `Tareas disponibles: ${tareas.length}.` : 'No tiene tareas de materias inscritas.');
}
function actualizarTipo() {
  const archivo = $('tipo').value === 'archivo';
  $('grupo-texto').hidden = archivo;
  $('grupo-archivo').hidden = !archivo;
}
$('estudiante').addEventListener('change', actualizarTareas);
$('tipo').addEventListener('change', actualizarTipo);
$('form-entrega').addEventListener('submit', (e) => {
  e.preventDefault();
  try {
    const contenido = $('tipo').value === 'archivo' ? $('archivo').files[0] : $('contenido').value;
    const entrega = gestor.enviar({
      estudianteId: $('estudiante').value,
      tareaId: $('tarea').value,
      tipo: $('tipo').value,
      contenido
    });
    mostrar('salida-estudiante', entrega);
  } catch (error) { mostrar('salida-estudiante', error.message, true); }
});
$('consultar').addEventListener('click', () => {
  const entrega = gestor.consultar($('estudiante').value, $('tarea').value);
  mostrar('salida-estudiante', entrega ?? 'No hay entrega registrada para ese estudiante y tarea.');
});
$('ver-entregas').addEventListener('click', () => {
  try {
    mostrar('salida-docente', gestor.verEntregas($('docente').value, $('tarea-docente').value));
  } catch (error) { mostrar('salida-docente', error.message, true); }
});
$('form-calificacion').addEventListener('submit', (e) => {
  e.preventDefault();
  try {
    const notaCadena = $('nota').value;
    const nota = notaCadena === '' ? NaN : Number(notaCadena);
    mostrar('salida-docente', gestor.calificar({
      docenteId: $('docente').value,
      estudianteId: $('estudiante-calificar').value,
      tareaId: $('tarea-docente').value,
      nota,
      observacion: $('observacion').value
    }));
  } catch (error) { mostrar('salida-docente', error.message, true); }
});
actualizarTipo();
actualizarTareas();
