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

//Obtener los avisos recientes
export function obtenerAvisosRecientes(avisos) {
  return avisos;
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

// T06: Mostrar los avisos recientes en el panel
function mostrarAvisosRecientes(avisos) {
  const listaAvisos = document.querySelector("#lista-avisos");

  if (!listaAvisos) return;

  listaAvisos.replaceChildren();

  obtenerAvisosRecientes(avisos).forEach((aviso) => {
    const elemento = document.createElement("li");

    const titulo = document.createElement("h3");
    titulo.textContent = aviso.titulo;

    const contenido = document.createElement("p");
    contenido.textContent = aviso.contenido;

    const fecha = document.createElement("small");
    fecha.textContent = `Publicado: ${aviso.fecha}`;

    elemento.appendChild(titulo);
    elemento.appendChild(contenido);
    elemento.appendChild(fecha);

    listaAvisos.appendChild(elemento);
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

const avisosDelUsuario = [
  {
    id: 1,
    titulo: "Cambio de horario",
    contenido: "La clase del viernes será a las 10:00.",
    fecha: "2026-11-04"
  },
  {
    id: 2,
    titulo: "Material disponible",
    contenido: "Ya está disponible el material de estudio.",
    fecha: "2026-11-03"
  },
  {
    id: 3,
    titulo: "Recordatorio de evaluación",
    contenido: "La próxima semana se realizará una evaluación.",
    fecha: "2026-11-02"
  }
];

if (typeof document !== "undefined") {
  mostrarAulas(aulasDelUsuario);
  mostrarTareasPendientes(tareasDelUsuario);
  mostrarAvisosRecientes(avisosDelUsuario);
}