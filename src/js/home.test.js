import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { obtenerAulas } from "./home.js";

describe("Panel de inicio", () => {
  it("debe devolver las aulas del usuario", () => {
    const aulas = [
      { id: 1, nombre: "Sistemas de Información 2" },
      { id: 2, nombre: "Programación Web" }
    ];

    assert.deepEqual(obtenerAulas(aulas), aulas);
  });
});