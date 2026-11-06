"use strict";

const CLAVE_TABLERO = "classboard.tablero.v1";
const TEMAS_INICIALES = ["XP", "Scrum", "TDD", "Tarjetas CRC", "Pair Programming", "Proceso Unificado"];

class GestorDudas {
    constructor(almacen) {
        this.almacen = almacen;
    }

    consultar() {
        const guardado = this.almacen.getItem(CLAVE_TABLERO);
        return guardado
            ? JSON.parse(guardado)
            : { temas: [...TEMAS_INICIALES], dudas: [] };
    }

    guardar(tablero) {
        this.almacen.setItem(CLAVE_TABLERO, JSON.stringify(tablero));
        return tablero;
    }

    registrarTema(tema) {
        const tablero = this.consultar();
        this.incorporarTema(tablero, this.texto(tema, "tema"));
        return this.guardar(tablero);
    }

    registrar({ tema, pregunta, estudiante }) {
        const temaLimpio = this.texto(tema, "tema");
        const preguntaLimpia = this.texto(pregunta, "pregunta");
        const estudianteLimpio = this.texto(estudiante, "nombre del estudiante");
        const tablero = this.consultar();
        const ultimoId = tablero.dudas.at(-1)?.id ?? 0;
        tablero.dudas.push({
            id: ultimoId + 1,
            tema: this.incorporarTema(tablero, temaLimpio),
            pregunta: preguntaLimpia,
            estudiante: estudianteLimpio,
            estado: "pendiente",
        });
        return this.guardar(tablero);
    }

    responder(id, { respuesta, docente }) {
        const respuestaLimpia = this.texto(respuesta, "respuesta");
        const docenteLimpio = this.texto(docente, "nombre del docente");
        const tablero = this.consultar();
        const duda = tablero.dudas.find(item => item.id === id);
        if (!duda) throw new Error("No se encontró la duda.");
        if (duda.estado !== "pendiente") throw new Error("Esta duda ya tiene respuesta.");
        duda.respuesta = respuestaLimpia;
        duda.docente = docenteLimpio;
        duda.estado = "respondida";
        return this.guardar(tablero);
    }

    comentar(id, { comentario, autor }) {
        const texto = this.texto(comentario, "comentario");
        const nombre = this.texto(autor, "nombre");
        const tablero = this.consultar();
        const duda = tablero.dudas.find(item => item.id === id);
        if (!duda) throw new Error("No se encontró la duda.");
        if (duda.estado !== "respondida") throw new Error("La duda debe tener una respuesta para comentar.");
        duda.comentarios ??= [];
        duda.comentarios.push({ autor: nombre, texto });
        return this.guardar(tablero);
    }

    incorporarTema(tablero, tema) {
        const existente = tablero.temas.find(item => item.toLowerCase() === tema.toLowerCase());
        if (existente) return existente;
        tablero.temas.push(tema);
        return tema;
    }

    texto(valor, campo) {
        if (typeof valor !== "string" || !valor.trim()) {
            throw new Error(`Completa el campo «${campo}».`);
        }
        return valor.trim();
    }
}
