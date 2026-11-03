# HU: Registro de dudas académicas

## Historia de usuario

**Como** estudiante universitario,  
**quiero** registrar preguntas sobre temas vistos en clase o durante el estudio, como XP, Scrum, TDD, tarjetas CRC, Pair Programming y Proceso Unificado,  
**para** organizar mis inquietudes, pedir aclaraciones al docente y consultar las respuestas para mejorar mi comprensión.

## Criterios de aceptación

1. El estudiante puede consultar los temas disponibles y registrar un tema nuevo.
2. El estudiante puede enviar una duda con un tema y una pregunta.
3. No se registran preguntas vacías ni formadas solo por espacios.
4. El docente puede consultar las dudas registradas.
5. El docente puede responder una duda pendiente.
6. El estudiante puede consultar la respuesta guardada.
7. Cada duda muestra el estado pendiente o respondida.

## Tarjetas CRC

### CRC 1 — Duda

| Responsabilidades | Colaboradores |
| --- | --- |
| Guardar identificador, tema, pregunta y estudiante. | GestorDudas |
| Mantener el estado de la duda. | |
| Guardar la respuesta y el docente que respondió. | |

### CRC 2 — GestorDudas

| Responsabilidades | Colaboradores |
| --- | --- |
| Validar que tema, pregunta, estudiante, respuesta y docente no estén vacíos. | Duda |
| Registrar y listar temas. | |
| Registrar dudas y asignar identificadores. | |
| Listar dudas y filtrar por estado. | |
| Guardar la respuesta y marcar la duda como respondida. | |
| Consultar una duda por identificador. | |

## Pruebas TDD

Las pruebas están en tests/test_dudas.py y se ejecutan sin dependencias adicionales:

    python -m unittest discover -s tests -v

| Criterio | Prueba |
| --- | --- |
| 1 | Consultar el catálogo y agregar un tema |
| 2 y 7 | Registrar una duda y comprobar su estado inicial pendiente |
| 3 | Rechazar una pregunta vacía o con espacios |
| 4 | Listar las dudas registradas |
| 5 y 7 | Responder una duda y verificar el cambio de estado |
| 6 | Consultar una duda respondida |
| 7 | Filtrar dudas pendientes y respondidas |
| Validación de apoyo | Rechazar respuestas vacías y búsquedas de IDs inexistentes |

### Ciclo RED–GREEN–REFACTOR aplicado

1. **RED:** se escribieron las pruebas antes de dudas.py; al ejecutarlas, fallaron porque todavía no existía el módulo.
2. **GREEN:** se implementaron Duda y GestorDudas para satisfacer los comportamientos comprobados.
3. **REFACTOR:** se agruparon las validaciones de texto en _texto_obligatorio y se representó el estado con EstadoDuda, manteniendo las pruebas verdes.

## Alcance de esta entrega

El repositorio actualmente solo contiene un README y no incluye el código de la aplicación web ni una base de datos. La implementación de dudas.py es una capa de dominio funcional que guarda datos en memoria; su conexión con pantallas, usuarios autenticados y persistencia queda pendiente de incorporar la estructura real de la aplicación.
