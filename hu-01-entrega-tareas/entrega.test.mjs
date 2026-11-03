
function validarContenido(tipo, contenido) {
  if (
    typeof contenido !== "string" ||
    contenido.trim() === ""
  ) {
    throw new Error("El contenido no puede estar vacío");
  }

  const valor = contenido.trim();

  if (tipo === "texto") {
    return valor;
  }

  if (tipo === "enlace") {
    try {
      const url = new URL(valor);

      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Enlace inválido");
      }

      return valor;
    } catch {
      throw new Error("Enlace inválido");
    }
  }

  throw new Error("Tipo de entrega no soportado");
}

export function registrarEntrega({
  estudianteId,
  tareaId,
  tipo,
  contenido
}) {
  return {
    estudianteId,
    tareaId,
    tipo,
    contenido: validarContenido(tipo, contenido)
  };
}
