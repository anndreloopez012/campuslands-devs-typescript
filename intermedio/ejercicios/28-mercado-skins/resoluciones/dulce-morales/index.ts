export {};

// Intermedio 28: Mercado de skins
// Tematica: videojuegos (mercado de skins)
// Resolucion: Dulce Morales
//
// Problema: un mercado de skins de un shooter recibe publicaciones de venta y ordenes de compra.
// El desgaste (float de 0 a 1) define la condicion de la skin. Hay que calcular el precio de
// referencia de cada skin con su historial, marcar publicaciones sospechosas (muy caras o de
// vendedores bloqueados o con bloqueo de intercambio), emparejar cada orden de compra con la
// publicacion valida mas barata y cobrar la comision del mercado.

// ===================== MODELO =====================

type Rareza = "comun" | "rara" | "mitica" | "legendaria";
type Condicion = "Recien fabricada" | "Casi nueva" | "Algo desgastada" | "Bastante desgastada" | "Deplorable";

interface Publicacion {
  readonly id: string;
  readonly skin: string; // ej. "AK | Neon Tide"
  readonly rareza: Rareza;
  readonly desgaste: number; // float 0 a 1
  readonly stattrak: boolean;
  readonly precio: number;
  readonly vendedor: string;
  readonly diasBloqueo: number; // dias que faltan para poder intercambiarla
}

interface OrdenCompra {
  readonly comprador: string;
  readonly skin: string;
  readonly condicionMinima: Condicion;
  readonly precioMaximo: number;
}

type Revision = { readonly valida: true } | { readonly valida: false; readonly motivo: string };

interface Venta {
  readonly orden: OrdenCompra;
  readonly publicacion: Publicacion;
  readonly comision: number;
  readonly paraVendedor: number;
}

// ===================== REGLAS (Record, Map y Set) =====================

// Limite superior de desgaste de cada condicion (de mejor a peor)
const CONDICIONES: readonly [Condicion, number][] = [
  ["Recien fabricada", 0.07],
  ["Casi nueva", 0.15],
  ["Algo desgastada", 0.38],
  ["Bastante desgastada", 0.45],
  ["Deplorable", 1],
];

const COMISION: Readonly<Record<Rareza, number>> = { comun: 0.05, rara: 0.08, mitica: 0.1, legendaria: 0.12 };
const SOBREPRECIO_SOSPECHOSO: number = 1.5; // 50% sobre la referencia
const VENDEDORES_BLOQUEADOS: ReadonlySet<string> = new Set(["scammer_99", "flipbot"]);

// Historial de ventas recientes de cada skin (precios en USD)
const historial: ReadonlyMap<string, readonly number[]> = new Map<string, readonly number[]>([
  ["AK | Neon Tide", [42, 45, 40, 44, 39]],
  ["AWP | Dragon Ash", [310, 295, 320, 305]],
  ["Pistola | Coral", [3.5, 4, 3.8, 4.2]],
  ["Cuchillo | Aurora", [850, 900, 880]],
]);

// ===================== FUNCIONES PURAS =====================

function condicionDe(desgaste: number): Condicion {
  const encontrada = CONDICIONES.find(([, limite]): boolean => desgaste < limite);
  return encontrada?.[0] ?? "Deplorable";
}

function nivelCondicion(c: Condicion): number {
  return CONDICIONES.findIndex(([nombre]): boolean => nombre === c);
}

function precioReferencia(skin: string): number | null {
  const precios: readonly number[] | undefined = historial.get(skin);
  if (precios === undefined || precios.length === 0) return null;
  return Math.round((precios.reduce((a: number, b: number): number => a + b, 0) / precios.length) * 100) / 100;
}

function revisar(p: Publicacion): Revision {
  if (p.desgaste < 0 || p.desgaste > 1) return { valida: false, motivo: `desgaste ${p.desgaste} fuera de 0-1` };
  if (p.precio <= 0) return { valida: false, motivo: "precio invalido" };
  if (VENDEDORES_BLOQUEADOS.has(p.vendedor)) return { valida: false, motivo: `vendedor bloqueado (${p.vendedor})` };
  if (p.diasBloqueo > 0) return { valida: false, motivo: `bloqueo de intercambio por ${p.diasBloqueo} dia(s)` };
  const referencia: number | null = precioReferencia(p.skin);
  if (referencia !== null && p.precio > referencia * SOBREPRECIO_SOSPECHOSO) {
    return { valida: false, motivo: `$${p.precio} es mas de 50% sobre la referencia ($${referencia})` };
  }
  return { valida: true };
}

// Para cada orden: publicaciones validas de esa skin, con condicion igual o mejor y precio dentro del maximo.
// Se elige la mas barata; en empate, la de menor desgaste. Cada publicacion se vende una sola vez.
function emparejar(ordenes: readonly OrdenCompra[], validas: readonly Publicacion[]): { ventas: Venta[]; sinVenta: { orden: OrdenCompra; motivo: string }[] } {
  const vendidas: Set<string> = new Set<string>();
  const ventas: Venta[] = [];
  const sinVenta: { orden: OrdenCompra; motivo: string }[] = [];

  for (const o of ordenes) {
    const candidatas: Publicacion[] = validas
      .filter((p: Publicacion): boolean => p.skin === o.skin && !vendidas.has(p.id))
      .filter((p: Publicacion): boolean => nivelCondicion(condicionDe(p.desgaste)) <= nivelCondicion(o.condicionMinima))
      .filter((p: Publicacion): boolean => p.precio <= o.precioMaximo)
      .sort((a, b): number => a.precio - b.precio || a.desgaste - b.desgaste);
    const elegida: Publicacion | undefined = candidatas[0];
    if (elegida === undefined) {
      sinVenta.push({ orden: o, motivo: "ninguna publicacion cumple condicion y precio" });
      continue;
    }
    vendidas.add(elegida.id);
    const comision: number = Math.round(elegida.precio * COMISION[elegida.rareza] * 100) / 100;
    ventas.push({ orden: o, publicacion: elegida, comision, paraVendedor: Math.round((elegida.precio - comision) * 100) / 100 });
  }
  return { ventas, sinVenta };
}

// ===================== DATOS DE PRUEBA =====================

const publicaciones: readonly Publicacion[] = [
  { id: "L1", skin: "AK | Neon Tide", rareza: "mitica", desgaste: 0.03, stattrak: true, precio: 48, vendedor: "lucia_fps", diasBloqueo: 0 },
  { id: "L2", skin: "AK | Neon Tide", rareza: "mitica", desgaste: 0.21, stattrak: false, precio: 36, vendedor: "kenji", diasBloqueo: 0 },
  // Limite: desgaste 0.07 EXACTO ya no es "Recien fabricada" (el limite es < 0.07) -> "Casi nueva"
  { id: "L3", skin: "AK | Neon Tide", rareza: "mitica", desgaste: 0.07, stattrak: false, precio: 41, vendedor: "mara", diasBloqueo: 0 },
  { id: "L4", skin: "AWP | Dragon Ash", rareza: "legendaria", desgaste: 0.12, stattrak: false, precio: 299, vendedor: "toni", diasBloqueo: 0 },
  { id: "L5", skin: "AWP | Dragon Ash", rareza: "legendaria", desgaste: 0.05, stattrak: false, precio: 480, vendedor: "flipper", diasBloqueo: 0 }, // sobreprecio
  { id: "L6", skin: "Pistola | Coral", rareza: "comun", desgaste: 0.4, stattrak: false, precio: 3.9, vendedor: "kenji", diasBloqueo: 0 },
  { id: "L7", skin: "Cuchillo | Aurora", rareza: "legendaria", desgaste: 0.01, stattrak: true, precio: 860, vendedor: "scammer_99", diasBloqueo: 0 }, // bloqueado
  { id: "L8", skin: "Cuchillo | Aurora", rareza: "legendaria", desgaste: 0.09, stattrak: false, precio: 870, vendedor: "ana", diasBloqueo: 3 }, // bloqueo de intercambio
  { id: "L9", skin: "Pistola | Coral", rareza: "comun", desgaste: 1.3, stattrak: false, precio: 2, vendedor: "x", diasBloqueo: 0 }, // invalida
];

const ordenes: readonly OrdenCompra[] = [
  { comprador: "Diego", skin: "AK | Neon Tide", condicionMinima: "Casi nueva", precioMaximo: 50 }, // L3 (41) gana a L1 (48)
  { comprador: "Sofia", skin: "AK | Neon Tide", condicionMinima: "Recien fabricada", precioMaximo: 50 }, // solo L1 es FN
  { comprador: "Pablo", skin: "AK | Neon Tide", condicionMinima: "Recien fabricada", precioMaximo: 60 }, // L1 ya se vendio
  { comprador: "Rita", skin: "AWP | Dragon Ash", condicionMinima: "Algo desgastada", precioMaximo: 299 }, // limite: precio EXACTO al maximo
  { comprador: "Leo", skin: "Pistola | Coral", condicionMinima: "Bastante desgastada", precioMaximo: 5 },
  { comprador: "Vale", skin: "Cuchillo | Aurora", condicionMinima: "Casi nueva", precioMaximo: 1000 }, // ninguna valida
];

// ===================== SALIDA POR CONSOLA =====================

function main(): void {
  console.log("==================== PUBLICACIONES ====================");
  const validas: Publicacion[] = [];
  for (const p of publicaciones) {
    const r: Revision = revisar(p);
    const cond: string = p.desgaste >= 0 && p.desgaste <= 1 ? condicionDe(p.desgaste) : "?";
    const st: string = p.stattrak ? " ST" : "";
    const linea: string = `${p.id} ${(p.skin + st).padEnd(21)} ${p.desgaste.toFixed(2)} ${cond.padEnd(19)} $${String(p.precio).padStart(4)}`;
    if (r.valida) {
      validas.push(p);
      console.log(`OK ${linea}`);
    } else {
      console.log(`X  ${linea}  ${r.motivo}`);
    }
  }

  console.log("\n==================== PRECIOS DE REFERENCIA ====================");
  for (const [skin, precios] of historial) {
    console.log(`${skin.padEnd(18)} $${precioReferencia(skin)} (promedio de ${precios.length} ventas)`);
  }

  const { ventas, sinVenta } = emparejar(ordenes, validas);
  console.log("\n==================== VENTAS ====================");
  ventas.forEach((v: Venta): void => {
    const p: Publicacion = v.publicacion;
    console.log(`${v.orden.comprador.padEnd(6)} compra ${p.id} ${p.skin} (${condicionDe(p.desgaste)}) por $${p.precio.toFixed(2)} | comision ${COMISION[p.rareza] * 100}% $${v.comision.toFixed(2)} | ${p.vendedor} recibe $${v.paraVendedor.toFixed(2)}`);
  });
  sinVenta.forEach(({ orden, motivo }): void => console.log(`${orden.comprador.padEnd(6)} sin compra (${orden.skin}, ${orden.condicionMinima}, max $${orden.precioMaximo}): ${motivo}`));

  const porVendedor: Map<string, number> = ventas.reduce(
    (m: Map<string, number>, v: Venta): Map<string, number> => m.set(v.publicacion.vendedor, (m.get(v.publicacion.vendedor) ?? 0) + v.paraVendedor),
    new Map<string, number>(),
  );
  const comisiones: number = ventas.reduce((t: number, v: Venta): number => t + v.comision, 0);
  console.log(`\nComisiones del mercado: $${comisiones.toFixed(2)} | pagos: ${[...porVendedor.entries()].map(([v, t]) => `${v} $${t.toFixed(2)}`).join(", ")}`);
}

main();
