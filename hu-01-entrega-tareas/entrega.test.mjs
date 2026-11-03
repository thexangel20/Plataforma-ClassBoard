
test("ET-02: permitir entrega mediante enlace HTTPS", () => {
  const entrega = registrarEntrega({
    estudianteId: "E01",
    tareaId: "T01",
    tipo: "enlace",
    contenido: "https://ejemplo.com/mi-tarea"
  });

  assert.equal(entrega.tipo, "enlace");
  assert.equal(
    entrega.contenido,
    "https://ejemplo.com/mi-tarea"
  );
});

test("ET-02: rechazar enlaces no permitidos", () => {
  assert.throws(() => {
    registrarEntrega({
      estudianteId: "E01",
      tareaId: "T01",
      tipo: "enlace",
      contenido: "javascript:alert(1)"
    });
  }, /enlace inválido/i);
});
