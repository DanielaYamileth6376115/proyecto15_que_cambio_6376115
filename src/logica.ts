export type ColorCelda = 'azul' | 'cian';
export type EstadoPartida = 'jugando' | 'victoria' | 'derrota';
export type Direccion = 'arriba' | 'abajo' | 'izquierda' | 'derecha';
export type ResultadoIntento = 'acierto' | 'error' | null;

export interface Coordenada {
  fila: number;
  columna: number;
}

export interface EstadoJuego {
  matrizA: ColorCelda[][];
  matrizB: ColorCelda[][];
  diferencias: boolean[][];
  diferenciasEncontradas: boolean[][];
  filaSeleccionada: number;
  columnaSeleccionada: number;
  segundosRestantes: number;
  fallos: number;
  puntuacion: number;
  nivel: number;
  estado: EstadoPartida;
  ultimoResultado: ResultadoIntento;
  ultimaCeldaIncorrecta: Coordenada | null;
  semilla: number;
}

export const CONFIG = {
  FILAS: 4, // filas
  COLUMNAS: 4, // columnas
  TIEMPO_INICIAL_SEGUNDOS: 60, // segundos
  FALLOS_MAXIMOS: 3, // fallos
  PUNTOS_POR_ACIERTO: 10, // puntos
  DIFERENCIAS_INICIALES: 1, // diferencias
  DIFERENCIAS_POR_NIVEL: 1, // diferencias por nivel
  DIFERENCIAS_MAXIMAS: 15, // diferencias
  NIVEL_MAXIMO: 10, // niveles
} as const;

type DatosRonda = Pick<EstadoJuego, 'matrizA' | 'matrizB' | 'diferencias' | 'diferenciasEncontradas'>;

const COLORES: ColorCelda[] = ['azul', 'cian'];

export function crearGeneradorAleatorio(semilla: number): () => number {
  let estado = semilla >>> 0;

  return () => {
    estado = (Math.imul(1664525, estado) + 1013904223) >>> 0;
    return estado / 0x100000000;
  };
}

function obtenerCantidadDiferencias(nivel: number): number {
  return Math.min(
    CONFIG.DIFERENCIAS_INICIALES + (nivel - 1) * CONFIG.DIFERENCIAS_POR_NIVEL,
    CONFIG.DIFERENCIAS_MAXIMAS,
  );
}

function crearRonda(semilla: number, nivel: number): DatosRonda {
  const aleatorio = crearGeneradorAleatorio((semilla + nivel - 1) >>> 0);
  const matrizA = Array.from({ length: CONFIG.FILAS }, () =>
    Array.from({ length: CONFIG.COLUMNAS }, () => COLORES[Math.floor(aleatorio() * COLORES.length)]),
  );
  const matrizB = matrizA.map((fila) => [...fila]);
  const diferencias = Array.from({ length: CONFIG.FILAS }, () =>
    Array.from({ length: CONFIG.COLUMNAS }, () => false),
  );
  const posiciones = Array.from({ length: CONFIG.FILAS * CONFIG.COLUMNAS }, (_, indice) => indice);

  for (let indice = posiciones.length - 1; indice > 0; indice -= 1) {
    const otraPosicion = Math.floor(aleatorio() * (indice + 1));
    [posiciones[indice], posiciones[otraPosicion]] = [posiciones[otraPosicion], posiciones[indice]];
  }

  const cantidadDiferencias = obtenerCantidadDiferencias(nivel);
  for (let indice = 0; indice < cantidadDiferencias; indice += 1) {
    const posicion = posiciones[indice];
    const fila = Math.floor(posicion / CONFIG.COLUMNAS);
    const columna = posicion % CONFIG.COLUMNAS;
    diferencias[fila][columna] = true;
    matrizB[fila][columna] = matrizA[fila][columna] === 'azul' ? 'cian' : 'azul';
  }

  return {
    matrizA,
    matrizB,
    diferencias,
    diferenciasEncontradas: Array.from({ length: CONFIG.FILAS }, () =>
      Array.from({ length: CONFIG.COLUMNAS }, () => false),
    ),
  };
}

export function crearEstadoInicial(semilla: number): EstadoJuego {
  const semillaNormalizada = semilla >>> 0;
  return {
    ...crearRonda(semillaNormalizada, 1),
    filaSeleccionada: 0,
    columnaSeleccionada: 0,
    segundosRestantes: CONFIG.TIEMPO_INICIAL_SEGUNDOS,
    fallos: 0,
    puntuacion: 0,
    nivel: 1,
    estado: 'jugando',
    ultimoResultado: null,
    ultimaCeldaIncorrecta: null,
    semilla: semillaNormalizada,
  };
}

export function moverSeleccion(estado: EstadoJuego, direccion: Direccion): boolean {
  if (estado.estado !== 'jugando') return false;

  const movimientos: Record<Direccion, Coordenada> = {
    arriba: { fila: -1, columna: 0 },
    abajo: { fila: 1, columna: 0 },
    izquierda: { fila: 0, columna: -1 },
    derecha: { fila: 0, columna: 1 },
  };
  const movimiento = movimientos[direccion];
  const nuevaFila = estado.filaSeleccionada + movimiento.fila;
  const nuevaColumna = estado.columnaSeleccionada + movimiento.columna;

  if (
    nuevaFila < 0 || nuevaFila >= CONFIG.FILAS ||
    nuevaColumna < 0 || nuevaColumna >= CONFIG.COLUMNAS
  ) {
    return false;
  }

  estado.filaSeleccionada = nuevaFila;
  estado.columnaSeleccionada = nuevaColumna;
  return true;
}

export function intentarCelda(estado: EstadoJuego, fila: number, columna: number): boolean {
  if (
    estado.estado !== 'jugando' ||
    !Number.isInteger(fila) || !Number.isInteger(columna) ||
    fila < 0 || fila >= CONFIG.FILAS || columna < 0 || columna >= CONFIG.COLUMNAS ||
    estado.diferenciasEncontradas[fila][columna]
  ) {
    return false;
  }

  estado.filaSeleccionada = fila;
  estado.columnaSeleccionada = columna;

  if (estado.diferencias[fila][columna]) {
    estado.diferenciasEncontradas[fila][columna] = true;
    estado.puntuacion += CONFIG.PUNTOS_POR_ACIERTO;
    estado.ultimoResultado = 'acierto';
    estado.ultimaCeldaIncorrecta = null;

    const rondaCompleta = estado.diferencias.every((filaDiferencias, indiceFila) =>
      filaDiferencias.every((esDiferencia, indiceColumna) =>
        !esDiferencia || estado.diferenciasEncontradas[indiceFila][indiceColumna],
      ),
    );

    if (rondaCompleta) {
      const cantidadDiferencias = obtenerCantidadDiferencias(estado.nivel);
      if (estado.nivel >= CONFIG.NIVEL_MAXIMO || cantidadDiferencias >= CONFIG.DIFERENCIAS_MAXIMAS) {
        estado.estado = 'victoria';
      } else {
        estado.nivel += 1;
        Object.assign(estado, crearRonda(estado.semilla, estado.nivel));
        estado.filaSeleccionada = 0;
        estado.columnaSeleccionada = 0;
        estado.segundosRestantes = CONFIG.TIEMPO_INICIAL_SEGUNDOS;
        estado.fallos = 0;
        estado.ultimaCeldaIncorrecta = null;
      }
    }
  } else {
    estado.fallos += 1;
    estado.ultimoResultado = 'error';
    estado.ultimaCeldaIncorrecta = { fila, columna };
    if (estado.fallos >= CONFIG.FALLOS_MAXIMOS) estado.estado = 'derrota';
  }

  return true;
}

export function confirmarSeleccion(estado: EstadoJuego): boolean {
  return intentarCelda(estado, estado.filaSeleccionada, estado.columnaSeleccionada);
}

export function avanzarTiempo(estado: EstadoJuego, segundos = 1): boolean {
  if (
    estado.estado !== 'jugando' ||
    !Number.isInteger(segundos) || segundos <= 0
  ) {
    return false;
  }

  estado.segundosRestantes = Math.max(0, estado.segundosRestantes - segundos);
  if (estado.segundosRestantes === 0) estado.estado = 'derrota';
  return true;
}