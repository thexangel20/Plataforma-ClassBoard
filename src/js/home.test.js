import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {obtenerAulas, obtenerTareasPendientes, ordenarTareasPorFecha, obtenerAvisosRecientes, formatearFecha} from "./home.js";

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

  it("debe devolver los avisos recientes", () => {
    const avisos = [
      {
        id: 1,
        titulo: "Cambio de horario",
        contenido: "La clase del viernes será a las 10:00.",
        fecha: "2026-11-04"
      },
      {
        id: 2,
        titulo: "Material disponible",
        contenido: "Ya está disponible el material de estudio.",
        fecha: "2026-11-03"
      }
    ];

    assert.deepEqual(obtenerAvisosRecientes(avisos), avisos);
  });
  
  it("no debe modificar el arreglo original al ordenar las tareas", () => {
    const tareas = [
      {
        id: 1,
        titulo: "Tarea lejana",
        fechaLimite: "2026-11-15"
      },
      {
        id: 2,
        titulo: "Tarea próxima",
        fechaLimite: "2026-11-08"
      }
    ];

    const copiaOriginal = [...tareas];

    ordenarTareasPorFecha(tareas);

    assert.deepEqual(tareas, copiaOriginal);
  });

  it("debe devolver una lista vacía cuando no hay tareas pendientes", () => {
    const tareas = [
      {
        id: 1,
        titulo: "Práctica entregada",
        estado: "completada"
      }
    ];

    assert.deepEqual(obtenerTareasPendientes(tareas), []);
  });

  it("debe devolver una lista vacía cuando el usuario no tiene aulas", () => {
    assert.deepEqual(obtenerAulas([]), []);
  });

  it("debe devolver una lista vacía cuando no hay avisos", () => {
    assert.deepEqual(obtenerAvisosRecientes([]), []);
  });

  it("debe convertir una fecha al formato dd/mm/aa", () => {
    assert.equal(formatearFecha("2026-11-08"), "08/11/26");
  });
});