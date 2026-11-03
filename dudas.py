"""Lógica de dominio para registrar y responder dudas académicas."""

from dataclasses import dataclass
from enum import Enum


class EstadoDuda(str, Enum):
    """Estados posibles de una duda académica."""

    PENDIENTE = "pendiente"
    RESPONDIDA = "respondida"


def _texto_obligatorio(valor: str, campo: str) -> str:
    if not isinstance(valor, str) or not valor.strip():
        raise ValueError(f"El campo {campo} es obligatorio.")
    return valor.strip()


@dataclass(slots=True)
class Duda:
    """Una pregunta de un estudiante y, si existe, su respuesta docente."""

    id: int
    tema: str
    pregunta: str
    estudiante: str
    estado: EstadoDuda = EstadoDuda.PENDIENTE
    respuesta: str | None = None
    docente: str | None = None


class GestorDudas:
    """Administra temas y dudas en memoria para esta primera entrega."""

    def __init__(self, temas: list[str] | tuple[str, ...] | None = None) -> None:
        self._temas: list[str] = []
        self._dudas: dict[int, Duda] = {}
        self._siguiente_id = 1
        for tema in temas or ():
            self.registrar_tema(tema)

    def registrar_tema(self, tema: str) -> str:
        """Añade un tema nuevo o devuelve el existente sin duplicarlo."""
        tema_limpio = _texto_obligatorio(tema, "tema")
        for tema_existente in self._temas:
            if tema_existente.casefold() == tema_limpio.casefold():
                return tema_existente
        self._temas.append(tema_limpio)
        return tema_limpio

    def listar_temas(self) -> tuple[str, ...]:
        """Devuelve los temas disponibles en el orden en que se registraron."""
        return tuple(self._temas)

    def registrar(self, tema: str, pregunta: str, estudiante: str) -> Duda:
        """Registra una duda; los temas nuevos se incorporan al catálogo."""
        tema_limpio = _texto_obligatorio(tema, "tema")
        pregunta_limpia = _texto_obligatorio(pregunta, "pregunta")
        estudiante_limpio = _texto_obligatorio(estudiante, "estudiante")
        tema_limpio = self.registrar_tema(tema_limpio)

        duda = Duda(
            id=self._siguiente_id,
            tema=tema_limpio,
            pregunta=pregunta_limpia,
            estudiante=estudiante_limpio,
        )
        self._dudas[duda.id] = duda
        self._siguiente_id += 1
        return duda

    def listar_dudas(self, estado: EstadoDuda | None = None) -> tuple[Duda, ...]:
        """Lista todas las dudas o las que coinciden con un estado."""
        dudas = self._dudas.values()
        if estado is not None:
            dudas = (duda for duda in dudas if duda.estado is estado)
        return tuple(dudas)

    def responder(self, duda_id: int, respuesta: str, docente: str) -> Duda:
        """Guarda la respuesta docente y cambia el estado a respondida."""
        respuesta_limpia = _texto_obligatorio(respuesta, "respuesta")
        docente_limpio = _texto_obligatorio(docente, "docente")
        duda = self.consultar(duda_id)
        if duda.estado is EstadoDuda.RESPONDIDA:
            raise ValueError(f"La duda {duda_id} ya fue respondida.")

        duda.respuesta = respuesta_limpia
        duda.docente = docente_limpio
        duda.estado = EstadoDuda.RESPONDIDA
        return duda

    def consultar(self, duda_id: int) -> Duda:
        """Busca una duda por identificador; falla si no existe."""
        try:
            return self._dudas[duda_id]
        except KeyError as error:
            raise KeyError(f"No existe la duda con id {duda_id}.") from error
