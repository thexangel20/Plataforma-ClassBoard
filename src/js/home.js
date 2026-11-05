export function obtenerAulas(aulas) {
  return aulas;
}

//Obtener solamente las tareas pendientes
export function obtenerTareasPendientes(tareas) {
  return tareas.filter((tarea) => tarea.estado === "pendiente");
}

//Ordenar tareas por fecha límite
export function ordenarTareasPorFecha(tareas) {
  return [...tareas].sort((a, b) => {
    return new Date(a.fechaLimite) - new Date(b.fechaLimite);
  });
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

  ordenarTareasPorFecha(
    obtenerTareasPendientes(tareas)
  ).forEach((tarea) => {
    const elemento = document.createElement("li");
    elemento.textContent = `${tarea.titulo} - Fecha límite: ${tarea.fechaLimite}`;
    listaTareas.appendChild(elemento);
  });
}

// Datos de ejemplo
const aulasDelUsuario = [
  { id: 1, nombre: "Sistemas de Información 2" },
  { id: 2, nombre: "Programación Web" }
];

const tareasDelUsuario = [
  {
    id: 1,
    titulo: "Investigar XP",
    estado: "pendiente",
    fechaLimite: "2026-11-15"
  },
  {
    id: 2,
    titulo: "Entregar práctica",
    estado: "completada",
    fechaLimite: "2026-11-08"
  },
  {
    id: 3,
    titulo: "Estudiar TDD",
    estado: "pendiente",
    fechaLimite: "2026-11-12"
  },
  {
    id: 4,
    titulo: "Preparar exposición",
    estado: "pendiente",
    fechaLimite: "2026-11-08"
  }
];

if (typeof document !== "undefined") {
  mostrarAulas(aulasDelUsuario);
  mostrarTareasPendientes(tareasDelUsuario);
}