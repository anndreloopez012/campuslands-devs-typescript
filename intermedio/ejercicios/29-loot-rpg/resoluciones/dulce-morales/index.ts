export {};

// Intermedio 29: Sistema de loot RPG
// Tematica: videojuegos RPG
// Resolucion: Dulce Morales
//
// Problema: al derrotar enemigos, el juego tira "dados" para decidir que objetos caen (loot).
// Cada rareza tiene un peso de probabilidad y existe un sistema de lastima (pity): si pasan
// muchas tiradas sin un legendario, la siguiente lo garantiza. Luego el loot se reparte en el
// grupo: cada objeto va a quien lo puede usar (por clase) y que menos tenga; lo que nadie puede
// usar o sale repetido se vende por oro. Se usa un generador con semilla para que el resultado
// sea siempre el mismo y se pueda revisar.

// ===================== MODELO =====================

type Rareza = "comun" | "rara" | "epica" | "legendaria";
type TipoObjeto = "espada" | "baston" | "arco" | "armadura pesada" | "tunica" | "pocion" | "hacha";
type Clase = "guerrero" | "mago" | "arquera";

interface Objeto {
  readonly nombre: string;
  readonly tipo: TipoObjeto;
  readonly rareza: Rareza;
}

interface Jugador {
  readonly nombre: string;
  readonly clase: Clase;
}

interface Tirada {
  readonly enemigo: string;
  readonly objeto: Objeto;
  readonly porLastima: boolean;
}

// ===================== REGLAS (Record, Set, Map) =====================

const PESO_RAREZA: Readonly<Record<Rareza, number>> = { comun: 60, rara: 28, epica: 10, legendaria: 2 };
const ORO_POR_RAREZA: Readonly<Record<Rareza, number>> = { comun: 5, rara: 20, epica: 80, legendaria: 300 };
const TIRADAS_PARA_LASTIMA: number = 10; // la tirada 10 sin legendario da uno seguro

// Tipos de objeto que puede usar cada clase (las pociones las usan todos)
const PUEDE_USAR: Readonly<Record<Clase, ReadonlySet<TipoObjeto>>> = {
  guerrero: new Set<TipoObjeto>(["espada", "armadura pesada", "pocion"]),
  mago: new Set<TipoObjeto>(["baston", "tunica", "pocion"]),
  arquera: new Set<TipoObjeto>(["arco", "tunica", "pocion"]),
};

// Objetos posibles por rareza
const CATALOGO: Readonly<Record<Rareza, readonly Objeto[]>> = {
  comun: [
    { nombre: "Pocion menor", tipo: "pocion", rareza: "comun" },
    { nombre: "Espada oxidada", tipo: "espada", rareza: "comun" },
    { nombre: "Tunica de lino", tipo: "tunica", rareza: "comun" },
    { nombre: "Hacha de lenador", tipo: "hacha", rareza: "comun" }, // nadie del grupo usa hachas
  ],
  rara: [
    { nombre: "Arco de fresno", tipo: "arco", rareza: "rara" },
    { nombre: "Coraza de hierro", tipo: "armadura pesada", rareza: "rara" },
    { nombre: "Baston de roble", tipo: "baston", rareza: "rara" },
  ],
  epica: [
    { nombre: "Espada runica", tipo: "espada", rareza: "epica" },
    { nombre: "Tunica astral", tipo: "tunica", rareza: "epica" },
  ],
  legendaria: [
    { nombre: "Arco del Alba", tipo: "arco", rareza: "legendaria" },
    { nombre: "Baston del Vacio", tipo: "baston", rareza: "legendaria" },
  ],
};

// ===================== GENERADOR CON SEMILLA =====================

// Mulberry32: genera numeros "aleatorios" repetibles a partir de una semilla
function crearAleatorio(semilla: number): () => number {
  let estado: number = semilla >>> 0;
  return (): number => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t: number = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Elige una clave de un Record de pesos (mientras mas peso, mas probable)
function elegirPorPeso<K extends string>(pesos: Readonly<Record<K, number>>, claves: readonly K[], azar: number): K {
  const total: number = claves.reduce((s: number, k: K): number => s + pesos[k], 0);
  let punto: number = azar * total;
  for (const k of claves) {
    punto -= pesos[k];
    if (punto < 0) return k;
  }
  return claves[claves.length - 1] ?? claves[0] ?? ("" as K);
}

// ===================== TIRADAS CON LASTIMA =====================

const RAREZAS: readonly Rareza[] = ["comun", "rara", "epica", "legendaria"];

function tirarLoot(enemigos: readonly string[], aleatorio: () => number): Tirada[] {
  let sinLegendario: number = 0;
  return enemigos.map((enemigo: string): Tirada => {
    sinLegendario += 1;
    const porLastima: boolean = sinLegendario >= TIRADAS_PARA_LASTIMA;
    const rareza: Rareza = porLastima ? "legendaria" : elegirPorPeso(PESO_RAREZA, RAREZAS, aleatorio());
    if (rareza === "legendaria") sinLegendario = 0;
    const opciones: readonly Objeto[] = CATALOGO[rareza];
    const objeto: Objeto = opciones[Math.floor(aleatorio() * opciones.length)] ?? CATALOGO.comun[0] ?? { nombre: "?", tipo: "pocion", rareza: "comun" };
    return { enemigo, objeto, porLastima };
  });
}

// ===================== REPARTO EN EL GRUPO =====================

interface Reparto {
  readonly inventarios: Map<string, Objeto[]>;
  readonly vendidos: { objeto: Objeto; motivo: string }[];
  readonly oro: number;
}

function repartir(tiradas: readonly Tirada[], grupo: readonly Jugador[]): Reparto {
  const inventarios: Map<string, Objeto[]> = new Map(grupo.map((j: Jugador): [string, Objeto[]] => [j.nombre, []]));
  const vendidos: { objeto: Objeto; motivo: string }[] = [];
  let oro: number = 0;

  for (const { objeto } of tiradas) {
    // Candidatos: pueden usarlo y no tienen ya ese mismo objeto (excepto pociones, que se acumulan)
    const candidatos: Jugador[] = grupo.filter((j: Jugador): boolean => {
      const inv: Objeto[] = inventarios.get(j.nombre) ?? [];
      const repetido: boolean = objeto.tipo !== "pocion" && inv.some((o: Objeto): boolean => o.nombre === objeto.nombre);
      return PUEDE_USAR[j.clase].has(objeto.tipo) && !repetido;
    });
    if (candidatos.length === 0) {
      const nadieLoUsa: boolean = !grupo.some((j: Jugador): boolean => PUEDE_USAR[j.clase].has(objeto.tipo));
      vendidos.push({ objeto, motivo: nadieLoUsa ? "nadie del grupo lo usa" : "repetido" });
      oro += ORO_POR_RAREZA[objeto.rareza];
      continue;
    }
    // Gana quien menos objetos tiene (empate: orden del grupo)
    const ganador: Jugador | undefined = [...candidatos].sort(
      (a, b): number => (inventarios.get(a.nombre)?.length ?? 0) - (inventarios.get(b.nombre)?.length ?? 0),
    )[0];
    if (ganador !== undefined) inventarios.set(ganador.nombre, [...(inventarios.get(ganador.nombre) ?? []), objeto]);
  }
  return { inventarios, vendidos, oro };
}

// ===================== DATOS Y SALIDA =====================

const grupo: readonly Jugador[] = [
  { nombre: "Thorne", clase: "guerrero" },
  { nombre: "Lyra", clase: "mago" },
  { nombre: "Sena", clase: "arquera" },
];

const enemigos: readonly string[] = [
  "Lobo", "Lobo", "Goblin", "Goblin", "Esqueleto", "Orco", "Orco", "Arana", "Golem", "Troll", "Bandido", "Bandido", "Dragon joven",
];

function main(): void {
  const aleatorio: () => number = crearAleatorio(2026);
  const tiradas: Tirada[] = tirarLoot(enemigos, aleatorio);

  console.log("==================== LOOT DE LA MAZMORRA (semilla 2026) ====================");
  tiradas.forEach((t: Tirada, i: number): void => {
    const marca: string = t.porLastima ? "  << garantizado por lastima" : "";
    console.log(`${String(i + 1).padStart(2)}. ${t.enemigo.padEnd(12)} ${t.objeto.rareza.padEnd(10)} ${t.objeto.nombre}${marca}`);
  });

  const conteo: Record<Rareza, number> = { comun: 0, rara: 0, epica: 0, legendaria: 0 };
  tiradas.forEach((t: Tirada): void => {
    conteo[t.objeto.rareza] += 1;
  });
  console.log(`Por rareza: ${RAREZAS.map((r: Rareza): string => `${r} ${conteo[r]}`).join(", ")}`);

  const { inventarios, vendidos, oro } = repartir(tiradas, grupo);
  console.log("\n==================== REPARTO ====================");
  for (const j of grupo) {
    const items: Objeto[] = inventarios.get(j.nombre) ?? [];
    console.log(`${j.nombre.padEnd(7)} (${j.clase.padEnd(8)}) ${items.length} objeto(s): ${items.map((o: Objeto): string => o.nombre).join(", ") || "-"}`);
  }
  console.log("\nVendidos por oro:");
  vendidos.forEach(({ objeto, motivo }): void => console.log(`  ${objeto.nombre.padEnd(17)} +${ORO_POR_RAREZA[objeto.rareza]} oro (${motivo})`));
  console.log(`Oro total para el grupo: ${oro}`);
}

main();
