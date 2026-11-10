export {};

// tipos
interface Vuelta {
  readonly numero: number;
  segundos: number;
  penalizacionSegundos: number;
}

interface Piloto {
  readonly nombre: string;
  readonly escuderia: string;
  vueltas: Vuelta[];
}

// datos
const pilotos: Piloto[] = [
  { nombre: 'Velas', escuderia: 'Aurelia', vueltas: [
    { numero: 1, segundos: 82.4, penalizacionSegundos: 0 },
    { numero: 2, segundos: 80.9, penalizacionSegundos: 3 },
    { numero: 3, segundos: 79.8, penalizacionSegundos: 0 },
  ] },
  { nombre: 'Rios', escuderia: 'Falcone', vueltas: [
    { numero: 1, segundos: 83.1, penalizacionSegundos: 0 },
    { numero: 2, segundos: 81.2, penalizacionSegundos: 0 },
    { numero: 3, segundos: 80.5, penalizacionSegundos: 5 },
  ] },
  { nombre: 'Mena', escuderia: 'Corvus', vueltas: [
    { numero: 1, segundos: 84.0, penalizacionSegundos: 0 },
    { numero: 2, segundos: 82.7, penalizacionSegundos: 0 },
    { numero: 3, segundos: 81.9, penalizacionSegundos: 0 },
  ] },
];

// validacion
function validarPiloto(piloto: Piloto): boolean {
  return piloto.vueltas.length > 0 && piloto.vueltas.every((vuelta) => vuelta.segundos > 0 && vuelta.penalizacionSegundos >= 0);
}

// calculos
function tiempoVuelta(vuelta: Vuelta): number {
  return vuelta.segundos + vuelta.penalizacionSegundos;
}

function tiempoTotal(piloto: Piloto): number {
  return Number(piloto.vueltas.reduce((total, vuelta) => total + tiempoVuelta(vuelta), 0).toFixed(2));
}

function mejorVuelta(piloto: Piloto): number {
  return Math.min(...piloto.vueltas.map(tiempoVuelta));
}

function construirClasificacion(pilotos: Piloto[]): Piloto[] {
  return pilotos
    .filter(validarPiloto)
    .sort((a, b) => tiempoTotal(a) - tiempoTotal(b));
}

function promedioEscuderia(pilotos: Piloto[]): Record<string, number> {
  const grupos = pilotos.reduce<Record<string, Piloto[]>>((acumulador, piloto) => {
    (acumulador[piloto.escuderia] ??= []).push(piloto);
    return acumulador;
  }, {});

  const resultado: Record<string, number> = {};
  Object.entries(grupos).forEach(([escuderia, grupo]) => {
    const suma = grupo.reduce((total, piloto) => total + tiempoTotal(piloto), 0);
    resultado[escuderia] = Number((suma / grupo.length).toFixed(2));
  });

  return resultado;
}

// salida
function mostrarResumen(pilotos: Piloto[]): void {
  console.log('=== Simulador de carrera por vueltas ===');
  console.log('Clasificacion final:');
  construirClasificacion(pilotos).forEach((piloto, indice) => {
    console.log(`${indice + 1}. ${piloto.nombre} (${piloto.escuderia}) | Total: ${tiempoTotal(piloto)}s | Mejor vuelta: ${mejorVuelta(piloto)}s`);
  });

  console.log('Promedio por escuderia:', promedioEscuderia(pilotos));
}

mostrarResumen(pilotos);
