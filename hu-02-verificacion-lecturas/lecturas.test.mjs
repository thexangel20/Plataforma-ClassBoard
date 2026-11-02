
import test from "node:test";
import assert from "node:assert/strict";
import { registrarComentario } from "./lecturas.mjs";

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