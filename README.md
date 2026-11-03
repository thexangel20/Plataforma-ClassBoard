# Plataforma-ClassBoard

Plataforma web colaborativa para la gestión del aula.

## Registro de dudas académicas

Esta entrega agrega la lógica inicial para que estudiantes registren preguntas sobre temas estudiados y docentes puedan responderlas. La historia de usuario, los criterios de aceptación, las tarjetas CRC y el ciclo TDD están en [docs/hu-registro-dudas.md](docs/hu-registro-dudas.md).

La lógica está en **dudas.py** y las pruebas automatizadas usan la biblioteca estándar de Python. Para ejecutarlas desde la raíz del repositorio:

    python -m unittest discover -s tests -v

El repositorio todavía no contiene la aplicación web ni una base de datos. Por eso, esta implementación conserva las dudas en memoria y queda lista para conectarse cuando se incorpore la estructura real de la aplicación.
