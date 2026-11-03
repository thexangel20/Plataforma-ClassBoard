
import test from "node:test";
import assert from "node:assert/strict";
import { registrarComentario, revisarComentario } from "./lecturas.mjs";

// PRUEBA 1: registrar comentario
test("VL-02: registrar un comentario", () => {
  const resultado = registrarComentario(
    "TDD",
    "TDD consiste en escribir pruebas primero."
  );

  assert.equal(resultado.tema, "TDD");
  assert.equal(resultado.estado, "pendiente");
});

// PRUEBA 2: rechazar comentario vacío
test("VL-02: rechazar un comentario vacío", () => {
  assert.throws(() => {
    registrarComentario("Scrum", "");
  }, /vacío/);
});
test("VL-04: docente marca correcto", () => {
  const registro = registrarComentario(
    "TDD",
    "Primero se crean las pruebas"
  );

  const resultado = revisarComentario(
    registro, true, "Buena explicación"
  );

  assert.equal(resultado.estado, "correcto");
});

test("VL-04: docente marca incorrecto", () => {
  const registro = registrarComentario(
    "Scrum",
    "Comentario pendiente de revisión"
  );

  const resultado = revisarComentario(
    registro, false, "Revisar concepto"
  );

  assert.equal(resultado.estado, "incorrecto");
});

test("VL-05: exigir observación", () => {
  const registro = registrarComentario(
    "XP",
    "Comentario de prueba"
  );

  assert.throws(
    () => revisarComentario(registro, true, ""),
    /observación/
  );
});