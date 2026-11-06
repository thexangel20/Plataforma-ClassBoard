# HU-01: Entrega de tareas — ClassBoard

Prototipo académico en HTML/CSS/JavaScript (módulos ES `.mjs`).

## Qué incluye
- ET-01: listar tareas de materias con estudiantes inscritos.
- ET-02: validar entregas de texto, enlace HTTP/HTTPS o archivo escogido por el usuario.
- ET-03: validar tarea existente y pertenencia a la materia.
- ET-04: fecha y hora de recepción en UTC.
- ET-05: marcar «a tiempo» o «tardía» según el límite; justo en el límite es a tiempo.
- ET-06: consulta propia y calificación de 0 a 20 por el identificador del docente asignado.
- Regla adicional: una entrega por estudiante y tarea.

## Ejecutar las pruebas
Desde la raíz de Plataforma-ClassBoard:
`node --test hu-01-entrega-tareas/entrega.test.mjs`

## Abrir la interfaz
Abrir `index.html` mediante la extensión Live Server de Visual Studio Code (servidor HTTP local).

## Límites
- Los datos solo están en memoria y se pierden al recargar la página.
- Seleccionar un archivo **no lo sube ni guarda**: este prototipo registra únicamente su nombre y tamaño.
- Los identificadores E01/E02/D01/D02 son ejemplos y no constituyen un inicio de sesión real.
- La lógica se comprueba automáticamente; las interacciones HTML/CSS se validan manualmente en navegador.
