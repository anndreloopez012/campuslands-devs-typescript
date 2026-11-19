export {};

// Intermedio 41: Reservas de restaurante
// Tematica: restaurantes
// Resolucion: Dulce Morales
//
// Problema: un restaurante recibe solicitudes de reserva con fecha y hora. Un servicio asigna a cada
// reserva la mesa mas chica donde quepa el grupo y que este libre esas 2 horas. Las reservas cambian
// de estado (pendiente, confirmada, cancelada, no se presento). Cancelar con menos de 24 h de aviso
// tiene cargo. Al final se arma un reporte por dia y por turno.

// ===================== TIPOS =====================

type Zona = "salon" | "terraza" | "barra";
type Estado = "pendiente" | "confirmada" | "cancelada" | "no se presento";
type Turno = "almuerzo" | "cena";

interface Mesa {
  readonly id: string;
  readonly capacidad: number;
  readonly zona: Zona;
}

interface Reserva {
  readonly id: number;
  readonly cliente: string;
  readonly personas: number;
  readonly inicio: Date;
  readonly zonaPreferida: Zona | null;
  mesaId: string | null;
  estado: Estado;
  cargo: number;
}

// ===================== REPOSITORIO GENERICO =====================

class Repositorio<T extends { readonly id: string | number }> {
  private readonly items: Map<string | number, T> = new Map();

  guardar(item: T): void {
    this.items.set(item.id, item);
  }

  buscar(id: string | number): T | undefined {
    return this.items.get(id);
  }

  todos(): T[] {
    return [...this.items.values()];
  }
}

// ===================== UTILIDADES DE FECHA =====================

const DURACION_MS: number = 2 * 60 * 60 * 1000;
const HORA_MS: number = 60 * 60 * 1000;

function fecha(texto: string): Date {
  return new Date(`${texto}:00`); // "2026-11-20T13:00" (hora local)
}

function finDe(r: Reserva): Date {
  return new Date(r.inicio.getTime() + DURACION_MS);
}

function turnoDe(d: Date): Turno | null {
  const h: number = d.getHours();
  if (h >= 12 && h < 16) return "almuerzo";
  if (h >= 19 && h < 23) return "cena";
  return null;
}

// Fecha local (no UTC): con toISOString una cena a las 20:00 apareceria como el dia siguiente
function diaTexto(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function horaTexto(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ===================== SERVICIO =====================

class ReservaService {
  private siguienteId: number = 1;
  private readonly cargoCancelacionTardia: number = 20;

  constructor(
    private readonly mesas: Repositorio<Mesa>,
    private readonly reservas: Repositorio<Reserva>,
  ) {}

  private ocupada(mesaId: string, inicio: Date): boolean {
    const fin: number = inicio.getTime() + DURACION_MS;
    // Se cruzan si una empieza antes de que la otra termine (terminar justo cuando otra empieza no cuenta)
    return this.reservas
      .todos()
      .some((r: Reserva): boolean => r.mesaId === mesaId && (r.estado === "pendiente" || r.estado === "confirmada") && r.inicio.getTime() < fin && inicio.getTime() < finDe(r).getTime());
  }

  solicitar(cliente: string, personas: number, inicioTexto: string, zona: Zona | null = null): { ok: true; reserva: Reserva } | { ok: false; motivo: string } {
    const inicio: Date = fecha(inicioTexto);
    if (Number.isNaN(inicio.getTime())) return { ok: false, motivo: "fecha invalida" };
    if (personas < 1) return { ok: false, motivo: "cantidad de personas invalida" };
    if (turnoDe(inicio) === null) return { ok: false, motivo: `${horaTexto(inicio)} esta fuera de los turnos (12-16 y 19-23)` };

    const candidatas: Mesa[] = this.mesas
      .todos()
      .filter((m: Mesa): boolean => m.capacidad >= personas && (zona === null || m.zona === zona))
      .sort((a, b): number => a.capacidad - b.capacidad || a.id.localeCompare(b.id));
    if (candidatas.length === 0) return { ok: false, motivo: `no hay mesas para ${personas}${zona ? ` en ${zona}` : ""}` };
    const libre: Mesa | undefined = candidatas.find((m: Mesa): boolean => !this.ocupada(m.id, inicio));
    if (libre === undefined) return { ok: false, motivo: "todas las mesas adecuadas estan ocupadas a esa hora" };

    const reserva: Reserva = { id: this.siguienteId++, cliente, personas, inicio, zonaPreferida: zona, mesaId: libre.id, estado: "pendiente", cargo: 0 };
    this.reservas.guardar(reserva);
    return { ok: true, reserva };
  }

  confirmar(id: number): string {
    const r: Reserva | undefined = this.reservas.buscar(id);
    if (r === undefined || r.estado !== "pendiente") return `reserva ${id}: solo se confirma una reserva pendiente`;
    r.estado = "confirmada";
    return `reserva ${id} confirmada`;
  }

  // Cancelar con menos de 24 h de anticipacion tiene cargo; con 24 h exactas o mas, no
  cancelar(id: number, ahoraTexto: string): string {
    const r: Reserva | undefined = this.reservas.buscar(id);
    if (r === undefined || (r.estado !== "pendiente" && r.estado !== "confirmada")) return `reserva ${id}: no se puede cancelar`;
    const horas: number = (r.inicio.getTime() - fecha(ahoraTexto).getTime()) / HORA_MS;
    r.estado = "cancelada";
    r.mesaId = null;
    if (horas < 24) {
      r.cargo = this.cargoCancelacionTardia;
      return `reserva ${id} cancelada con ${horas} h de aviso: cargo de $${r.cargo}`;
    }
    return `reserva ${id} cancelada con ${horas} h de aviso: sin cargo`;
  }

  marcarNoShow(id: number): string {
    const r: Reserva | undefined = this.reservas.buscar(id);
    if (r === undefined || r.estado !== "confirmada") return `reserva ${id}: solo una confirmada puede ser "no se presento"`;
    r.estado = "no se presento";
    r.cargo = this.cargoCancelacionTardia * 2;
    return `reserva ${id}: el cliente no se presento, cargo de $${r.cargo}`;
  }

  // Reporte agrupado por dia y turno
  reporte(): Map<string, Reserva[]> {
    return this.reservas
      .todos()
      .sort((a, b): number => a.inicio.getTime() - b.inicio.getTime())
      .reduce((m: Map<string, Reserva[]>, r: Reserva): Map<string, Reserva[]> => {
        const clave: string = `${diaTexto(r.inicio)} ${turnoDe(r.inicio) ?? "?"}`;
        return m.set(clave, [...(m.get(clave) ?? []), r]);
      }, new Map<string, Reserva[]>());
  }
}

// ===================== DATOS Y SALIDA =====================

function main(): void {
  const mesas: Repositorio<Mesa> = new Repositorio<Mesa>();
  const listaMesas: readonly Mesa[] = [
    { id: "S1", capacidad: 2, zona: "salon" }, { id: "S2", capacidad: 4, zona: "salon" }, { id: "S3", capacidad: 6, zona: "salon" },
    { id: "T1", capacidad: 4, zona: "terraza" }, { id: "B1", capacidad: 2, zona: "barra" },
  ];
  listaMesas.forEach((m: Mesa): void => mesas.guardar(m));
  const servicio: ReservaService = new ReservaService(mesas, new Repositorio<Reserva>());

  console.log("==================== SOLICITUDES ====================");
  const solicitudes: [string, number, string, Zona | null][] = [
    ["Lopez", 2, "2026-11-20T13:00", null],
    ["Garcia", 4, "2026-11-20T13:30", "terraza"],
    ["Mora", 6, "2026-11-20T20:00", null], // limite: 6 personas, mesa de 6 EXACTA
    ["Rivas", 4, "2026-11-20T13:00", null],
    ["Pena", 4, "2026-11-20T14:00", "terraza"], // terraza ocupada por Garcia
    ["Diaz", 2, "2026-11-20T15:00", null], // limite: Lopez termina 15:00 justo cuando empieza -> puede usar la misma mesa
    ["Vega", 8, "2026-11-20T21:00", null], // no hay mesa de 8
    ["Soto", 2, "2026-11-20T17:30", null], // fuera de turno
    ["Ruiz", 3, "2026-11-21T20:30", "salon"],
    ["Paz", 2, "2026-11-21T20:00", "barra"],
  ];
  for (const [cliente, personas, inicio, zona] of solicitudes) {
    const r = servicio.solicitar(cliente, personas, inicio, zona);
    console.log(r.ok ? `OK  #${r.reserva.id} ${cliente.padEnd(7)} ${personas} pers. ${inicio.replace("T", " ")} -> mesa ${r.reserva.mesaId}` : `X   ${cliente.padEnd(7)} ${personas} pers. ${inicio.replace("T", " ")} -> ${r.motivo}`);
  }

  console.log("\n==================== CAMBIOS DE ESTADO ====================");
  [
    servicio.confirmar(1), servicio.confirmar(2), servicio.confirmar(3), servicio.confirmar(7),
    servicio.cancelar(4, "2026-11-19T13:00"), // limite: 24 h EXACTAS -> sin cargo
    servicio.cancelar(5, "2026-11-20T10:00"), // 5 h de aviso -> cargo
    servicio.marcarNoShow(2),
    servicio.marcarNoShow(6), // solo pendiente, no confirmada
    servicio.confirmar(4), // ya estaba cancelada
  ].forEach((m: string): void => console.log(`- ${m}`));

  console.log("\n==================== REPORTE POR DIA Y TURNO ====================");
  let cargos: number = 0;
  for (const [clave, lista] of servicio.reporte()) {
    const activas: Reserva[] = lista.filter((r) => r.estado === "pendiente" || r.estado === "confirmada");
    const personas: number = activas.reduce((s: number, r: Reserva): number => s + r.personas, 0);
    console.log(`${clave}: ${activas.length} reserva(s) activa(s), ${personas} personas`);
    lista.forEach((r: Reserva): void => {
      cargos += r.cargo;
      console.log(`   #${r.id} ${horaTexto(r.inicio)}-${horaTexto(finDe(r))} ${r.cliente.padEnd(7)} ${r.personas} pers. mesa ${(r.mesaId ?? "-").padEnd(2)} ${r.estado}${r.cargo > 0 ? ` (cargo $${r.cargo})` : ""}`);
    });
  }
  console.log(`\nCargos por cancelaciones y no-shows: $${cargos}`);
}

main();
