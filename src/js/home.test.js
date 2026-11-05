import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {obtenerAulas, obtenerTareasPendientes, ordenarTareasPorFecha} from "./home.js";

describe("Panel de inicio", () => {
  it("debe devolver las aulas del usuario", () => {
    const aulas = [
      { id: 1, nombre: "Sistemas de Información 2" },
      { id: 2, nombre: "Programación Web" }
    ];

    assert.deepEqual(obtenerAulas(aulas), aulas);
  });

  it("debe mostrar solamente las tareas pendientes", () => {
    const tareas = [
      { id: 1, titulo: "Investigar XP", estado: "pendiente" },
      { id: 2, titulo: "Entregar práctica", estado: "completada" },
      { id: 3, titulo: "Estudiar TDD", estado: "pendiente" }
    ];

    const resultado = obtenerTareasPendientes(tareas);

    assert.deepEqual(resultado, [
      { id: 1, titulo: "Investigar XP", estado: "pendiente" },
      { id: 3, titulo: "Estudiar TDD", estado: "pendiente" }
    ]);
  });

  it("debe ordenar las tareas pendientes por fecha límite, de la más próxima a la más lejana", () => {
    const tareas = [
      {
        id: 1,
        titulo: "Investigar XP",
        estado: "pendiente",
        fechaLimite: "2026-11-15"
      },
      {
        id: 2,
        titulo: "Entregar práctica",
        estado: "pendiente",
        fechaLimite: "2026-11-08"
      },
      {
        id: 3,
        titulo: "Estudiar TDD",
        estado: "pendiente",
        fechaLimite: "2026-11-12"
      }
    ];

    const resultado = ordenarTareasPorFecha(tareas);

    assert.deepEqual(
      resultado.map((tarea) => tarea.id),
      [2, 3, 1]
    );
  });
});