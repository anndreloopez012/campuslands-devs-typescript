export {};

interface FichaTecnica {
  readonly modelo: string;
  readonly potenciaCv: number;
  readonly ceroACien: number;
  readonly velocidadMaxKmH: number;
}

interface PrecioMercado {
  readonly modelo: string;
  readonly precioUsd: number;
}

interface Comparacion extends FichaTecnica {
  readonly precioUsd: number;
  readonly usdPorCaballo: number;
}

const esperar = (ms: number): Promise<void> => new Promise((resolver) => setTimeout(resolver, ms));

const fichas: readonly FichaTecnica[] = [
  { modelo: "Porsche 911 Turbo S", potenciaCv: 650, ceroACien: 2.7, velocidadMaxKmH: 330 },
  { modelo: "Lamborghini Huracan", potenciaCv: 640, ceroACien: 2.9, velocidadMaxKmH: 325 },
  { modelo: "McLaren 720S", potenciaCv: 720, ceroACien: 2.8, velocidadMaxKmH: 341 },
  { modelo: "Aston Martin Vantage", potenciaCv: 510, ceroACien: 3.6, velocidadMaxKmH: 314 },
];

const precios: readonly PrecioMercado[] = [
  { modelo: "Porsche 911 Turbo S", precioUsd: 230000 },
  { modelo: "Lamborghini Huracan", precioUsd: 250000 },
  { modelo: "McLaren 720S", precioUsd: 300000 },
];

const fetchFicha = async (modelo: string): Promise<FichaTecnica> => {
  await esperar(10);
  const ficha = fichas.find((f) => f.modelo === modelo);
  if (!ficha) throw new Error(`Ficha tecnica no encontrada: ${modelo}`);
  return ficha;
};

const fetchPrecio = async (modelo: string): Promise<PrecioMercado> => {
  // El servicio de precios es lento para el McLaren: se corta con un tiempo limite.
  await esperar(modelo === "McLaren 720S" ? 80 : 10);
  const precio = precios.find((p) => p.modelo === modelo);
  if (!precio) throw new Error(`Precio no disponible: ${modelo}`);
  return precio;
};

const conLimite = <T>(promesa: Promise<T>, ms: number, etiqueta: string): Promise<T> =>
  Promise.race([
    promesa,
    new Promise<never>((_, rechazar) => setTimeout(() => rechazar(new Error(`${etiqueta}: sin respuesta en ${ms} ms`)), ms)),
  ]);

const comparar = async (modelo: string): Promise<Comparacion> => {
  // Ficha y precio son independientes, asi que se piden en paralelo.
  const [ficha, precio] = await Promise.all([
    fetchFicha(modelo),
    conLimite(fetchPrecio(modelo), 40, `Precio de ${modelo}`),
  ]);
  return { ...ficha, precioUsd: precio.precioUsd, usdPorCaballo: Math.round(precio.precioUsd / ficha.potenciaCv) };
};

const main = async (): Promise<void> => {
  console.log("Ejercicio 59: Comparador de autos premium");
  const modelos = fichas.map((f) => f.modelo).concat("Ferrari Fantasma");
  const resultados = await Promise.allSettled(modelos.map(comparar));

  const comparables: Comparacion[] = [];
  resultados.forEach((r, i) => {
    if (r.status === "fulfilled") comparables.push(r.value);
    else console.log(`  ! ${modelos[i]}: ${r.reason instanceof Error ? r.reason.message : "error"}`);
  });

  comparables
    .sort((a, b) => a.usdPorCaballo - b.usdPorCaballo)
    .forEach((c, i) =>
      console.log(`${i + 1}. ${c.modelo}: $${c.precioUsd} | ${c.potenciaCv} CV | 0-100 en ${c.ceroACien}s | $${c.usdPorCaballo}/CV`),
    );
  const masRapido = [...comparables].sort((a, b) => a.ceroACien - b.ceroACien)[0];
  console.log(`Mejor valor por CV: ${comparables[0].modelo} | mas rapido: ${masRapido.modelo}`);
};

void main();
