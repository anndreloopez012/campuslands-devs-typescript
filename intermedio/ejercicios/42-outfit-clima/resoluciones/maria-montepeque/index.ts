export {};

type Categoria = "frio" | "fresco" | "templado" | "calido";

interface Clima {
  readonly fecha: string;
  readonly temperatura: number;
  readonly lluvia: boolean;
  readonly vientoKmH: number;
}

interface Outfit {
  readonly fecha: string;
  readonly categoria: Categoria;
  readonly prendas: readonly string[];
}

const semana: readonly Clima[] = [
  { fecha: "2026-06-01", temperatura: 8, lluvia: false, vientoKmH: 10 },
  { fecha: "2026-06-02", temperatura: 14, lluvia: true, vientoKmH: 25 },
  { fecha: "2026-06-03", temperatura: 19, lluvia: false, vientoKmH: 8 },
  { fecha: "2026-06-04", temperatura: 24, lluvia: false, vientoKmH: 35 },
  { fecha: "2026-06-05", temperatura: 31, lluvia: false, vientoKmH: 5 },
  { fecha: "2026-06-06", temperatura: 99, lluvia: false, vientoKmH: 5 },
  { fecha: "2026-06-07", temperatura: 22, lluvia: true, vientoKmH: -4 },
];

const clasificar = (temperatura: number): Categoria => {
  if (temperatura < 10) return "frio";
  if (temperatura < 17) return "fresco";
  if (temperatura < 25) return "templado";
  return "calido";
};

const prendasBase: Record<Categoria, readonly string[]> = {
  frio: ["abrigo", "bufanda", "pantalon grueso"],
  fresco: ["sudadera", "jeans"],
  templado: ["camiseta", "jeans"],
  calido: ["camiseta ligera", "short", "gorra"],
};

const esClimaValido = (c: Clima): boolean =>
  c.temperatura >= -30 && c.temperatura <= 50 && c.vientoKmH >= 0;

const recomendar = (clima: Clima): Outfit => {
  const categoria = clasificar(clima.temperatura);
  const extras = [
    ...(clima.lluvia ? ["impermeable"] : []),
    ...(clima.vientoKmH >= 30 ? ["cortaviento"] : []),
  ];
  return { fecha: clima.fecha, categoria, prendas: [...prendasBase[categoria], ...extras] };
};

const diaDeSemana = (fecha: string): string =>
  ["dom", "lun", "mar", "mie", "jue", "vie", "sab"][new Date(`${fecha}T00:00:00Z`).getUTCDay()];

const validos = semana.filter(esClimaValido);
const invalidos = semana.filter((c) => !esClimaValido(c));
const outfits = validos.map(recomendar);
const porCategoria = outfits.reduce(
  (mapa, o) => mapa.set(o.categoria, (mapa.get(o.categoria) ?? 0) + 1),
  new Map<Categoria, number>(),
);
const diasLluvia = validos.filter((c) => c.lluvia).map((c) => diaDeSemana(c.fecha));

console.log("Ejercicio 42: Outfit segun clima");
console.log(`Dias validos: ${validos.length} | invalidos: ${invalidos.length}`);
invalidos.forEach((c) => console.log(`  - ${c.fecha} tiene lecturas imposibles`));
outfits.forEach((o) => console.log(`  ${diaDeSemana(o.fecha)} ${o.fecha} [${o.categoria}]: ${o.prendas.join(", ")}`));
porCategoria.forEach((dias, categoria) => console.log(`  ${categoria}: ${dias} dia(s)`));
console.log(`Dias con lluvia: ${diasLluvia.join(", ") || "ninguno"}`);
