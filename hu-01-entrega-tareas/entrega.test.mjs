
import test from "node:test";
import assert from "node:assert/strict";
import { registrarEntrega } from "./entrega.mjs";

// PRUEBA 1: registrar una entrega válida
test("ET-02: registrar una entrega de texto", () => {
  const entrega = registrarEntrega({
    estudianteId: "E01",
    tareaId: "T01",
    tipo: "texto",
    contenido: "Esta es mi tarea"
  });

  assert.equal(entrega.tipo, "texto");
  assert.equal(entrega.contenido, "Esta es mi tarea");
});

// PRUEBA 2: rechazar una entrega vacía
test("ET-02: no permitir texto vacío", () => {
  assert.throws(() => {
    registrarEntrega({
      estudianteId: "E01",
      tareaId: "T01",
      tipo: "texto",
      contenido: ""
    });
  }, /vacío/);
});
