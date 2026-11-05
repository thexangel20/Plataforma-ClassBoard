export function obtenerAulas(aulas) {
  return aulas;
}

//Obtener solamente las tareas pendientes
export function obtenerTareasPendientes(tareas) {
  return tareas.filter((tarea) => tarea.estado === "pendiente");
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

function mostrarTareasPendientes(tareas) {
  const listaTareas = document.querySelector("#lista-tareas");

  if (!listaTareas) return;

  listaTareas.replaceChildren();

  obtenerTareasPendientes(tareas).forEach((tarea) => {
    const elemento = document.createElement("li");
    elemento.textContent = tarea.titulo;
    listaTareas.appendChild(elemento);
  });
}

// Datos de ejemplo
const aulasDelUsuario = [
  { id: 1, nombre: "Sistemas de Información 2" },
  { id: 2, nombre: "Programación Web" }
];

const tareasDelUsuario = [
  { id: 1, titulo: "Investigar XP", estado: "pendiente" },
  { id: 2, titulo: "Entregar práctica", estado: "completada" },
  { id: 3, titulo: "Estudiar TDD", estado: "pendiente" }
];

if (typeof document !== "undefined") {
  mostrarAulas(aulasDelUsuario);
  mostrarTareasPendientes(tareasDelUsuario);
}