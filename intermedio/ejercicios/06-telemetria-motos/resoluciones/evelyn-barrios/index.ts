export {};

type CategoriaMoto = "Moto3" | "Moto2" | "MotoGP";

interface VueltaTelemetria {
  readonly numeroVuelta: number;
  readonly tiempoSegundos: number;
  readonly velocidadPuntaKmH: number;
  readonly temperaturaNeumaticoC: number;
}

interface PilotoTelemetria {
  readonly id: string;
  readonly nombre: string;
  readonly categoria: CategoriaMoto;
  readonly vueltas: readonly VueltaTelemetria[];
}

interface AnalisisRendimiento {
  readonly piloto: string;
  readonly categoria: CategoriaMoto;
  readonly mejorVuelta: number;
  readonly velocidadPromedioPunta: number;
  readonly consistencia: number;
}

function calcularMejorVuelta(vueltas: readonly VueltaTelemetria[]): number {
  if (vueltas.length === 0) return 0;
  return Math.min(...vueltas.map((v) => v.tiempoSegundos));
}

function calcularVelocidadPuntaPromedio(vueltas: readonly VueltaTelemetria[]): number {
  if (vueltas.length === 0) return 0;
  const suma = vueltas.reduce((acc, v) => acc + v.velocidadPuntaKmH, 0);
  return Number((suma / vueltas.length).toFixed(1));
}

function analizarPiloto(piloto: PilotoTelemetria): AnalisisRendimiento {
  const mejorVuelta = calcularMejorVuelta(piloto.vueltas);
  const velocidadPromedioPunta = calcularVelocidadPuntaPromedio(piloto.vueltas);
  const peorVuelta = piloto.vueltas.length > 0 ? Math.max(...piloto.vueltas.map((v) => v.tiempoSegundos)) : 0;
  const consistencia = Number((peorVuelta - mejorVuelta).toFixed(3));

  return {
    piloto: piloto.nombre,
    categoria: piloto.categoria,
    mejorVuelta,
    velocidadPromedioPunta,
    consistencia,
  };
}

const datosSesion: PilotoTelemetria[] = [
  {
    id: "plt-01",
    nombre: "Pecco Bagnaia",
    categoria: "MotoGP",
    vueltas: [
      { numeroVuelta: 1, tiempoSegundos: 98.42, velocidadPuntaKmH: 348.5, temperaturaNeumaticoC: 92 },
      { numeroVuelta: 2, tiempoSegundos: 97.85, velocidadPuntaKmH: 351.2, temperaturaNeumaticoC: 95 },
      { numeroVuelta: 3, tiempoSegundos: 97.91, velocidadPuntaKmH: 350.0, temperaturaNeumaticoC: 94 },
    ],
  },
  {
    id: "plt-02",
    nombre: "Jorge MartÃ­n",
    categoria: "MotoGP",
    vueltas: [
      { numeroVuelta: 1, tiempoSegundos: 98.15, velocidadPuntaKmH: 352.0, temperaturaNeumaticoC: 93 },
      { numeroVuelta: 2, tiempoSegundos: 97.72, velocidadPuntaKmH: 353.4, temperaturaNeumaticoC: 96 },
      { numeroVuelta: 3, tiempoSegundos: 98.02, velocidadPuntaKmH: 351.8, temperaturaNeumaticoC: 95 },
    ],
  },
];

console.log("=== TELEMETRÃA DE MOTOS DEPORTIVAS ===");
datosSesion.map(analizarPiloto).forEach((res) => {
  console.log(`${res.piloto} (${res.categoria}) - Best Lap: ${res.mejorVuelta}s | V.Punta: ${res.velocidadPromedioPunta} km/h | Gap: ${res.consistencia}s`);
});
