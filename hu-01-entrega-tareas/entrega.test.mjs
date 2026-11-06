import test from 'node:test';
import assert from 'node:assert/strict';
import { registrarEntrega, GestorEntregas } from './entrega.mjs';

// Conserva las primeras 4 pruebas de los ciclos TDD anteriores.
test('ET-02 registrar entrega de texto', () => {
  const e = registrarEntrega({ estudianteId: 'E01', tareaId: 'T01', tipo: 'texto', contenido: 'Mi tarea' });
  assert.equal(e.tipo, 'texto');
  assert.equal(e.contenido, 'Mi tarea');
});
test('ET-02 rechazar texto vacío', () => {
  assert.throws(() => registrarEntrega({ estudianteId: 'E01', tareaId: 'T01', tipo: 'texto', contenido: '' }), /vacío/);
});
test('ET-02 permitir enlace HTTPS', () => {
  const e = registrarEntrega({ estudianteId: 'E01', tareaId: 'T01', tipo: 'enlace', contenido: 'https://ejemplo.com/tarea' });
  assert.equal(e.tipo, 'enlace');
  assert.equal(e.contenido, 'https://ejemplo.com/tarea');
});
test('ET-02 rechazar protocolo no permitido', () => {
  assert.throws(() => registrarEntrega({ estudianteId: 'E01', tareaId: 'T01', tipo: 'enlace', contenido: 'javascript:alert(1)' }), /enlace inválido/i);
});

function nuevoGestor(hora = '2026-11-02T10:00:00.000Z') {
  return new GestorEntregas({
    ahora: () => new Date(hora),
    materias: [
      { codigo: 'M01', nombre: 'Sistemas', docenteId: 'D01', inscritos: ['E01', 'E02'] },
      { codigo: 'M02', nombre: 'Estadística', docenteId: 'D02', inscritos: ['E02'] }
    ],
    tareas: [
      { codigo: 'T01', titulo: 'Ensayo', materiaId: 'M01', limiteUTC: '2026-11-02T10:00:00.000Z' },
      { codigo: 'T02', titulo: 'Práctica', materiaId: 'M02', limiteUTC: '2026-11-01T10:00:00.000Z' }
    ]
  });
}
const datos = { estudianteId: 'E01', tareaId: 'T01', tipo: 'texto', contenido: 'Trabajo entregado' };

test('ET-01 listar solo tareas de materias inscritas', () => {
  const g = nuevoGestor();
  assert.deepEqual(g.listarTareas('E01').map(t => t.codigo), ['T01']);
  assert.deepEqual(g.listarTareas('E02').map(t => t.codigo), ['T01', 'T02']);
  assert.deepEqual(g.listarTareas('E03'), []);
});
test('ET-02 archivo elegido realmente por el usuario es aceptado por metadatos', () => {
  const e = registrarEntrega({ estudianteId: 'E01', tareaId: 'T01', tipo: 'archivo', contenido: { name: 'actividad.pdf', size: 12 } });
  assert.deepEqual(e.contenido, { nombre: 'actividad.pdf', tamano: 12 });
  assert.throws(() => registrarEntrega({ estudianteId: 'E01', tareaId: 'T01', tipo: 'archivo', contenido: null }), /Archivo inválido/);
});
test('ET-03 rechaza tarea inexistente y estudiante sin inscripción', () => {
  const g = nuevoGestor();
  assert.throws(() => g.enviar({ ...datos, tareaId: 'NO_EXISTE' }), /no existe/);
  assert.throws(() => g.enviar({ ...datos, estudianteId: 'E03' }), /no inscrito/);
  assert.equal(g.consultar('E01', 'T01'), null);
});
test('ET-04 fecha UTC y ET-05 entrega justo en el límite es puntual', () => {
  const e = nuevoGestor().enviar(datos);
  assert.equal(e.fechaUTC, '2026-11-02T10:00:00.000Z');
  assert.equal(e.estado, 'a tiempo');
});
test('ET-05 entrega después del límite es tardía', () => {
  const e = nuevoGestor('2026-11-02T10:00:01.000Z').enviar(datos);
  assert.equal(e.estado, 'tardía');
});
test('Regla extra: no permite segunda entrega', () => {
  const g = nuevoGestor();
  g.enviar(datos);
  assert.throws(() => g.enviar(datos), /Ya existe/);
});
test('ET-06 el estudiante consulta su propia entrega y no la ajena', () => {
  const g = nuevoGestor();
  g.enviar(datos);
  assert.equal(g.consultar('E01', 'T01').contenido, 'Trabajo entregado');
  assert.equal(g.consultar('E02', 'T01'), null);
});
test('ET-06 solo el docente asignado puede ver y calificar', () => {
  const g = nuevoGestor();
  g.enviar(datos);
  assert.throws(() => g.verEntregas('D02', 'T01'), /no autorizado/);
  assert.equal(g.verEntregas('D01', 'T01').length, 1);
  assert.throws(() => g.calificar({ docenteId: 'D02', estudianteId: 'E01', tareaId: 'T01', nota: 15, observacion: 'Bien' }), /no autorizado/);
  const e = g.calificar({ docenteId: 'D01', estudianteId: 'E01', tareaId: 'T01', nota: 18, observacion: 'Buen trabajo' });
  assert.equal(e.nota, 18);
  assert.equal(g.consultar('E01', 'T01').observacion, 'Buen trabajo');
});
test('ET-06 nota inválida y observación vacía se rechazan sin cambiar el estado', () => {
  const g = nuevoGestor();
  g.enviar(datos);
  const base = { docenteId: 'D01', estudianteId: 'E01', tareaId: 'T01', observacion: 'Muy bien' };
  for (const nota of [-1, 21, NaN, '17', Infinity]) {
    assert.throws(() => g.calificar({ ...base, nota }), /0 a 20/);
  }
  assert.throws(() => g.calificar({ ...base, nota: 17, observacion: ' ' }), /observación/);
  assert.equal(g.consultar('E01', 'T01').nota, null);
});
