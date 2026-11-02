
function validarContenido(contenido) {
  if (
    typeof contenido !== "string" ||
    contenido.trim() === ""
  ) {
    throw new Error("El contenido no puede estar vacío");
  }

  return contenido.trim();
}

export function registrarEntrega({
  estudianteId,
  tareaId,
  tipo,
  contenido
}) {
  if (tipo !== "texto") {
    throw new Error("Tipo de entrega no soportado");
  }

  return {
    estudianteId,
    tareaId,
    tipo,
    contenido: validarContenido(contenido)
  };
}
