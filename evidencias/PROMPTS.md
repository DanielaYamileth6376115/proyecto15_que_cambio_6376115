PROMPT 1: ARRANQUE · las reglas

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

La IA generó `src/logica.ts` con el objeto `CONFIG`, los tipos del estado del juego y las funciones para reiniciar, seleccionar celdas y verificar el tiempo.

PROMPT 2: PRUEBAS · que la máquina revise

Creá el archivo src/logica.test.ts para probar las reglas de src/logica.ts con Vitest.

REGLAS TÉCNICAS:
- Usá Vitest (import { describe, it, expect } from 'vitest').
- Probá los casos principales:
  1. Estado inicial del juego (nivel 1, tiempo inicial, puntuación en 0).
  2. Acierto: seleccionar la celda con diferencia suma puntos y la marca como encontrada.
  3. Error: seleccionar una celda sin diferencia descuenta un intento o vida.
  4. Victoria de nivel: encontrar todas las diferencias sube de nivel y reinicia el tablero.
  5. Derrota: agotar los intentos/tiempo cambia el estado a juego terminado.
  6. Determinismo: probar que usar la misma semilla genera el mismo tablero.

REGLAS DE TRABAJO:
- No modifiques src/logica.ts a menos que sea un error crítico.
- Código y comentarios en español.

- Resultado: La IA creó `src/logica.test.ts` cubriendo los casos de inicio, aciertos, fallos, cambio de nivel y semillas deterministas.

PROMPT 3: PANTALLA · que se vea

Creá la interfaz de usuario en src/main.ts y los estilos en src/style.css para ¿QUÉ CAMBIÓ? utilizando la lógica de src/logica.ts.

REGLAS TÉCNICAS Y DESIGN MOBILE-FIRST:
- Conectá toda la interfaz con las funciones de src/logica.ts.
- Renderizá las dos matrices (Matriz A y Matriz B), el temporizador, el nivel actual, el puntaje y los intentos/fallos.
- Diseño accesible para celular: elementos táctiles (celdas/botones) con tamaño mínimo de 44px x 44px, tamaño de fuente mínimo de 16px y 0 scroll horizontal.
- Soporte para controles: interacción táctil/clic en celdas y navegación por teclado (flechas para moverte, Enter/Espacio para seleccionar).
- Colores según la ficha: Azul/Cian para interfaz/celdas base, Verde para aciertos, Rojo para errores y fondo oscuro de alto contraste.
- Botón claro para reiniciar/jugar de nuevo al ganar o perder.

REGLAS DE TRABAJO:
- No modifiques src/logica.ts.
- Código y comentarios en español.

Resultado: Se implementó la interfaz visual, soporte táctil/teclado y estilos responsive.

PROMPT 4: Adaptación Móvil

Haz que esto funcione bien en un celular:

1. Todo lo que se toca tiene que medir al menos 44 píxeles de alto y de ancho.
2. Nada se sale de la pantalla a lo ancho: cero desplazamiento horizontal.
3. El texto nunca baja de 16 píxeles.
4. Funciona con el dedo (toque) y también con teclado, las dos cosas.
5. Agregá la etiqueta viewport en index.html si falta.

No cambies las reglas ni la dificultad. Decime qué ajustaste.

Resultado: Se ajustó `style.css` garantizando zonas táctiles de mínimo 44px, tipografía mínima de 16px, eliminación de anchos fijos para evitar scroll horizontal, y se confirmó la presencia del tag viewport en `index.html`.

PROMPT 4: los seis problemas típicos

evisá todo el proyecto buscando estos seis problemas, y decime cuáles tiene y en qué línea está cada uno:
1. Lógica metida dentro de main.ts.
2. Números sueltos fuera del objeto CONFIG.
3. Un final bueno al que no se pueda llegar: hacé el cálculo con los números reales.
4. Estado que no se reinicia bien al empezar de nuevo.
5. Variables o funciones que quedaron sin uso.
6. Alguna regla de mi ficha que las pruebas no cubran.

Solo el informe, numerado. TODAVÍA NO ARREGLES NADA.

Resultado: Copilot detectó números fuera de `CONFIG`, archivos/CSS sin uso (`counter.ts`, `--superficie`) y la falta de un test para verificar el estado de `victoria` al completar el último nivel.