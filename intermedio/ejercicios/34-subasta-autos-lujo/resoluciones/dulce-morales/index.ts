export {};

// Intermedio 34: Subasta de autos de lujo
// Tematica: autos de lujo
// Resolucion: Dulce Morales
//
// Problema: una casa de subastas vende autos de lujo en lotes. Cada puja debe superar la anterior
// por un incremento minimo (que depende del precio), solo pueden pujar postores verificados, y si
// alguien puja en el ultimo minuto la subasta se alarga 2 minutos (anti-sniping). Al cerrar, el auto
// se vende solo si se alcanzo el precio de reserva, y el comprador paga una comision.

// ===================== TIPOS =====================

type EstadoLote = "abierto" | "vendido" | "sin vender";

interface Auto {
  readonly marca: string;
  readonly modelo: string;
  readonly anio: number;
  readonly km: number;
}

interface Postor {
  readonly id: string;
  readonly nombre: string;
  readonly verificado: boolean;
  readonly limiteCredito: number;
}

interface Puja {
  readonly postorId: string;
  readonly monto: number;
  readonly segundo: number; // segundos desde que abrio el lote
}

// Resultado de intentar una puja
type Respuesta =
  | { readonly aceptada: true; readonly puja: Puja; readonly extendio: boolean }
  | { readonly aceptada: false; readonly puja: Puja; readonly motivo: string };

function esAceptada(r: Respuesta): r is Extract<Respuesta, { aceptada: true }> {
  return r.aceptada;
}

// ===================== REGLAS =====================

// Incremento minimo segun el precio actual: [hasta este monto, incremento]
const INCREMENTOS: readonly (readonly [number, number])[] = [
  [100_000, 2_000],
  [500_000, 5_000],
  [Infinity, 10_000],
];
const DURACION_SEG: number = 600; // 10 minutos
const VENTANA_ANTISNIPING_SEG: number = 60;
const EXTENSION_SEG: number = 120;
const COMISION_COMPRADOR: number = 0.1;

function incrementoMinimo(precio: number): number {
  return INCREMENTOS.find(([hasta]): boolean => precio < hasta)?.[1] ?? 10_000;
}

// ===================== CLASES =====================

// Historial generico, de solo agregar
class Historial<T> {
  private readonly items: T[] = [];

  agregar(item: T): void {
    this.items.push(item);
  }

  get todos(): readonly T[] {
    return this.items;
  }

  get ultimo(): T | undefined {
    return this.items[this.items.length - 1];
  }
}

class Lote {
  private cierreSeg: number = DURACION_SEG;
  private estadoActual: EstadoLote = "abierto";
  public readonly respuestas: Historial<Respuesta> = new Historial<Respuesta>();

  constructor(
    public readonly numero: number,
    public readonly auto: Auto,
    public readonly precioSalida: number,
    private readonly precioReserva: number,
  ) {
    if (precioReserva < precioSalida) throw new Error(`lote ${numero}: la reserva no puede ser menor que la salida`);
  }

  get estado(): EstadoLote {
    return this.estadoActual;
  }

  get cierre(): number {
    return this.cierreSeg;
  }

  get precioActual(): number {
    const ultima: Respuesta | undefined = [...this.respuestas.todos].reverse().find(esAceptada);
    return ultima?.puja.monto ?? this.precioSalida;
  }

  get ganador(): string | null {
    const ultima = [...this.respuestas.todos].reverse().find(esAceptada);
    return ultima?.puja.postorId ?? null;
  }

  pujar(puja: Puja, postor: Postor | undefined): Respuesta {
    const r: Respuesta = this.evaluar(puja, postor);
    this.respuestas.agregar(r);
    if (esAceptada(r) && r.extendio) this.cierreSeg += EXTENSION_SEG;
    return r;
  }

  private evaluar(puja: Puja, postor: Postor | undefined): Respuesta {
    if (this.estadoActual !== "abierto") return { aceptada: false, puja, motivo: "el lote ya cerro" };
    if (puja.segundo > this.cierreSeg) return { aceptada: false, puja, motivo: `llego en el segundo ${puja.segundo}, cerro en el ${this.cierreSeg}` };
    if (postor === undefined) return { aceptada: false, puja, motivo: "postor no registrado" };
    if (!postor.verificado) return { aceptada: false, puja, motivo: `${postor.nombre} no esta verificado` };
    if (puja.monto > postor.limiteCredito) return { aceptada: false, puja, motivo: `supera el credito de ${postor.nombre}` };
    if (this.ganador === postor.id) return { aceptada: false, puja, motivo: `${postor.nombre} ya va ganando` };
    const hayPujas: boolean = this.ganador !== null;
    const minimo: number = hayPujas ? this.precioActual + incrementoMinimo(this.precioActual) : this.precioSalida;
    if (puja.monto < minimo) return { aceptada: false, puja, motivo: `minimo ${dinero(minimo)}` };
    const extendio: boolean = this.cierreSeg - puja.segundo < VENTANA_ANTISNIPING_SEG;
    return { aceptada: true, puja, extendio };
  }

  cerrar(): EstadoLote {
    this.estadoActual = this.ganador !== null && this.precioActual >= this.precioReserva ? "vendido" : "sin vender";
    return this.estadoActual;
  }

  get reservaAlcanzada(): boolean {
    return this.precioActual >= this.precioReserva;
  }
}

// ===================== DATOS =====================

function dinero(v: number): string {
  return `$${v.toLocaleString("en-US")}`;
}

const postores: readonly Postor[] = [
  { id: "P1", nombre: "Ines", verificado: true, limiteCredito: 900_000 },
  { id: "P2", nombre: "Marco", verificado: true, limiteCredito: 450_000 },
  { id: "P3", nombre: "Hugo", verificado: false, limiteCredito: 2_000_000 },
  { id: "P4", nombre: "Lena", verificado: true, limiteCredito: 1_500_000 },
];

interface Escenario {
  readonly lote: Lote;
  readonly pujas: readonly Puja[];
}

function escenarios(): Escenario[] {
  return [
    {
      // Puja final en el ultimo minuto: se extiende y hay contraoferta
      lote: new Lote(1, { marca: "Ferrari", modelo: "F40", anio: 1990, km: 18000 }, 300_000, 420_000),
      pujas: [
        { postorId: "P2", monto: 300_000, segundo: 30 },
        { postorId: "P1", monto: 302_000, segundo: 90 }, // incremento muy chico (minimo 5,000)
        { postorId: "P1", monto: 305_000, segundo: 95 }, // limite: EXACTO el incremento minimo
        { postorId: "P3", monto: 350_000, segundo: 200 }, // no verificado
        { postorId: "P2", monto: 400_000, segundo: 300 },
        { postorId: "P2", monto: 410_000, segundo: 320 }, // ya va ganando
        { postorId: "P1", monto: 420_000, segundo: 580 }, // ultimo minuto -> extiende a 720 s
        { postorId: "P2", monto: 470_000, segundo: 650 }, // supera su credito (450,000)
        { postorId: "P4", monto: 440_000, segundo: 700 }, // dentro de la extension -> extiende a 840 s
        { postorId: "P1", monto: 460_000, segundo: 900 }, // llega tarde
      ],
    },
    {
      // No llega a la reserva: queda sin vender
      lote: new Lote(2, { marca: "Lamborghini", modelo: "Countach", anio: 1988, km: 32000 }, 250_000, 380_000),
      pujas: [
        { postorId: "P2", monto: 250_000, segundo: 60 },
        { postorId: "P4", monto: 300_000, segundo: 240 },
        { postorId: "P2", monto: 350_000, segundo: 400 },
      ],
    },
    {
      // Limite: la ultima puja es EXACTA a la reserva -> se vende
      lote: new Lote(3, { marca: "Porsche", modelo: "959", anio: 1987, km: 25000 }, 600_000, 800_000),
      pujas: [
        { postorId: "P4", monto: 600_000, segundo: 100 },
        { postorId: "P1", monto: 700_000, segundo: 200 },
        { postorId: "P4", monto: 800_000, segundo: 300 },
      ],
    },
  ];
}

// ===================== SALIDA =====================

function main(): void {
  try {
    new Lote(99, { marca: "X", modelo: "Y", anio: 2000, km: 0 }, 100_000, 50_000);
  } catch (e: unknown) {
    console.log(`Validacion: ${e instanceof Error ? e.message : "error"}\n`);
  }

  const porId: Map<string, Postor> = new Map(postores.map((p: Postor): [string, Postor] => [p.id, p]));
  let recaudado: number = 0;

  for (const { lote, pujas } of escenarios()) {
    const a: Auto = lote.auto;
    console.log(`========== Lote ${lote.numero}: ${a.marca} ${a.modelo} ${a.anio} (${a.km.toLocaleString("en-US")} km) | salida ${dinero(lote.precioSalida)} ==========`);
    for (const p of pujas) {
      const r: Respuesta = lote.pujar(p, porId.get(p.postorId));
      const quien: string = (porId.get(p.postorId)?.nombre ?? p.postorId).padEnd(6);
      const linea: string = `  ${String(p.segundo).padStart(3)}s ${quien} ${dinero(p.monto).padStart(10)}`;
      if (esAceptada(r)) console.log(`${linea}  OK${r.extendio ? `  (puja en el ultimo minuto: cierre extendido a ${lote.cierre}s)` : ""}`);
      else console.log(`${linea}  X ${r.motivo}`);
    }
    const estado: EstadoLote = lote.cerrar();
    const ganador: string = porId.get(lote.ganador ?? "")?.nombre ?? "-";
    if (estado === "vendido") {
      const comision: number = lote.precioActual * COMISION_COMPRADOR;
      recaudado += lote.precioActual + comision;
      console.log(`  VENDIDO a ${ganador} por ${dinero(lote.precioActual)} + comision ${dinero(comision)} = ${dinero(lote.precioActual + comision)}\n`);
    } else {
      console.log(`  SIN VENDER: la mejor puja (${dinero(lote.precioActual)} de ${ganador}) no alcanzo la reserva\n`);
    }
  }
  console.log(`Total cobrado a compradores: ${dinero(recaudado)}`);
}

main();
