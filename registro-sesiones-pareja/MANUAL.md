# Manual de usuario: Registro de sesiones de programación por parejas

Versión 1.2

## 1. Qué hace el sistema

Sirve para documentar cada sesión de Pair Programming: cuándo se trabajó, en qué ejercicio, cuánto duró, qué se observó, qué decisiones se tomaron y qué mejoras quedaron pendientes o resueltas.

## 2. Cómo abrirlo

Abre el archivo **index.html** dentro de la carpeta **registro-sesiones-pareja**. Se abre en el navegador. No necesita instalación ni conexión a internet.

Los datos se guardan en el propio navegador. Si quieres una copia de seguridad, usa la función de exportación (sección 6).

## 3. Pantalla "Nueva sesión"

Al guardar, el sistema asigna un **código de sesión** con el formato PP-AAAAMMDD-XXXX (por ejemplo, PP-20261104-3PB1). El código identifica cada sesión en el detalle, el historial, la tabla CSV y el respaldo JSON, y tiene el mismo formato que el utilizado en el módulo de control de roles.


Aquí se registra una sesión nueva.

**Datos de la sesión:**
- **Fecha:** viene con la fecha de hoy. Puedes cambiarla.
- **Duración (minutos):** se escribe manualmente. Es obligatoria y debe ser mayor que 0.
- **Ejercicio trabajado:** nombre o descripción del ejercicio.
- **Integrante 1 y 2:** nombres de los dos integrantes. Deben ser distintos. Si ya registraste una sesión, los nombres aparecen prellenados con los de la última.

Pulsa **Guardar sesión**. El sistema abre el detalle de la sesión para que agregues entradas.

**Cronómetro de apoyo (opcional):**
- **Iniciar cronómetro:** empieza a contar.
- **Pausar:** detiene el conteo. El botón cambia a **Reanudar**.
- **Detener:** termina el cronómetro.
- **Reiniciar:** lo vuelve a cero.
- **Usar este tiempo como duración:** copia el tiempo medido al campo de duración, redondeado a minutos.

El cronómetro no guarda nada por sí solo. Siempre debes revisar el dato y guardar la sesión.

## 4. Detalle de una sesión

Se abre al guardar una sesión o desde el historial con **Ver detalle**.

**Encabezado:** muestra ejercicio, fecha, duración, integrantes, número de entradas y cuántas mejoras están pendientes.

**Editar duración:** pulsa **Editar duración**, escribe el nuevo valor en minutos y pulsa **Guardar duración**. Para salir sin cambios, pulsa **Cancelar**.

**Agregar entrada:**
1. Elige el **tipo**: Observación, Decisión o Mejora identificada.
2. Elige quién la **registra** (uno de los dos integrantes).
3. Escribe la **descripción**.
4. Pulsa **Agregar entrada**.

Puedes agregar tantas entradas como necesites en la misma sesión.

**Listas:** las entradas se separan en tres bloques: Observaciones, Decisiones y Mejoras identificadas. Cada una muestra su descripción, quién la registró y la fecha y hora. Si una entrada fue editada, aparece la leyenda "editada" con la fecha del cambio.

**Editar una entrada:** pulsa **Editar**. Puedes cambiar el tipo, quién la registró y la descripción. Pulsa **Guardar cambios** para confirmar o **Cancelar** para descartar. Si cambias una entrada a tipo Mejora, se crea como Pendiente; si cambias una mejora a otro tipo, pierde su estado.

**Estado de las mejoras:** solo las mejoras tienen estado.
- Se crean como **Pendiente**.
- El botón **Marcar resuelta** cambia el estado a Resuelta, y **Marcar pendiente** lo regresa.
- Las observaciones y decisiones no tienen estado.

**Eliminar entrada:** borra la entrada después de confirmarlo.

**Código de sesión:** aparece en el encabezado del detalle.

**Eliminar esta sesión:** borra la sesión completa y todas sus entradas. Pide confirmación y no se puede deshacer.

## 5. Pantalla "Historial"

Muestra todas las sesiones, de la más reciente a la más antigua. Cada una indica fecha, duración, integrantes, número de entradas y cuántas mejoras están pendientes o resueltas.

**Filtros:**
- **Buscar:** busca texto en el ejercicio, en los nombres de los integrantes y en las descripciones de las entradas.
- **Integrante:** muestra solo las sesiones de una persona.
- **Mejoras:** puede mostrar todas las sesiones, solo las que tienen mejoras pendientes, o solo las que tienen mejoras resueltas.
- **Desde / Hasta:** filtra por rango de fechas.
- **Limpiar filtros:** restablece todos los filtros.

Los resultados se actualizan al escribir o cambiar un filtro.

## 6. Exportar el historial

En la pantalla Historial hay dos botones:

- **Exportar respaldo (JSON):** guarda todas las sesiones, entradas y estados en un archivo JSON. Sirve como copia de seguridad completa.
- **Exportar tabla (CSV):** genera un archivo que se abre en Excel o Hojas de cálculo. Tiene una fila por entrada, con los datos de la sesión repetidos en cada fila, incluido el código de sesión como primera columna.

Los archivos se descargan a la carpeta de descargas de tu equipo, con la fecha en el nombre. La exportación exporta todas las sesiones, no solo las que muestran los filtros.

## 7. Confirmación al cerrar

Si intentas cerrar o recargar la página mientras hay datos sin guardar, el navegador muestra un aviso para que confirmes la salida. Esto ocurre cuando:
- Escribiste un ejercicio o una duración en el formulario de nueva sesión y no guardaste.
- Escribiste una descripción de entrada y no la agregaste.
- Tienes una edición de entrada o de duración abierta.
- El cronómetro está en marcha o en pausa.

Si confirmas, los datos no guardados se pierden. Las sesiones ya guardadas no se ven afectadas.

## 8. Buenas prácticas

- Registra la sesión al terminarla, mientras los detalles están frescos.
- Escribe las mejoras como acciones concretas, por ejemplo "Refactorizar calcular() en dos funciones", para que sean fáciles de dar seguimiento.
- Marca una mejora como resuelta solo cuando realmente se haya aplicado.
- Exporta el respaldo JSON de vez en cuando, sobre todo antes de limpiar el navegador.

## 9. Preguntas frecuentes

**¿Se pierden los datos si cierro la página?**
No. Las sesiones, entradas y estados de mejoras se guardan en el navegador. Sí se pierden si borras los datos del navegador o si abres la página en otro navegador o equipo, porque cada navegador guarda los suyos. Por eso conviene exportar un respaldo.

**¿Se pierde el cronómetro si recargo la página?**
Sí. El cronómetro no se guarda. Si lo necesitas, anota el tiempo antes de recargar.

**¿Puedo importar un respaldo JSON?**
No en esta versión. El JSON sirve como copia de seguridad, pero el sistema todavía no lo puede volver a cargar.

**¿Puedo cambiar el nombre de un integrante en todas sus sesiones?**
No de una vez. Hay que editar cada sesión, o registrar las nuevas con el nombre correcto.

**¿Este sistema se mezcla con el de control de roles?**
No. Usan almacenamientos separados, así que ninguno afecta al otro.
