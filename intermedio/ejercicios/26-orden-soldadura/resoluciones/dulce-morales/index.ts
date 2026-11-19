export {};

// Intermedio 26: Control de soldadura
// Tematica: soldadura
// Resolucion: Dulce Morales
//
// Problema: un taller de estructuras metalicas recibe ordenes de soldadura. Cada orden pide un
// proceso (MIG, TIG o electrodo) sobre un material y un espesor, con un amperaje programado.
// Hay que asignar cada orden a un soldador certificado para ese proceso y espesor, revisar que
// el amperaje este en el rango correcto, descontar el consumible y resumir la carga por soldador.

// ===================== MODELO =====================

type Proceso = "MIG" | "TIG" | "electrodo";
type Material = "acero" | "inoxidable" | "aluminio";
type Consumible = "alambre ER70S" | "varilla ER308" | "varilla ER4043" | "electrodo E6013";

interface Soldador {
  readonly nombre: string;
  readonly certificaciones: ReadonlySet<Proceso>;
  readonly espesorMaxMm: number;
  readonly horasDisponibles: number;
}

interface Orden {
  readonly folio: string;
  readonly proceso: Proceso;
  readonly material: Material;
  readonly espesorMm: number;
  readonly metrosCordon: number;
  readonly amperaje: number;
}

type Resultado =
  | { readonly estado: "asignada"; readonly orden: Orden; readonly soldador: string; readonly horas: number; readonly consumible: Consumible }
  | { readonly estado: "rechazada"; readonly orden: Orden; readonly motivo: string };

// ===================== REGLAS (Record y Set) =====================

// Rango de amperaje por proceso y material (null = combinacion no permitida)
const RANGO_AMPERAJE: Readonly<Record<Proceso, Readonly<Record<Material, readonly [number, number] | null>>>> = {
  MIG: { acero: [90, 250], inoxidable: [80, 200], aluminio: [100, 220] },
  TIG: { acero: [60, 180], inoxidable: [50, 160], aluminio: [70, 200] },
  electrodo: { acero: [70, 160], inoxidable: [60, 140], aluminio: null },
};

// Consumible que usa cada combinacion
const CONSUMIBLE: Readonly<Record<Proceso, Readonly<Record<Material, Consumible>>>> = {
  MIG: { acero: "alambre ER70S", inoxidable: "varilla ER308", aluminio: "varilla ER4043" },
  TIG: { acero: "alambre ER70S", inoxidable: "varilla ER308", aluminio: "varilla ER4043" },
  electrodo: { acero: "electrodo E6013", inoxidable: "varilla ER308", aluminio: "varilla ER4043" },
};

// Metros de cordon por hora segun el proceso (TIG es el mas lento)
const METROS_POR_HORA: Readonly<Record<Proceso, number>> = { MIG: 6, TIG: 2, electrodo: 3 };
// Kg de consumible por metro de cordon
const KG_POR_METRO: number = 0.2;

// ===================== DATOS DE PRUEBA =====================

const soldadores: readonly Soldador[] = [
  { nombre: "Raul", certificaciones: new Set<Proceso>(["MIG", "electrodo"]), espesorMaxMm: 20, horasDisponibles: 8 },
  { nombre: "Lina", certificaciones: new Set<Proceso>(["TIG", "MIG"]), espesorMaxMm: 12, horasDisponibles: 8 },
  { nombre: "Omar", certificaciones: new Set<Proceso>(["electrodo"]), espesorMaxMm: 25, horasDisponibles: 6 },
];

const inventarioInicial: Readonly<Record<Consumible, number>> = {
  "alambre ER70S": 20,
  "varilla ER308": 2,
  "varilla ER4043": 3,
  "electrodo E6013": 6,
};

const ordenes: readonly Orden[] = [
  { folio: "S-01", proceso: "MIG", material: "acero", espesorMm: 8, metrosCordon: 24, amperaje: 180 },
  { folio: "S-02", proceso: "TIG", material: "inoxidable", espesorMm: 4, metrosCordon: 6, amperaje: 120 },
  { folio: "S-03", proceso: "electrodo", material: "acero", espesorMm: 22, metrosCordon: 9, amperaje: 150 },
  // Limite: amperaje EXACTO al maximo del rango TIG-aluminio (200) -> si
  { folio: "S-04", proceso: "TIG", material: "aluminio", espesorMm: 6, metrosCordon: 4, amperaje: 200 },
  // Amperaje fuera de rango
  { folio: "S-05", proceso: "MIG", material: "inoxidable", espesorMm: 5, metrosCordon: 10, amperaje: 230 },
  // Combinacion no permitida
  { folio: "S-06", proceso: "electrodo", material: "aluminio", espesorMm: 6, metrosCordon: 5, amperaje: 100 },
  // Nadie certificado en TIG para 15 mm
  { folio: "S-07", proceso: "TIG", material: "acero", espesorMm: 15, metrosCordon: 3, amperaje: 150 },
  // Se acaba la varilla ER308 (solo quedan 2 kg y la S-02 uso 1.2)
  { folio: "S-08", proceso: "TIG", material: "inoxidable", espesorMm: 3, metrosCordon: 5, amperaje: 100 },
  // Necesita 5 h: a Raul le quedan 4 y a Lina 3 -> nadie tiene tiempo
  { folio: "S-09", proceso: "MIG", material: "acero", espesorMm: 10, metrosCordon: 30, amperaje: 200 },
  // Datos invalidos
  { folio: "S-10", proceso: "MIG", material: "acero", espesorMm: 0, metrosCordon: -2, amperaje: 150 },
];

// ===================== CALCULOS (funciones puras) =====================

function redondear(v: number): number {
  return Math.round(v * 100) / 100;
}

function horasDeOrden(o: Orden): number {
  return redondear(o.metrosCordon / METROS_POR_HORA[o.proceso]);
}

function validarParametros(o: Orden): string | null {
  if (o.espesorMm <= 0 || o.metrosCordon <= 0) return "espesor y metros deben ser mayores que 0";
  const rango = RANGO_AMPERAJE[o.proceso][o.material];
  if (rango === null) return `${o.proceso} no se usa en ${o.material}`;
  const [min, max] = rango;
  if (o.amperaje < min || o.amperaje > max) return `${o.amperaje} A fuera del rango ${min}-${max} A`;
  return null;
}

function procesar(lista: readonly Orden[]): { resultados: Resultado[]; inventario: Record<Consumible, number>; horasUsadas: Map<string, number> } {
  const inventario: Record<Consumible, number> = { ...inventarioInicial };
  const horasUsadas: Map<string, number> = new Map(soldadores.map((s: Soldador): [string, number] => [s.nombre, 0]));
  const resultados: Resultado[] = [];

  for (const o of lista) {
    const error: string | null = validarParametros(o);
    if (error !== null) {
      resultados.push({ estado: "rechazada", orden: o, motivo: error });
      continue;
    }
    const certificados: Soldador[] = soldadores.filter((s: Soldador): boolean => s.certificaciones.has(o.proceso) && s.espesorMaxMm >= o.espesorMm);
    if (certificados.length === 0) {
      resultados.push({ estado: "rechazada", orden: o, motivo: `nadie certificado en ${o.proceso} para ${o.espesorMm} mm` });
      continue;
    }
    const consumible: Consumible = CONSUMIBLE[o.proceso][o.material];
    const kg: number = redondear(o.metrosCordon * KG_POR_METRO);
    if (inventario[consumible] < kg) {
      resultados.push({ estado: "rechazada", orden: o, motivo: `faltan ${consumible}: necesita ${kg} kg, hay ${redondear(inventario[consumible])} kg` });
      continue;
    }
    const horas: number = horasDeOrden(o);
    // Se elige al certificado con mas horas libres que alcance
    const libre = (s: Soldador): number => s.horasDisponibles - (horasUsadas.get(s.nombre) ?? 0);
    const elegido: Soldador | undefined = certificados.filter((s: Soldador): boolean => libre(s) >= horas).sort((a, b): number => libre(b) - libre(a))[0];
    if (elegido === undefined) {
      resultados.push({ estado: "rechazada", orden: o, motivo: `necesita ${horas} h y ningun certificado tiene tiempo` });
      continue;
    }
    horasUsadas.set(elegido.nombre, (horasUsadas.get(elegido.nombre) ?? 0) + horas);
    inventario[consumible] = redondear(inventario[consumible] - kg);
    resultados.push({ estado: "asignada", orden: o, soldador: elegido.nombre, horas, consumible });
  }
  return { resultados, inventario, horasUsadas };
}

// ===================== SALIDA POR CONSOLA =====================

function main(): void {
  const { resultados, inventario, horasUsadas } = procesar(ordenes);

  console.log("==================== ORDENES DE SOLDADURA ====================");
  for (const r of resultados) {
    const o: Orden = r.orden;
    const que: string = `${o.folio} ${o.proceso.padEnd(9)} ${o.material.padEnd(10)} ${String(o.espesorMm).padStart(2)} mm ${String(o.amperaje).padStart(3)} A`;
    if (r.estado === "asignada") {
      console.log(`OK ${que} -> ${r.soldador.padEnd(5)} ${r.horas} h, ${r.consumible}`);
    } else {
      console.log(`X  ${que} -> ${r.motivo}`);
    }
  }

  console.log("\n==================== CARGA POR SOLDADOR ====================");
  const porSoldador: Map<string, Resultado[]> = resultados.reduce(
    (m: Map<string, Resultado[]>, r: Resultado): Map<string, Resultado[]> =>
      r.estado === "asignada" ? m.set(r.soldador, [...(m.get(r.soldador) ?? []), r]) : m,
    new Map<string, Resultado[]>(),
  );
  for (const s of soldadores) {
    const usadas: number = redondear(horasUsadas.get(s.nombre) ?? 0);
    const folios: string = (porSoldador.get(s.nombre) ?? []).map((r: Resultado): string => r.orden.folio).join(", ") || "-";
    console.log(`${s.nombre.padEnd(5)} ${usadas}/${s.horasDisponibles} h | ${[...s.certificaciones].join("/")} hasta ${s.espesorMaxMm} mm | ordenes: ${folios}`);
  }

  console.log("\n==================== CONSUMIBLES ====================");
  const nombres: readonly Consumible[] = ["alambre ER70S", "varilla ER308", "varilla ER4043", "electrodo E6013"];
  nombres.forEach((c: Consumible): void => {
    const aviso: string = inventario[c] < 1 ? "  << reabastecer" : "";
    console.log(`${c.padEnd(16)} ${inventarioInicial[c]} kg -> ${inventario[c]} kg${aviso}`);
  });

  const porProceso: Record<Proceso, number> = { MIG: 0, TIG: 0, electrodo: 0 };
  resultados.forEach((r: Resultado): void => {
    if (r.estado === "asignada") porProceso[r.orden.proceso] += r.orden.metrosCordon;
  });
  const asignadas: number = resultados.filter((r: Resultado): boolean => r.estado === "asignada").length;
  console.log(`\nAsignadas ${asignadas} de ${resultados.length} | metros por proceso: MIG ${porProceso.MIG}, TIG ${porProceso.TIG}, electrodo ${porProceso.electrodo}`);
}

main();
