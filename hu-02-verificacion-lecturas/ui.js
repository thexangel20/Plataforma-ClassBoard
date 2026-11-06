import {
  registrarComentario,
  revisarComentario
} from "./lecturas.mjs";

// Guardamos temporalmente el comentario.
let comentarioActual = null;

const resultado = document.querySelector("#resultado");

// Formulario del estudiante.
document.querySelector("#formulario-comentario")
  .addEventListener("submit", (evento) => {

    evento.preventDefault();

    const tema =
      document.querySelector("#tema").value;

    const comentario =
      document.querySelector("#comentario").value;

    try {
      comentarioActual = registrarComentario(
        tema,
        comentario
      );

      resultado.textContent =
        "Comentario registrado. Estado: pendiente.";

      resultado.style.color = "green";

    } catch (error) {
      resultado.textContent = error.message;
      resultado.style.color = "red";
    }
  });

// Formulario de revisión.
document.querySelector("#formulario-revision")
  .addEventListener("submit", (evento) => {

    evento.preventDefault();

    if (!comentarioActual) {
      resultado.textContent =
        "Primero debes registrar un comentario.";
      resultado.style.color = "red";
      return;
    }

    const correcto =
      document.querySelector("#estado").value === "correcto";

    const observacion =
      document.querySelector("#observacion").value;

    try {
      comentarioActual = revisarComentario(
        comentarioActual,
        correcto,
        observacion
      );

      resultado.textContent =
        `Estado: ${comentarioActual.estado}. ` +
        `Observación: ${comentarioActual.observacion}`;

      resultado.style.color = "green";

    } catch (error) {
      resultado.textContent = error.message;
      resultado.style.color = "red";
    }
  });
