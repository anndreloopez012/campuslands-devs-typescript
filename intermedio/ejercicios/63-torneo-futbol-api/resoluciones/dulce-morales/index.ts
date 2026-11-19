export {};

// Intermedio 63: Torneo futbol asincrono
// Tematica: futbol
// Resolucion: Dulce Morales
//
// Problema: un torneo de 8 equipos pasa por fases: inscripcion -> grupos -> semifinales -> final ->
// terminado. El estado se maneja con un reducer puro y una maquina de estados: cada accion solo
// vale en ciertas fases. Los resultados de los partidos llegan de una API remota (simulada, con
// demora y una falla que se reintenta). Un "orquestador" asincrono pide los datos y despacha
// acciones al reducer.

// ===================== TIPOS =====================

type Fase = "inscripcion" | "grupos" | "semifinales" | "final" | "terminado";

interface Resultado {
  readonly local: string;
  readonly visita: string;
  readonly golesLocal: number;
  readonly golesVisita: number;
  readonly penales?: Readonly<{ local: number; visita: number }>; // solo en eliminatorias con empate
}

interface Estado {
  readonly fase: Fase;
  readonly equipos: readonly string[];
  readonly grupos: Readonly<Record<"A" | "B", readonly string[]>>;
  readonly resultados: readonly Resultado[];
  readonly semifinalistas: readonly string[];
  readonly finalistas: readonly string[];
  readonly campeon: string | null;
  readonly log: readonly string[];
}

type Accion =
  | { readonly tipo: "INSCRIBIR"; readonly equipo: string }
  | { readonly tipo: "CERRAR_INSCRIPCION" }
  | { readonly tipo: "RESULTADOS_GRUPOS"; readonly resultados: readonly Resultado[] }
  | { readonly tipo: "RESULTADOS_SEMIS"; readonly resultados: readonly Resultado[] }
  | { readonly tipo: "RESULTADO_FINAL"; readonly resultado: Resultado };

// Que acciones valen en cada fase
const PERMITIDAS: Readonly<Record<Fase, readonly Accion["tipo"][]>> = {
  inscripcion: ["INSCRIBIR", "CERRAR_INSCRIPCION"],
  grupos: ["RESULTADOS_GRUPOS"],
  semifinales: ["RESULTADOS_SEMIS"],
  final: ["RESULTADO_FINAL"],
  terminado: [],
};

// ===================== CALCULOS PUROS =====================

function ganador(r: Resultado): string {
  if (r.golesLocal !== r.golesVisita) return r.golesLocal > r.golesVisita ? r.local : r.visita;
  if (r.penales === undefined) return r.local; // no deberia pasar en eliminatorias
  return r.penales.local > r.penales.visita ? r.local : r.visita;
}

interface Fila {
  readonly equipo: string;
  readonly pts: number;
  readonly dg: number;
  readonly gf: number;
}

function tabla(equipos: readonly string[], resultados: readonly Resultado[]): Fila[] {
  return equipos
    .map((eq): Fila => {
      // Solo partidos entre equipos de ESTE grupo (las eliminatorias no suman a la tabla)
      const jugados: Resultado[] = resultados.filter((r) => (r.local === eq || r.visita === eq) && equipos.includes(r.local) && equipos.includes(r.visita));
      return jugados.reduce(
        (f: Fila, r: Resultado): Fila => {
          const propios: number = r.local === eq ? r.golesLocal : r.golesVisita;
          const ajenos: number = r.local === eq ? r.golesVisita : r.golesLocal;
          return { equipo: eq, pts: f.pts + (propios > ajenos ? 3 : propios === ajenos ? 1 : 0), dg: f.dg + propios - ajenos, gf: f.gf + propios };
        },
        { equipo: eq, pts: 0, dg: 0, gf: 0 },
      );
    })
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.equipo.localeCompare(b.equipo));
}

// ===================== REDUCER =====================

function reducer(s: Estado, a: Accion): Estado {
  const anotar = (texto: string): readonly string[] => [...s.log, texto];
  if (!PERMITIDAS[s.fase].includes(a.tipo)) return { ...s, log: anotar(`X ${a.tipo} no se permite en la fase "${s.fase}"`) };

  switch (a.tipo) {
    case "INSCRIBIR":
      if (s.equipos.includes(a.equipo)) return { ...s, log: anotar(`X ${a.equipo} ya esta inscrito`) };
      if (s.equipos.length === 8) return { ...s, log: anotar(`X cupo lleno, ${a.equipo} queda fuera`) };
      return { ...s, equipos: [...s.equipos, a.equipo], log: anotar(`inscrito ${a.equipo} (${s.equipos.length + 1}/8)`) };

    case "CERRAR_INSCRIPCION":
      if (s.equipos.length !== 8) return { ...s, log: anotar(`X faltan equipos: hay ${s.equipos.length} de 8`) };
      return {
        ...s,
        fase: "grupos",
        grupos: { A: s.equipos.filter((_, i) => i % 2 === 0), B: s.equipos.filter((_, i) => i % 2 === 1) },
        log: anotar("inscripcion cerrada -> fase de grupos"),
      };

    case "RESULTADOS_GRUPOS": {
      const resultados: Resultado[] = [...s.resultados, ...a.resultados];
      const [a1, a2] = tabla(s.grupos.A, resultados);
      const [b1, b2] = tabla(s.grupos.B, resultados);
      // Cruces: 1A vs 2B y 1B vs 2A
      const semis: string[] = [a1, b2, b1, a2].flatMap((f) => (f ? [f.equipo] : []));
      return { ...s, fase: "semifinales", resultados, semifinalistas: semis, log: anotar(`grupos terminados -> semifinales: ${semis[0]} vs ${semis[1]}, ${semis[2]} vs ${semis[3]}`) };
    }

    case "RESULTADOS_SEMIS": {
      const finalistas: string[] = a.resultados.map(ganador);
      return { ...s, fase: "final", resultados: [...s.resultados, ...a.resultados], finalistas, log: anotar(`semifinales terminadas -> final: ${finalistas.join(" vs ")}`) };
    }

    case "RESULTADO_FINAL": {
      const campeon: string = ganador(a.resultado);
      return { ...s, fase: "terminado", resultados: [...s.resultados, a.resultado], campeon, log: anotar(`FINAL -> CAMPEON: ${campeon}`) };
    }
  }
}

// ===================== API REMOTA SIMULADA =====================

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

class ErrorApi extends Error {
  constructor(public readonly endpoint: string) {
    super(`${endpoint} respondio 503`);
    this.name = "ErrorApi";
  }
}

// Goles "precalculados" por partido (la API los devuelve)
const MARCADORES: ReadonlyMap<string, readonly [number, number, Resultado["penales"]?]> = new Map<string, readonly [number, number, Resultado["penales"]?]>([
  ["Leones-Toros", [2, 1]], ["Leones-Cobras", [1, 1]], ["Leones-Pumas", [3, 0]], ["Toros-Cobras", [0, 2]], ["Toros-Pumas", [1, 1]], ["Cobras-Pumas", [2, 2]],
  ["Halcones-Lobos", [0, 1]], ["Halcones-Osos", [2, 0]], ["Halcones-Zorros", [1, 3]], ["Lobos-Osos", [2, 2]], ["Lobos-Zorros", [1, 0]], ["Osos-Zorros", [0, 1]],
]);

let fallasRestantes: number = 1; // la primera consulta de semifinales falla

async function pedirResultados(endpoint: string, partidos: readonly [string, string][]): Promise<Resultado[]> {
  await esperar(10);
  if (endpoint === "/semifinales" && fallasRestantes > 0) {
    fallasRestantes--;
    throw new ErrorApi(endpoint);
  }
  return partidos.map(([local, visita]): Resultado => {
    const m = MARCADORES.get(`${local}-${visita}`) ?? MARCADORES.get(`${visita}-${local}`);
    // Eliminatorias: resultado fijo segun el orden alfabetico (para que sea repetible)
    if (m === undefined) return local < visita ? { local, visita, golesLocal: 1, golesVisita: 1, penales: { local: 4, visita: 3 } } : { local, visita, golesLocal: 2, golesVisita: 0 };
    return { local, visita, golesLocal: m[0], golesVisita: m[1] };
  });
}

async function conReintento<T>(fn: () => Promise<T>, log: string[]): Promise<T> {
  try {
    return await fn();
  } catch (e: unknown) {
    if (!(e instanceof ErrorApi)) throw e;
    log.push(`! [${e.name}] ${e.message}; reintentando...`);
    await esperar(20);
    return fn();
  }
}

// Todos contra todos dentro del grupo
function cruces(equipos: readonly string[]): [string, string][] {
  return equipos.flatMap((a, i) => equipos.slice(i + 1).map((b): [string, string] => [a, b]));
}

// ===================== ORQUESTADOR =====================

async function main(): Promise<void> {
  let s: Estado = { fase: "inscripcion", equipos: [], grupos: { A: [], B: [] }, resultados: [], semifinalistas: [], finalistas: [], campeon: null, log: [] };
  const despachar = (a: Accion): void => {
    s = reducer(s, a);
  };
  const avisos: string[] = [];

  ["Leones", "Halcones", "Toros", "Lobos", "Cobras", "Osos", "Pumas"].forEach((e) => despachar({ tipo: "INSCRIBIR", equipo: e }));
  despachar({ tipo: "CERRAR_INSCRIPCION" }); // faltan equipos
  despachar({ tipo: "RESULTADO_FINAL", resultado: { local: "X", visita: "Y", golesLocal: 1, golesVisita: 0 } }); // fase equivocada
  ["Zorros", "Leones", "Aguilas"].forEach((e) => despachar({ tipo: "INSCRIBIR", equipo: e })); // repetido y cupo lleno
  despachar({ tipo: "CERRAR_INSCRIPCION" });

  const grupos: Resultado[] = await pedirResultados("/grupos", [...cruces(s.grupos.A), ...cruces(s.grupos.B)]);
  despachar({ tipo: "RESULTADOS_GRUPOS", resultados: grupos });
  despachar({ tipo: "INSCRIBIR", equipo: "Tarde FC" }); // inscripcion ya cerrada

  const [sa = "", sb = "", sc = "", sd = ""] = s.semifinalistas;
  const semis: Resultado[] = await conReintento(() => pedirResultados("/semifinales", [[sa, sb], [sc, sd]]), avisos);
  despachar({ tipo: "RESULTADOS_SEMIS", resultados: semis });

  const [f1 = "", f2 = ""] = s.finalistas;
  const [final] = await pedirResultados("/final", [[f1, f2]]);
  if (final !== undefined) despachar({ tipo: "RESULTADO_FINAL", resultado: final });

  console.log("==================== BITACORA DEL TORNEO ====================");
  s.log.forEach((l) => console.log(l));
  avisos.forEach((a) => console.log(a));

  console.log("\n==================== TABLAS DE GRUPOS ====================");
  for (const g of ["A", "B"] as const) {
    console.log(`Grupo ${g}:`);
    tabla(s.grupos[g], s.resultados).forEach((f, i) => console.log(`  ${i + 1}. ${f.equipo.padEnd(9)} ${f.pts} pts  DG ${f.dg >= 0 ? "+" : ""}${f.dg}  GF ${f.gf}${i < 2 ? "  <- clasifica" : ""}`));
  }

  console.log("\n==================== ELIMINATORIAS ====================");
  s.resultados.slice(12).forEach((r) => {
    const pen: string = r.penales ? ` (penales ${r.penales.local}-${r.penales.visita})` : "";
    console.log(`${r.local} ${r.golesLocal}-${r.golesVisita} ${r.visita}${pen} -> pasa ${ganador(r)}`);
  });
  console.log(`\nFase final: ${s.fase} | campeon: ${s.campeon ?? "-"}`);
}

main();
