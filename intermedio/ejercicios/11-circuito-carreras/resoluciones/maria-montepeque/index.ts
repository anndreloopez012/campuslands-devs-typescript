export {};

const TOTAL_VUELTAS = 5;

interface Vuelta {
  readonly numero: number;
  readonly tiempoSegundos: number;
}

interface Piloto {
  readonly nombre: string;
  readonly equipo: string;
  readonly vueltas: readonly Vuelta[];
}

interface ResultadoPiloto {
  readonly nombre: string;
  readonly equipo: string;
  readonly tiempoTotalSegundos: number;
  readonly vueltaMasRapida: number;
  readonly promedioSegundos: number;
}

const parrilla: readonly Piloto[] = [
  {
    nombre: "Valentina Rios",
    equipo: "Escuderia Halcon",
    vueltas: [
      { numero: 1, tiempoSegundos: 94.2 },
      { numero: 2, tiempoSegundos: 92.8 },
      { numero: 3, tiempoSegundos: 91.5 },
      { numero: 4, tiempoSegundos: 92.1 },
      { numero: 5, tiempoSegundos: 90.9 },
    ],
  },
  {
    nombre: "Mateo Solares",
    equipo: "Escuderia Cobra",
    vueltas: [
      { numero: 1, tiempoSegundos: 95.6 },
      { numero: 2, tiempoSegundos: 93.4 },
      { numero: 3, tiempoSegundos: 93.9 },
      { numero: 4, tiempoSegundos: 92.7 },
      { numero: 5, tiempoSegundos: 91.8 },
    ],
  },
  {
    nombre: "Camila Ordonez",
    equipo: "Escuderia Halcon",
    vueltas: [
      { numero: 1, tiempoSegundos: 96.1 },
      { numero: 2, tiempoSegundos: 94.9 },
      { numero: 3, tiempoSegundos: 93.2 },
      { numero: 4, tiempoSegundos: 93.0 },
      { numero: 5, tiempoSegundos: 92.4 },
    ],
  },
  {
    nombre: "Andres Peralta",
    equipo: "Escuderia Lobo",
    vueltas: [
      { numero: 1, tiempoSegundos: 97.3 },
      { numero: 2, tiempoSegundos: 95.0 },
      { numero: 3, tiempoSegundos: 94.4 },
      { numero: 4, tiempoSegundos: 93.8 },
    ],
  },
  {
    nombre: "Renata Fuentes",
    equipo: "Escuderia Cobra",
    vueltas: [
      { numero: 1, tiempoSegundos: 93.1 },
      { numero: 2, tiempoSegundos: 92.0 },
      { numero: 3, tiempoSegundos: 0 },
      { numero: 4, tiempoSegundos: 91.4 },
      { numero: 5, tiempoSegundos: 90.6 },
    ],
  },
  {
    nombre: "Ignacio Barrios",
    equipo: "Escuderia Lobo",
    vueltas: [
      { numero: 1, tiempoSegundos: 98.0 },
      { numero: 2, tiempoSegundos: 96.2 },
      { numero: 3, tiempoSegundos: 95.5 },
      { numero: 4, tiempoSegundos: 94.7 },
      { numero: 5, tiempoSegundos: 93.9 },
    ],
  },
];

const esPilotoValido = (piloto: Piloto): boolean => {
  if (piloto.vueltas.length !== TOTAL_VUELTAS) {
    return false;
  }

  const numerosUnicos = new Set(piloto.vueltas.map((vuelta) => vuelta.numero));

  return (
    numerosUnicos.size === TOTAL_VUELTAS &&
    piloto.vueltas.every((vuelta) => vuelta.tiempoSegundos > 0)
  );
};

const calcularResultado = (piloto: Piloto): ResultadoPiloto => {
  const tiempoTotalSegundos = piloto.vueltas.reduce(
    (suma, vuelta) => suma + vuelta.tiempoSegundos,
    0,
  );
  const vueltaMasRapida = Math.min(
    ...piloto.vueltas.map((vuelta) => vuelta.tiempoSegundos),
  );

  return {
    nombre: piloto.nombre,
    equipo: piloto.equipo,
    tiempoTotalSegundos: Math.round(tiempoTotalSegundos * 100) / 100,
    vueltaMasRapida,
    promedioSegundos: Math.round((tiempoTotalSegundos / TOTAL_VUELTAS) * 100) / 100,
  };
};

const procesarCircuito = (pilotos: readonly Piloto[]) => {
  const validos = pilotos.filter(esPilotoValido);
  const invalidos = pilotos.filter((piloto) => !esPilotoValido(piloto));
  const clasificacion = validos
    .map(calcularResultado)
    .sort((a, b) => a.tiempoTotalSegundos - b.tiempoTotalSegundos);
  const vueltaRapidaGlobal = clasificacion.reduce((mejor, actual) =>
    actual.vueltaMasRapida < mejor.vueltaMasRapida ? actual : mejor,
  );

  return { validos, invalidos, clasificacion, vueltaRapidaGlobal };
};

// --- Render del Sistema ---
const resumen = procesarCircuito(parrilla);

console.log(
  `Ejercicio 11: Simulador de carrera por vueltas\nPilotos totales: ${parrilla.length}\nPilotos validos: ${resumen.validos.length}\nPilotos invalidos: ${resumen.invalidos.length}\nVueltas por carrera: ${TOTAL_VUELTAS}`,
);

resumen.invalidos.forEach((piloto) =>
  console.log(`  - ${piloto.nombre} (${piloto.equipo}) no completo la carrera correctamente`),
);

console.log("Clasificacion final:");
resumen.clasificacion.forEach((resultado, index) =>
  console.log(
    `${index + 1}. ${resultado.nombre} (${resultado.equipo}) - ${resultado.tiempoTotalSegundos}s total, promedio ${resultado.promedioSegundos}s`,
  ),
);

console.log(
  `Vuelta mas rapida: ${resumen.vueltaRapidaGlobal.nombre} con ${resumen.vueltaRapidaGlobal.vueltaMasRapida}s`,
);
