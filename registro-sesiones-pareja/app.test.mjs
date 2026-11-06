
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(
  new URL('./index.html', import.meta.url), 'utf8'
);
const js = fs.readFileSync(
  new URL('./app.js', import.meta.url), 'utf8'
);
const css = fs.readFileSync(
  new URL('./styles.css', import.meta.url), 'utf8'
);

test('JavaScript tiene sintaxis válida', () => {
  assert.doesNotThrow(() => new vm.Script(js));
});

test('HTML carga JavaScript y CSS externos', () => {
  assert.match(html, /<script[^>]+src=["']app\.js["']/);
  assert.match(html, /<link[^>]+href=["']styles\.css["']/);
});

test('Los archivos externos existen y no están vacíos', () => {
  assert.ok(js.trim().length > 0);
  assert.ok(css.trim().length > 0);
});

test('Todos los elementos utilizados por JavaScript existen en HTML', () => {
  const htmlIds = new Set(
    [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1])
  );
  const jsIds = new Set(
    [...js.matchAll(/\$\(["']([^"']+)["']\)/g)].map(m => m[1])
  );

  const missing = [...jsIds].filter(id => !htmlIds.has(id));
  assert.deepEqual(missing, []);
});

test('El almacenamiento de sesiones es independiente', () => {
  assert.match(js, /registroSesionesPareja\.v1/);
  assert.match(js, /localStorage\.getItem\(STORAGE_KEY\)/);
  assert.match(js, /localStorage\.setItem\(STORAGE_KEY/);
});

test('Existe la función para guardar sesiones', () => {
  assert.match(js, /function onSaveSession/);
  assert.match(js, /function saveSessions/);
});

test('Se validan los datos obligatorios de la sesión', () => {
  assert.match(js, /if \(!fecha\)/);
  assert.match(js, /if \(!\(duracion > 0\)\)/);
  assert.match(js, /if \(!ejercicio\)/);
  assert.match(js, /if \(!a \|\| !b\)/);
});

test('Se comprueba que los integrantes sean diferentes', () => {
  assert.match(js, /a\.toLowerCase\(\) === b\.toLowerCase\(\)/);
});

test('Se pueden agregar y editar observaciones, decisiones y mejoras', () => {
  assert.match(js, /function onAddEntry/);
  assert.match(js, /function saveEditedEntry/);
  assert.match(js, /observacion/);
  assert.match(js, /decision/);
  assert.match(js, /mejora/);
});

test('Las mejoras tienen estados pendiente y resuelta', () => {
  assert.match(js, /pendiente/);
  assert.match(js, /resuelta/);
});

test('Existe la edición de duración y el cronómetro', () => {
  assert.match(js, /function saveDuration/);
  assert.match(js, /function swStart/);
  assert.match(js, /function swPause/);
  assert.match(js, /function swStop/);
  assert.match(js, /function swReset/);
});

test('Se pueden exportar sesiones a JSON y CSV', () => {
  assert.match(js, /function exportJSON/);
  assert.match(js, /function exportCSV/);
});

test('Existe la función para recuperar sesiones guardadas', () => {
  assert.match(js, /function loadSessions/);
  assert.match(js, /JSON\.parse\(localStorage\.getItem\(STORAGE_KEY\)\)/);
});
