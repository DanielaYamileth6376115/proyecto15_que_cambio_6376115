PROMPT 1:

Creá el archivo src/logica.ts con las reglas de ¿QUÉ CAMBIÓ?, según la ficha de abajo.

REGLAS TÉCNICAS, obligatorias:
- TypeScript. Exportá los tipos y el objeto CONFIG con todos los números juntos arriba, cada uno con un comentario que diga su unidad.
- Este archivo NO puede tocar la pantalla: nada de document, window, alert ni console.log. Solo datos y funciones sobre el estado.
- Cada función que cambia el estado devuelve true si la acción fue válida y false si no se pudo hacer.
- Si hace falta azar, usá un generador con semilla y exportalo, para que la misma semilla dé siempre el mismo resultado.
- Código y comentarios en español.

REGLAS DE TRABAJO:
- Hacé exactamente lo que dice la ficha. Nada más.
- Si algo es ambiguo o imposible, paralo y preguntame antes de inventar.
- Al terminar, listame qué dejaste fuera y qué decidiste vos donde la ficha no decía nada.

FICHA:
- Nombre del proyecto: ¿Qué Cambió? - Desafío Visual
- En una frase: Encontrar las diferencias entre dos cuadrículas casi idénticas antes de que se agote el tiempo.
- Para quién es: Para cualquier persona que quiera poner a prueba su memoria y atención.
- Qué logra: Entrenar la memoria de trabajo y agilidad visual.
- Los tres verbos: 1. Observar, 2. Seleccionar, 3. Comparar.
- Termina bien si: El jugador identifica todas las celdas diferentes dentro del tiempo límite.
- Termina mal si: El tiempo se agota antes de hallar las diferencias o supera el límite de fallos permitidos.
- Qué se ve en pantalla: Dos cuadrículas (Matriz A y Matriz B), el temporizador descendente y la puntuación/nivel actual.
- Controles: Teclado (flechas y Enter/Espacio) y Dedo/Táctil.
- Colores y qué significan: Azul/Cian (Celdas/Interfaz), Verde (Acierto), Rojo (Error), Oscuro (Fondo).
- Criterio de aceptación: 
  1. Inicio el juego y veo dos cuadrículas parecidas.
  2. Toco la celda que creo que cambió en la segunda matriz.
  3. Si acierto, se marca en verde y sube el puntaje.
  4. Si encuentro todas las diferencias antes de que el reloj llegue a cero, gano e incremento el nivel.
- Lo que no va: Sin imágenes pesadas, sin sonido de fondo, sin librerías de UI externas.