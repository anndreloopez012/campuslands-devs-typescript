export {};

// Intermedio 04: Rotacion de heroes MOBA
// Tematica: videojuegos MOBA
// Resolucion: Dulce Morales
//
// Problema: cada semana el juego regala una rotacion de heroes gratis.
// Hay que elegirlos con reglas claras: un heroe por rol como minimo,
// sin repetir heroes que estuvieron gratis hace poco y sin heroes en mantenimiento.

// ===================== MODELO =====================

type Rol = "tanque" | "luchador" | "asesino" | "mago" | "tirador" | "soporte";
type EstadoHeroe = "activo" | "mantenimiento";

interface Heroe {
  readonly id: string;
  readonly nombre: string;
  readonly rol: Rol;
  readonly estado: EstadoHeroe;
  readonly winrate: number; // porcentaje 0-100
  readonly pickrate: number; // porcentaje 0-100
  readonly ultimaSemanaGratis: number | null; // null = nunca estuvo gratis
}

interface ConfigRotacion {
  readonly semana: number;
  readonly cupos: number;
  readonly semanasDeEspera: number; // un heroe no repite gratis antes de esto
}

interface Candidato {
  readonly heroe: Heroe;
  readonly prioridad: number;
}

type MotivoExclusion = "mantenimiento" | "en espera" | "datos invalidos";

interface Exclusion {
  readonly heroe: Heroe;
  readonly motivo: MotivoExclusion;
  readonly detalle: string;
}

interface Rotacion {
  readonly semana: number;
  readonly elegidos: readonly Candidato[];
  readonly sinCupo: readonly Candidato[]; // elegibles que no alcanzaron cupo
  readonly excluidos: readonly Exclusion[];
  readonly rolesSinCubrir: readonly Rol[]; // no hay ningun heroe disponible
  readonly rolesSinCupo: readonly Rol[]; // hay heroes, pero no alcanzaron los cupos
}

const ROLES: readonly Rol[] = ["tanque", "luchador", "asesino", "mago", "tirador", "soporte"];

// ===================== VALIDACION =====================

function esPorcentaje(valor: number): boolean {
  return Number.isFinite(valor) && valor >= 0 && valor <= 100;
}

function validarHeroe(heroe: Heroe): string | null {
  if (!esPorcentaje(heroe.winrate) || !esPorcentaje(heroe.pickrate)) {
    return `winrate/pickrate fuera de 0-100 (${heroe.winrate}% / ${heroe.pickrate}%)`;
  }
  return null;
}

function semanasDesdeGratis(heroe: Heroe, semanaActual: number): number | null {
  return heroe.ultimaSemanaGratis === null ? null : semanaActual - heroe.ultimaSemanaGratis;
}

// Devuelve el motivo por el que un heroe NO puede entrar, o null si puede
function motivoExclusion(heroe: Heroe, config: ConfigRotacion): Exclusion | null {
  const error: string | null = validarHeroe(heroe);
  if (error !== null) {
    return { heroe, motivo: "datos invalidos", detalle: error };
  }
  if (heroe.estado === "mantenimiento") {
    return { heroe, motivo: "mantenimiento", detalle: "deshabilitado por un bug" };
  }
  const semanas: number | null = semanasDesdeGratis(heroe, config.semana);
  if (semanas !== null && semanas < config.semanasDeEspera) {
    return { heroe, motivo: "en espera", detalle: `estuvo gratis hace ${semanas} semana(s)` };
  }
  return null;
}

// ===================== CALCULOS (funciones puras) =====================

// Prioriza heroes poco jugados (para darlos a conocer), que lleven tiempo sin estar gratis
// y con un winrate razonable (no conviene regalar uno que pierde casi siempre)
function calcularPrioridad(heroe: Heroe, semanaActual: number): number {
  const semanas: number | null = semanasDesdeGratis(heroe, semanaActual);
  const bonusEspera: number = semanas === null ? 30 : Math.min(semanas, 10) * 2;
  const bonusPocoJugado: number = 100 - heroe.pickrate;
  const penalizacionWinrate: number = heroe.winrate < 45 ? 25 : 0;
  return Math.round(bonusPocoJugado + bonusEspera - penalizacionWinrate);
}

function ordenarPorPrioridad(candidatos: readonly Candidato[]): Candidato[] {
  return [...candidatos].sort((a: Candidato, b: Candidato): number => b.prioridad - a.prioridad || a.heroe.nombre.localeCompare(b.heroe.nombre));
}

function generarRotacion(heroes: readonly Heroe[], config: ConfigRotacion): Rotacion {
  const excluidos: Exclusion[] = [];
  const candidatos: Candidato[] = [];

  for (const heroe of heroes) {
    const exclusion: Exclusion | null = motivoExclusion(heroe, config);
    if (exclusion === null) {
      candidatos.push({ heroe, prioridad: calcularPrioridad(heroe, config.semana) });
    } else {
      excluidos.push(exclusion);
    }
  }

  const ordenados: Candidato[] = ordenarPorPrioridad(candidatos);

  // Paso 1: el mejor candidato de cada rol. Si hay menos cupos que roles,
  // entran primero los roles cuyo mejor heroe tiene mas prioridad.
  const mejoresPorRol: Candidato[] = [];
  const rolesSinCubrir: Rol[] = [];
  for (const rol of ROLES) {
    const mejor: Candidato | undefined = ordenados.find((c: Candidato): boolean => c.heroe.rol === rol);
    if (mejor === undefined) {
      rolesSinCubrir.push(rol);
    } else {
      mejoresPorRol.push(mejor);
    }
  }
  const porRolOrdenados: Candidato[] = ordenarPorPrioridad(mejoresPorRol);
  const elegidos: Candidato[] = porRolOrdenados.slice(0, config.cupos);
  const rolesSinCupo: Rol[] = porRolOrdenados.slice(config.cupos).map((c: Candidato): Rol => c.heroe.rol);

  // Paso 2: llenar los cupos restantes con los de mayor prioridad
  for (const candidato of ordenados) {
    if (elegidos.length >= config.cupos) break;
    if (!elegidos.includes(candidato)) {
      elegidos.push(candidato);
    }
  }

  const sinCupo: Candidato[] = ordenados.filter((c: Candidato): boolean => !elegidos.includes(c));
  return { semana: config.semana, elegidos: ordenarPorPrioridad(elegidos), sinCupo, excluidos, rolesSinCubrir, rolesSinCupo };
}

// ===================== DATOS DE PRUEBA =====================

const heroes: readonly Heroe[] = [
  { id: "H01", nombre: "Gorrak", rol: "tanque", estado: "activo", winrate: 51.2, pickrate: 8.5, ultimaSemanaGratis: 30 },
  { id: "H02", nombre: "Bastion", rol: "tanque", estado: "activo", winrate: 49.0, pickrate: 3.1, ultimaSemanaGratis: null },
  { id: "H03", nombre: "Kaela", rol: "luchador", estado: "activo", winrate: 52.8, pickrate: 15.4, ultimaSemanaGratis: 37 },
  { id: "H04", nombre: "Draven", rol: "luchador", estado: "activo", winrate: 50.1, pickrate: 6.0, ultimaSemanaGratis: 20 },
  { id: "H05", nombre: "Shiro", rol: "asesino", estado: "activo", winrate: 47.3, pickrate: 12.0, ultimaSemanaGratis: 34 },
  { id: "H06", nombre: "Nyx", rol: "asesino", estado: "mantenimiento", winrate: 55.0, pickrate: 4.2, ultimaSemanaGratis: null },
  { id: "H07", nombre: "Lyra", rol: "mago", estado: "activo", winrate: 53.5, pickrate: 18.9, ultimaSemanaGratis: 25 },
  { id: "H08", nombre: "Orin", rol: "mago", estado: "activo", winrate: 43.0, pickrate: 2.0, ultimaSemanaGratis: 10 },
  { id: "H09", nombre: "Vesper", rol: "tirador", estado: "activo", winrate: 50.6, pickrate: 22.0, ultimaSemanaGratis: 36 },
  { id: "H10", nombre: "Quill", rol: "tirador", estado: "activo", winrate: 48.8, pickrate: 5.5, ultimaSemanaGratis: 39 },
  { id: "H11", nombre: "Mira", rol: "soporte", estado: "activo", winrate: 51.9, pickrate: 9.8, ultimaSemanaGratis: 32 },
  { id: "H12", nombre: "Elara", rol: "soporte", estado: "mantenimiento", winrate: 50.0, pickrate: 7.7, ultimaSemanaGratis: 15 },
  { id: "H13", nombre: "Glitchy", rol: "asesino", estado: "activo", winrate: 140, pickrate: 3.0, ultimaSemanaGratis: null },
];

// ===================== SALIDA POR CONSOLA =====================

function imprimirRotacion(titulo: string, rotacion: Rotacion, config: ConfigRotacion): void {
  console.log(`\n========== ${titulo} (semana ${rotacion.semana}, ${config.cupos} cupos) ==========`);
  rotacion.elegidos.forEach((c: Candidato, i: number): void => {
    const h: Heroe = c.heroe;
    const ultima: string = h.ultimaSemanaGratis === null ? "nunca" : `semana ${h.ultimaSemanaGratis}`;
    console.log(
      `${String(i + 1).padStart(2)}. ${h.nombre.padEnd(8)} ${h.rol.padEnd(9)} prioridad ${String(c.prioridad).padStart(3)} | pick ${h.pickrate.toFixed(1).padStart(4)}% | win ${h.winrate.toFixed(1)}% | ultima gratis: ${ultima}`,
    );
  });

  console.log(`Elegibles sin cupo: ${rotacion.sinCupo.map((c: Candidato): string => `${c.heroe.nombre} (${c.prioridad})`).join(", ") || "ninguno"}`);
  console.log("Excluidos:");
  rotacion.excluidos.forEach((e: Exclusion): void => {
    console.log(`  - ${e.heroe.nombre.padEnd(8)} [${e.motivo}] ${e.detalle}`);
  });

  if (rotacion.rolesSinCubrir.length > 0) {
    console.log(`AVISO: roles sin heroe disponible: ${rotacion.rolesSinCubrir.join(", ")}`);
  }
  if (rotacion.rolesSinCupo.length > 0) {
    console.log(`AVISO: roles que no alcanzaron cupo: ${rotacion.rolesSinCupo.join(", ")}`);
  }
  if (rotacion.rolesSinCubrir.length === 0 && rotacion.rolesSinCupo.length === 0) {
    console.log("Todos los roles estan cubiertos.");
  }
}

function main(): void {
  // Caso normal
  const normal: ConfigRotacion = { semana: 40, cupos: 8, semanasDeEspera: 3 };
  imprimirRotacion("ROTACION GRATIS", generarRotacion(heroes, normal), normal);

  // Caso limite: solo 4 cupos (menos que roles) y una espera mas larga
  const limite: ConfigRotacion = { semana: 40, cupos: 4, semanasDeEspera: 5 };
  imprimirRotacion("CASO LIMITE", generarRotacion(heroes, limite), limite);
}

main();
