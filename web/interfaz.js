"use strict";

const buscar = selector => document.querySelector(selector);
let tablero = { temas: [], dudas: [] };
let gestor;

function aviso(texto, error = false) {
    const mensaje = buscar("#notice");
    mensaje.textContent = texto;
    mensaje.classList.toggle("error", error);
    mensaje.hidden = false;
}

function elemento(etiqueta, texto, clase) {
    const nodo = document.createElement(etiqueta);
    if (texto !== undefined) nodo.textContent = texto;
    if (clase) nodo.className = clase;
    return nodo;
}

function mostrarTablero(datos) {
    tablero = datos;
    buscar("#topics").replaceChildren(...tablero.temas.map(tema => {
        const opcion = elemento("option");
        opcion.value = tema;
        return opcion;
    }));
    mostrarDudas();
}

function conectarFormulario(formulario, guardar, mensaje) {
    formulario.addEventListener("submit", evento => {
        evento.preventDefault();
        try {
            if (!gestor) throw new Error("El almacenamiento del navegador no está disponible.");
            const datos = Object.fromEntries(new FormData(formulario));
            mostrarTablero(guardar(datos));
            formulario.reset();
            aviso(mensaje);
        } catch (error) {
            aviso(error.message, true);
        }
    });
}

function formularioAporte(id, campos, boton, guardar, mensaje) {
    const formulario = elemento("form");
    for (const [campo, etiqueta, tipo, limite] of campos) {
        const entrada = elemento(tipo);
        entrada.id = `${campo}-${id}`;
        entrada.name = campo;
        entrada.required = true;
        entrada.maxLength = limite;
        const rotulo = elemento("label", etiqueta);
        rotulo.htmlFor = entrada.id;
        formulario.append(rotulo, entrada);
    }
    formulario.append(elemento("button", boton));
    conectarFormulario(formulario, guardar, mensaje);
    return formulario;
}

function formularioRespuesta(duda) {
    const panel = elemento("details");
    const campos = [
        ["docente", "Tu nombre", "input", 120],
        ["respuesta", "Respuesta", "textarea", 5000],
    ];
    panel.append(elemento("summary", "Responder"),
        formularioAporte(duda.id, campos, "Publicar respuesta",
            datos => gestor.responder(duda.id, datos), "Respuesta publicada."));
    return panel;
}

function hiloComentarios(duda) {
    const comentarios = duda.comentarios ?? [];
    const panel = elemento("details");
    panel.append(elemento("summary", comentarios.length ? `Comentar (${comentarios.length})` : "Comentar"));
    if (comentarios.length) {
        panel.open = true;
        const lista = elemento("ul", undefined, "comentarios");
        for (const comentario of comentarios) {
            const entrada = elemento("li");
            entrada.append(elemento("strong", comentario.autor), elemento("p", comentario.texto));
            lista.append(entrada);
        }
        panel.append(lista);
    }
    const campos = [
        ["autor", "Tu nombre", "input", 120],
        ["comentario", "Comentario", "textarea", 5000],
    ];
    panel.append(formularioAporte(duda.id, campos, "Publicar comentario",
        datos => gestor.comentar(duda.id, datos), "Comentario publicado."));
    return panel;
}

function tarjetaDuda(duda) {
    const respondida = duda.estado === "respondida";
    const tarjeta = elemento("article", undefined, "card");
    const cabecera = elemento("div", undefined, "meta");
    cabecera.append(
        elemento("span", duda.tema, "topic"),
        elemento("span", respondida ? "Respondida" : "Pendiente", respondida ? "badge answered" : "badge"),
    );
    tarjeta.append(cabecera, elemento("h3", duda.pregunta),
        elemento("div", `${duda.estudiante} · Duda #${duda.id}`, "author"));
    if (respondida) {
        const respuesta = elemento("div", undefined, "answer");
        respuesta.append(elemento("p", duda.respuesta), elemento("small", `Respuesta de ${duda.docente}`));
        tarjeta.append(respuesta, hiloComentarios(duda));
    } else {
        tarjeta.append(formularioRespuesta(duda));
    }
    return tarjeta;
}

function mostrarDudas() {
    const resueltas = tablero.dudas.filter(duda => duda.estado === "respondida").length;
    buscar("#total").textContent = tablero.dudas.length;
    buscar("#pending").textContent = tablero.dudas.length - resueltas;
    buscar("#answered").textContent = resueltas;
    const filtro = buscar("#filter").value;
    const visibles = tablero.dudas.filter(duda => !filtro || duda.estado === filtro).reverse();
    const tarjetas = buscar("#cards");
    if (visibles.length) {
        tarjetas.replaceChildren(...visibles.map(tarjetaDuda));
    } else {
        const vacio = elemento("div", undefined, "empty");
        vacio.append(elemento("strong", tablero.dudas.length ? "No hay dudas en este estado." : "Aún no hay dudas en el aula."));
        tarjetas.replaceChildren(vacio);
    }
}

function cargarTablero() {
    try {
        gestor = new GestorDudas(window.localStorage);
        mostrarTablero(gestor.consultar());
    } catch (error) {
        aviso(`No se pudo cargar el aula. ${error.message}`, true);
    }
}

conectarFormulario(buscar("#ask"), datos => gestor.registrar(datos), "Tu duda ya está en el aula.");
conectarFormulario(buscar("#new-topic"), datos => gestor.registrarTema(datos.tema), "Tema agregado.");
buscar("#filter").addEventListener("change", mostrarDudas);
window.addEventListener("storage", evento => {
    if (evento.key === CLAVE_TABLERO || evento.key === null) cargarTablero();
});
cargarTablero();
