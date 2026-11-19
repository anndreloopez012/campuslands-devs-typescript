export {};

// Intermedio 36: Bracket de kickboxing
// Tematica: kickboxing
// Resolucion: Dulce Morales
//
// Problema: armar y simular la llave de eliminacion directa de un torneo de kickboxing.
// Primero hay un pesaje: quien pasa el limite de su categoria queda fuera. Con los que pasan,
// se ordenan por ranking (cabezas de serie) y, si no son potencia de 2, los mejores pasan
// directo a la siguiente ronda (bye). Cada pelea se decide segun la diferencia de nivel,
// con un generador con semilla para que el resultado sea repetible.

// ===================== TIPOS =====================

type Categoria = "pluma" | "ligero" | "welter";
type Metodo = "KO" | "TKO" | "decision";

interface Peleador {
  readonly nombre: string;
  readonly categoria: Categoria;
  readonly pesoKg: number;
  readonly nivel: number; // 1 a 100
  readonly ranking: number; // 1 = el mejor
}

// Un cupo en la llave puede ser un peleador o un "bye" (pase directo)
type Cupo<T> = { readonly tipo: "peleador"; readonly valor: T } | { readonly tipo: "bye" };

function esPeleador<T>(c: Cupo<T>): c is Extract<Cupo<T>, { tipo: "peleador" }> {
  return c.tipo === "peleador";
}

interface Combate {
  readonly ronda: string;
  readonly rojo: Peleador;
  readonly azul: Peleador | null; // null = bye
  readonly ganador: Peleador;
  readonly metodo: Metodo | "pase directo";
  readonly round: number | null;
}

// ===================== REGLAS =====================

const LIMITE_KG: Readonly<Record<Categoria, number>> = { pluma: 57, ligero: 63.5, welter: 69.9 };

function crearAleatorio(semilla: number): () => number {
  let estado: number = semilla >>> 0;
  return (): number => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t: number = Math.imul(estado ^ (estado >>> 15), estado | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ===================== CLASES =====================

class Torneo {
  private readonly combates: Combate[] = [];

  constructor(
    public readonly nombre: string,
    public readonly categoria: Categoria,
    private readonly aleatorio: () => number,
  ) {}

  // Pesaje: el limite exacto se acepta; pasarse aunque sea un poco descalifica
  pesaje(inscritos: readonly Peleador[]): { aptos: Peleador[]; fuera: string[] } {
    const aptos: Peleador[] = [];
    const fuera: string[] = [];
    for (const p of inscritos) {
      const limite: number = LIMITE_KG[this.categoria];
      if (p.categoria !== this.categoria) fuera.push(`${p.nombre}: inscrito en ${p.categoria}, no en ${this.categoria}`);
      else if (p.pesoKg > limite) fuera.push(`${p.nombre}: pesa ${p.pesoKg} kg (limite ${limite} kg)`);
      else aptos.push(p);
    }
    return { aptos, fuera };
  }

  // Orden estandar de siembra: para 8 cupos da [1, 8, 4, 5, 2, 7, 3, 6].
  // Asi el 1 y el 2 quedan en mitades distintas y solo se pueden cruzar en la final.
  private ordenDeSiembra(tamano: number): number[] {
    let orden: number[] = [1];
    while (orden.length < tamano) {
      const n: number = orden.length * 2;
      orden = orden.flatMap((s: number): number[] => [s, n + 1 - s]);
    }
    return orden;
  }

  // Cabezas de serie por ranking, con byes para completar una potencia de 2
  armarLlave(aptos: readonly Peleador[]): Cupo<Peleador>[] {
    const ordenados: Peleador[] = [...aptos].sort((a, b): number => a.ranking - b.ranking);
    let tamano: number = 1;
    while (tamano < ordenados.length) tamano *= 2;
    // Las siembras que no tienen peleador (las ultimas) son byes
    return this.ordenDeSiembra(tamano).map((siembra: number): Cupo<Peleador> => {
      const p: Peleador | undefined = ordenados[siembra - 1];
      return p === undefined ? { tipo: "bye" } : { tipo: "peleador", valor: p };
    });
  }

  private pelear(ronda: string, a: Peleador, b: Peleador): Peleador {
    // Probabilidad de que gane "a" segun la diferencia de nivel
    const probA: number = 1 / (1 + Math.pow(10, (b.nivel - a.nivel) / 20));
    const ganador: Peleador = this.aleatorio() < probA ? a : b;
    const azar: number = this.aleatorio();
    const metodo: Metodo = azar < 0.25 ? "KO" : azar < 0.45 ? "TKO" : "decision";
    const round: number = metodo === "decision" ? 3 : 1 + Math.floor(this.aleatorio() * 3);
    this.combates.push({ ronda, rojo: a, azul: b, ganador, metodo, round });
    return ganador;
  }

  simular(llave: Cupo<Peleador>[]): Peleador | null {
    const nombres: Record<number, string> = { 8: "Cuartos", 4: "Semifinal", 2: "Final" };
    let actual: Cupo<Peleador>[] = llave;
    while (actual.length > 1) {
      const ronda: string = nombres[actual.length] ?? `Ronda de ${actual.length}`;
      const siguiente: Cupo<Peleador>[] = [];
      for (let i = 0; i < actual.length; i += 2) {
        const a: Cupo<Peleador> | undefined = actual[i];
        const b: Cupo<Peleador> | undefined = actual[i + 1];
        if (a === undefined || b === undefined) continue;
        if (esPeleador(a) && esPeleador(b)) {
          siguiente.push({ tipo: "peleador", valor: this.pelear(ronda, a.valor, b.valor) });
        } else {
          // Uno de los dos es bye: el otro pasa directo (si los dos son bye, sigue el bye)
          const pasa: Peleador | undefined = esPeleador(a) ? a.valor : esPeleador(b) ? b.valor : undefined;
          if (pasa === undefined) {
            siguiente.push({ tipo: "bye" });
            continue;
          }
          this.combates.push({ ronda, rojo: pasa, azul: null, ganador: pasa, metodo: "pase directo", round: null });
          siguiente.push({ tipo: "peleador", valor: pasa });
        }
      }
      actual = siguiente;
    }
    const [campeon] = actual;
    return campeon !== undefined && esPeleador(campeon) ? campeon.valor : null;
  }

  get historial(): readonly Combate[] {
    return this.combates;
  }
}

// ===================== DATOS Y SALIDA =====================

const inscritos: readonly Peleador[] = [
  { nombre: "Camila Torres", categoria: "ligero", pesoKg: 63.1, nivel: 88, ranking: 1 },
  { nombre: "Nadia Brooks", categoria: "ligero", pesoKg: 62.8, nivel: 84, ranking: 2 },
  { nombre: "Lia Moreno", categoria: "ligero", pesoKg: 63.5, nivel: 80, ranking: 3 }, // limite: peso EXACTO -> pasa
  { nombre: "Eva Kraus", categoria: "ligero", pesoKg: 61.9, nivel: 77, ranking: 4 },
  { nombre: "Sol Pena", categoria: "ligero", pesoKg: 63.0, nivel: 74, ranking: 5 },
  { nombre: "Ana Ruiz", categoria: "ligero", pesoKg: 62.2, nivel: 71, ranking: 6 },
  { nombre: "Rita Gomez", categoria: "ligero", pesoKg: 64.0, nivel: 86, ranking: 7 }, // se pasa del peso
  { nombre: "Ivy Chen", categoria: "pluma", pesoKg: 56.5, nivel: 79, ranking: 8 }, // otra categoria
];

function main(): void {
  const torneo: Torneo = new Torneo("Copa Andina de Kickboxing", "ligero", crearAleatorio(1));

  console.log(`============ ${torneo.nombre} - categoria ${torneo.categoria} (hasta ${LIMITE_KG.ligero} kg) ============`);
  const { aptos, fuera } = torneo.pesaje(inscritos);
  console.log(`Pesaje: ${aptos.length} aptos`);
  fuera.forEach((f: string): void => console.log(`  X ${f}`));

  const llave: Cupo<Peleador>[] = torneo.armarLlave(aptos);
  console.log(`\nLlave de ${llave.length} cupos (${llave.filter((c) => !esPeleador(c)).length} bye):`);
  for (let i = 0; i < llave.length; i += 2) {
    const texto = (c: Cupo<Peleador> | undefined): string => (c === undefined ? "?" : esPeleador(c) ? `#${c.valor.ranking} ${c.valor.nombre}` : "BYE");
    console.log(`  ${texto(llave[i]).padEnd(18)} vs ${texto(llave[i + 1])}`);
  }

  const campeon: Peleador | null = torneo.simular(llave);
  console.log("\n============ COMBATES ============");
  let ronda: string = "";
  torneo.historial.forEach((c: Combate): void => {
    if (c.ronda !== ronda) {
      ronda = c.ronda;
      console.log(`${ronda}:`);
    }
    if (c.azul === null) {
      console.log(`  ${c.rojo.nombre} pasa directo (bye)`);
      return;
    }
    const sorpresa: string = c.ganador.ranking > (c.ganador === c.rojo ? c.azul.ranking : c.rojo.ranking) ? "  << sorpresa" : "";
    console.log(`  ${c.rojo.nombre.padEnd(14)} vs ${c.azul.nombre.padEnd(14)} -> gana ${c.ganador.nombre} por ${c.metodo} (round ${c.round})${sorpresa}`);
  });

  console.log(`\nCAMPEONA: ${campeon?.nombre ?? "sin campeona"}`);
  const porMetodo: Map<string, number> = torneo.historial
    .filter((c: Combate): boolean => c.azul !== null)
    .reduce((m: Map<string, number>, c: Combate) => m.set(c.metodo, (m.get(c.metodo) ?? 0) + 1), new Map<string, number>());
  console.log(`Definiciones: ${[...porMetodo.entries()].map(([m, n]) => `${m} ${n}`).join(", ")}`);
}

main();
