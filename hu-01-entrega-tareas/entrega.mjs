
export function registrarEntrega({
  estudianteId,
  tareaId,
  tipo,
  contenido
}) {
  if (tipo !== "texto") {
    throw new Error("Tipo de entrega no soportado");
  }

  if (
    typeof contenido !== "string" ||
    contenido.trim() === ""
  ) {
    throw new Error("El contenido no puede estar vacío");
  }

  return {
    estudianteId,
    tareaId,
    tipo,
    contenido: contenido.trim()
  };
}
