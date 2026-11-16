export {};

// Intermedio 09: Calendario de torneo futsal
// Tematica: futbol sala
// Resolucion: Dulce Morales
//
// Problema: armar el calendario de un torneo "todos contra todos":
// cada equipo juega una vez contra cada rival, nadie juega dos veces en la misma jornada,
// los partidos se reparten en canchas y horarios, y si los equipos son impares
// uno descansa en cada jornada. Despues, con los resultados, se arma la tabla.

// ===================== MODELO =====================

type Cancha = "Cancha A" | "Cancha B";
type Horario = "18:00" | "19:00" | "20:00";

interface Equipo {
  readonly id: string;
  readonly nombre: string;
}

interface Partido {
  readonly jornada: number;
  readonly local: Equipo;
  readonly visitante: Equipo;
  readonly cancha: Cancha;
  readonly horario: Horario;
}

interface Jornada {
  readonly numero: number;
  readonly partidos: readonly Partido[];
  readonly descansa: Equipo | null;
}

interface Resultado {
  readonly localId: string;
  readonly visitanteId: string;
  readonly golesLocal: number;
  readonly golesVisitante: number;
}

interface FilaTabla {
  readonly equipo: Equipo;
  readonly jugados: number;
  readonly ganados: number;
  readonly empatados: number;
  readonly perdidos: number;
  readonly golesFavor: number;
  readonly golesContra: number;
  readonly puntos: number;
}

type Validacion = { readonly ok: true } | { readonly ok: false; readonly errores: readonly string[] };

// ===================== REGLAS =====================

const CANCHAS: readonly Cancha[] = ["Cancha A", "Cancha B"];
const HORARIOS: readonly Horario[] = ["18:00", "19:00", "20:00"];
const MAX_PARTIDOS_POR_JORNADA: number = CANCHAS.length * HORARIOS.length;
const PUNTOS = { victoria: 3, empate: 1, derrota: 0 } as const;

// ===================== VALIDACION =====================

function validarEquipos(equipos: readonly Equipo[]): Validacion {
  const errores: string[] = [];
  if (equipos.length < 2) {
    errores.push(`se necesitan al menos 2 equipos (hay ${equipos.length})`);
  }
  const ids: Set<string> = new Set<string>();
  for (const e of equipos) {
    if (ids.has(e.id)) errores.push(`id repetido: ${e.id}`);
    ids.add(e.id);
  }
  if (Math.floor(equipos.length / 2) > MAX_PARTIDOS_POR_JORNADA) {
    errores.push(`demasiados equipos: no caben en ${MAX_PARTIDOS_POR_JORNADA} espacios por jornada`);
  }
  return errores.length === 0 ? { ok: true } : { ok: false, errores };
}

// Revisa el calendario ya generado: cada pareja una sola vez y nadie juega 2 veces en una jornada
function verificarCalendario(equipos: readonly Equipo[], jornadas: readonly Jornada[]): string[] {
  const errores: string[] = [];
  const parejas: Map<string, number> = new Map<string, number>();

  for (const jornada of jornadas) {
    const enJornada: Set<string> = new Set<string>();
    for (const p of jornada.partidos) {
      for (const e of [p.local, p.visitante]) {
        if (enJornada.has(e.id)) errores.push(`${e.nombre} juega 2 veces en la jornada ${jornada.numero}`);
        enJornada.add(e.id);
      }
      const clave: string = [p.local.id, p.visitante.id].sort().join("-");
      parejas.set(clave, (parejas.get(clave) ?? 0) + 1);
    }
  }

  const esperadas: number = (equipos.length * (equipos.length - 1)) / 2;
  if (parejas.size !== esperadas) errores.push(`hay ${parejas.size} enfrentamientos distintos, se esperaban ${esperadas}`);
  for (const [clave, veces] of parejas) {
    if (veces > 1) errores.push(`el enfrentamiento ${clave} se repite ${veces} veces`);
  }
  return errores;
}

// ===================== GENERACION (metodo del circulo) =====================

// Rota la lista dejando fijo el primer elemento. Devuelve una lista NUEVA.
function rotar<T>(lista: readonly T[]): T[] {
  const [fijo, ...resto] = lista;
  if (fijo === undefined || resto.length === 0) return [...lista];
  const ultimo: T | undefined = resto[resto.length - 1];
  return ultimo === undefined ? [...lista] : [fijo, ultimo, ...resto.slice(0, -1)];
}

function asignarEspacio(indice: number): { cancha: Cancha; horario: Horario } {
  const cancha: Cancha = CANCHAS[indice % CANCHAS.length] ?? "Cancha A";
  const horario: Horario = HORARIOS[Math.floor(indice / CANCHAS.length)] ?? "18:00";
  return { cancha, horario };
}

function generarCalendario(equipos: readonly Equipo[]): Jornada[] {
  // Si son impares se agrega un "hueco" (null): quien le toque al hueco descansa
  let ronda: (Equipo | null)[] = equipos.length % 2 === 0 ? [...equipos] : [...equipos, null];
  const totalJornadas: number = ronda.length - 1;
  const mitad: number = ronda.length / 2;
  const jornadas: Jornada[] = [];

  for (let numero = 1; numero <= totalJornadas; numero++) {
    const partidos: Partido[] = [];
    let descansa: Equipo | null = null;

    for (let i = 0; i < mitad; i++) {
      const a: Equipo | null = ronda[i] ?? null;
      const b: Equipo | null = ronda[ronda.length - 1 - i] ?? null;
      if (a === null || b === null) {
        descansa = a ?? b;
        continue;
      }
      // Se alterna la localia por jornada para que sea pareja
      const [local, visitante] = numero % 2 === 0 ? [b, a] : [a, b];
      partidos.push({ jornada: numero, local, visitante, ...asignarEspacio(partidos.length) });
    }

    jornadas.push({ numero, partidos, descansa });
    ronda = rotar(ronda);
  }
  return jornadas;
}

// ===================== TABLA DE POSICIONES =====================

function filaVacia(equipo: Equipo): FilaTabla {
  return { equipo, jugados: 0, ganados: 0, empatados: 0, perdidos: 0, golesFavor: 0, golesContra: 0, puntos: 0 };
}

function sumarPartido(fila: FilaTabla, golesFavor: number, golesContra: number): FilaTabla {
  const gano: boolean = golesFavor > golesContra;
  const empato: boolean = golesFavor === golesContra;
  return {
    ...fila,
    jugados: fila.jugados + 1,
    ganados: fila.ganados + (gano ? 1 : 0),
    empatados: fila.empatados + (empato ? 1 : 0),
    perdidos: fila.perdidos + (!gano && !empato ? 1 : 0),
    golesFavor: fila.golesFavor + golesFavor,
    golesContra: fila.golesContra + golesContra,
    puntos: fila.puntos + (gano ? PUNTOS.victoria : empato ? PUNTOS.empate : PUNTOS.derrota),
  };
}

function esResultadoValido(r: Resultado): boolean {
  return Number.isInteger(r.golesLocal) && Number.isInteger(r.golesVisitante) && r.golesLocal >= 0 && r.golesVisitante >= 0;
}

function calcularTabla(equipos: readonly Equipo[], resultados: readonly Resultado[]): FilaTabla[] {
  const tabla: Map<string, FilaTabla> = new Map(equipos.map((e: Equipo): [string, FilaTabla] => [e.id, filaVacia(e)]));
  for (const r of resultados) {
    const local: FilaTabla | undefined = tabla.get(r.localId);
    const visitante: FilaTabla | undefined = tabla.get(r.visitanteId);
    if (local === undefined || visitante === undefined || !esResultadoValido(r)) continue;
    tabla.set(r.localId, sumarPartido(local, r.golesLocal, r.golesVisitante));
    tabla.set(r.visitanteId, sumarPartido(visitante, r.golesVisitante, r.golesLocal));
  }
  // Desempate: puntos, diferencia de goles, goles a favor, nombre
  return [...tabla.values()].sort(
    (a: FilaTabla, b: FilaTabla): number =>
      b.puntos - a.puntos ||
      b.golesFavor - b.golesContra - (a.golesFavor - a.golesContra) ||
      b.golesFavor - a.golesFavor ||
      a.equipo.nombre.localeCompare(b.equipo.nombre),
  );
}

// ===================== DATOS DE PRUEBA =====================

const equiposPares: readonly Equipo[] = [
  { id: "LEO", nombre: "Leones FS" },
  { id: "TIB", nombre: "Tiburones" },
  { id: "HAL", nombre: "Halcones" },
  { id: "COB", nombre: "Cobras" },
  { id: "LOB", nombre: "Lobos" },
  { id: "TOR", nombre: "Toros" },
];

// Caso limite: numero impar de equipos -> uno descansa en cada jornada
const equiposImpares: readonly Equipo[] = [
  { id: "AGU", nombre: "Aguilas" },
  { id: "PAN", nombre: "Panteras" },
  { id: "ZOR", nombre: "Zorros" },
  { id: "OSO", nombre: "Osos" },
  { id: "BUF", nombre: "Bufalos" },
];

// Invalidos
const equiposInvalidos: readonly Equipo[] = [
  { id: "X1", nombre: "Solo" },
  { id: "X1", nombre: "Repetido" },
];

// Resultados de las dos primeras jornadas del torneo par (incluye uno invalido)
const resultados: readonly Resultado[] = [
  { localId: "LEO", visitanteId: "TOR", golesLocal: 5, golesVisitante: 2 },
  { localId: "TIB", visitanteId: "LOB", golesLocal: 3, golesVisitante: 3 },
  { localId: "HAL", visitanteId: "COB", golesLocal: 1, golesVisitante: 4 },
  { localId: "LOB", visitanteId: "LEO", golesLocal: 2, golesVisitante: 2 },
  { localId: "COB", visitanteId: "TOR", golesLocal: 6, golesVisitante: 1 },
  { localId: "HAL", visitanteId: "TIB", golesLocal: 3, golesVisitante: 2 },
  { localId: "TIB", visitanteId: "TOR", golesLocal: -1, golesVisitante: 0 }, // invalido: se ignora
];

// ===================== SALIDA POR CONSOLA =====================

function imprimirCalendario(titulo: string, equipos: readonly Equipo[]): void {
  console.log(`\n================ ${titulo} (${equipos.length} equipos) ================`);
  const validacion: Validacion = validarEquipos(equipos);
  if (!validacion.ok) {
    validacion.errores.forEach((e: string): void => console.log(`X ${e}`));
    return;
  }

  const jornadas: Jornada[] = generarCalendario(equipos);
  for (const j of jornadas) {
    console.log(`Jornada ${j.numero}`);
    j.partidos.forEach((p: Partido): void => {
      console.log(`  ${p.horario} ${p.cancha}: ${p.local.nombre.padEnd(9)} vs ${p.visitante.nombre}`);
    });
    if (j.descansa !== null) console.log(`  Descansa: ${j.descansa.nombre}`);
  }

  const errores: string[] = verificarCalendario(equipos, jornadas);
  const totalPartidos: number = jornadas.reduce((t: number, j: Jornada): number => t + j.partidos.length, 0);
  console.log(errores.length === 0 ? `Verificado: ${totalPartidos} partidos, cada pareja juega una sola vez y nadie repite jornada.` : errores.join("\n"));
}

function imprimirTabla(equipos: readonly Equipo[], lista: readonly Resultado[]): void {
  const validos: number = lista.filter(esResultadoValido).length;
  console.log(`\n================ TABLA (tras ${validos} resultados validos, ${lista.length - validos} ignorado) ================`);
  console.log("Pos Equipo     PJ  G  E  P  GF GC  DG  Pts");
  calcularTabla(equipos, lista).forEach((f: FilaTabla, i: number): void => {
    const dg: number = f.golesFavor - f.golesContra;
    console.log(
      `${String(i + 1).padStart(2)}. ${f.equipo.nombre.padEnd(10)} ${f.jugados}  ${f.ganados}  ${f.empatados}  ${f.perdidos}  ${String(f.golesFavor).padStart(2)} ${String(f.golesContra).padStart(2)} ${(dg > 0 ? `+${dg}` : String(dg)).padStart(3)}  ${f.puntos}`,
    );
  });
}

function main(): void {
  imprimirCalendario("TORNEO PAR", equiposPares);
  imprimirCalendario("TORNEO IMPAR", equiposImpares);
  imprimirCalendario("TORNEO INVALIDO", equiposInvalidos);
  imprimirTabla(equiposPares, resultados);
}

main();
