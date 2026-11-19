export {};

// Intermedio 33: Plan de mantenimiento moto
// Tematica: motos y mecanica de motos
// Resolucion: Dulce Morales
//
// Problema: cada tarea de mantenimiento de una moto se hace cada cierto kilometraje, cada cierto
// tiempo, o "lo que ocurra primero". Con el historial de servicios y los km que la moto recorre
// cada mes, hay que saber que tareas estan vencidas hoy, armar el plan de los proximos 12 meses
// y estimar cuanto va a costar.

// ===================== TIPOS =====================

type Sistema = "motor" | "transmision" | "frenos" | "llantas" | "electrico";

// El intervalo de cada tarea: union discriminada por "regla"
type Intervalo =
  | { readonly regla: "km"; readonly cadaKm: number }
  | { readonly regla: "meses"; readonly cadaMeses: number }
  | { readonly regla: "lo que ocurra primero"; readonly cadaKm: number; readonly cadaMeses: number };

interface Tarea {
  readonly id: string;
  readonly nombre: string;
  readonly sistema: Sistema;
  readonly intervalo: Intervalo;
  readonly costo: number;
}

interface Servicio {
  readonly tareaId: string;
  readonly mes: number; // meses desde que se compro la moto
  readonly km: number;
}

type Estado = "al dia" | "proxima" | "vencida";

// Type guards para saber si un intervalo usa km o meses
function usaKm(i: Intervalo): i is Extract<Intervalo, { regla: "km" | "lo que ocurra primero" }> {
  return i.regla === "km" || i.regla === "lo que ocurra primero";
}

function usaMeses(i: Intervalo): i is Extract<Intervalo, { regla: "meses" | "lo que ocurra primero" }> {
  return i.regla === "meses" || i.regla === "lo que ocurra primero";
}

// ===================== CLASES =====================

// Agenda generica: guarda elementos por mes y los devuelve en orden
class Agenda<T> {
  private readonly porMes: Map<number, T[]> = new Map<number, T[]>();

  agregar(mes: number, item: T): void {
    this.porMes.set(mes, [...(this.porMes.get(mes) ?? []), item]);
  }

  meses(): number[] {
    return [...this.porMes.keys()].sort((a, b): number => a - b);
  }

  del(mes: number): readonly T[] {
    return this.porMes.get(mes) ?? [];
  }
}

class Moto {
  private readonly historial: Servicio[] = [];

  constructor(
    public readonly modelo: string,
    private km: number,
    private mes: number,
    public readonly kmPorMes: number,
  ) {
    if (km < 0 || kmPorMes <= 0) throw new Error("kilometraje invalido");
  }

  get kmActual(): number {
    return this.km;
  }

  get mesActual(): number {
    return this.mes;
  }

  registrar(s: Servicio): void {
    if (s.km > this.km || s.mes > this.mes) throw new Error(`servicio ${s.tareaId} en el futuro`);
    this.historial.push(s);
  }

  // El ultimo servicio de una tarea; si nunca se hizo, cuenta desde que se compro (mes 0, km 0)
  ultimo(tareaId: string): Servicio {
    const hechos: Servicio[] = this.historial.filter((s: Servicio): boolean => s.tareaId === tareaId);
    return hechos.sort((a, b): number => b.mes - a.mes)[0] ?? { tareaId, mes: 0, km: 0 };
  }

  // Calcula cuando toca la tarea otra vez (en meses desde la compra)
  mesDeVencimiento(t: Tarea): number {
    const u: Servicio = this.ultimo(t.id);
    const candidatos: number[] = [];
    if (usaKm(t.intervalo)) {
      const kmObjetivo: number = u.km + t.intervalo.cadaKm;
      // En que mes se llega a ese km al ritmo actual
      candidatos.push(this.mes + Math.ceil((kmObjetivo - this.km) / this.kmPorMes));
    }
    if (usaMeses(t.intervalo)) candidatos.push(u.mes + t.intervalo.cadaMeses);
    return Math.min(...candidatos); // "lo que ocurra primero"
  }

  estado(t: Tarea): Estado {
    const vence: number = this.mesDeVencimiento(t);
    if (vence <= this.mes) return "vencida"; // llegar EXACTO al intervalo ya cuenta como vencida
    if (vence - this.mes <= 1) return "proxima";
    return "al dia";
  }
}

// ===================== DATOS =====================

const tareas: readonly Tarea[] = [
  { id: "T1", nombre: "Cambio de aceite", sistema: "motor", intervalo: { regla: "lo que ocurra primero", cadaKm: 3000, cadaMeses: 6 }, costo: 35 },
  { id: "T2", nombre: "Filtro de aire", sistema: "motor", intervalo: { regla: "km", cadaKm: 12000 }, costo: 25 },
  { id: "T3", nombre: "Lubricar cadena", sistema: "transmision", intervalo: { regla: "km", cadaKm: 800 }, costo: 8 },
  { id: "T4", nombre: "Kit de arrastre", sistema: "transmision", intervalo: { regla: "km", cadaKm: 20000 }, costo: 140 },
  { id: "T5", nombre: "Liquido de frenos", sistema: "frenos", intervalo: { regla: "meses", cadaMeses: 24 }, costo: 30 },
  { id: "T6", nombre: "Pastillas de freno", sistema: "frenos", intervalo: { regla: "km", cadaKm: 10000 }, costo: 45 },
  { id: "T7", nombre: "Revision de llantas", sistema: "llantas", intervalo: { regla: "meses", cadaMeses: 3 }, costo: 0 },
  { id: "T8", nombre: "Bateria", sistema: "electrico", intervalo: { regla: "lo que ocurra primero", cadaKm: 30000, cadaMeses: 36 }, costo: 90 },
];

const historial: readonly Servicio[] = [
  { tareaId: "T1", mes: 18, km: 9500 }, // aceite: 6 meses despues es mes 24 -> hoy, vencida (limite exacto)
  { tareaId: "T2", mes: 12, km: 6200 },
  { tareaId: "T3", mes: 23, km: 11900 },
  { tareaId: "T6", mes: 15, km: 7900 },
  { tareaId: "T7", mes: 22, km: 11400 },
];

// ===================== SALIDA =====================

function main(): void {
  // Moto con 24 meses y 12,300 km que recorre 500 km al mes
  const moto: Moto = new Moto("Yamaha MT-03", 12300, 24, 500);
  historial.forEach((s: Servicio): void => moto.registrar(s));

  try {
    moto.registrar({ tareaId: "T4", mes: 30, km: 15000 });
  } catch (e: unknown) {
    console.log(`Validacion: ${e instanceof Error ? e.message : "error"}\n`);
  }

  console.log(`=========== ${moto.modelo}: mes ${moto.mesActual}, ${moto.kmActual} km (${moto.kmPorMes} km/mes) ===========`);
  const orden: Record<Estado, number> = { vencida: 0, proxima: 1, "al dia": 2 };
  [...tareas]
    .sort((a, b): number => orden[moto.estado(a)] - orden[moto.estado(b)] || moto.mesDeVencimiento(a) - moto.mesDeVencimiento(b))
    .forEach((t: Tarea): void => {
      const u: Servicio = moto.ultimo(t.id);
      const ultimo: string = u.mes === 0 ? "nunca" : `mes ${u.mes} / ${u.km} km`;
      const regla: string = t.intervalo.regla === "km" ? `cada ${t.intervalo.cadaKm} km` : t.intervalo.regla === "meses" ? `cada ${t.intervalo.cadaMeses} meses` : `${t.intervalo.cadaKm} km o ${t.intervalo.cadaMeses} meses`;
      console.log(`${moto.estado(t).toUpperCase().padEnd(8)} ${t.nombre.padEnd(19)} ${regla.padEnd(22)} ultimo: ${ultimo.padEnd(18)} toca: mes ${moto.mesDeVencimiento(t)}`);
    });

  // Plan de los proximos 12 meses: se simula hacer cada tarea cuando vence
  console.log("\n=========== PLAN DE LOS PROXIMOS 12 MESES ===========");
  const agenda: Agenda<Tarea> = new Agenda<Tarea>();
  const fin: number = moto.mesActual + 12;
  for (const t of tareas) {
    let siguiente: number = Math.max(moto.mesActual, moto.mesDeVencimiento(t));
    while (siguiente <= fin) {
      agenda.agregar(siguiente, t);
      // Siguiente vez, contando desde ese servicio (el que ocurra primero: km o meses)
      const porKm: number = usaKm(t.intervalo) ? siguiente + Math.ceil(t.intervalo.cadaKm / moto.kmPorMes) : Infinity;
      const porMeses: number = usaMeses(t.intervalo) ? siguiente + t.intervalo.cadaMeses : Infinity;
      siguiente = Math.min(porKm, porMeses);
    }
  }
  let total: number = 0;
  const porSistema: Record<Sistema, number> = { motor: 0, transmision: 0, frenos: 0, llantas: 0, electrico: 0 };
  for (const mes of agenda.meses()) {
    const lista: readonly Tarea[] = agenda.del(mes);
    const costo: number = lista.reduce((s: number, t: Tarea): number => s + t.costo, 0);
    total += costo;
    lista.forEach((t: Tarea): void => {
      porSistema[t.sistema] += t.costo;
    });
    const km: number = moto.kmActual + (mes - moto.mesActual) * moto.kmPorMes;
    console.log(`Mes ${String(mes).padStart(2)} (~${km} km): ${lista.map((t) => t.nombre).join(", ")} -> $${costo}`);
  }
  console.log(`\nCosto estimado del ano: $${total}`);
  console.log(`Por sistema: ${Object.entries(porSistema).filter(([, v]) => v > 0).map(([s, v]) => `${s} $${v}`).join(", ")}`);
}

main();
