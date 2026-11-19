export {};

// Intermedio 74: Planner de viajes DOM
// Tematica: viajes
// Resolucion: Dulce Morales
//
// Problema: un planificador de viajes. Desde un formulario (simulado) se agregan actividades a un
// viaje; cada actividad llega como DTO de texto, se valida contra las reglas del viaje (fechas,
// horario, choques, traslados entre ciudades, presupuesto) y se guarda en un repositorio en memoria.
// Al final se genera el itinerario por dia (lo que se pintaria en el DOM) y el reporte de gastos.

// ===================== MODELO =====================

type Moneda = "MXN" | "USD" | "EUR";
type TipoActividad = "transporte" | "hospedaje" | "comida" | "tour" | "museo" | "libre";

interface Viaje {
  readonly nombre: string;
  readonly inicio: string; // YYYY-MM-DD
  readonly fin: string;
  readonly presupuestoMXN: number;
  readonly limitePorTipo: Readonly<Partial<Record<TipoActividad, number>>>;
}

// DTO: lo que manda el formulario "Nueva actividad" (los <input> siempre son texto)
interface ActividadFormDTO {
  readonly titulo: string;
  readonly tipo: string;
  readonly ciudad: string;
  readonly fecha: string;
  readonly inicio: string; // HH:MM
  readonly fin: string;
  readonly costo: string;
  readonly moneda: string;
}

interface Actividad {
  readonly id: number;
  readonly titulo: string;
  readonly tipo: TipoActividad;
  readonly ciudad: string;
  readonly fecha: string;
  readonly inicioMin: number; // minutos desde las 00:00
  readonly finMin: number;
  readonly costoMXN: number;
  readonly costoOriginal: string;
}

type Validacion = { readonly ok: true; readonly actividad: Omit<Actividad, "id"> } | { readonly ok: false; readonly errores: readonly string[] };

// ===================== CONFIGURACION =====================

const TIPOS: readonly TipoActividad[] = ["transporte", "hospedaje", "comida", "tour", "museo", "libre"];
const MONEDAS: readonly Moneda[] = ["MXN", "USD", "EUR"];
const TIPO_CAMBIO: Readonly<Record<Moneda, number>> = { MXN: 1, USD: 17.5, EUR: 19 };

// Minutos de traslado entre ciudades (si no aparece, se asume misma ciudad = 0)
const TRASLADOS: ReadonlyMap<string, number> = new Map([
  ["Oaxaca|Puerto Escondido", 360],
  ["Oaxaca|Mitla", 60],
  ["Mitla|Puerto Escondido", 390],
]);

function traslado(a: string, b: string): number {
  if (a === b) return 0;
  return TRASLADOS.get(`${a}|${b}`) ?? TRASLADOS.get(`${b}|${a}`) ?? Infinity;
}

// ===================== AYUDAS =====================

function aMinutos(hhmm: string): number | null {
  const m: RegExpMatchArray | null = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (m === null) return null;
  const h: number = Number(m[1]);
  const min: number = Number(m[2]);
  return h <= 23 && min <= 59 ? h * 60 + min : null;
}

const hhmm = (min: number): string => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

function fechaValida(f: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) return false;
  const d: Date = new Date(`${f}T00:00:00`);
  // Si el dia no existe (ej. 30 de febrero) Date lo "corrige" y la fecha ya no coincide
  return !Number.isNaN(d.getTime()) && f === fechaLocal(d);
}

function fechaLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function diasEntre(inicio: string, fin: string): string[] {
  const dias: string[] = [];
  const d: Date = new Date(`${inicio}T00:00:00`);
  while (fechaLocal(d) <= fin) {
    dias.push(fechaLocal(d));
    d.setDate(d.getDate() + 1);
  }
  return dias;
}

function esTipo(x: string): x is TipoActividad { return TIPOS.some((t) => t === x); }
function esMoneda(x: string): x is Moneda { return MONEDAS.some((m) => m === x); }

// ===================== VALIDACION DEL DTO =====================

function validarForm(viaje: Viaje, dto: ActividadFormDTO): Validacion {
  const errores: string[] = [];
  const tipo: string = dto.tipo.trim().toLowerCase();
  const moneda: string = dto.moneda.trim().toUpperCase();
  const inicioMin: number | null = aMinutos(dto.inicio);
  const finMin: number | null = aMinutos(dto.fin);
  const costo: number = Number(dto.costo);

  if (dto.titulo.trim() === "") errores.push("titulo vacio");
  if (!esTipo(tipo)) errores.push(`tipo "${dto.tipo}" desconocido`);
  if (dto.ciudad.trim() === "") errores.push("ciudad vacia");
  if (!fechaValida(dto.fecha)) errores.push(`fecha "${dto.fecha}" invalida`);
  else if (dto.fecha < viaje.inicio || dto.fecha > viaje.fin) errores.push(`fecha ${dto.fecha} fuera del viaje (${viaje.inicio} a ${viaje.fin})`);
  if (inicioMin === null || finMin === null) errores.push("hora invalida (usa HH:MM)");
  else if (finMin <= inicioMin) errores.push("la hora de fin debe ser despues del inicio");
  if (!Number.isFinite(costo) || costo < 0) errores.push("costo invalido");
  if (!esMoneda(moneda)) errores.push(`moneda "${dto.moneda}" no soportada`);

  if (errores.length > 0 || !esTipo(tipo) || !esMoneda(moneda) || inicioMin === null || finMin === null) return { ok: false, errores };
  return {
    ok: true,
    actividad: {
      titulo: dto.titulo.trim(), tipo, ciudad: dto.ciudad.trim(), fecha: dto.fecha, inicioMin, finMin,
      costoMXN: Math.round(costo * TIPO_CAMBIO[moneda] * 100) / 100,
      costoOriginal: `${costo} ${moneda}`,
    },
  };
}

// ===================== REPOSITORIO =====================

class RepoActividades {
  private items: readonly Actividad[] = [];
  private siguienteId: number = 1;
  agregar(a: Omit<Actividad, "id">): Actividad {
    const nueva: Actividad = { ...a, id: this.siguienteId++ };
    this.items = [...this.items, nueva];
    return nueva;
  }
  quitar(id: number): boolean {
    const antes: number = this.items.length;
    this.items = this.items.filter((a) => a.id !== id);
    return this.items.length < antes;
  }
  delDia(fecha: string): readonly Actividad[] {
    return this.items.filter((a) => a.fecha === fecha).sort((a, b) => a.inicioMin - b.inicioMin);
  }
  todas(): readonly Actividad[] { return this.items; }
}

// ===================== SERVICIO =====================

class Planner {
  readonly repo: RepoActividades = new RepoActividades();
  constructor(readonly viaje: Viaje) {}

  private gastado(tipo?: TipoActividad): number {
    return this.repo.todas().filter((a) => tipo === undefined || a.tipo === tipo).reduce((s, a) => s + a.costoMXN, 0);
  }

  agregar(dto: ActividadFormDTO): string {
    const v: Validacion = validarForm(this.viaje, dto);
    if (!v.ok) return `RECHAZADA "${dto.titulo}": ${v.errores.join("; ")}`;
    const a = v.actividad;

    // Reglas que dependen de lo que ya esta en el plan
    for (const otra of this.repo.delDia(a.fecha)) {
      const choca: boolean = a.inicioMin < otra.finMin && otra.inicioMin < a.finMin;
      if (choca && a.tipo !== "hospedaje" && otra.tipo !== "hospedaje") {
        return `RECHAZADA "${a.titulo}": choca con "${otra.titulo}" (${hhmm(otra.inicioMin)}-${hhmm(otra.finMin)})`;
      }
      // Si hay cambio de ciudad, debe alcanzar el tiempo de traslado entre una y otra
      const [primera, segunda] = otra.finMin <= a.inicioMin ? [otra, a] : [a, otra];
      if (primera.tipo === "hospedaje" || segunda.tipo === "hospedaje" || primera.tipo === "transporte" || segunda.tipo === "transporte") continue;
      const hueco: number = segunda.inicioMin - primera.finMin;
      const necesario: number = traslado(primera.ciudad, segunda.ciudad);
      if (hueco >= 0 && hueco < necesario) {
        const req: string = necesario === Infinity ? "no hay ruta registrada" : `se necesitan ${necesario} min`;
        return `RECHAZADA "${a.titulo}": de ${primera.ciudad} a ${segunda.ciudad} solo hay ${hueco} min (${req})`;
      }
    }

    const limite: number | undefined = this.viaje.limitePorTipo[a.tipo];
    const avisos: string[] = [];
    if (limite !== undefined && this.gastado(a.tipo) + a.costoMXN > limite) avisos.push(`supera el limite de ${a.tipo} ($${limite})`);
    if (this.gastado() + a.costoMXN > this.viaje.presupuestoMXN) avisos.push("supera el presupuesto total");

    const guardada: Actividad = this.repo.agregar(a);
    return `#${guardada.id} agregada "${a.titulo}" ($${a.costoMXN.toFixed(2)} MXN)${avisos.length ? "  AVISO: " + avisos.join("; ") : ""}`;
  }

  // "DOM": cada dia seria una columna con tarjetas; aqui se imprime como texto
  itinerario(): string[] {
    const salida: string[] = [];
    for (const dia of diasEntre(this.viaje.inicio, this.viaje.fin)) {
      const acts: readonly Actividad[] = this.repo.delDia(dia);
      const total: number = acts.reduce((s, a) => s + a.costoMXN, 0);
      salida.push(`[${dia}] ${acts.length} actividad(es), $${total.toFixed(2)}`);
      if (acts.length === 0) salida.push("    (dia libre)");
      for (const a of acts) {
        salida.push(`    ${hhmm(a.inicioMin)}-${hhmm(a.finMin)} ${a.tipo.padEnd(10)} ${a.titulo.padEnd(26)} ${a.ciudad.padEnd(16)} ${a.costoOriginal}`);
      }
    }
    return salida;
  }

  reporte(): string[] {
    const total: number = this.gastado();
    const lineas: string[] = TIPOS.map((t) => {
      const g: number = this.gastado(t);
      const lim: number | undefined = this.viaje.limitePorTipo[t];
      const estado: string = lim === undefined ? "" : g > lim ? ` / limite $${lim} EXCEDIDO` : ` / limite $${lim}`;
      return `${t.padEnd(10)} $${g.toFixed(2).padStart(9)}${estado}`;
    });
    const resto: number = this.viaje.presupuestoMXN - total;
    lineas.push(`TOTAL      $${total.toFixed(2).padStart(9)} de $${this.viaje.presupuestoMXN} -> ${resto >= 0 ? `sobran $${resto.toFixed(2)}` : `faltan $${(-resto).toFixed(2)}`}`);
    const ciudades: string[] = [...new Set(this.repo.todas().map((a) => a.ciudad))];
    lineas.push(`Ciudades visitadas: ${ciudades.join(", ")}`);
    return lineas;
  }
}

// ===================== DEMO =====================

function main(): void {
  const viaje: Viaje = {
    nombre: "Oaxaca y costa", inicio: "2026-12-20", fin: "2026-12-23", presupuestoMXN: 12000,
    limitePorTipo: { comida: 2500, tour: 3000, hospedaje: 5000 },
  };
  const p: Planner = new Planner(viaje);
  const f = (titulo: string, tipo: string, ciudad: string, fecha: string, inicio: string, fin: string, costo: string, moneda: string): ActividadFormDTO =>
    ({ titulo, tipo, ciudad, fecha, inicio, fin, costo, moneda });

  console.log(`=== ${viaje.nombre} (${viaje.inicio} a ${viaje.fin}) ===`);
  const formularios: readonly ActividadFormDTO[] = [
    f("Hotel centro", "hospedaje", "Oaxaca", "2026-12-20", "15:00", "23:59", "2400", "MXN"),
    f("Tlayudas", "comida", "Oaxaca", "2026-12-20", "19:00", "20:30", "350", "MXN"),
    f("Mezcaleria", "comida", "Oaxaca", "2026-12-20", "20:00", "22:00", "500", "MXN"),          // choca
    f("Monte Alban", "tour", "Oaxaca", "2026-12-21", "09:00", "13:00", "45", "USD"),
    f("Ruinas de Mitla", "tour", "Mitla", "2026-12-21", "13:30", "16:00", "60", "USD"),        // 30 min < 60
    f("Ruinas de Mitla", "tour", "Mitla", "2026-12-21", "14:00", "16:30", "60", "USD"),        // limite: 60 min justos
    f("Hierve el Agua", "tour", "Hierve el Agua", "2026-12-21", "18:00", "19:00", "20", "EUR"), // sin ruta
    f("Autobus a la costa", "transporte", "Oaxaca", "2026-12-22", "07:00", "13:00", "650", "MXN"),
    f("Hotel playa", "hospedaje", "Puerto Escondido", "2026-12-22", "14:00", "23:59", "150", "USD"), // supera limite
    f("Clase de surf", "tour", "Puerto Escondido", "2026-12-22", "16:00", "18:00", "40", "USD"),
    f("Cena en la playa", "comida", "Puerto Escondido", "2026-12-22", "19:00", "21:00", "1800", "MXN"),
    f("Lancha y delfines", "tour", "Puerto Escondido", "2026-12-23", "08:00", "11:00", "120", "USD"), // excede tour y total
    f("Fiesta", "fiesta", "", "2026-12-24", "25:00", "10:00", "-5", "GBP"),
    f("Fecha imposible", "libre", "Oaxaca", "2026-02-30", "10:00", "11:00", "0", "MXN"),
  ];
  for (const dto of formularios) console.log("  " + p.agregar(dto));

  console.log("\n=== Itinerario ===");
  for (const l of p.itinerario()) console.log("  " + l);

  console.log("\n=== Gastos ===");
  for (const l of p.reporte()) console.log("  " + l);
}

main();
