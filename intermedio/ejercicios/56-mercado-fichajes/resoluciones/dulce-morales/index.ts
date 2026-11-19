export {};

// Intermedio 56: Mercado de fichajes futbol
// Tematica: futbol
// Resolucion: Dulce Morales
//
// Problema: el ultimo dia del mercado de fichajes, un club negocia varios jugadores a la vez.
// Cada negociacion es asincrona: se manda una oferta, el otro club tarda en responder y acepta,
// contraoferta o rechaza. Se negocia hasta 3 rondas. Si se acepta, el jugador pasa la revision
// medica (tambien asincrona, puede fallar). El presupuesto se reserva al aceptar para no gastar
// dos veces el mismo dinero en negociaciones paralelas. A la hora de cierre ya no se aceptan tratos.

// ===================== TIPOS =====================

type Posicion = "POR" | "DEF" | "MED" | "DEL";

interface Objetivo {
  readonly jugador: string;
  readonly club: string;
  readonly posicion: Posicion;
  readonly valorMercado: number; // millones
  readonly ofertaInicial: number;
  readonly maximo: number; // lo maximo que el club esta dispuesto a pagar
  readonly lesionOculta: boolean; // la revision medica lo detecta
  readonly demoraMs: number; // cuanto tarda el otro club en responder
}

type RespuestaClub =
  | { readonly tipo: "acepta" }
  | { readonly tipo: "contraoferta"; readonly monto: number }
  | { readonly tipo: "rechaza"; readonly motivo: string };

// ===================== ERRORES TIPADOS =====================

class ErrorVentanaCerrada extends Error {
  constructor(public readonly jugador: string) {
    super(`el mercado cerro antes de cerrar el trato por ${jugador}`);
    this.name = "ErrorVentanaCerrada";
  }
}

class ErrorPresupuesto extends Error {
  constructor(public readonly jugador: string, public readonly falta: number) {
    super(`no alcanza el presupuesto para ${jugador} (faltan ${falta} M)`);
    this.name = "ErrorPresupuesto";
  }
}

class ErrorNegociacion extends Error {
  constructor(public readonly jugador: string, motivo: string) {
    super(`${jugador}: ${motivo}`);
    this.name = "ErrorNegociacion";
  }
}

class ErrorMedico extends Error {
  constructor(public readonly jugador: string) {
    super(`${jugador} no paso la revision medica`);
    this.name = "ErrorMedico";
  }
}

type ErrorFichaje = ErrorVentanaCerrada | ErrorPresupuesto | ErrorNegociacion | ErrorMedico;

function esErrorFichaje(e: unknown): e is ErrorFichaje {
  return e instanceof ErrorVentanaCerrada || e instanceof ErrorPresupuesto || e instanceof ErrorNegociacion || e instanceof ErrorMedico;
}

// ===================== CLUB VENDEDOR SIMULADO =====================

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

// Acepta desde el 110% del valor; contraoferta al 125% si la oferta llega al 80%; si no, rechaza
async function responder(o: Objetivo, oferta: number): Promise<RespuestaClub> {
  await esperar(o.demoraMs);
  if (oferta >= o.valorMercado * 1.1) return { tipo: "acepta" };
  if (oferta >= o.valorMercado * 0.8) return { tipo: "contraoferta", monto: Math.round(o.valorMercado * 1.25 * 10) / 10 };
  return { tipo: "rechaza", motivo: "la oferta es demasiado baja" };
}

async function revisionMedica(o: Objetivo): Promise<void> {
  await esperar(20);
  if (o.lesionOculta) throw new ErrorMedico(o.jugador);
}

// ===================== DIRECTOR DEPORTIVO =====================

class DirectorDeportivo {
  private disponible: number;
  private readonly reservado: Map<string, number> = new Map();
  private readonly bitacora: string[] = [];
  private readonly inicio: number = Date.now();

  constructor(presupuesto: number, private readonly cierreMs: number) {
    this.disponible = presupuesto;
  }

  private abierto(): boolean {
    return Date.now() - this.inicio <= this.cierreMs;
  }

  private anotar(texto: string): void {
    this.bitacora.push(texto);
  }

  get registro(): readonly string[] {
    return this.bitacora;
  }

  get saldo(): number {
    return Math.round(this.disponible * 10) / 10;
  }

  // Negocia hasta 3 rondas; si el otro club contraoferta, se sube hasta el maximo propio
  async fichar(o: Objetivo): Promise<number> {
    let oferta: number = o.ofertaInicial;
    for (let ronda = 1; ronda <= 3; ronda++) {
      if (!this.abierto()) throw new ErrorVentanaCerrada(o.jugador);
      this.anotar(`${o.jugador}: ronda ${ronda}, oferta ${oferta} M`);
      const r: RespuestaClub = await responder(o, oferta);
      if (!this.abierto()) throw new ErrorVentanaCerrada(o.jugador);

      if (r.tipo === "rechaza") throw new ErrorNegociacion(o.jugador, r.motivo);
      if (r.tipo === "contraoferta") {
        if (r.monto > o.maximo) throw new ErrorNegociacion(o.jugador, `piden ${r.monto} M y el maximo es ${o.maximo} M`);
        this.anotar(`${o.jugador}: contraoferta de ${r.monto} M`);
        oferta = r.monto;
        continue;
      }
      // Acepta: se reserva el dinero ANTES de la revision medica (otra negociacion podria gastarlo)
      if (oferta > this.disponible) throw new ErrorPresupuesto(o.jugador, Math.round((oferta - this.disponible) * 10) / 10);
      this.disponible -= oferta;
      this.reservado.set(o.jugador, oferta);
      this.anotar(`${o.jugador}: ACEPTADO por ${oferta} M (reservado; quedan ${this.saldo} M)`);
      try {
        await revisionMedica(o);
      } catch (e: unknown) {
        this.disponible += oferta; // se libera la reserva
        this.reservado.delete(o.jugador);
        this.anotar(`${o.jugador}: se libera la reserva de ${oferta} M`);
        throw e;
      }
      return oferta;
    }
    throw new ErrorNegociacion(o.jugador, "sin acuerdo despues de 3 rondas");
  }
}

// ===================== DATOS Y SALIDA =====================

const objetivos: readonly Objetivo[] = [
  { jugador: "Lautaro Paz", club: "River Sur", posicion: "DEL", valorMercado: 40, ofertaInicial: 35, maximo: 52, lesionOculta: false, demoraMs: 20 },
  { jugador: "Ines Mora", club: "Real Costa", posicion: "MED", valorMercado: 30, ofertaInicial: 20, maximo: 40, lesionOculta: false, demoraMs: 15 },
  { jugador: "Bruno Leal", club: "Atletico Norte", posicion: "DEF", valorMercado: 25, ofertaInicial: 28, maximo: 30, lesionOculta: true, demoraMs: 10 },
  // Limite: la contraoferta (25 M) es EXACTAMENTE su maximo -> se acepta
  { jugador: "Tomas Rey", club: "Union Valle", posicion: "POR", valorMercado: 20, ofertaInicial: 17, maximo: 25, lesionOculta: false, demoraMs: 25 },
  { jugador: "Kevin Sol", club: "Deportivo Este", posicion: "DEL", valorMercado: 60, ofertaInicial: 50, maximo: 80, lesionOculta: false, demoraMs: 30 },
  { jugador: "Hugo Diaz", club: "Sporting Mar", posicion: "MED", valorMercado: 22, ofertaInicial: 21, maximo: 30, lesionOculta: false, demoraMs: 90 }, // responde lento
];

async function main(): Promise<void> {
  const director: DirectorDeportivo = new DirectorDeportivo(110, 150);
  console.log("================ ULTIMO DIA DE FICHAJES (presupuesto 110 M, todas las negociaciones a la vez) ================");

  const resultados = await Promise.allSettled(objetivos.map((o) => director.fichar(o)));

  console.log("\n--- Bitacora (en el orden en que paso) ---");
  director.registro.forEach((l: string): void => console.log(l));

  console.log("\n--- Resultado por jugador ---");
  let gastado: number = 0;
  resultados.forEach((r, i) => {
    const o: Objetivo | undefined = objetivos[i];
    if (o === undefined) return;
    if (r.status === "fulfilled") {
      gastado += r.value;
      console.log(`FICHADO   ${o.jugador.padEnd(12)} ${o.posicion} de ${o.club.padEnd(15)} por ${r.value} M (valor ${o.valorMercado} M)`);
    } else if (esErrorFichaje(r.reason)) {
      console.log(`NO        ${o.jugador.padEnd(12)} [${r.reason.name}] ${r.reason.message}`);
    } else {
      throw r.reason;
    }
  });
  console.log(`\nGastado: ${gastado} M | presupuesto restante: ${director.saldo} M`);
}

main();
