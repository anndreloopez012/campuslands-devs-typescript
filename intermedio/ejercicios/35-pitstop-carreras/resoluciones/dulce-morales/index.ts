export {};

// Intermedio 35: Estrategia de pit stop
// Tematica: carreras
// Resolucion: Dulce Morales
//
// Problema: antes de una carrera de 50 vueltas, el equipo compara estrategias de paradas en pits.
// Cada compuesto de llanta tiene un ritmo base, se degrada (pierde tiempo) en cada vuelta y tiene
// una vida maxima. Cada parada cuesta 22 segundos. El reglamento obliga a usar al menos dos
// compuestos distintos. Hay que validar cada estrategia, simular su tiempo total y elegir la mejor.

// ===================== TIPOS =====================

type Compuesto = "blando" | "medio" | "duro";

interface Stint {
  readonly compuesto: Compuesto;
  readonly vueltas: number;
}

interface DatosLlanta {
  readonly ritmoBase: number; // segundos por vuelta con la llanta nueva
  readonly degradacion: number; // segundos que se pierden por cada vuelta de uso
  readonly vidaMaxima: number; // vueltas antes de que sea peligroso
}

type Validacion = { readonly valida: true } | { readonly valida: false; readonly errores: readonly string[] };

function esValida(v: Validacion): v is Extract<Validacion, { valida: true }> {
  return v.valida;
}

// ===================== REGLAS =====================

const VUELTAS_CARRERA: number = 50;
const TIEMPO_PARADA_SEG: number = 22;
const LLANTAS: Readonly<Record<Compuesto, DatosLlanta>> = {
  blando: { ritmoBase: 90.0, degradacion: 0.12, vidaMaxima: 18 },
  medio: { ritmoBase: 90.6, degradacion: 0.06, vidaMaxima: 30 },
  duro: { ritmoBase: 91.2, degradacion: 0.03, vidaMaxima: 45 },
};

// ===================== CLASES =====================

class Estrategia {
  constructor(
    public readonly nombre: string,
    public readonly stints: readonly Stint[],
  ) {}

  get paradas(): number {
    return Math.max(0, this.stints.length - 1);
  }

  validar(): Validacion {
    const errores: string[] = [];
    const total: number = this.stints.reduce((s: number, x: Stint): number => s + x.vueltas, 0);
    if (total !== VUELTAS_CARRERA) errores.push(`suma ${total} vueltas y la carrera tiene ${VUELTAS_CARRERA}`);
    if (new Set(this.stints.map((s: Stint): Compuesto => s.compuesto)).size < 2) errores.push("debe usar al menos 2 compuestos distintos");
    this.stints.forEach((s: Stint, i: number): void => {
      if (!Number.isInteger(s.vueltas) || s.vueltas <= 0) errores.push(`stint ${i + 1}: vueltas invalidas`);
      // Llegar EXACTO a la vida maxima esta permitido; pasarse no
      if (s.vueltas > LLANTAS[s.compuesto].vidaMaxima) errores.push(`stint ${i + 1}: ${s.vueltas} vueltas con ${s.compuesto} (maximo ${LLANTAS[s.compuesto].vidaMaxima})`);
    });
    return errores.length === 0 ? { valida: true } : { valida: false, errores };
  }

  // Tiempo de un stint: suma de vueltas, cada una mas lenta por la degradacion
  private tiempoStint(s: Stint): number {
    const llanta: DatosLlanta = LLANTAS[s.compuesto];
    let total: number = 0;
    for (let v = 0; v < s.vueltas; v++) total += llanta.ritmoBase + llanta.degradacion * v;
    return total;
  }

  tiempoTotal(): number {
    const enPista: number = this.stints.reduce((t: number, s: Stint): number => t + this.tiempoStint(s), 0);
    return Math.round((enPista + this.paradas * TIEMPO_PARADA_SEG) * 1000) / 1000;
  }

  // Vuelta en la que se hace cada parada
  vueltasDeParada(): number[] {
    const paradas: number[] = [];
    let acumulado: number = 0;
    this.stints.slice(0, -1).forEach((s: Stint): void => {
      acumulado += s.vueltas;
      paradas.push(acumulado);
    });
    return paradas;
  }
}

// Comparador generico: ordena cualquier cosa por un puntaje (menor es mejor)
class Comparador<T> {
  constructor(private readonly puntaje: (item: T) => number) {}

  ordenar(items: readonly T[]): T[] {
    return [...items].sort((a: T, b: T): number => this.puntaje(a) - this.puntaje(b));
  }
}

// ===================== DATOS =====================

const estrategias: readonly Estrategia[] = [
  new Estrategia("1 parada: medio -> duro", [{ compuesto: "medio", vueltas: 22 }, { compuesto: "duro", vueltas: 28 }]),
  new Estrategia("1 parada: blando -> duro", [{ compuesto: "blando", vueltas: 15 }, { compuesto: "duro", vueltas: 35 }]),
  // Limite: el blando llega EXACTO a su vida maxima (18 vueltas)
  new Estrategia("2 paradas: blando -> medio -> blando", [{ compuesto: "blando", vueltas: 18 }, { compuesto: "medio", vueltas: 22 }, { compuesto: "blando", vueltas: 10 }]),
  new Estrategia("2 paradas: blando -> blando -> medio", [{ compuesto: "blando", vueltas: 14 }, { compuesto: "blando", vueltas: 14 }, { compuesto: "medio", vueltas: 22 }]),
  new Estrategia("3 paradas: casi todo blando", [{ compuesto: "blando", vueltas: 13 }, { compuesto: "medio", vueltas: 13 }, { compuesto: "blando", vueltas: 12 }, { compuesto: "blando", vueltas: 12 }]),
  // Invalidas
  new Estrategia("Sin parar con duros", [{ compuesto: "duro", vueltas: 50 }]),
  new Estrategia("Blando demasiado largo", [{ compuesto: "blando", vueltas: 25 }, { compuesto: "duro", vueltas: 25 }]),
  new Estrategia("Mal contada", [{ compuesto: "medio", vueltas: 20 }, { compuesto: "duro", vueltas: 25 }]),
];

// ===================== SALIDA =====================

function formatear(seg: number): string {
  const min: number = Math.floor(seg / 60);
  return `${min}:${(seg - min * 60).toFixed(3).padStart(6, "0")}`;
}

function main(): void {
  console.log(`================ ESTRATEGIAS PARA ${VUELTAS_CARRERA} VUELTAS (parada = ${TIEMPO_PARADA_SEG} s) ================`);
  const validas: Estrategia[] = [];
  for (const e of estrategias) {
    const v: Validacion = e.validar();
    if (esValida(v)) {
      validas.push(e);
    } else {
      console.log(`X ${e.nombre}`);
      v.errores.forEach((err: string): void => console.log(`    - ${err}`));
    }
  }

  const comparador: Comparador<Estrategia> = new Comparador<Estrategia>((e: Estrategia): number => e.tiempoTotal());
  const ranking: Estrategia[] = comparador.ordenar(validas);
  const mejor: Estrategia | undefined = ranking[0];

  console.log("\n================ RANKING DE ESTRATEGIAS VALIDAS ================");
  ranking.forEach((e: Estrategia, i: number): void => {
    const delta: string = mejor === undefined || e === mejor ? "mejor" : `+${(e.tiempoTotal() - mejor.tiempoTotal()).toFixed(3)} s`;
    const stints: string = e.stints.map((s: Stint): string => `${s.compuesto} ${s.vueltas}v`).join(" | ");
    console.log(`${i + 1}. ${e.nombre.padEnd(37)} ${formatear(e.tiempoTotal())}  ${delta.padEnd(11)} paradas en vuelta ${e.vueltasDeParada().join(", ")}`);
    console.log(`     ${stints}`);
  });

  if (mejor !== undefined) {
    const peor: Estrategia | undefined = ranking[ranking.length - 1];
    console.log(`\nRecomendada: ${mejor.nombre}. Gana ${peor === undefined ? 0 : (peor.tiempoTotal() - mejor.tiempoTotal()).toFixed(3)} s sobre la peor estrategia valida.`);
  }
}

main();
