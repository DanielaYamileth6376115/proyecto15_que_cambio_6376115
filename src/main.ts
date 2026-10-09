import './style.css';
import {
  avanzarTiempo,
  CONFIG,
  confirmarSeleccion,
  crearEstadoInicial,
  intentarCelda,
  moverSeleccion,
  type Direccion,
} from './logica';

const aplicacion = document.querySelector<HTMLDivElement>('#app');

if (!aplicacion) throw new Error('No se encontró el contenedor principal del juego.');

let semilla = Date.now() >>> 0;
let estado = crearEstadoInicial(semilla);
let mensaje = 'Encontrá las diferencias entre las dos matrices.';
let intervaloTemporizador: number | undefined;

aplicacion.innerHTML = `
  <div class="marco">
    <header class="encabezado">
      <a class="marca" href="#inicio" aria-label="¿Qué cambió? Inicio">
        <span class="marca__simbolo" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
        <span class="marca__texto">¿QUÉ<br />CAMBIÓ?</span>
      </a>
      <p class="encabezado__nota">DESAFÍO VISUAL <span aria-hidden="true">/</span> <span>ATENCIÓN Y MEMORIA</span></p>
      <button class="boton-reinicio" type="button" data-accion="reiniciar" aria-label="Iniciar una nueva partida">
        <span class="boton-reinicio__icono" aria-hidden="true">↻</span>
        <span class="boton-reinicio__texto">Nueva partida</span>
      </button>
    </header>

    <main id="inicio" class="contenido">
      <section class="intro" aria-labelledby="titulo-juego">
        <div class="intro__titulo">
          <span class="rotulo"><span class="rotulo__punto" aria-hidden="true"></span> RONDA EN CURSO</span>
          <h1 id="titulo-juego">¿Qué cambió<span aria-hidden="true">?</span></h1>
        </div>
        <p id="mensaje" class="mensaje" role="status" aria-live="polite"></p>
      </section>

      <section class="marcador" aria-label="Estado de la partida">
        <div class="indicador indicador--reloj">
          <span class="indicador__etiqueta">Tiempo</span>
          <span id="tiempo" class="indicador__valor" aria-label="Tiempo restante"></span>
          <span class="reloj__pista" aria-hidden="true"><span id="progreso-tiempo"></span></span>
        </div>
        <div class="indicador">
          <span class="indicador__etiqueta">Nivel</span>
          <span id="nivel" class="indicador__valor"></span>
        </div>
        <div class="indicador">
          <span class="indicador__etiqueta">Puntaje</span>
          <span id="puntuacion" class="indicador__valor"></span>
        </div>
        <div class="indicador">
          <span class="indicador__etiqueta">Fallos</span>
          <span id="fallos" class="indicador__valor"></span>
        </div>
      </section>

      <section class="tableros" aria-label="Matrices para comparar">
        <section class="tablero" aria-labelledby="titulo-matriz-a">
          <header class="tablero__encabezado">
            <h2 id="titulo-matriz-a">Matriz A</h2>
            <span class="tablero__letra" aria-hidden="true">01</span>
          </header>
          <div id="matriz-a" class="cuadricula cuadricula--lectura" role="grid" aria-label="Matriz A"></div>
        </section>

        <section class="tablero tablero--seleccion" aria-labelledby="titulo-matriz-b">
          <header class="tablero__encabezado">
            <h2 id="titulo-matriz-b">Matriz B</h2>
            <span class="tablero__letra" aria-hidden="true">02</span>
          </header>
          <div id="matriz-b" class="cuadricula" role="grid" aria-label="Matriz B. Seleccioná las celdas que cambiaron."></div>
        </section>
      </section>

    </main>
  </div>
`;

const elementoTiempo = document.querySelector<HTMLElement>('#tiempo')!;
const elementoProgreso = document.querySelector<HTMLElement>('#progreso-tiempo')!;
const elementoNivel = document.querySelector<HTMLElement>('#nivel')!;
const elementoPuntuacion = document.querySelector<HTMLElement>('#puntuacion')!;
const elementoFallos = document.querySelector<HTMLElement>('#fallos')!;
const elementoMensaje = document.querySelector<HTMLElement>('#mensaje')!;
const elementoMatrizA = document.querySelector<HTMLElement>('#matriz-a')!;
const elementoMatrizB = document.querySelector<HTMLElement>('#matriz-b')!;
const botonReinicio = document.querySelector<HTMLButtonElement>('[data-accion="reiniciar"]')!;

function actualizarReloj(): void {
  const minutos = Math.floor(estado.segundosRestantes / 60);
  const segundos = estado.segundosRestantes % 60;
  elementoTiempo.textContent = `${minutos}:${segundos.toString().padStart(2, '0')}`;
  elementoTiempo.classList.toggle('indicador__valor--urgente', estado.segundosRestantes <= 10);
  elementoProgreso.style.width = `${(estado.segundosRestantes / CONFIG.TIEMPO_INICIAL_SEGUNDOS) * 100}%`;
  elementoProgreso.classList.toggle('reloj__pista--urgente', estado.segundosRestantes <= 10);
}

function crearCeldaLectura(fila: number, columna: number): string {
  const color = estado.matrizA[fila][columna];
  return `<div class="celda celda--${color}" role="gridcell" aria-label="Fila ${fila + 1}, columna ${columna + 1}: ${color}"></div>`;
}

function crearCeldaSeleccionable(fila: number, columna: number): string {
  const color = estado.matrizB[fila][columna];
  const encontrada = estado.diferenciasEncontradas[fila][columna];
  const seleccionada = estado.filaSeleccionada === fila && estado.columnaSeleccionada === columna;
  const incorrecta = estado.ultimaCeldaIncorrecta?.fila === fila && estado.ultimaCeldaIncorrecta.columna === columna;
  const clases = [
    'celda',
    `celda--${color}`,
    seleccionada ? 'celda--seleccionada' : '',
    encontrada ? 'celda--acierto' : '',
    incorrecta ? 'celda--error' : '',
  ].filter(Boolean).join(' ');
  const detalle = encontrada ? ', diferencia encontrada' : incorrecta ? ', intento incorrecto' : '';

  return `<button class="${clases}" type="button" role="gridcell" data-fila="${fila}" data-columna="${columna}" aria-label="Fila ${fila + 1}, columna ${columna + 1}: ${color}${detalle}" aria-pressed="${encontrada}" ${encontrada || estado.estado !== 'jugando' ? 'disabled' : ''}><span class="celda__marca" aria-hidden="true"></span></button>`;
}

function renderizar(focoEnSeleccion = false): void {
  elementoMatrizA.innerHTML = estado.matrizA
    .map((fila, indiceFila) => fila.map((_, indiceColumna) => crearCeldaLectura(indiceFila, indiceColumna)).join(''))
    .join('');
  elementoMatrizB.innerHTML = estado.matrizB
    .map((fila, indiceFila) => fila.map((_, indiceColumna) => crearCeldaSeleccionable(indiceFila, indiceColumna)).join(''))
    .join('');

  elementoNivel.textContent = estado.nivel.toString().padStart(2, '0');
  elementoPuntuacion.textContent = estado.puntuacion.toString();
  elementoFallos.textContent = `${estado.fallos} / ${CONFIG.FALLOS_MAXIMOS}`;
  elementoMensaje.textContent = mensaje;
  botonReinicio.querySelector<HTMLElement>('.boton-reinicio__texto')!.textContent =
    estado.estado === 'jugando' ? 'Nueva partida' : 'Jugar de nuevo';
  botonReinicio.setAttribute(
    'aria-label',
    estado.estado === 'jugando' ? 'Iniciar una nueva partida' : 'Jugar de nuevo',
  );
  actualizarReloj();

  if (focoEnSeleccion && estado.estado === 'jugando') {
    elementoMatrizB.querySelector<HTMLButtonElement>(
      `[data-fila="${estado.filaSeleccionada}"][data-columna="${estado.columnaSeleccionada}"]`,
    )?.focus({ preventScroll: true });
  } else if (estado.estado !== 'jugando') {
    botonReinicio.focus({ preventScroll: true });
  }

  aplicacion!.dataset.estado = estado.estado;
}

function actualizarMensaje(): void {
  if (estado.estado === 'victoria') {
    mensaje = '¡Desafío completado! Encontraste todas las diferencias.';
  } else if (estado.estado === 'derrota') {
    mensaje = estado.segundosRestantes === 0 ? 'Se agotó el tiempo. La partida terminó.' : 'Alcanzaste el límite de fallos. La partida terminó.';
  } else if (estado.ultimoResultado === 'acierto') {
    mensaje = `¡Diferencia encontrada! Nivel ${estado.nivel}.`;
  } else if (estado.ultimoResultado === 'error') {
    mensaje = 'Esa celda no cambió. Seguí buscando.';
  } else {
    mensaje = 'Encontrá las diferencias entre las dos matrices.';
  }
}

function detenerTemporizador(): void {
  if (intervaloTemporizador !== undefined) {
    window.clearInterval(intervaloTemporizador);
    intervaloTemporizador = undefined;
  }
}

function iniciarTemporizador(): void {
  detenerTemporizador();
  intervaloTemporizador = window.setInterval(() => {
    if (estado.estado !== 'jugando') {
      detenerTemporizador();
      return;
    }

    avanzarTiempo(estado);
    actualizarReloj();
    if (estado.estado !== 'jugando') {
      actualizarMensaje();
      renderizar();
      detenerTemporizador();
    }
  }, 1000);
}

function procesarIntento(fila: number, columna: number): void {
  if (!intentarCelda(estado, fila, columna)) return;

  actualizarMensaje();
  renderizar(true);
  if (estado.estado !== 'jugando') detenerTemporizador();
}

function procesarConfirmacion(): void {
  if (!confirmarSeleccion(estado)) return;

  actualizarMensaje();
  renderizar(true);
  if (estado.estado !== 'jugando') detenerTemporizador();
}

aplicacion.addEventListener('click', (evento: MouseEvent) => {
  const objetivo = evento.target;
  if (!(objetivo instanceof Element)) return;

  const boton = objetivo.closest<HTMLButtonElement>('[data-accion], [data-fila][data-columna]');
  if (!boton) return;

  if (boton.dataset.accion === 'reiniciar') {
    semilla = (semilla + 1) >>> 0;
    estado = crearEstadoInicial(semilla);
    mensaje = 'Encontrá las diferencias entre las dos matrices.';
    renderizar();
    iniciarTemporizador();
    return;
  }

  const fila = Number(boton.dataset.fila);
  const columna = Number(boton.dataset.columna);
  procesarIntento(fila, columna);
});

document.addEventListener('keydown', (evento: KeyboardEvent) => {
  const objetivo = evento.target;
  if (objetivo instanceof HTMLButtonElement && objetivo.dataset.accion === 'reiniciar') return;

  const direcciones: Record<string, Direccion> = {
    ArrowUp: 'arriba',
    ArrowDown: 'abajo',
    ArrowLeft: 'izquierda',
    ArrowRight: 'derecha',
  };
  const direccion = direcciones[evento.key];

  if (direccion) {
    evento.preventDefault();
    if (moverSeleccion(estado, direccion)) renderizar(true);
    return;
  }

  if (evento.key === 'Enter' || evento.key === ' ') {
    if (estado.estado !== 'jugando') return;
    evento.preventDefault();
    procesarConfirmacion();
  }
});

renderizar();
iniciarTemporizador();