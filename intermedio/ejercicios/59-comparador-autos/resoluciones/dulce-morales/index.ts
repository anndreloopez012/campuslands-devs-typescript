export {};

// Intermedio 59: Comparador de autos premium
// Tematica: autos de lujo
// Resolucion: Dulce Morales
//
// Problema: un comparador junta datos de cada auto desde tres servicios remotos (simulados):
// ficha tecnica del fabricante, calificacion de resenas y precio de concesionarios. Las fichas y
// resenas se piden en paralelo; si un servicio falla, se usa lo que llego y se avisa. El precio
// se toma del primer concesionario que responda (Promise.any); si todos fallan se informa.
// Al final se ordenan los autos segun las prioridades del comprador.

// ===================== TIPOS =====================

interface Ficha {
  readonly potenciaHp: number;
  readonly ceroACien: number;
  readonly consumoKmL: number;
  readonly cajuela: number; // litros
}

interface Auto {
  readonly modelo: string;
  readonly ficha: Ficha | null;
  readonly calificacion: number | null; // 0 a 5
  readonly precio: { readonly monto: number; readonly concesionario: string } | null;
  readonly avisos: readonly string[];
}

type Prioridad = "potencia" | "aceleracion" | "consumo" | "espacio" | "precio" | "resenas";

// ===================== ERRORES TIPADOS =====================

class ErrorServicio extends Error {
  constructor(public readonly servicio: string, public readonly modelo: string, motivo: string) {
    super(`${servicio} (${modelo}): ${motivo}`);
    this.name = "ErrorServicio";
  }
}

// ===================== SERVICIOS SIMULADOS =====================

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const FICHAS: ReadonlyMap<string, Ficha> = new Map([
  ["Porsche Taycan", { potenciaHp: 616, ceroACien: 3.2, consumoKmL: 0, cajuela: 407 }],
  ["BMW M5", { potenciaHp: 617, ceroACien: 3.3, consumoKmL: 9.0, cajuela: 530 }],
  ["Mercedes AMG GT", { potenciaHp: 577, ceroACien: 3.2, consumoKmL: 8.2, cajuela: 456 }],
  ["Audi RS7", { potenciaHp: 591, ceroACien: 3.6, consumoKmL: 8.5, cajuela: 535 }],
]);
const RESENAS: ReadonlyMap<string, number> = new Map([["Porsche Taycan", 4.7], ["BMW M5", 4.5], ["Audi RS7", 4.4]]); // falta el AMG GT
const SIN_FICHA: ReadonlySet<string> = new Set(["Lexus LC"]); // el fabricante no responde

// Concesionarios: [nombre, demora ms, precio o null si falla] por modelo
const CONCESIONARIOS: ReadonlyMap<string, readonly [string, number, number | null][]> = new Map([
  ["Porsche Taycan", [["AutoLux", 40, 112000], ["Prestige", 15, 115500], ["Elite Motors", 30, null]]],
  ["BMW M5", [["AutoLux", 25, 120000], ["Prestige", 35, 118900]]],
  ["Mercedes AMG GT", [["Elite Motors", 20, 136000]]],
  ["Audi RS7", [["AutoLux", 10, null], ["Prestige", 20, null]]], // todos fallan
  ["Lexus LC", [["Prestige", 15, 99000]]],
]);

async function pedirFicha(modelo: string): Promise<Ficha> {
  await esperar(15);
  const f: Ficha | undefined = FICHAS.get(modelo);
  if (f === undefined || SIN_FICHA.has(modelo)) throw new ErrorServicio("fabricante", modelo, "no respondio");
  return f;
}

async function pedirResenas(modelo: string): Promise<number> {
  await esperar(10);
  const c: number | undefined = RESENAS.get(modelo);
  if (c === undefined) throw new ErrorServicio("resenas", modelo, "sin resenas publicadas");
  return c;
}

async function cotizar(modelo: string, concesionario: string, demora: number, precio: number | null): Promise<{ monto: number; concesionario: string }> {
  await esperar(demora);
  if (precio === null) throw new ErrorServicio(`concesionario ${concesionario}`, modelo, "sin stock");
  return { monto: precio, concesionario };
}

// ===================== ARMADO DE CADA AUTO =====================

async function armarAuto(modelo: string): Promise<Auto> {
  const avisos: string[] = [];
  // Ficha y resenas en paralelo; allSettled para usar lo que llegue
  const [ficha, resenas] = await Promise.allSettled([pedirFicha(modelo), pedirResenas(modelo)]);
  if (ficha.status === "rejected") avisos.push(ficha.reason instanceof ErrorServicio ? ficha.reason.message : "ficha no disponible");
  if (resenas.status === "rejected") avisos.push(resenas.reason instanceof ErrorServicio ? resenas.reason.message : "resenas no disponibles");

  // Precio: el primer concesionario que responda bien (Promise.any). Si todos fallan -> AggregateError
  let precio: Auto["precio"] = null;
  const ofertas = (CONCESIONARIOS.get(modelo) ?? []).map(([c, d, p]) => cotizar(modelo, c, d, p));
  try {
    precio = await Promise.any(ofertas);
  } catch (e: unknown) {
    if (e instanceof AggregateError) avisos.push(`ningun concesionario tiene precio (${e.errors.length} fallaron)`);
    else throw e;
  }

  return {
    modelo,
    ficha: ficha.status === "fulfilled" ? ficha.value : null,
    calificacion: resenas.status === "fulfilled" ? resenas.value : null,
    precio,
    avisos,
  };
}

// ===================== PUNTAJE SEGUN PRIORIDADES =====================

// Cada criterio da de 0 a 10 puntos. Si falta el dato, ese criterio da 0.
function puntos(a: Auto, p: Prioridad): number {
  const f: Ficha | null = a.ficha;
  switch (p) {
    case "potencia":
      return f ? Math.min(10, f.potenciaHp / 65) : 0;
    case "aceleracion":
      return f ? Math.max(0, (6 - f.ceroACien) * 3.5) : 0;
    case "consumo":
      return f ? (f.consumoKmL === 0 ? 10 : Math.min(10, f.consumoKmL)) : 0; // electrico = 10
    case "espacio":
      return f ? Math.min(10, f.cajuela / 55) : 0;
    case "precio":
      return a.precio ? Math.max(0, 10 - (a.precio.monto - 90000) / 5000) : 0;
    case "resenas":
      return a.calificacion !== null ? a.calificacion * 2 : 0;
  }
}

const PRIORIDADES: readonly Prioridad[] = ["potencia", "aceleracion", "consumo", "espacio", "precio", "resenas"];

// Suma de (puntos del criterio x peso que le da el comprador); un criterio sin peso no cuenta
function puntaje(a: Auto, pesos: Readonly<Partial<Record<Prioridad, number>>>): number {
  const total: number = PRIORIDADES.reduce((s: number, p: Prioridad): number => s + puntos(a, p) * (pesos[p] ?? 0), 0);
  return Math.round(total * 10) / 10;
}

// ===================== SALIDA =====================

async function main(): Promise<void> {
  const modelos: readonly string[] = [...CONCESIONARIOS.keys()];
  console.log("================ CONSULTANDO SERVICIOS (todos los autos en paralelo) ================");
  const autos: Auto[] = await Promise.all(modelos.map(armarAuto));

  for (const a of autos) {
    const f: string = a.ficha ? `${a.ficha.potenciaHp} hp, 0-100 en ${a.ficha.ceroACien} s, ${a.ficha.consumoKmL === 0 ? "electrico" : `${a.ficha.consumoKmL} km/L`}, ${a.ficha.cajuela} L` : "sin ficha";
    const pr: string = a.precio ? `$${a.precio.monto.toLocaleString("en-US")} (${a.precio.concesionario})` : "sin precio";
    console.log(`\n${a.modelo}: ${f} | ${a.calificacion !== null ? `${a.calificacion} estrellas` : "sin resenas"} | ${pr}`);
    a.avisos.forEach((x) => console.log(`   ! ${x}`));
  }

  const perfiles: readonly [string, Partial<Record<Prioridad, number>>][] = [
    ["Familia que viaja", { espacio: 3, consumo: 2, precio: 2, resenas: 1 }],
    ["Amante de la velocidad", { potencia: 3, aceleracion: 3, resenas: 1 }],
  ];
  for (const [nombre, pesos] of perfiles) {
    console.log(`\n================ RANKING: ${nombre} ================`);
    [...autos]
      .sort((a, b) => puntaje(b, pesos) - puntaje(a, pesos))
      .forEach((a, i) => console.log(`${i + 1}. ${a.modelo.padEnd(16)} ${puntaje(a, pesos)} pts${a.avisos.length > 0 ? "  (datos incompletos)" : ""}`));
  }
}

main();
