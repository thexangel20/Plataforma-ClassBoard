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

### CRC 1 — Duda (registro JavaScript)

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
| Consultar y guardar el tablero en el almacenamiento local. | |
| Guardar la respuesta y marcar la duda como respondida. | |
| Buscar una duda por identificador para responder. | |

## Implementación y verificación

La interfaz en `web/index.html` permite agregar temas, publicar dudas,
filtrar por estado y consultar las respuestas. `web/classboard.js` valida
los datos y gestiona los cambios de estado. `web/interfaz.js` conecta los
formularios y aplica el filtro al tablero.

Para comprobar el flujo, registra un tema y una duda. Filtra por pendientes,
responde la duda, filtra por respondidas y recarga la página. La respuesta
debe seguir disponible. Prueba también un campo que contenga solo espacios:
el tablero debe quedar igual.

Las dudas se guardan en el navegador. Los nombres se usan como etiquetas de
autor, sin autenticación ni sincronización entre dispositivos.
