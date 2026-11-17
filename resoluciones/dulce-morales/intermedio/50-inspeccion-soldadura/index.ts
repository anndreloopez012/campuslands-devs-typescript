export {};

// Intermedio 50: Inspeccion visual soldadura
// Tematica: soldadura
// Resolucion: Dulce Morales
//
// Problema: un inspector revisa a simple vista cada cordon de soldadura y anota los defectos que ve.
// Segun el tipo y la cantidad de defectos, el cordon queda aprobado, se manda a reparar o se
// rechaza. Una reparacion se vuelve a inspeccionar. Con el historial de los ultimos 30 dias se
// calcula la tasa de rechazo de cada soldador: si pasa de 20%, debe volver a certificarse.

// ===================== TIPOS =====================

type Defecto = "porosidad" | "socavado" | "salpicadura" | "falta de fusion" | "grieta";
type Resultado = "aprobada" | "reparar" | "rechazada";

interface Hallazgo {
  readonly defecto: Defecto;
  readonly cantidad: number; // poros, mm de socavado, etc. (por cada 100 mm de cordon)
}

interface Inspeccion {
  readonly id: string;
  readonly fecha: Date;
  readonly soldador: string;
  readonly junta: string;
  readonly hallazgos: readonly Hallazgo[];
  readonly reinspeccionDe: string | null; // si es la revision de una reparacion
}

interface Evaluacion {
  readonly inspeccion: Inspeccion;
  readonly resultado: Resultado;
  readonly motivos: readonly string[];
}

// ===================== CRITERIOS (Record) =====================

// "aceptable": hasta cuanto se acepta sin reparar. "reparable": hasta cuanto se puede reparar.
// Infinity = siempre se puede reparar; 0 y 0 = cualquier cantidad se rechaza
const CRITERIO: Readonly<Record<Defecto, { readonly aceptable: number; readonly reparable: number }>> = {
  porosidad: { aceptable: 3, reparable: 10 },
  socavado: { aceptable: 1, reparable: 5 },
  salpicadura: { aceptable: 20, reparable: Infinity },
  "falta de fusion": { aceptable: 0, reparable: 15 },
  grieta: { aceptable: 0, reparable: 0 }, // cualquier grieta se rechaza
};

const TASA_MAXIMA_RECHAZO: number = 0.2;
const DIAS_VENTANA: number = 30;

// ===================== REGISTRO GENERICO =====================

class Registro<T extends { readonly fecha: Date }> {
  private readonly items: T[] = [];

  agregar(item: T): void {
    this.items.push(item);
  }

  entre(desde: Date, hasta: Date): T[] {
    return this.items.filter((i: T): boolean => i.fecha.getTime() >= desde.getTime() && i.fecha.getTime() <= hasta.getTime());
  }

  todos(): readonly T[] {
    return this.items;
  }
}

// ===================== SERVICIO =====================

class InspeccionService {
  private readonly evaluaciones: Registro<Evaluacion & { readonly fecha: Date }> = new Registro();

  evaluar(ins: Inspeccion): Evaluacion {
    const motivos: string[] = [];
    let resultado: Resultado = "aprobada";
    for (const h of ins.hallazgos) {
      const c = CRITERIO[h.defecto];
      if (h.cantidad <= c.aceptable) continue;
      if (h.cantidad <= c.reparable) {
        motivos.push(`${h.defecto} ${h.cantidad} (acepta hasta ${c.aceptable}): reparar`);
        if (resultado === "aprobada") resultado = "reparar";
      } else {
        motivos.push(`${h.defecto} ${h.cantidad}: no se puede reparar`);
        resultado = "rechazada";
      }
    }
    // Una reparacion que vuelve a salir mal ya no se repara otra vez
    if (ins.reinspeccionDe !== null && resultado === "reparar") {
      resultado = "rechazada";
      motivos.push("ya era una reparacion y sigue con defectos");
    }
    const ev: Evaluacion = { inspeccion: ins, resultado, motivos };
    this.evaluaciones.agregar({ ...ev, fecha: ins.fecha });
    return ev;
  }

  // Tasa de rechazo de cada soldador en los ultimos 30 dias (solo primeras inspecciones)
  tasas(hoy: Date): Map<string, { total: number; rechazadas: number; tasa: number }> {
    const desde: Date = new Date(hoy.getTime() - DIAS_VENTANA * 86_400_000);
    const r: Map<string, { total: number; rechazadas: number; tasa: number }> = new Map();
    for (const ev of this.evaluaciones.entre(desde, hoy)) {
      if (ev.inspeccion.reinspeccionDe !== null) continue;
      const s: string = ev.inspeccion.soldador;
      const actual = r.get(s) ?? { total: 0, rechazadas: 0, tasa: 0 };
      const total: number = actual.total + 1;
      const rechazadas: number = actual.rechazadas + (ev.resultado === "rechazada" ? 1 : 0);
      r.set(s, { total, rechazadas, tasa: rechazadas / total });
    }
    return r;
  }

  defectosMasComunes(): [Defecto, number][] {
    const conteo: Map<Defecto, number> = new Map();
    this.evaluaciones.todos().forEach((ev) =>
      ev.inspeccion.hallazgos.forEach((h: Hallazgo): void => {
        if (h.cantidad > CRITERIO[h.defecto].aceptable) conteo.set(h.defecto, (conteo.get(h.defecto) ?? 0) + 1);
      }),
    );
    return [...conteo.entries()].sort((a, b) => b[1] - a[1]);
  }
}

// ===================== DATOS Y SALIDA =====================

function f(mes: number, dia: number): Date {
  return new Date(2026, mes - 1, dia);
}

const h = (defecto: Defecto, cantidad: number): Hallazgo => ({ defecto, cantidad });

const inspecciones: readonly Inspeccion[] = [
  // Raul: 5 inspecciones, 1 rechazada = 20% EXACTO -> no requiere recertificacion (limite)
  { id: "I01", fecha: f(10, 20), soldador: "Raul", junta: "Viga V1-a", hallazgos: [], reinspeccionDe: null },
  { id: "I02", fecha: f(10, 27), soldador: "Raul", junta: "Viga V1-b", hallazgos: [h("porosidad", 3)], reinspeccionDe: null }, // limite: 3 poros EXACTOS -> aprobada
  { id: "I03", fecha: f(11, 3), soldador: "Raul", junta: "Viga V2-a", hallazgos: [h("socavado", 3)], reinspeccionDe: null },
  { id: "I04", fecha: f(11, 4), soldador: "Raul", junta: "Viga V2-a", hallazgos: [], reinspeccionDe: "I03" }, // reparacion OK
  { id: "I05", fecha: f(11, 10), soldador: "Raul", junta: "Viga V3-a", hallazgos: [h("grieta", 1)], reinspeccionDe: null },
  { id: "I06", fecha: f(11, 12), soldador: "Raul", junta: "Viga V3-b", hallazgos: [h("salpicadura", 25)], reinspeccionDe: null },
  // Lina: muchas rechazadas -> recertificacion
  { id: "I07", fecha: f(11, 2), soldador: "Lina", junta: "Columna C1", hallazgos: [h("falta de fusion", 20)], reinspeccionDe: null },
  { id: "I08", fecha: f(11, 5), soldador: "Lina", junta: "Columna C2", hallazgos: [h("porosidad", 6)], reinspeccionDe: null },
  { id: "I09", fecha: f(11, 6), soldador: "Lina", junta: "Columna C2", hallazgos: [h("porosidad", 4)], reinspeccionDe: "I08" }, // la reparacion sale mal
  { id: "I10", fecha: f(11, 11), soldador: "Lina", junta: "Columna C3", hallazgos: [h("grieta", 2), h("porosidad", 2)], reinspeccionDe: null },
  { id: "I11", fecha: f(11, 13), soldador: "Lina", junta: "Columna C4", hallazgos: [], reinspeccionDe: null },
  // Omar: inspeccion vieja (fuera de los 30 dias) no cuenta para su tasa
  { id: "I12", fecha: f(9, 20), soldador: "Omar", junta: "Placa P1", hallazgos: [h("grieta", 1)], reinspeccionDe: null },
  { id: "I13", fecha: f(11, 9), soldador: "Omar", junta: "Placa P2", hallazgos: [h("salpicadura", 5)], reinspeccionDe: null },
];

function main(): void {
  const servicio: InspeccionService = new InspeccionService();
  const fecha = (d: Date): string => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

  console.log("==================== INSPECCIONES ====================");
  for (const ins of inspecciones) {
    const ev: Evaluacion = servicio.evaluar(ins);
    const rep: string = ins.reinspeccionDe ? ` (reinspeccion de ${ins.reinspeccionDe})` : "";
    console.log(`${ins.id} ${fecha(ins.fecha)} ${ins.soldador.padEnd(5)} ${ins.junta.padEnd(11)} -> ${ev.resultado.toUpperCase()}${rep}`);
    ev.motivos.forEach((m: string): void => console.log(`      - ${m}`));
  }

  const hoy: Date = f(11, 16);
  console.log(`\n==================== TASA DE RECHAZO (ultimos ${DIAS_VENTANA} dias al ${fecha(hoy)}) ====================`);
  for (const [soldador, t] of servicio.tasas(hoy)) {
    const recert: string = t.tasa > TASA_MAXIMA_RECHAZO ? "  << debe recertificarse" : "";
    console.log(`${soldador.padEnd(5)} ${t.rechazadas}/${t.total} rechazadas = ${Math.round(t.tasa * 100)}%${recert}`);
  }

  console.log("\nDefectos que mas aparecen (fuera de lo aceptable):");
  servicio.defectosMasComunes().forEach(([d, n]): void => console.log(`  ${d.padEnd(16)} ${n}`));
}

main();
