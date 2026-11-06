
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

test('El almacenamiento de roles es independiente', () => {
  assert.match(js, /registroRolesPareja\.v2/);
  assert.match(js, /registroRolesPareja\.historial\.v2/);
  assert.match(js, /localStorage\.getItem\(KEY\)/);
  assert.match(js, /localStorage\.setItem\(KEY/);
});

test('Existe el inicio de sesión', () => {
  assert.match(js, /function startSession/);
  assert.match(js, /function load/);
  assert.match(js, /function save/);
});

test('Se asignan los roles Driver y Navigator', () => {
  assert.match(js, /driver/);
  assert.match(js, /navigator/);
  assert.match(js, /startDriver/);
});

test('Existe la rotación de roles', () => {
  assert.match(js, /function confirmRotation/);
  assert.match(js, /state\.rotations\+\+/);
});

test('La rotación registra motivo y observaciones', () => {
  assert.match(js, /reason, notes/);
  assert.match(js, /function openRotPanel/);
});

test('Existe la función para pausar y reanudar', () => {
  assert.match(js, /function togglePause/);
  assert.match(js, /Sesión en pausa/);
  assert.match(js, /Sesión reanudada/);
});

test('Existe la finalización de sesiones', () => {
  assert.match(js, /function endSession/);
  assert.match(js, /state\.ended = true/);
});

test('Las sesiones finalizadas se guardan en el historial', () => {
  assert.match(js, /history\.unshift/);
  assert.match(js, /function saveHist/);
  assert.match(js, /function renderHistory/);
});

test('Existe la recuperación del historial', () => {
  assert.match(js, /function loadHist/);
  assert.match(js, /localStorage\.getItem\(HIST_KEY\)/);
});
