export {};

type CategoriaAuto = "deportivo" | "lujo" | "hiperdeportivo";

interface Hiperdeportivo {
  readonly id: number;
  readonly marca: string;
  readonly modelo: string;
  readonly categoria: CategoriaAuto;
  readonly potenciaHp: number;
  readonly velocidadMaximaKmh: number;
  readonly precioUsd: number;
  readonly disponible: boolean;
}

interface RankingVelocidad {
  readonly puesto: number;
  readonly marca: string;
  readonly modelo: string;
  readonly velocidadMaximaKmh: number;
}

interface ResumenCatalogo {
  readonly validos: readonly Hiperdeportivo[];
  readonly invalidos: readonly Hiperdeportivo[];
  readonly disponiblesCount: number;
  readonly precioPromedioUsd: number;
  readonly ranking: readonly RankingVelocidad[];
}

const catalogo: readonly Hiperdeportivo[] = [
  {
    id: 1,
    marca: "Bugatti",
    modelo: "Chiron Super Sport",
    categoria: "hiperdeportivo",
    potenciaHp: 1600,
    velocidadMaximaKmh: 440,
    precioUsd: 3800000,
    disponible: true,
  },
  {
    id: 2,
    marca: "Koenigsegg",
    modelo: "Jesko Absolut",
    categoria: "hiperdeportivo",
    potenciaHp: 1600,
    velocidadMaximaKmh: 480,
    precioUsd: 3400000,
    disponible: false,
  },
  {
    id: 3,
    marca: "Ferrari",
    modelo: "SF90 Stradale",
    categoria: "deportivo",
    potenciaHp: 986,
    velocidadMaximaKmh: 340,
    precioUsd: 625000,
    disponible: true,
  },
  {
    id: 4,
    marca: "Lamborghini",
    modelo: "Revuelto",
    categoria: "hiperdeportivo",
    potenciaHp: 1015,
    velocidadMaximaKmh: 350,
    precioUsd: 608000,
    disponible: true,
  },
  {
    id: 5,
    marca: "Rolls-Royce",
    modelo: "Phantom",
    categoria: "lujo",
    potenciaHp: 563,
    velocidadMaximaKmh: 250,
    precioUsd: 460000,
    disponible: true,
  },
  {
    id: 6,
    marca: "Rimac",
    modelo: "Nevera",
    categoria: "hiperdeportivo",
    potenciaHp: 1914,
    velocidadMaximaKmh: 412,
    precioUsd: 2400000,
    disponible: false,
  },
  {
    id: 7,
    marca: "Pagani",
    modelo: "Utopia",
    categoria: "hiperdeportivo",
    potenciaHp: 0,
    velocidadMaximaKmh: 350,
    precioUsd: 2400000,
    disponible: true,
  },
  {
    id: 8,
    marca: "McLaren",
    modelo: "Artura",
    categoria: "deportivo",
    potenciaHp: 690,
    velocidadMaximaKmh: 330,
    precioUsd: -1,
    disponible: true,
  },
];

const esAutoValido = (auto: Hiperdeportivo): boolean =>
  auto.potenciaHp > 0 && auto.precioUsd > 0 && auto.velocidadMaximaKmh > 0;

const calcularPrecioPromedio = (lista: readonly Hiperdeportivo[]): number => {
  if (lista.length === 0) {
    return 0;
  }

  const total = lista.reduce((suma, auto) => suma + auto.precioUsd, 0);
  return Math.round(total / lista.length);
};

const generarRankingVelocidad = (
  lista: readonly Hiperdeportivo[],
  limite: number,
): RankingVelocidad[] =>
  [...lista]
    .sort((a, b) => b.velocidadMaximaKmh - a.velocidadMaximaKmh)
    .slice(0, limite)
    .map((auto, index) => ({
      puesto: index + 1,
      marca: auto.marca,
      modelo: auto.modelo,
      velocidadMaximaKmh: auto.velocidadMaximaKmh,
    }));

const procesarCatalogo = (lista: readonly Hiperdeportivo[]): ResumenCatalogo => {
  const validos = lista.filter(esAutoValido);
  const invalidos = lista.filter((auto) => !esAutoValido(auto));
  const disponiblesCount = validos.filter((auto) => auto.disponible).length;

  return {
    validos,
    invalidos,
    disponiblesCount,
    precioPromedioUsd: calcularPrecioPromedio(validos),
    ranking: generarRankingVelocidad(validos, 3),
  };
};

// --- Render del Sistema ---
const resumen = procesarCatalogo(catalogo);

console.log(
  `Ejercicio 8: Catalogo de hiperdeportivos\nAutos totales: ${catalogo.length}\nAutos validos: ${resumen.validos.length}\nAutos invalidos: ${resumen.invalidos.length}\nDisponibles: ${resumen.disponiblesCount}\nPrecio promedio: $${resumen.precioPromedioUsd.toLocaleString("en-US")}`,
);

resumen.invalidos.forEach((auto) =>
  console.log(`  - #${auto.id} ${auto.marca} ${auto.modelo} tiene datos invalidos`),
);

console.log("Top 3 por velocidad maxima:");
resumen.ranking.forEach((item) =>
  console.log(
    `${item.puesto}. ${item.marca} ${item.modelo} - ${item.velocidadMaximaKmh} km/h`,
  ),
);
