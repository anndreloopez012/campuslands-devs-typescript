export {};

// Intermedio 12: Liga de pingpong
// Tematica: pingpong
// Resolucion: Dulce Morales
//
// Problema: llevar la tabla de una liga de pingpong. Cada partido es al mejor de 5 sets.
// Un set se gana llegando a 11 con 2 puntos de ventaja (si hay 10-10, se sigue hasta
// sacar 2 de diferencia). Hay que validar cada marcador, decidir quien gano cada partido
// y ordenar la tabla con desempates: victorias, enfrentamiento directo, sets y puntos.

// ===================== MODELO (objetos anidados) =====================

type Division = "Primera" | "Ascenso";

interface Jugador {
  readonly id: string;
  readonly nombre: string;
  readonly club: { readonly nombre: string; readonly ciudad: string };
  readonly division: Division;
}

// Un set: [puntos del jugador A, puntos del jugador B]
type MarcadorSet = readonly [number, number];

interface Partido {
  readonly jornada: number;
  readonly jugadorA: string;
  readonly jugadorB: string;
  readonly sets: readonly MarcadorSet[];
}

interface PartidoValidado {
  readonly partido: Partido;
  readonly ganador: string;
  readonly perdedor: string;
  readonly setsA: number;
  readonly setsB: number;
}

interface FilaTabla {
  readonly jugador: Jugador;
  readonly jugados: number;
  readonly ganados: number;
  readonly perdidos: number;
  readonly setsFavor: number;
  readonly setsContra: number;
  readonly puntosFavor: number;
  readonly puntosContra: number;
}

type Validacion = { readonly ok: true; readonly valor: PartidoValidado } | { readonly ok: false; readonly error: string };

// ===================== REGLAS =====================

const PUNTOS_PARA_SET: number = 11;
const DIFERENCIA_MINIMA: number = 2;
const SETS_PARA_GANAR: number = 3; // mejor de 5

// ===================== VALIDACION =====================

function esSetValido([a, b]: MarcadorSet): boolean {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return false;
  const mayor: number = Math.max(a, b);
  const menor: number = Math.min(a, b);
  if (mayor < PUNTOS_PARA_SET) return false; // nadie llego a 11
  if (mayor === PUNTOS_PARA_SET) return menor <= PUNTOS_PARA_SET - DIFERENCIA_MINIMA; // 11-9 o menos
  return mayor - menor === DIFERENCIA_MINIMA; // por encima de 11 solo vale ganar por exactamente 2 (12-10, 13-11...)
}

function validarPartido(partido: Partido, ids: ReadonlySet<string>): Validacion {
  const etiqueta: string = `J${partido.jornada} ${partido.jugadorA} vs ${partido.jugadorB}`;
  if (!ids.has(partido.jugadorA) || !ids.has(partido.jugadorB)) {
    return { ok: false, error: `${etiqueta}: jugador no inscrito` };
  }
  if (partido.jugadorA === partido.jugadorB) {
    return { ok: false, error: `${etiqueta}: un jugador no puede jugar contra si mismo` };
  }

  let setsA: number = 0;
  let setsB: number = 0;
  for (const [i, set] of partido.sets.entries()) {
    if (setsA === SETS_PARA_GANAR || setsB === SETS_PARA_GANAR) {
      return { ok: false, error: `${etiqueta}: hay sets despues de que el partido ya termino` };
    }
    if (!esSetValido(set)) {
      return { ok: false, error: `${etiqueta}: el set ${i + 1} (${set[0]}-${set[1]}) no es un marcador posible` };
    }
    if (set[0] > set[1]) setsA++;
    else setsB++;
  }
  if (setsA !== SETS_PARA_GANAR && setsB !== SETS_PARA_GANAR) {
    return { ok: false, error: `${etiqueta}: partido incompleto (${setsA}-${setsB} en sets)` };
  }

  const ganoA: boolean = setsA === SETS_PARA_GANAR;
  return {
    ok: true,
    valor: {
      partido,
      ganador: ganoA ? partido.jugadorA : partido.jugadorB,
      perdedor: ganoA ? partido.jugadorB : partido.jugadorA,
      setsA,
      setsB,
    },
  };
}

// ===================== CALCULOS (map / filter / reduce / sort) =====================

function puntosDeJugador(p: PartidoValidado, id: string): { favor: number; contra: number } {
  const esA: boolean = p.partido.jugadorA === id;
  return p.partido.sets.reduce(
    (acc: { favor: number; contra: number }, [a, b]: MarcadorSet) => ({
      favor: acc.favor + (esA ? a : b),
      contra: acc.contra + (esA ? b : a),
    }),
    { favor: 0, contra: 0 },
  );
}

function filaDeJugador(jugador: Jugador, partidos: readonly PartidoValidado[]): FilaTabla {
  const propios: PartidoValidado[] = partidos.filter(
    (p: PartidoValidado): boolean => p.partido.jugadorA === jugador.id || p.partido.jugadorB === jugador.id,
  );
  return propios.reduce(
    (fila: FilaTabla, p: PartidoValidado): FilaTabla => {
      const esA: boolean = p.partido.jugadorA === jugador.id;
      const puntos = puntosDeJugador(p, jugador.id);
      return {
        ...fila,
        jugados: fila.jugados + 1,
        ganados: fila.ganados + (p.ganador === jugador.id ? 1 : 0),
        perdidos: fila.perdidos + (p.perdedor === jugador.id ? 1 : 0),
        setsFavor: fila.setsFavor + (esA ? p.setsA : p.setsB),
        setsContra: fila.setsContra + (esA ? p.setsB : p.setsA),
        puntosFavor: fila.puntosFavor + puntos.favor,
        puntosContra: fila.puntosContra + puntos.contra,
      };
    },
    { jugador, jugados: 0, ganados: 0, perdidos: 0, setsFavor: 0, setsContra: 0, puntosFavor: 0, puntosContra: 0 },
  );
}

function cociente(favor: number, contra: number): number {
  return contra === 0 ? favor : favor / contra;
}

// Victorias de un jugador SOLO contra rivales del grupo empatado (minitabla)
function victoriasDentroDelGrupo(id: string, grupo: ReadonlySet<string>, partidos: readonly PartidoValidado[]): number {
  return partidos.filter((p: PartidoValidado): boolean => p.ganador === id && grupo.has(p.perdedor)).length;
}

function idsConVictorias(filas: readonly FilaTabla[], ganados: number): ReadonlySet<string> {
  return new Set(filas.filter((f: FilaTabla): boolean => f.ganados === ganados).map((f: FilaTabla): string => f.jugador.id));
}

// Desempate: 1) victorias  2) minitabla entre los empatados (enfrentamiento directo)
//            3) cociente de sets  4) cociente de puntos
// Con 3 o mas empatados no sirve comparar de dos en dos: si A le gano a B, B a C y C a A
// se forma un circulo y el orden dependeria de que pareja se compare primero.
// Por eso se cuentan las victorias dentro de TODO el grupo empatado.
function ordenarTabla(filas: readonly FilaTabla[], partidos: readonly PartidoValidado[]): FilaTabla[] {
  return [...filas].sort((x: FilaTabla, y: FilaTabla): number => {
    if (y.ganados !== x.ganados) return y.ganados - x.ganados;
    const grupo: ReadonlySet<string> = idsConVictorias(filas, x.ganados);
    return (
      victoriasDentroDelGrupo(y.jugador.id, grupo, partidos) - victoriasDentroDelGrupo(x.jugador.id, grupo, partidos) ||
      cociente(y.setsFavor, y.setsContra) - cociente(x.setsFavor, x.setsContra) ||
      cociente(y.puntosFavor, y.puntosContra) - cociente(x.puntosFavor, x.puntosContra)
    );
  });
}

// ===================== DATOS DE PRUEBA =====================

const jugadores: readonly Jugador[] = [
  { id: "ALE", nombre: "Alejandra Paz", club: { nombre: "Club Raqueta", ciudad: "Bogota" }, division: "Primera" },
  { id: "BEN", nombre: "Benjamin Soto", club: { nombre: "Spin Masters", ciudad: "Medellin" }, division: "Primera" },
  { id: "CAR", nombre: "Carolina Diaz", club: { nombre: "Club Raqueta", ciudad: "Bogota" }, division: "Primera" },
  { id: "DAN", nombre: "Daniel Ortiz", club: { nombre: "Topspin FC", ciudad: "Cali" }, division: "Primera" },
];

const partidos: readonly Partido[] = [
  // Jornada 1
  { jornada: 1, jugadorA: "ALE", jugadorB: "BEN", sets: [[11, 7], [9, 11], [11, 5], [11, 8]] },
  { jornada: 1, jugadorA: "CAR", jugadorB: "DAN", sets: [[11, 3], [11, 6], [11, 4]] },
  // Jornada 2 (con sets a ventaja: 12-10 y 14-12)
  { jornada: 2, jugadorA: "ALE", jugadorB: "CAR", sets: [[12, 10], [8, 11], [14, 12], [7, 11], [9, 11]] },
  { jornada: 2, jugadorA: "BEN", jugadorB: "DAN", sets: [[11, 9], [11, 7], [11, 6]] },
  // Jornada 3
  { jornada: 3, jugadorA: "ALE", jugadorB: "DAN", sets: [[11, 4], [11, 2], [11, 6]] },
  { jornada: 3, jugadorA: "BEN", jugadorB: "CAR", sets: [[11, 9], [5, 11], [11, 9], [13, 11]] },
  // Invalidos
  { jornada: 3, jugadorA: "DAN", jugadorB: "ALE", sets: [[11, 10], [11, 5], [11, 3]] }, // 11-10 no existe
  { jornada: 3, jugadorA: "CAR", jugadorB: "BEN", sets: [[11, 5], [11, 6], [11, 2], [11, 9]] }, // un 4to set tras ganar 3-0
  { jornada: 3, jugadorA: "BEN", jugadorB: "ZZZ", sets: [[11, 0], [11, 0], [11, 0]] }, // ZZZ no esta inscrito
  { jornada: 3, jugadorA: "ALE", jugadorB: "BEN", sets: [[11, 5], [15, 12]] }, // 15-12 no es posible y queda incompleto
];

// ===================== SALIDA POR CONSOLA =====================

function main(): void {
  const ids: ReadonlySet<string> = new Set(jugadores.map((j: Jugador): string => j.id));
  const resultados: Validacion[] = partidos.map((p: Partido): Validacion => validarPartido(p, ids));
  const validos: PartidoValidado[] = resultados.flatMap((r: Validacion): PartidoValidado[] => (r.ok ? [r.valor] : []));
  const errores: string[] = resultados.flatMap((r: Validacion): string[] => (r.ok ? [] : [r.error]));

  const nombre = (id: string): string => jugadores.find((j: Jugador): boolean => j.id === id)?.nombre ?? id;

  console.log("================= LIGA DE PINGPONG - PRIMERA =================");
  console.log("--- Resultados ---");
  validos.forEach((p: PartidoValidado): void => {
    const sets: string = p.partido.sets.map(([a, b]: MarcadorSet): string => `${a}-${b}`).join(", ");
    console.log(`J${p.partido.jornada} ${nombre(p.partido.jugadorA).padEnd(14)} ${p.setsA}-${p.setsB} ${nombre(p.partido.jugadorB).padEnd(14)} (${sets})`);
  });

  console.log("\n--- Partidos rechazados ---");
  errores.forEach((e: string): void => console.log(`X ${e}`));

  console.log("\n--- Tabla ---");
  console.log("Pos Jugador         Club           PJ G P  Sets   Puntos");
  const tabla: FilaTabla[] = ordenarTabla(
    jugadores.map((j: Jugador): FilaTabla => filaDeJugador(j, validos)),
    validos,
  );
  tabla.forEach((f: FilaTabla, i: number): void => {
    console.log(
      `${String(i + 1).padStart(2)}. ${f.jugador.nombre.padEnd(15)} ${f.jugador.club.nombre.padEnd(14)} ${f.jugados}  ${f.ganados} ${f.perdidos}  ${f.setsFavor}-${f.setsContra}   ${f.puntosFavor}-${f.puntosContra}`,
    );
  });

  // Explicacion de cada empate
  const victoriasDistintas: number[] = [...new Set(tabla.map((f: FilaTabla): number => f.ganados))];
  for (const v of victoriasDistintas) {
    const grupo: FilaTabla[] = tabla.filter((f: FilaTabla): boolean => f.ganados === v);
    if (grupo.length < 2) continue;
    const ids: ReadonlySet<string> = idsConVictorias(tabla, v);
    console.log(`\nEmpate a ${v} victorias entre ${grupo.length} jugadores:`);
    grupo.forEach((f: FilaTabla): void => {
      console.log(
        `  ${f.jugador.nombre.padEnd(15)} ${victoriasDentroDelGrupo(f.jugador.id, ids, validos)} victoria(s) entre ellos | cociente de sets ${cociente(f.setsFavor, f.setsContra).toFixed(2)}`,
      );
    });
  }

  const setsAVentaja: number = validos
    .flatMap((p: PartidoValidado): readonly MarcadorSet[] => p.partido.sets)
    .filter(([a, b]: MarcadorSet): boolean => Math.max(a, b) > PUNTOS_PARA_SET).length;
  console.log(`\nSets que se definieron a ventaja (despues del 10-10): ${setsAVentaja}`);
}

main();
