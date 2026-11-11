export {};

// tipos
type Golpe = 'jab' | 'cross' | 'patada' | 'rodilla' | 'lowkick';

interface Luchador {
  readonly nombre: string;
  puntos: number;
  golpes: Record<Golpe, number>;
  faltas: number;
}

// datos
const puntajePorGolpe: Record<Golpe, number> = {
  jab: 1,
  cross: 2,
  patada: 3,
  rodilla: 2,
  lowkick: 1,
};

// validacion
function validarLuchador(luchador: Luchador): boolean {
  return luchador.faltas >= 0 && Object.values(luchador.golpes).every((cantidad) => cantidad >= 0);
}

// acciones
function registrarGolpe(luchador: Luchador, golpe: Golpe): void {
  luchador.golpes[golpe] += 1;
  luchador.puntos += puntajePorGolpe[golpe];
}

function aplicarPenalizacion(luchador: Luchador): void {
  luchador.faltas += 1;
  if (luchador.faltas >= 3) {
    luchador.puntos = Math.max(0, luchador.puntos - 2);
  }
}

// calculos
function calcularPuntajeEsperado(luchador: Luchador): number {
  const golpes = Object.entries(luchador.golpes) as [Golpe, number][];
  return golpes.reduce((total, [golpe, cantidad]) => total + puntajePorGolpe[golpe] * cantidad, 0);
}

function determinarGanador(a: Luchador, b: Luchador): string {
  if (a.puntos > b.puntos) return a.nombre;
  if (b.puntos > a.puntos) return b.nombre;
  return 'empate';
}

// datos
const velasco: Luchador = { nombre: 'Velas', puntos: 0, golpes: { jab: 0, cross: 0, patada: 0, rodilla: 0, lowkick: 0 }, faltas: 0 };
const rivas: Luchador = { nombre: 'Rivas', puntos: 0, golpes: { jab: 0, cross: 0, patada: 0, rodilla: 0, lowkick: 0 }, faltas: 0 };

const asaltosVelasco: Golpe[] = ['jab', 'cross', 'patada', 'jab', 'patada', 'lowkick', 'rodilla', 'patada'];
const asaltosRivas: Golpe[] = ['cross', 'lowkick', 'rodilla', 'cross', 'jab', 'lowkick'];

// salida
function mostrarResumen(): void {
  console.log('=== Marcador de kickboxing ===');
  asaltosVelasco.forEach((golpe) => registrarGolpe(velasco, golpe));
  asaltosRivas.forEach((golpe) => registrarGolpe(rivas, golpe));
  aplicarPenalizacion(velasco);

  [velasco, rivas].forEach((luchador) => {
    if (!validarLuchador(luchador)) console.log(`${luchador.nombre}: datos invalidos`);
    console.log(`${luchador.nombre} | Puntos: ${luchador.puntos} | Esperado: ${calcularPuntajeEsperado(luchador)} | Faltas: ${luchador.faltas}`);
  });

  console.log(`Ganador: ${determinarGanador(velasco, rivas)}`);
}

mostrarResumen();
