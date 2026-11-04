export function obtenerAulas(aulas) {
  return aulas;
}

function mostrarAulas(aulas) {
  const listaAulas = document.querySelector("#lista-aulas");

  if (!listaAulas) return;

  listaAulas.replaceChildren();

  obtenerAulas(aulas).forEach((aula) => {
    const elemento = document.createElement("li");
    elemento.textContent = aula.nombre;
    listaAulas.appendChild(elemento);
  });
}

const aulasDelUsuario = [
  { id: 1, nombre: "Sistemas de Información 2" },
  { id: 2, nombre: "Programación Web" }
];

if (typeof document !== "undefined") {
  mostrarAulas(aulasDelUsuario);
}