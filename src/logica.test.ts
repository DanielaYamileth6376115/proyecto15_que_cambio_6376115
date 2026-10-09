import { describe, it, expect } from 'vitest';
import {
  avanzarTiempo,
  CONFIG,
  crearEstadoInicial,
  intentarCelda,
  type Coordenada,
  type EstadoJuego,
} from './logica';

function buscarCelda(estado: EstadoJuego, esDiferencia: boolean): Coordenada {
  for (let fila = 0; fila < CONFIG.FILAS; fila += 1) {
    for (let columna = 0; columna < CONFIG.COLUMNAS; columna += 1) {
      if (estado.diferencias[fila][columna] === esDiferencia) return { fila, columna };
    }
  }

  throw new Error('No se encontró una celda que coincida con el criterio.');
}

function contarDiferencias(estado: EstadoJuego): number {
  return estado.diferencias.flat().filter(Boolean).length;
}

describe('reglas del juego', () => {
  it('crea el estado inicial en nivel 1, con el tiempo y la puntuación iniciales', () => {
    const estado = crearEstadoInicial(123);

    expect(estado.nivel).toBe(1);
    expect(estado.segundosRestantes).toBe(CONFIG.TIEMPO_INICIAL_SEGUNDOS);
    expect(estado.puntuacion).toBe(0);
    expect(estado.estado).toBe('jugando');
    expect(contarDiferencias(estado)).toBe(CONFIG.DIFERENCIAS_INICIALES);
  });

  it('suma puntos y marca la diferencia como encontrada', () => {
    const estado = crearEstadoInicial(123);
    const diferenciaInicial = buscarCelda(estado, true);
    intentarCelda(estado, diferenciaInicial.fila, diferenciaInicial.columna);

    const diferenciaDelSegundoNivel = buscarCelda(estado, true);
    const resultado = intentarCelda(
      estado,
      diferenciaDelSegundoNivel.fila,
      diferenciaDelSegundoNivel.columna,
    );

    expect(resultado).toBe(true);
    expect(estado.puntuacion).toBe(CONFIG.PUNTOS_POR_ACIERTO * 2);
    expect(estado.diferenciasEncontradas[diferenciaDelSegundoNivel.fila][diferenciaDelSegundoNivel.columna]).toBe(true);
    expect(estado.ultimoResultado).toBe('acierto');
    expect(estado.nivel).toBe(2);
  });

  it('registra un error y consume un intento', () => {
    const estado = crearEstadoInicial(123);
    const celdaSinDiferencia = buscarCelda(estado, false);

    const resultado = intentarCelda(estado, celdaSinDiferencia.fila, celdaSinDiferencia.columna);

    expect(resultado).toBe(true);
    expect(estado.fallos).toBe(1);
    expect(estado.ultimoResultado).toBe('error');
    expect(estado.estado).toBe('jugando');
  });

  it('avanza de nivel al encontrar todas las diferencias y reinicia el tablero', () => {
    const estado = crearEstadoInicial(123);
    const matrizAnterior = estado.matrizB;
    const diferencia = buscarCelda(estado, true);

    intentarCelda(estado, diferencia.fila, diferencia.columna);

    expect(estado.nivel).toBe(2);
    expect(estado.estado).toBe('jugando');
    expect(estado.matrizB).not.toBe(matrizAnterior);
    expect(contarDiferencias(estado)).toBe(2);
    expect(estado.diferenciasEncontradas.flat().every((encontrada) => !encontrada)).toBe(true);
    expect(estado.segundosRestantes).toBe(CONFIG.TIEMPO_INICIAL_SEGUNDOS);
  });

  it('termina en derrota al agotar los intentos', () => {
    const estado = crearEstadoInicial(123);
    const celdaSinDiferencia = buscarCelda(estado, false);

    for (let intento = 0; intento < CONFIG.FALLOS_MAXIMOS; intento += 1) {
      intentarCelda(estado, celdaSinDiferencia.fila, celdaSinDiferencia.columna);
    }

    expect(estado.fallos).toBe(CONFIG.FALLOS_MAXIMOS);
    expect(estado.estado).toBe('derrota');
  });

  it('termina en derrota cuando se agota el tiempo', () => {
    const estado = crearEstadoInicial(123);

    avanzarTiempo(estado, CONFIG.TIEMPO_INICIAL_SEGUNDOS);

    expect(estado.segundosRestantes).toBe(0);
    expect(estado.estado).toBe('derrota');
  });

  it('genera el mismo tablero al usar la misma semilla', () => {
    const primerEstado = crearEstadoInicial(9876);
    const segundoEstado = crearEstadoInicial(9876);

    expect(segundoEstado.matrizA).toEqual(primerEstado.matrizA);
    expect(segundoEstado.matrizB).toEqual(primerEstado.matrizB);
    expect(segundoEstado.diferencias).toEqual(primerEstado.diferencias);
  });
});