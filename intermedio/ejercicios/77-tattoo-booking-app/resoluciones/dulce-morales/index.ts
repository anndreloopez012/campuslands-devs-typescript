export {};

// Intermedio 77: Booking tattoo app
// Tematica: tatuajes
// Resolucion: Dulce Morales
//
// Problema: la app de citas de un estudio de tatuajes. La persona manda una solicitud (DTO) con el
// estilo, tamano y zona del tatuaje; el sistema estima duracion y precio, busca el primer hueco libre
// en la agenda de un artista que domine ese estilo y crea la cita. Las citas pasan por estados
// (pendiente de anticipo -> confirmada -> completada / cancelada) con una politica de reembolso.
// Al final se genera el reporte del estudio.

// ===================== MODELO =====================

type Estilo = "fineline" | "tradicional" | "realismo" | "blackwork" | "acuarela";
type Tamano = "chico" | "mediano" | "grande";
type Zona = "brazo" | "pierna" | "espalda" | "costillas" | "mano";

interface Artista {
  readonly id: string;
  readonly nombre: string;
  readonly estilos: readonly Estilo[];
  readonly tarifaHora: number;
  readonly dias: readonly number[]; // 0 = domingo ... 6 = sabado
  readonly abre: number;            // hora
  readonly cierra: number;
}

// DTO de la solicitud (formulario de la app)
interface SolicitudDTO {
  readonly cliente: string;
  readonly edad: number;
  readonly estilo: Estilo;
  readonly tamano: Tamano;
  readonly zona: Zona;
  readonly aColor: boolean;
  readonly artistaPreferido?: string;
  readonly desdeDia: number; // dia del mes desde el que busca cita
}

type Cita =
  | { readonly estado: "pendiente"; readonly base: DatosCita }
  | { readonly estado: "confirmada"; readonly base: DatosCita; readonly anticipo: number }
  | { readonly estado: "completada"; readonly base: DatosCita; readonly cobrado: number }
  | { readonly estado: "cancelada"; readonly base: DatosCita; readonly reembolso: number; readonly retenido: number };

interface DatosCita {
  readonly id: number;
  readonly cliente: string;
  readonly artistaId: string;
  readonly estilo: Estilo;
  readonly dia: number;    // dia del mes (diciembre 2026)
  readonly inicio: number; // hora
  readonly horas: number;    // horas de esta sesion
  readonly sesiones: number; // sesiones totales que necesita el tatuaje
  readonly precio: number;   // precio del tatuaje completo
}

type Resultado<T> = { readonly ok: true; readonly valor: T } | { readonly ok: false; readonly error: string };

// ===================== REGLAS =====================

const HORAS_BASE: Readonly<Record<Tamano, number>> = { chico: 1, mediano: 3, grande: 5 };
const FACTOR_ZONA: Readonly<Record<Zona, number>> = { brazo: 1, pierna: 1, espalda: 1, costillas: 1.4, mano: 1.2 };
const EXTRA_COLOR_HORAS: number = 1;
const MINIMO: number = 800;
const ANTICIPO: number = 0.3;
const MAX_HORAS_SESION: number = 5; // mas de esto se divide en sesiones (se agenda la primera)
const ANIO: number = 2026;
const MES: number = 11; // diciembre (0-based para Date)

const artistas: readonly Artista[] = [
  { id: "vale", nombre: "Vale", estilos: ["fineline", "acuarela"], tarifaHora: 700, dias: [2, 3, 4, 5, 6], abre: 11, cierra: 19 },
  { id: "rocko", nombre: "Rocko", estilos: ["tradicional", "blackwork"], tarifaHora: 1000, dias: [1, 2, 3, 4, 5], abre: 12, cierra: 20 },
  { id: "iris", nombre: "Iris", estilos: ["realismo", "blackwork"], tarifaHora: 1400, dias: [3, 4, 5, 6], abre: 10, cierra: 18 },
];

// ===================== CALCULOS PUROS =====================

function estimar(s: SolicitudDTO, a: Artista): { readonly horas: number; readonly precio: number } {
  const crudo: number = (HORAS_BASE[s.tamano] + (s.aColor ? EXTRA_COLOR_HORAS : 0)) * FACTOR_ZONA[s.zona];
  const horas: number = Math.ceil(crudo * 2) / 2; // se redondea a medias horas hacia arriba
  return { horas, precio: Math.max(MINIMO, Math.round(horas * a.tarifaHora)) };
}

const diaSemana = (dia: number): number => new Date(ANIO, MES, dia).getDay();
const NOMBRE_DIA: readonly string[] = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
const fmtHora = (h: number): string => `${String(Math.floor(h)).padStart(2, "0")}:${h % 1 === 0 ? "00" : "30"}`;

// ===================== REPOSITORIO =====================

class RepoCitas {
  private items: Map<number, Cita> = new Map();
  private sig: number = 1;
  nuevoId(): number { return this.sig++; }
  guardar(c: Cita): void { this.items.set(c.base.id, c); }
  buscar(id: number): Cita | undefined { return this.items.get(id); }
  todas(): readonly Cita[] { return [...this.items.values()]; }
  // Las canceladas liberan su horario
  ocupadas(artistaId: string, dia: number): readonly DatosCita[] {
    return this.todas().filter((c) => c.estado !== "cancelada" && c.base.artistaId === artistaId && c.base.dia === dia).map((c) => c.base);
  }
}

// ===================== SERVICIO =====================

class Estudio {
  constructor(private readonly repo: RepoCitas) {}

  private primerHueco(a: Artista, horas: number, desdeDia: number): { dia: number; inicio: number } | null {
    for (let dia = desdeDia; dia <= 31; dia++) {
      if (!a.dias.includes(diaSemana(dia))) continue;
      const ocupadas: readonly DatosCita[] = this.repo.ocupadas(a.id, dia);
      for (let inicio = a.abre; inicio + horas <= a.cierra; inicio += 0.5) {
        const libre: boolean = ocupadas.every((o) => inicio + horas <= o.inicio || o.inicio + o.horas <= inicio);
        if (libre) return { dia, inicio };
      }
    }
    return null;
  }

  solicitar(s: SolicitudDTO): Resultado<Cita> {
    if (s.edad < 18) return { ok: false, error: `${s.cliente}: hay que ser mayor de edad` };
    if (s.estilo === "acuarela" && !s.aColor) return { ok: false, error: `${s.cliente}: la acuarela siempre es a color` };
    const candidatos: readonly Artista[] = artistas.filter((a) => a.estilos.includes(s.estilo) && (s.artistaPreferido === undefined || a.id === s.artistaPreferido));
    if (candidatos.length === 0) return { ok: false, error: `${s.cliente}: ningun artista hace ${s.estilo}${s.artistaPreferido ? ` (pidio a ${s.artistaPreferido})` : ""}` };

    // Entre los candidatos se elige la cita mas pronta; si empatan, la mas barata
    let mejor: { a: Artista; dia: number; inicio: number; horas: number; precio: number } | null = null;
    for (const a of candidatos) {
      const est = estimar(s, a);
      const hueco = this.primerHueco(a, Math.min(est.horas, MAX_HORAS_SESION), s.desdeDia);
      if (hueco === null) continue;
      const opcion = { a, ...hueco, ...est };
      if (mejor === null || opcion.dia * 100 + opcion.inicio < mejor.dia * 100 + mejor.inicio
        || (opcion.dia === mejor.dia && opcion.inicio === mejor.inicio && opcion.precio < mejor.precio)) mejor = opcion;
    }
    if (mejor === null) return { ok: false, error: `${s.cliente}: sin huecos en diciembre` };

    const base: DatosCita = {
      id: this.repo.nuevoId(), cliente: s.cliente, artistaId: mejor.a.id, estilo: s.estilo,
      dia: mejor.dia, inicio: mejor.inicio, horas: Math.min(mejor.horas, MAX_HORAS_SESION),
      sesiones: Math.ceil(mejor.horas / MAX_HORAS_SESION), precio: mejor.precio,
    };
    const cita: Cita = { estado: "pendiente", base };
    this.repo.guardar(cita);
    return { ok: true, valor: cita };
  }

  pagarAnticipo(id: number, monto: number): string {
    const c: Cita | undefined = this.repo.buscar(id);
    if (c === undefined) return `cita #${id} no existe`;
    if (c.estado !== "pendiente") return `cita #${id} esta ${c.estado}`;
    const requerido: number = Math.round(c.base.precio * ANTICIPO);
    if (monto < requerido) return `cita #${id}: anticipo insuficiente ($${monto} de $${requerido})`;
    this.repo.guardar({ estado: "confirmada", base: c.base, anticipo: monto });
    return `cita #${id} confirmada con $${monto}`;
  }

  completar(id: number): string {
    const c: Cita | undefined = this.repo.buscar(id);
    if (c === undefined || c.estado !== "confirmada") return `cita #${id} no se puede completar (${c?.estado ?? "no existe"})`;
    this.repo.guardar({ estado: "completada", base: c.base, cobrado: c.base.precio });
    return `cita #${id} completada: resta cobrar $${c.base.precio - c.anticipo}`;
  }

  // Politica: con 72 h o mas de aviso se devuelve todo el anticipo; con menos, se retiene la mitad;
  // con menos de 24 h se retiene completo. Una pendiente se cancela sin costo.
  cancelar(id: number, horasDeAviso: number): string {
    const c: Cita | undefined = this.repo.buscar(id);
    if (c === undefined) return `cita #${id} no existe`;
    if (c.estado === "completada" || c.estado === "cancelada") return `cita #${id} ya esta ${c.estado}`;
    const anticipo: number = c.estado === "confirmada" ? c.anticipo : 0;
    const retenido: number = horasDeAviso >= 72 ? 0 : horasDeAviso >= 24 ? Math.round(anticipo / 2) : anticipo;
    this.repo.guardar({ estado: "cancelada", base: c.base, reembolso: anticipo - retenido, retenido });
    return `cita #${id} cancelada con ${horasDeAviso} h de aviso: reembolso $${anticipo - retenido}, retenido $${retenido}`;
  }

  agenda(): string[] {
    return this.repo.todas()
      .filter((c) => c.estado !== "cancelada")
      .sort((x, y) => x.base.dia - y.base.dia || x.base.inicio - y.base.inicio)
      .map((c) => {
        const b: DatosCita = c.base;
        return `${NOMBRE_DIA[diaSemana(b.dia)]} ${String(b.dia).padStart(2, "0")}/12 ${fmtHora(b.inicio)}-${fmtHora(b.inicio + b.horas)} ${b.artistaId.padEnd(6)} ${b.cliente.padEnd(8)} ${b.estilo.padEnd(12)} $${b.precio} [${c.estado}]`;
      });
  }

  reporte(): string[] {
    return artistas.map((a) => {
      const suyas: Cita[] = this.repo.todas().filter((c) => c.base.artistaId === a.id);
      const ingreso: number = suyas.reduce((s, c) => s + (c.estado === "completada" ? c.cobrado : c.estado === "cancelada" ? c.retenido : 0), 0);
      const porCobrar: number = suyas.reduce((s, c) => s + (c.estado === "confirmada" ? c.base.precio - c.anticipo : c.estado === "pendiente" ? c.base.precio : 0), 0);
      const horas: number = suyas.filter((c) => c.estado !== "cancelada").reduce((s, c) => s + c.base.horas, 0);
      return `${a.nombre.padEnd(6)} citas ${suyas.length} | horas agendadas ${String(horas).padStart(4)} | ingreso $${String(ingreso).padStart(5)} | por cobrar $${String(porCobrar).padStart(5)}`;
    });
  }
}

// ===================== DEMO =====================

function main(): void {
  const estudio: Estudio = new Estudio(new RepoCitas());
  const s = (cliente: string, estilo: Estilo, tamano: Tamano, zona: Zona, aColor: boolean, desdeDia: number, extra: Partial<SolicitudDTO> = {}): SolicitudDTO =>
    ({ cliente, edad: 25, estilo, tamano, zona, aColor, desdeDia, ...extra });

  console.log("=== Solicitudes ===");
  const solicitudes: readonly SolicitudDTO[] = [
    s("Ana", "fineline", "chico", "mano", false, 1),             // 1 h x 1.2 (mano) = 1.2 h -> 1.5 h
    s("Beto", "realismo", "grande", "espalda", false, 1),
    s("Caro", "realismo", "grande", "costillas", true, 1),       // 6*1.4=8.4 -> 8.5 h, sesion de 5
    s("Dani", "tradicional", "mediano", "brazo", true, 1),
    s("Eli", "blackwork", "mediano", "pierna", false, 3),        // Rocko o Iris: el primero que pueda
    s("Fede", "acuarela", "mediano", "brazo", false, 1),
    s("Gus", "fineline", "chico", "brazo", false, 1, { edad: 17 }),
    s("Hana", "realismo", "chico", "brazo", false, 1, { artistaPreferido: "vale" }),
    s("Ivan", "fineline", "chico", "brazo", false, 1),           // limite: 1 h x $700 = $700, se cobra el minimo de $800
    s("Juli", "blackwork", "chico", "mano", false, 1, { artistaPreferido: "iris" }),
  ];
  const ids: Map<string, number> = new Map();
  for (const sol of solicitudes) {
    const r: Resultado<Cita> = estudio.solicitar(sol);
    if (!r.ok) { console.log(`  x ${r.error}`); continue; }
    const b: DatosCita = r.valor.base;
    ids.set(b.cliente, b.id);
    console.log(`  #${b.id} ${b.cliente.padEnd(5)} -> ${b.artistaId.padEnd(6)} dia ${String(b.dia).padStart(2)} ${fmtHora(b.inicio)} (${b.horas} h${b.sesiones > 1 ? `, sesion 1 de ${b.sesiones}` : ""}) $${b.precio}`);
  }

  console.log("\n=== Pagos y cambios ===");
  const id = (n: string): number => ids.get(n) ?? -1;
  for (const msg of [
    estudio.pagarAnticipo(id("Ana"), 405),
    estudio.pagarAnticipo(id("Beto"), 1000),
    estudio.pagarAnticipo(id("Beto"), 2100),
    estudio.pagarAnticipo(id("Caro"), 3570),
    estudio.pagarAnticipo(id("Dani"), 1200),
    estudio.pagarAnticipo(id("Eli"), 900),
    estudio.completar(id("Ana")),
    estudio.completar(id("Ivan")),
    estudio.cancelar(id("Beto"), 72),     // limite: 72 h exactas, reembolso total
    estudio.cancelar(id("Dani"), 30),
    estudio.cancelar(id("Eli"), 5),
    estudio.cancelar(id("Ivan"), 1),      // pendiente: sin costo
    estudio.cancelar(id("Ana"), 100),
    estudio.pagarAnticipo(99, 500),
  ]) console.log("  " + msg);

  // El hueco que libero Beto lo toma alguien nuevo
  const nueva = estudio.solicitar(s("Karla", "realismo", "mediano", "brazo", false, 1));
  if (nueva.ok) console.log(`  #${nueva.valor.base.id} Karla toma el hueco liberado: dia ${nueva.valor.base.dia} ${fmtHora(nueva.valor.base.inicio)} con ${nueva.valor.base.artistaId}`);

  console.log("\n=== Agenda de diciembre ===");
  for (const l of estudio.agenda()) console.log("  " + l);
  console.log("\n=== Reporte por artista ===");
  for (const l of estudio.reporte()) console.log("  " + l);
}

main();
