// Solución Ejercicio Intermedio 77 - Stefani Sánchez
export {};

interface Almacen {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
}

class AlmacenMemoria implements Almacen {
  private readonly datos = new Map<string, string>();
  getItem(clave: string): string | null {
    return this.datos.get(clave) ?? null;
  }
  setItem(clave: string, valor: string): void {
    this.datos.set(clave, valor);
  }
}

type EstadoCita = "reservada" | "confirmada" | "cancelada";

interface Cita {
  readonly id: number;
  readonly cliente: string;
  readonly artista: string;
  readonly fecha: string;
  readonly horaInicio: number;
  readonly horas: number;
  readonly deposito: number;
  readonly estado: EstadoCita;
}

type Resultado = { readonly ok: true; readonly cita: Cita } | { readonly ok: false; readonly motivo: string };

const HORA_APERTURA = 10;
const HORA_CIERRE = 20;
const TARIFA_HORA = 70;
const PORCENTAJE_DEPOSITO = 0.25;
const CLAVE = "agenda-tattoo";

class Agenda {
  private citas: Cita[] = [];

  constructor(private readonly almacen: Almacen) {
    const crudo = almacen.getItem(CLAVE);
    if (crudo) this.citas = JSON.parse(crudo) as Cita[];
  }

  private activas(artista: string, fecha: string): Cita[] {
    return this.citas.filter((c) => c.artista === artista && c.fecha === fecha && c.estado !== "cancelada");
  }

  reservar(cliente: string, artista: string, fecha: string, horaInicio: number, horas: number): Resultado {
    if (cliente.trim() === "") return { ok: false, motivo: "Falta el nombre del cliente" };
    if (Number.isNaN(Date.parse(`${fecha}T00:00:00Z`))) return { ok: false, motivo: `Fecha invalida: ${fecha}` };
    if (horas < 1 || horas > 6) return { ok: false, motivo: "Las sesiones duran entre 1 y 6 horas" };
    if (horaInicio < HORA_APERTURA || horaInicio + horas > HORA_CIERRE) {
      return { ok: false, motivo: `El estudio atiende de ${HORA_APERTURA}:00 a ${HORA_CIERRE}:00` };
    }
    const choque = this.activas(artista, fecha).find((c) => horaInicio < c.horaInicio + c.horas && horaInicio + horas > c.horaInicio);
    if (choque) return { ok: false, motivo: `${artista} ya tiene a ${choque.cliente} de ${choque.horaInicio}:00 a ${choque.horaInicio + choque.horas}:00` };

    const id = this.citas.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const cita: Cita = { id, cliente, artista, fecha, horaInicio, horas, deposito: horas * TARIFA_HORA * PORCENTAJE_DEPOSITO, estado: "reservada" };
    this.citas = [...this.citas, cita];
    this.guardar();
    return { ok: true, cita };
  }

  cambiarEstado(id: number, estado: EstadoCita): boolean {
    const existe = this.citas.some((c) => c.id === id && c.estado !== "cancelada");
    if (!existe) return false;
    this.citas = this.citas.map((c) => (c.id === id ? { ...c, estado } : c));
    this.guardar();
    return true;
  }

  private guardar(): void {
    this.almacen.setItem(CLAVE, JSON.stringify(this.citas));
  }

  resumen(): string[] {
    return this.citas.map((c) => `#${c.id} ${c.fecha} ${c.horaInicio}:00-${c.horaInicio + c.horas}:00 ${c.artista} / ${c.cliente} [${c.estado}] deposito $${c.deposito}`);
  }
}

console.log("Ejercicio 77: Booking tattoo app");
const almacen = new AlmacenMemoria();
const agenda = new Agenda(almacen);
const solicitudes: [string, string, string, number, number][] = [
  ["Paula", "Kiko", "2026-10-05", 11, 3],
  ["Quino", "Kiko", "2026-10-05", 13, 2],
  ["Rosa", "Kiko", "2026-10-05", 14, 2],
  ["Santi", "Mara", "2026-10-05", 18, 3],
  ["Tere", "Mara", "2026-10-05", 9, 2],
  ["", "Mara", "2026-10-05", 15, 1],
  ["Ugo", "Mara", "2026-10-05", 15, 8],
];
solicitudes.forEach(([cliente, artista, fecha, inicio, horas]) => {
  const r = agenda.reservar(cliente, artista, fecha, inicio, horas);
  console.log(`  ${r.ok ? `+ #${r.cita.id}` : "x"} ${cliente || "(sin nombre)"} con ${artista} a las ${inicio}:00${r.ok ? "" : ` - ${r.motivo}`}`);
});
console.log(`  confirmar #1: ${agenda.cambiarEstado(1, "confirmada")} | cancelar #2: ${agenda.cambiarEstado(2, "cancelada")} | cancelar #2 otra vez: ${agenda.cambiarEstado(2, "cancelada")}`);
const libre = agenda.reservar("Rosa", "Kiko", "2026-10-05", 13, 2);
console.log(`  Rosa reintenta el horario liberado: ${libre.ok ? "aceptada" : libre.motivo}`);
console.log("Agenda guardada (otra sesion):");
new Agenda(almacen).resumen().forEach((l) => console.log(`  ${l}`));
