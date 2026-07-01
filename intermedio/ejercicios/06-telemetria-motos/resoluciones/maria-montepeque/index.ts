export {};

type Categoria = "moto3" | "supersport" | "superbike";

interface MotoTelemetria {
  readonly id: number;
  readonly piloto: string;
  readonly modelo: string;
  readonly categoria: Categoria;
  readonly velocidadMaxima: number;
  readonly anguloMaxInclinacion: number;
  readonly vueltas: readonly number[];
}
interface ResultadoPiloto {
  readonly id: number;
  readonly piloto: string;
  readonly categoria: Categoria;
  readonly mejorVuelta: number;
  readonly vueltaPromedio: number;
  readonly velocidadMaxima: number;
}

const telemetrias: readonly MotoTelemetria[] = [
  {
    id: 1,
    piloto: "Marco Rivas",
    modelo: "Yamaha R1",
    categoria: "superbike",
    velocidadMaxima: 299,
    anguloMaxInclinacion: 58,
    vueltas: [98.4, 97.9, 98.1, 97.7],
  },
  {
    id: 2,
    piloto: "Elena Sosa",
    modelo: "Ducati Panigale V4",
    categoria: "superbike",
    velocidadMaxima: 305,
    anguloMaxInclinacion: 61,
    vueltas: [97.2, 96.8, 97.5, 96.9],
  },
  {
    id: 3,
    piloto: "Tomas Vidal",
    modelo: "Kawasaki ZX-6R",
    categoria: "supersport",
    velocidadMaxima: 260,
    anguloMaxInclinacion: 55,
    vueltas: [101.3, 100.9, 101.0],
  },
  {
    id: 4,
    piloto: "Nadia Cruz",
    modelo: "Honda NSF250R",
    categoria: "moto3",
    velocidadMaxima: 235,
    anguloMaxInclinacion: 62,
    vueltas: [],
  },
];

const fuera: string[] = [];
const ranking: ResultadoPiloto[] = telemetrias
  .reduce((acc, t) => {
    const len = t.vueltas.length;
    if (t.velocidadMaxima <= 0 || t.anguloMaxInclinacion <= 0 || len === 0) {
      fuera.push(t.piloto);
      return acc;
    }

    const stats = t.vueltas.reduce(
      (res, v) => ({
        best: v < res.best ? v : res.best,
        sum: res.sum + v,
      }),
      { best: Infinity, sum: 0 },
    );

    acc.push({
      id: t.id,
      piloto: t.piloto,
      categoria: t.categoria,
      velocidadMaxima: t.velocidadMaxima,
      mejorVuelta: stats.best,
      vueltaPromedio: Number((stats.sum / len).toFixed(2)),
    });
    return acc;
  }, [] as ResultadoPiloto[])
  .sort((a, b) => a.mejorVuelta - b.mejorVuelta); 

// Salida limpia por consola
console.log("Ranking de vuelta rapida:");
ranking.forEach((r, i) =>
  console.log(
    `${i + 1}. ${r.piloto} (${r.categoria}) - mejor vuelta ${r.mejorVuelta}s - promedio ${r.vueltaPromedio}s - top ${r.velocidadMaxima} km/h`,
  ),
);

if (fuera.length > 0)
  console.log(
    `Descalificados por falta de vueltas registradas:\n${fuera.map((p) => `- ${p}`).join("\n")}`,
  );
