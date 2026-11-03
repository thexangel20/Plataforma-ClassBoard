
import { registrarEntrega } from "./entrega.mjs";

// Buscamos el formulario en HTML.
const formulario = document.querySelector(
  "#formulario-entrega"
);

// Aquí mostraremos el resultado.
const resultado = document.querySelector("#resultado");

// Detectamos cuando alguien pulsa el botón.
formulario.addEventListener("submit", (evento) => {

  // Evitamos que la página se recargue.
  evento.preventDefault();

  // Obtenemos los datos del formulario.
  const estudianteId =
    document.querySelector("#estudiante").value;

  const tareaId =
    document.querySelector("#tarea").value;

  const tipo =
    document.querySelector("#tipo").value;

  const contenido =
    document.querySelector("#contenido").value;

  // Intentamos validar la entrega.
  try {
    const entrega = registrarEntrega({
      estudianteId,
      tareaId,
      tipo,
      contenido
    });

    resultado.textContent =
      `Entrega validada (${entrega.tipo}). ` +
      "Demostración sin almacenamiento.";

    resultado.style.color = "green";

  } catch (error) {

    resultado.textContent = error.message;

    resultado.style.color = "red";
  }
});
