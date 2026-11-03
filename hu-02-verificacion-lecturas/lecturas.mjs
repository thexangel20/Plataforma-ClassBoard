
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


export function revisarComentario(
  registro,
  correcto,
  observacion
) {
  if (typeof correcto !== "boolean") {
    throw new Error("Resultado de revisión inválido");
  }

  return {
    ...registro,
    estado: correcto ? "correcto" : "incorrecto",
    observacion: validarTexto(
      observacion,
      "La observación"
    )
  };
}
