export {};

type TipoComision = "retrato" | "personaje" | "fondo";

interface Comision {
  readonly id: number;
  readonly cliente: string;
  readonly tipo: TipoComision;
  readonly personajes: number;
  readonly urgente: boolean;
}

const precioBase: Record<TipoComision, number> = {
  retrato: 40,
  personaje: 60,
  fondo: 80,
};

const RECARGO_PERSONAJE_EXTRA = 0.25;
const RECARGO_URGENTE = 0.5;

const comisiones: readonly Comision[] = [
  { id: 1, cliente: "Nico", tipo: "retrato", personajes: 1, urgente: false },
  { id: 2, cliente: "Sara", tipo: "personaje", personajes: 3, urgente: true },
  { id: 3, cliente: "Nico", tipo: "fondo", personajes: 0, urgente: false },
  { id: 4, cliente: "Omar", tipo: "personaje", personajes: 2, urgente: false },
  { id: 5, cliente: "Sara", tipo: "retrato", personajes: 2, urgente: false },
  { id: 6, cliente: "", tipo: "fondo", personajes: 0, urgente: true },
  { id: 7, cliente: "Luz", tipo: "personaje", personajes: 0, urgente: false },
];

const esComisionValida = (comision: Comision): boolean =>
  comision.cliente.trim().length > 0 &&
  comision.personajes >= 0 &&
  (comision.tipo === "fondo" || comision.personajes >= 1);

const calcularPrecio = (comision: Comision): number => {
  const extras = Math.max(comision.personajes - 1, 0);
  const base = precioBase[comision.tipo] * (1 + extras * RECARGO_PERSONAJE_EXTRA);
  return Math.round(base * (comision.urgente ? 1 + RECARGO_URGENTE : 1) * 100) / 100;
};

const validas = comisiones.filter(esComisionValida);
const invalidas = comisiones.filter((comision) => !esComisionValida(comision));
const totalPorCliente = validas.reduce(
  (mapa, c) => mapa.set(c.cliente, (mapa.get(c.cliente) ?? 0) + calcularPrecio(c)),
  new Map<string, number>(),
);

console.log("Ejercicio 23: Comisiones de dibujo");
console.log(`Comisiones validas: ${validas.length} | invalidas: ${invalidas.length}`);
invalidas.forEach((c) => console.log(`  - #${c.id} (${c.tipo}) tiene datos invalidos`));
validas.forEach((c) =>
  console.log(`  #${c.id} ${c.cliente} - ${c.tipo}${c.urgente ? " (urgente)" : ""}: $${calcularPrecio(c)}`),
);
console.log("Total por cliente:");
Array.from(totalPorCliente)
  .sort((a, b) => b[1] - a[1])
  .forEach(([cliente, total]) => console.log(`  ${cliente}: $${Math.round(total * 100) / 100}`));
