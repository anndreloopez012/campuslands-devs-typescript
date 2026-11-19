export {};

// Intermedio 49: Control de planos 3D
// Tematica: arquitectura y modelado 3D
// Resolucion: Dulce Morales
//
// Problema: un despacho de arquitectura lleva el control de versiones de sus planos. Cada plano
// tiene revisiones (A, B, C...). Una revision se aprueba solo cuando firman todas las disciplinas
// que la deben revisar (estructura, electrica, hidraulica). Al aprobar una revision nueva, la
// anterior aprobada queda obsoleta: solo puede haber una vigente. Ademas, una revision que lleva
// mas de 5 dias habiles esperando firmas se marca como atrasada.

// ===================== TIPOS =====================

type Disciplina = "arquitectura" | "estructura" | "electrica" | "hidraulica";
type EstadoRevision = "en revision" | "aprobada" | "rechazada" | "obsoleta";

interface Revision {
  readonly letra: string;
  readonly autor: string;
  readonly emitida: Date;
  readonly requiere: ReadonlySet<Disciplina>;
  readonly firmas: Set<Disciplina>;
  estado: EstadoRevision;
  comentario: string | null;
}

interface Plano {
  readonly codigo: string; // ej. A-101
  readonly titulo: string;
  readonly revisiones: Revision[];
}

// ===================== VERSIONADO GENERICO =====================

// Lleva el historial de versiones de cualquier cosa que tenga una letra de version
class Versionado<T extends { readonly letra: string }> {
  constructor(private readonly versiones: T[]) {}

  siguienteLetra(): string {
    const ultima: T | undefined = this.versiones[this.versiones.length - 1];
    return ultima === undefined ? "A" : String.fromCharCode(ultima.letra.charCodeAt(0) + 1);
  }

  agregar(v: T): void {
    this.versiones.push(v);
  }

  donde(pred: (v: T) => boolean): T[] {
    return this.versiones.filter(pred);
  }
}

// ===================== FECHAS =====================

function f(mes: number, dia: number): Date {
  return new Date(2026, mes - 1, dia);
}

function txt(d: Date): string {
  const dias: readonly string[] = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
  return `${dias[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Dias habiles (lunes a viernes) entre dos fechas, sin contar el dia de inicio
function diasHabiles(desde: Date, hasta: Date): number {
  let cuenta: number = 0;
  const d: Date = new Date(desde);
  while (d.getTime() < hasta.getTime()) {
    d.setDate(d.getDate() + 1);
    const dia: number = d.getDay();
    if (dia !== 0 && dia !== 6) cuenta++;
  }
  return cuenta;
}

// ===================== SERVICIO =====================

const MAX_DIAS_HABILES: number = 5;

class ControlPlanos {
  private readonly planos: Map<string, Plano> = new Map();

  registrar(codigo: string, titulo: string): void {
    this.planos.set(codigo, { codigo, titulo, revisiones: [] });
  }

  emitir(codigo: string, autor: string, fecha: Date, requiere: Disciplina[]): string {
    const p: Plano | undefined = this.planos.get(codigo);
    if (p === undefined) return `X el plano ${codigo} no existe`;
    const versionado: Versionado<Revision> = new Versionado<Revision>(p.revisiones);
    const pendiente: Revision | undefined = versionado.donde((r) => r.estado === "en revision")[0];
    if (pendiente !== undefined) return `X ${codigo}: ya hay una revision ${pendiente.letra} en revision`;
    if (requiere.length === 0) return `X ${codigo}: la revision debe tener al menos una disciplina que la revise`;
    const letra: string = versionado.siguienteLetra();
    versionado.agregar({ letra, autor, emitida: fecha, requiere: new Set(requiere), firmas: new Set(), estado: "en revision", comentario: null });
    return `OK ${codigo} rev. ${letra} emitida por ${autor} (${txt(fecha)}), la revisan: ${requiere.join(", ")}`;
  }

  firmar(codigo: string, disciplina: Disciplina, aprueba: boolean, comentario: string | null = null): string {
    const p: Plano | undefined = this.planos.get(codigo);
    const r: Revision | undefined = p?.revisiones.find((x) => x.estado === "en revision");
    if (p === undefined || r === undefined) return `X ${codigo}: no hay revision pendiente`;
    if (!r.requiere.has(disciplina)) return `X ${codigo} rev. ${r.letra}: ${disciplina} no tiene que revisarla`;
    if (r.firmas.has(disciplina)) return `X ${codigo} rev. ${r.letra}: ${disciplina} ya firmo`;
    if (!aprueba) {
      r.estado = "rechazada";
      r.comentario = `${disciplina}: ${comentario ?? "sin comentario"}`;
      return `X ${codigo} rev. ${r.letra} RECHAZADA por ${disciplina} (${comentario})`;
    }
    r.firmas.add(disciplina);
    const faltan: Disciplina[] = [...r.requiere].filter((d) => !r.firmas.has(d));
    if (faltan.length > 0) return `OK ${codigo} rev. ${r.letra}: firma ${disciplina}, faltan ${faltan.join(", ")}`;
    // Todas firmaron: se aprueba y la aprobada anterior queda obsoleta
    p.revisiones.filter((x) => x.estado === "aprobada").forEach((x) => (x.estado = "obsoleta"));
    r.estado = "aprobada";
    return `OK ${codigo} rev. ${r.letra} APROBADA (firmaron todas las disciplinas)`;
  }

  atrasadas(hoy: Date): string[] {
    return [...this.planos.values()].flatMap((p: Plano): string[] =>
      p.revisiones
        .filter((r) => r.estado === "en revision" && diasHabiles(r.emitida, hoy) > MAX_DIAS_HABILES)
        .map((r) => `${p.codigo} rev. ${r.letra}: ${diasHabiles(r.emitida, hoy)} dias habiles esperando a ${[...r.requiere].filter((d) => !r.firmas.has(d)).join(", ")}`),
    );
  }

  todos(): Plano[] {
    return [...this.planos.values()];
  }
}

// ===================== SALIDA =====================

function main(): void {
  const control: ControlPlanos = new ControlPlanos();
  control.registrar("A-101", "Planta baja");
  control.registrar("A-102", "Planta alta");
  control.registrar("E-201", "Instalacion electrica");
  control.registrar("S-301", "Cimentacion");

  console.log("==================== MOVIMIENTOS ====================");
  [
    control.emitir("A-101", "Lucia", f(11, 2), ["arquitectura", "estructura"]),
    control.firmar("A-101", "arquitectura", true),
    control.firmar("A-101", "estructura", true),
    control.emitir("A-101", "Lucia", f(11, 9), ["arquitectura", "estructura", "hidraulica"]), // rev. B
    control.firmar("A-101", "hidraulica", true),
    control.firmar("A-101", "hidraulica", true), // firma doble
    control.firmar("A-101", "electrica", true), // no le toca
    control.emitir("A-101", "Lucia", f(11, 10), ["arquitectura"]), // ya hay una pendiente
    control.firmar("A-101", "arquitectura", true),
    control.firmar("A-101", "estructura", true), // aprueba B -> A queda obsoleta
    control.emitir("A-102", "Marco", f(11, 6), ["arquitectura", "estructura"]),
    control.firmar("A-102", "estructura", false, "faltan vigas en eje 4"),
    control.emitir("A-102", "Marco", f(11, 9), ["arquitectura", "estructura"]), // rev. B despues del rechazo
    control.emitir("E-201", "Sofia", f(11, 6), ["electrica", "arquitectura"]), // vie 06/11
    control.firmar("E-201", "arquitectura", true),
    control.emitir("S-301", "Diego", f(11, 9), ["estructura"]), // lun 09/11
    control.emitir("X-999", "Nadie", f(11, 9), ["estructura"]),
  ].forEach((m: string): void => console.log(m));

  const hoy: Date = f(11, 16); // lunes
  console.log(`\n==================== ESTADO AL ${txt(hoy)} ====================`);
  for (const p of control.todos()) {
    const vigente: Revision | undefined = p.revisiones.find((r) => r.estado === "aprobada");
    console.log(`${p.codigo} ${p.titulo.padEnd(22)} vigente: ${vigente ? `rev. ${vigente.letra}` : "ninguna"}`);
    p.revisiones.forEach((r: Revision): void => {
      console.log(`   rev. ${r.letra} ${txt(r.emitida)} ${r.autor.padEnd(6)} ${r.estado}${r.comentario ? ` (${r.comentario})` : ""}`);
    });
  }

  console.log("\n==================== REVISIONES ATRASADAS (mas de 5 dias habiles) ====================");
  const atrasadas: string[] = control.atrasadas(hoy);
  atrasadas.forEach((a: string): void => console.log(`! ${a}`));
  console.log(`(Limite: S-301 y A-102 rev. B se emitieron el lun 09/11: llevan 5 dias habiles exactos y todavia no estan atrasadas)`);
}

main();
