
function validarTexto(valor, campo) {
  if (
    typeof valor !== "string" ||
    valor.trim() === ""
  ) {
    throw new Error(`${campo} no puede estar vacío`);
  }

  return valor.trim();
}

export function registrarComentario(tema, comentario) {
  return {
    tema: validarTexto(tema, "El tema"),
    comentario: validarTexto(
      comentario,
      "El comentario"
    ),
    estado: "pendiente",
    observacion: ""
  };
}
