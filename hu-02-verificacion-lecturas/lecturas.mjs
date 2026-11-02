
export function registrarComentario(tema, comentario) {
  if (
    typeof tema !== "string" ||
    tema.trim() === ""
  ) {
    throw new Error("El tema es obligatorio");
  }

  if (
    typeof comentario !== "string" ||
    comentario.trim() === ""
  ) {
    throw new Error("El comentario no puede estar vacío");
  }

  return {
    tema: tema.trim(),
    comentario: comentario.trim(),
    estado: "pendiente",
    observacion: ""
  };
}
