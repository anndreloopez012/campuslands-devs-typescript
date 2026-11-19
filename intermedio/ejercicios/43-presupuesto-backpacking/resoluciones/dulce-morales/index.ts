export {};

// Intermedio 43: Presupuesto backpacking
// Tematica: viajes de mochilero
// Resolucion: Dulce Morales
//
// Problema: una mochilera recorre varios paises con un presupuesto total en dolares. Cada pais
// tiene su moneda y un presupuesto diario. Registra gastos en moneda local; un servicio los
// valida (fecha dentro del tramo, moneda correcta), los convierte a dolares y arma reportes:
// gasto por pais y categoria, dias que se paso del presupuesto y cuanto puede gastar por dia
// en lo que queda del viaje.

// ===================== TIPOS =====================

type Moneda = "USD" | "PEN" | "BOB" | "CLP" | "ARS";
type Categoria = "hospedaje" | "comida" | "transporte" | "actividades" | "otros";

interface Tramo {
  readonly pais: string;
  readonly moneda: Moneda;
  readonly desde: Date;
  readonly hasta: Date; // inclusive
  readonly presupuestoDiarioUsd: number;
}

interface Gasto {
  readonly id: number;
  readonly fecha: Date;
  readonly monto: number;
  readonly moneda: Moneda;
  readonly categoria: Categoria;
  readonly descripcion: string;
}

interface GastoUsd extends Gasto {
  readonly usd: number;
  readonly pais: string;
}

// ===================== REGLAS =====================

// Cuantas unidades de cada moneda equivalen a 1 USD
const TASA: Readonly<Record<Moneda, number>> = { USD: 1, PEN: 3.75, BOB: 6.9, CLP: 940, ARS: 1000 };
const DIA_MS: number = 86_400_000;

function dia(m: number, d: number): Date {
  return new Date(2026, m - 1, d);
}

function claveDia(f: Date): string {
  return `${String(f.getDate()).padStart(2, "0")}/${String(f.getMonth() + 1).padStart(2, "0")}`;
}

function redondear(v: number): number {
  return Math.round(v * 100) / 100;
}

// ===================== SERVICIO =====================

class PresupuestoService {
  private readonly gastos: GastoUsd[] = [];
  private siguienteId: number = 1;

  constructor(
    private readonly tramos: readonly Tramo[],
    private readonly presupuestoTotalUsd: number,
  ) {}

  private tramoDe(f: Date): Tramo | undefined {
    return this.tramos.find((t: Tramo): boolean => f.getTime() >= t.desde.getTime() && f.getTime() <= t.hasta.getTime());
  }

  registrar(fecha: Date, monto: number, moneda: Moneda, categoria: Categoria, descripcion: string): { ok: true; gasto: GastoUsd } | { ok: false; motivo: string } {
    if (monto <= 0) return { ok: false, motivo: "el monto debe ser mayor que 0" };
    const tramo: Tramo | undefined = this.tramoDe(fecha);
    if (tramo === undefined) return { ok: false, motivo: `el ${claveDia(fecha)} no esta dentro del viaje` };
    // Solo se acepta la moneda del pais o dolares
    if (moneda !== tramo.moneda && moneda !== "USD") return { ok: false, motivo: `en ${tramo.pais} se paga en ${tramo.moneda} o USD, no en ${moneda}` };
    const gasto: GastoUsd = { id: this.siguienteId++, fecha, monto, moneda, categoria, descripcion, usd: redondear(monto / TASA[moneda]), pais: tramo.pais };
    this.gastos.push(gasto);
    return { ok: true, gasto };
  }

  totalGastado(): number {
    return redondear(this.gastos.reduce((s: number, g: GastoUsd): number => s + g.usd, 0));
  }

  porCategoria(): Record<Categoria, number> {
    const total: Record<Categoria, number> = { hospedaje: 0, comida: 0, transporte: 0, actividades: 0, otros: 0 };
    this.gastos.forEach((g: GastoUsd): void => {
      total[g.categoria] = redondear(total[g.categoria] + g.usd);
    });
    return total;
  }

  // Gasto de cada dia, agrupado por tramo, comparado con su presupuesto diario
  dias(): { tramo: Tramo; dia: string; usd: number }[] {
    const porDia: Map<string, { tramo: Tramo; dia: string; usd: number }> = new Map();
    for (const g of this.gastos) {
      const tramo: Tramo | undefined = this.tramoDe(g.fecha);
      if (tramo === undefined) continue;
      const k: string = claveDia(g.fecha);
      const actual = porDia.get(k) ?? { tramo, dia: k, usd: 0 };
      porDia.set(k, { ...actual, usd: redondear(actual.usd + g.usd) });
    }
    return [...porDia.values()];
  }

  porPais(): Map<string, { gastado: number; presupuesto: number; dias: number }> {
    const r: Map<string, { gastado: number; presupuesto: number; dias: number }> = new Map();
    for (const t of this.tramos) {
      const dias: number = Math.round((t.hasta.getTime() - t.desde.getTime()) / DIA_MS) + 1;
      const gastado: number = redondear(this.gastos.filter((g) => g.pais === t.pais).reduce((s, g): number => s + g.usd, 0));
      r.set(t.pais, { gastado, presupuesto: dias * t.presupuestoDiarioUsd, dias });
    }
    return r;
  }

  // Cuanto puede gastar por dia desde "hoy" hasta el final del viaje
  proyeccion(hoy: Date): { restante: number; diasRestantes: number; porDia: number } {
    const fin: Date | undefined = this.tramos[this.tramos.length - 1]?.hasta;
    const diasRestantes: number = fin === undefined ? 0 : Math.max(0, Math.round((fin.getTime() - hoy.getTime()) / DIA_MS) + 1);
    const restante: number = redondear(this.presupuestoTotalUsd - this.totalGastado());
    return { restante, diasRestantes, porDia: diasRestantes === 0 ? 0 : redondear(restante / diasRestantes) };
  }
}

// ===================== DATOS Y SALIDA =====================

const tramos: readonly Tramo[] = [
  { pais: "Peru", moneda: "PEN", desde: dia(3, 1), hasta: dia(3, 5), presupuestoDiarioUsd: 45 },
  { pais: "Bolivia", moneda: "BOB", desde: dia(3, 6), hasta: dia(3, 9), presupuestoDiarioUsd: 35 },
  { pais: "Chile", moneda: "CLP", desde: dia(3, 10), hasta: dia(3, 13), presupuestoDiarioUsd: 60 },
  { pais: "Argentina", moneda: "ARS", desde: dia(3, 14), hasta: dia(3, 18), presupuestoDiarioUsd: 50 },
];

function main(): void {
  const servicio: PresupuestoService = new PresupuestoService(tramos, 900);
  const gastos: [Date, number, Moneda, Categoria, string][] = [
    [dia(3, 1), 120, "PEN", "hospedaje", "Hostal en Cusco (2 noches)"],
    [dia(3, 1), 45, "PEN", "comida", "Menu del dia"],
    [dia(3, 2), 70, "USD", "actividades", "Entrada a Machu Picchu"],
    [dia(3, 2), 30, "PEN", "comida", "Cena"],
    [dia(3, 3), 168.75, "PEN", "transporte", "Tren"], // limite: 45 USD EXACTOS = presupuesto del dia
    [dia(3, 5), 90, "PEN", "transporte", "Bus a La Paz"], // limite: ultimo dia del tramo de Peru
    [dia(3, 6), 140, "BOB", "hospedaje", "Hostal La Paz"],
    [dia(3, 7), 350, "BOB", "actividades", "Tour Salar de Uyuni"],
    [dia(3, 8), 60, "BOB", "comida", "Comidas del tour"],
    [dia(3, 10), 28000, "CLP", "hospedaje", "Hostal en San Pedro"],
    [dia(3, 11), 45000, "CLP", "actividades", "Geiseres del Tatio"],
    [dia(3, 11), 15000, "CLP", "comida", "Almuerzo y cena"],
    // Invalidos
    [dia(3, 12), 20, "PEN", "comida", "Soles en Chile"],
    [dia(3, 25), 30, "USD", "otros", "Fuera del viaje"],
    [dia(3, 12), 0, "CLP", "otros", "Monto cero"],
  ];

  console.log("==================== REGISTRO DE GASTOS ====================");
  for (const [fecha, monto, moneda, categoria, desc] of gastos) {
    const r = servicio.registrar(fecha, monto, moneda, categoria, desc);
    if (r.ok) console.log(`OK ${claveDia(fecha)} ${r.gasto.pais.padEnd(9)} ${desc.padEnd(27)} ${String(monto).padStart(6)} ${moneda} = $${r.gasto.usd.toFixed(2)}`);
    else console.log(`X  ${claveDia(fecha)} ${desc.padEnd(37)} -> ${r.motivo}`);
  }

  console.log("\n==================== DIAS SOBRE PRESUPUESTO ====================");
  servicio.dias().forEach(({ tramo, dia: d, usd }): void => {
    const marca: string = usd > tramo.presupuestoDiarioUsd ? `EXCEDIDO por $${redondear(usd - tramo.presupuestoDiarioUsd).toFixed(2)}` : usd === tramo.presupuestoDiarioUsd ? "justo en el limite" : "ok";
    console.log(`${d} ${tramo.pais.padEnd(9)} $${usd.toFixed(2).padStart(6)} de $${tramo.presupuestoDiarioUsd} -> ${marca}`);
  });

  console.log("\n==================== POR PAIS ====================");
  for (const [pais, r] of servicio.porPais()) {
    console.log(`${pais.padEnd(9)} ${r.dias} dias | gastado $${r.gastado.toFixed(2).padStart(7)} de $${r.presupuesto} | ${r.gastado <= r.presupuesto ? `sobran $${redondear(r.presupuesto - r.gastado).toFixed(2)}` : `excedido $${redondear(r.gastado - r.presupuesto).toFixed(2)}`}`);
  }

  console.log("\n==================== POR CATEGORIA ====================");
  const cat: Record<Categoria, number> = servicio.porCategoria();
  const total: number = servicio.totalGastado();
  const categorias: readonly Categoria[] = ["hospedaje", "comida", "transporte", "actividades", "otros"];
  categorias
    .map((c: Categoria): [Categoria, number] => [c, cat[c]])
    .sort((a, b) => b[1] - a[1])
    .forEach(([c, v]): void => console.log(`${c.padEnd(12)} $${v.toFixed(2).padStart(7)} (${total === 0 ? 0 : Math.round((v / total) * 100)}%)`));

  const p = servicio.proyeccion(dia(3, 12));
  console.log(`\nAl 12/03: gastado $${total.toFixed(2)} de $900. Quedan $${p.restante.toFixed(2)} para ${p.diasRestantes} dias -> $${p.porDia.toFixed(2)} por dia`);
}

main();
