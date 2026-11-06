// HU-01 — ClassBoard. Reglas del prototipo, sin base de datos ni autenticación real.
export function validarContenido(tipo, contenido) {
  if (tipo === 'texto') {
    if (typeof contenido !== 'string' || !contenido.trim()) {
      throw new Error('El contenido no puede estar vacío');
    }
    return contenido.trim();
  }
  if (tipo === 'enlace') {
    if (typeof contenido !== 'string' || !contenido.trim()) {
      throw new Error('Enlace inválido');
    }
    try {
      const enlace = new URL(contenido.trim());
      if (!['http:', 'https:'].includes(enlace.protocol) || !enlace.hostname) {
        throw new Error('Enlace inválido');
      }
      return enlace.href;
    } catch {
      throw new Error('Enlace inválido');
    }
  }
  if (tipo === 'archivo') {
    // Desde un navegador se recibe un File seleccionado por el usuario.
    // Solo se registra su metadata en esta demostración; NO se suben los bytes.
    const nombre = contenido?.name ?? contenido?.nombre;
    const tamano = contenido?.size ?? contenido?.tamano;
    if (typeof nombre !== 'string' || !nombre.trim() ||
        !Number.isSafeInteger(tamano) || tamano < 0) {
      throw new Error('Archivo inválido: selecciona un archivo existente');
    }
    return { nombre: nombre.trim(), tamano };
  }
  throw new Error('Tipo de entrega no soportado');
}

// Esta función conserva las pruebas TDD que realizaron en las fases anteriores.
export function registrarEntrega({ estudianteId, tareaId, tipo, contenido } = {}) {
  if (!estudianteId || !tareaId) {
    throw new Error('Estudiante y tarea son obligatorios');
  }
  return {
    estudianteId,
    tareaId,
    tipo,
    contenido: validarContenido(tipo, contenido)
  };
}

function codigo(texto) {
  return typeof texto === 'string' ? texto.trim() : '';
}
function fechaValida(fecha) {
  const d = new Date(fecha);
  if (!Number.isFinite(d.getTime())) throw new Error('Fecha límite inválida');
  return d;
}

export class GestorEntregas {
  constructor({ materias = [], tareas = [], ahora = () => new Date() } = {}) {
    this.materias = new Map();
    this.tareas = new Map();
    this.entregas = new Map();
    this.ahora = ahora;
    for (const m of materias) {
      if (!codigo(m.codigo) || !codigo(m.docenteId) || !Array.isArray(m.inscritos)) {
        throw new Error('Materia inválida');
      }
      this.materias.set(m.codigo, { ...m, inscritos: [...m.inscritos] });
    }
    for (const t of tareas) {
      if (!codigo(t.codigo) || !this.materias.has(t.materiaId)) {
        throw new Error('Tarea inválida o materia inexistente');
      }
      fechaValida(t.limiteUTC);
      this.tareas.set(t.codigo, { ...t });
    }
  }

  _tarea(tareaId) {
    const tarea = this.tareas.get(tareaId);
    if (!tarea) throw new Error('La tarea no existe');
    return tarea;
  }

  _materiaDe(tarea) {
    return this.materias.get(tarea.materiaId);
  }

  _verificarInscripcion(estudianteId, tarea) {
    if (!this._materiaDe(tarea).inscritos.includes(estudianteId)) {
      throw new Error('Estudiante no inscrito en la materia');
    }
  }

  _verificarDocente(docenteId, tarea) {
    if (this._materiaDe(tarea).docenteId !== docenteId) {
      throw new Error('Docente no autorizado');
    }
  }

  _clave(estudianteId, tareaId) {
    return JSON.stringify([estudianteId, tareaId]);
  }

  // ET-01: cada estudiante ve las tareas de sus materias.
  listarTareas(estudianteId) {
    return [...this.tareas.values()]
      .filter(t => this._materiaDe(t).inscritos.includes(estudianteId))
      .map(t => ({ ...t }));
  }

  // ET-02/03/04/05 y regla extra de no duplicar entregas.
  enviar({ estudianteId, tareaId, tipo, contenido } = {}) {
    const tarea = this._tarea(tareaId);
    this._verificarInscripcion(estudianteId, tarea);
    const clave = this._clave(estudianteId, tareaId);
    if (this.entregas.has(clave)) throw new Error('Ya existe una entrega de esta tarea');
    const datos = registrarEntrega({ estudianteId, tareaId, tipo, contenido });
    const fecha = this.ahora();
    if (!(fecha instanceof Date) || !Number.isFinite(fecha.getTime())) {
      throw new Error('Reloj inválido');
    }
    const entrega = {
      ...datos,
      fechaUTC: fecha.toISOString(),
      estado: fecha.getTime() <= fechaValida(tarea.limiteUTC).getTime() ? 'a tiempo' : 'tardía',
      nota: null,
      observacion: ''
    };
    this.entregas.set(clave, entrega);
    return { ...entrega };
  }

  // ET-06: el estudiante consulta únicamente su entrega.
  consultar(estudianteId, tareaId) {
    const e = this.entregas.get(this._clave(estudianteId, tareaId));
    return e ? { ...e } : null;
  }

  // ET-06: el docente autorizado ve y califica la entrega.
  verEntregas(docenteId, tareaId) {
    const tarea = this._tarea(tareaId);
    this._verificarDocente(docenteId, tarea);
    return [...this.entregas.values()]
      .filter(e => e.tareaId === tareaId)
      .map(e => ({ ...e }));
  }

  calificar({ docenteId, estudianteId, tareaId, nota, observacion } = {}) {
    const tarea = this._tarea(tareaId);
    this._verificarDocente(docenteId, tarea);
    if (typeof nota !== 'number' || !Number.isFinite(nota) || nota < 0 || nota > 20) {
      throw new Error('La nota debe ser un número de 0 a 20');
    }
    if (typeof observacion !== 'string' || !observacion.trim()) {
      throw new Error('La observación es obligatoria');
    }
    const clave = this._clave(estudianteId, tareaId);
    const entrega = this.entregas.get(clave);
    if (!entrega) throw new Error('La entrega no existe');
    entrega.nota = nota;
    entrega.observacion = observacion.trim();
    return { ...entrega };
  }
}
