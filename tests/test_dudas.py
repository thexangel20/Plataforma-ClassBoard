import unittest

from dudas import EstadoDuda, GestorDudas


class GestorDudasTests(unittest.TestCase):
    def test_estudiante_puede_consultar_y_registrar_temas(self):
        gestor = GestorDudas(temas=["XP", "TDD"])

        self.assertEqual(gestor.listar_temas(), ("XP", "TDD"))
        self.assertEqual(gestor.registrar_tema("Pair Programming"), "Pair Programming")
        self.assertIn("Pair Programming", gestor.listar_temas())

    def test_estudiante_registra_una_duda_pendiente(self):
        gestor = GestorDudas(temas=["Scrum"])

        duda = gestor.registrar("Scrum", "¿Qué es un Sprint?", "Estudiante 1")

        self.assertEqual(duda.tema, "Scrum")
        self.assertEqual(duda.pregunta, "¿Qué es un Sprint?")
        self.assertEqual(duda.estudiante, "Estudiante 1")
        self.assertIs(duda.estado, EstadoDuda.PENDIENTE)
        self.assertIsNone(duda.respuesta)

    def test_no_registra_preguntas_vacias(self):
        gestor = GestorDudas()

        for pregunta in ("", "   ", "\n\t"):
            with self.subTest(pregunta=pregunta):
                with self.assertRaisesRegex(ValueError, "pregunta"):
                    gestor.registrar("TDD", pregunta, "Estudiante 1")

        self.assertEqual(gestor.listar_dudas(), ())
        self.assertEqual(gestor.listar_temas(), ())

    def test_docente_puede_ver_las_dudas_registradas(self):
        gestor = GestorDudas()
        primera = gestor.registrar("TDD", "¿Qué significa RED?", "Ana")
        segunda = gestor.registrar("XP", "¿Qué es Pair Programming?", "Luis")

        self.assertEqual(gestor.listar_dudas(), (primera, segunda))

    def test_docente_responde_y_el_estado_cambia_a_respondida(self):
        gestor = GestorDudas()
        duda = gestor.registrar("TDD", "¿Qué significa RED?", "Ana")

        respondida = gestor.responder(
            duda.id, "Escribir primero una prueba que falla.", "Docente"
        )

        self.assertEqual(respondida.respuesta, "Escribir primero una prueba que falla.")
        self.assertEqual(respondida.docente, "Docente")
        self.assertIs(respondida.estado, EstadoDuda.RESPONDIDA)

    def test_estudiante_puede_consultar_la_respuesta_del_docente(self):
        gestor = GestorDudas()
        duda = gestor.registrar("CRC", "¿Qué significa colaborador?", "Ana")
        gestor.responder(duda.id, "Una clase que ayuda a otra.", "Docente")

        consulta = gestor.consultar(duda.id)

        self.assertEqual(consulta.respuesta, "Una clase que ayuda a otra.")
        self.assertIs(consulta.estado, EstadoDuda.RESPONDIDA)

    def test_puede_listar_dudas_pendientes_y_respondidas(self):
        gestor = GestorDudas()
        pendiente = gestor.registrar("XP", "¿Qué es XP?", "Ana")
        respondida = gestor.registrar("TDD", "¿Qué es GREEN?", "Luis")
        gestor.responder(respondida.id, "Hacer pasar la prueba.", "Docente")

        self.assertEqual(gestor.listar_dudas(EstadoDuda.PENDIENTE), (pendiente,))
        self.assertEqual(gestor.listar_dudas(EstadoDuda.RESPONDIDA), (respondida,))

    def test_rechaza_respuestas_vacias_y_dudas_inexistentes(self):
        gestor = GestorDudas()
        duda = gestor.registrar("TDD", "¿Qué es REFACTOR?", "Ana")

        with self.assertRaisesRegex(ValueError, "respuesta"):
            gestor.responder(duda.id, "  ", "Docente")
        with self.assertRaisesRegex(KeyError, "999"):
            gestor.consultar(999)


if __name__ == "__main__":
    unittest.main()
