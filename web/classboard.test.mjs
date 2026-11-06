import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const script = readFileSync(new URL("./classboard.js", import.meta.url), "utf8");
const GestorDudas = runInNewContext(script + "\nGestorDudas;");

function tableroNuevo() {
    const datos = new Map();
    const almacen = {
        getItem: clave => datos.get(clave) ?? null,
        setItem: (clave, valor) => datos.set(clave, valor),
    };
    return { gestor: new GestorDudas(almacen), almacen };
}

test("registra dudas pendientes y reutiliza el nombre de un tema", () => {
    const { gestor } = tableroNuevo();
    gestor.registrarTema("Arquitectura");
    const tablero = gestor.registrar({ tema: " arquitectura ", pregunta: "¿Qué es MVC?", estudiante: "Ana" });
    assert.equal(tablero.temas.filter(tema => tema === "Arquitectura").length, 1);
    assert.equal(tablero.temas.length, 7);
    assert.equal(tablero.dudas[0].tema, "Arquitectura");
    assert.equal(tablero.dudas[0].estado, "pendiente");
});

test("rechaza una pregunta vacía sin agregar el tema ni guardar la duda", () => {
    const { gestor } = tableroNuevo();
    assert.throws(() => gestor.registrar({ tema: "Nuevo", pregunta: " ", estudiante: "Ana" }), /pregunta/);
    const tablero = gestor.consultar();
    assert.equal(tablero.dudas.length, 0);
    assert.equal(tablero.temas.includes("Nuevo"), false);
});

test("conserva la respuesta al volver a abrir el gestor y rechaza una segunda", () => {
    const { gestor, almacen } = tableroNuevo();
    const { dudas: [duda] } = gestor.registrar({ tema: "XP", pregunta: "¿Qué es XP?", estudiante: "Ana" });
    gestor.responder(duda.id, { respuesta: "Extreme Programming", docente: "Luis" });
    const reabierto = new GestorDudas(almacen);
    assert.throws(() => reabierto.responder(duda.id, { respuesta: "Otra", docente: "Luis" }), /ya tiene respuesta/);
    const [guardada] = reabierto.consultar().dudas;
    assert.equal(guardada.respuesta, "Extreme Programming");
    assert.equal(guardada.docente, "Luis");
    assert.equal(guardada.estado, "respondida");
});
