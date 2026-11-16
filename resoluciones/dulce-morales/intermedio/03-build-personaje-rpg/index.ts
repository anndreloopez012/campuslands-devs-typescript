export {};

// Intermedio 03: Builder de personaje RPG
// Tematica: videojuegos RPG
// Resolucion: Dulce Morales

// ===================== MODELO =====================

type Atributo = "fuerza" | "destreza" | "inteligencia" | "vitalidad";
type ClaseRPG = "guerrero" | "picaro" | "mago";
type Ranura = "arma" | "armadura" | "accesorio";
type Arquetipo = "Tanque" | "Danio fisico" | "Danio magico" | "Hibrido";

// Un mapa con los cuatro atributos (Record obliga a tenerlos todos)
type Atributos = Readonly<Record<Atributo, number>>;

interface DefinicionClase {
  readonly clase: ClaseRPG;
  readonly base: Atributos;
  readonly atributoPrincipal: Atributo;
}

interface Equipo {
  readonly nombre: string;
  readonly ranura: Ranura;
  readonly bonus: Partial<Atributos>; // solo algunos atributos
  readonly requisito?: { readonly atributo: Atributo; readonly minimo: number };
}

// Lo que el jugador elige
interface PlanBuild {
  readonly nombre: string;
  readonly clase: ClaseRPG;
  readonly nivel: number;
  readonly puntosAsignados: Partial<Atributos>;
  readonly equipo: readonly Equipo[];
}

// Lo que el builder calcula
interface BuildFinal {
  readonly nombre: string;
  readonly clase: ClaseRPG;
  readonly nivel: number;
  readonly atributos: Atributos;
  readonly puntosLibres: number;
  readonly vida: number;
  readonly poder: number;
  readonly arquetipo: Arquetipo;
}

type ResultadoBuild = { readonly ok: true; readonly build: BuildFinal } | { readonly ok: false; readonly errores: readonly string[] };

// ===================== DATOS BASE =====================

const ATRIBUTOS: readonly Atributo[] = ["fuerza", "destreza", "inteligencia", "vitalidad"];
const PUNTOS_POR_NIVEL: number = 3;
const NIVEL_MAXIMO: number = 50;

const CLASES: Readonly<Record<ClaseRPG, DefinicionClase>> = {
  guerrero: { clase: "guerrero", base: { fuerza: 12, destreza: 6, inteligencia: 3, vitalidad: 10 }, atributoPrincipal: "fuerza" },
  picaro: { clase: "picaro", base: { fuerza: 6, destreza: 12, inteligencia: 5, vitalidad: 7 }, atributoPrincipal: "destreza" },
  mago: { clase: "mago", base: { fuerza: 3, destreza: 5, inteligencia: 14, vitalidad: 6 }, atributoPrincipal: "inteligencia" },
};

const espadaRunica: Equipo = { nombre: "Espada runica", ranura: "arma", bonus: { fuerza: 8 }, requisito: { atributo: "fuerza", minimo: 20 } };
const dagasGemelas: Equipo = { nombre: "Dagas gemelas", ranura: "arma", bonus: { destreza: 6, fuerza: 2 }, requisito: { atributo: "destreza", minimo: 15 } };
const bastonArcano: Equipo = { nombre: "Baston arcano", ranura: "arma", bonus: { inteligencia: 10 }, requisito: { atributo: "inteligencia", minimo: 25 } };
const cotaMalla: Equipo = { nombre: "Cota de malla", ranura: "armadura", bonus: { vitalidad: 6, destreza: -2 } };
const tunicaSeda: Equipo = { nombre: "Tunica de seda", ranura: "armadura", bonus: { inteligencia: 3, vitalidad: 2 } };
const anilloVida: Equipo = { nombre: "Anillo de vida", ranura: "accesorio", bonus: { vitalidad: 4 } };
const amuletoSombra: Equipo = { nombre: "Amuleto sombra", ranura: "accesorio", bonus: { destreza: 3 } };

// ===================== VALIDACION =====================

function puntosDisponibles(nivel: number): number {
  return (nivel - 1) * PUNTOS_POR_NIVEL;
}

function sumarPuntos(puntos: Partial<Atributos>): number {
  return ATRIBUTOS.reduce((total: number, a: Atributo): number => total + (puntos[a] ?? 0), 0);
}

function validarNivel(nivel: number): string[] {
  return Number.isInteger(nivel) && nivel >= 1 && nivel <= NIVEL_MAXIMO ? [] : [`nivel ${nivel} fuera de rango (1-${NIVEL_MAXIMO})`];
}

function validarPuntos(plan: PlanBuild): string[] {
  const errores: string[] = [];
  for (const atributo of ATRIBUTOS) {
    const valor: number = plan.puntosAsignados[atributo] ?? 0;
    if (!Number.isInteger(valor) || valor < 0) {
      errores.push(`puntos de ${atributo} invalidos (${valor})`);
    }
  }
  const usados: number = sumarPuntos(plan.puntosAsignados);
  const disponibles: number = puntosDisponibles(plan.nivel);
  if (usados > disponibles) {
    errores.push(`usa ${usados} puntos pero solo tiene ${disponibles}`);
  }
  return errores;
}

function validarRanuras(equipo: readonly Equipo[]): string[] {
  const vistas: Set<Ranura> = new Set<Ranura>();
  const errores: string[] = [];
  for (const pieza of equipo) {
    if (vistas.has(pieza.ranura)) {
      errores.push(`ranura "${pieza.ranura}" repetida (${pieza.nombre})`);
    }
    vistas.add(pieza.ranura);
  }
  return errores;
}

// El requisito se revisa contra los atributos SIN el bonus del propio equipo
function validarRequisitos(equipo: readonly Equipo[], atributos: Atributos): string[] {
  const errores: string[] = [];
  for (const pieza of equipo) {
    const req = pieza.requisito;
    if (req !== undefined && atributos[req.atributo] < req.minimo) {
      errores.push(`${pieza.nombre} requiere ${req.atributo} ${req.minimo} (tiene ${atributos[req.atributo]})`);
    }
  }
  return errores;
}

// ===================== TRANSFORMACION (funciones puras) =====================

function sumarAtributos(a: Atributos, b: Partial<Atributos>): Atributos {
  return {
    fuerza: a.fuerza + (b.fuerza ?? 0),
    destreza: a.destreza + (b.destreza ?? 0),
    inteligencia: a.inteligencia + (b.inteligencia ?? 0),
    vitalidad: a.vitalidad + (b.vitalidad ?? 0),
  };
}

function aplicarEquipo(base: Atributos, equipo: readonly Equipo[]): Atributos {
  return equipo.reduce((acumulado: Atributos, pieza: Equipo): Atributos => sumarAtributos(acumulado, pieza.bonus), base);
}

// ===================== CALCULOS =====================

function calcularVida(atributos: Atributos, nivel: number): number {
  return 50 + atributos.vitalidad * 12 + nivel * 5;
}

// El atributo principal de la clase vale doble
function calcularPoder(atributos: Atributos, principal: Atributo): number {
  const resto: number = ATRIBUTOS.filter((a: Atributo): boolean => a !== principal && a !== "vitalidad").reduce(
    (total: number, a: Atributo): number => total + atributos[a],
    0,
  );
  return atributos[principal] * 2 + Math.round(resto / 2);
}

function clasificarArquetipo(atributos: Atributos): Arquetipo {
  const fisico: number = atributos.fuerza + atributos.destreza;
  const magico: number = atributos.inteligencia;
  if (atributos.vitalidad >= Math.max(fisico, magico) * 0.8) return "Tanque";
  if (fisico >= magico * 2) return "Danio fisico";
  if (magico >= fisico) return "Danio magico";
  return "Hibrido";
}

function construirBuild(plan: PlanBuild): ResultadoBuild {
  // Sin un nivel valido no tiene sentido revisar los puntos
  const erroresNivel: string[] = validarNivel(plan.nivel);
  if (erroresNivel.length > 0) {
    return { ok: false, errores: erroresNivel };
  }

  const erroresBase: string[] = [...validarPuntos(plan), ...validarRanuras(plan.equipo)];
  if (erroresBase.length > 0) {
    return { ok: false, errores: erroresBase };
  }

  const definicion: DefinicionClase = CLASES[plan.clase];
  const conPuntos: Atributos = sumarAtributos(definicion.base, plan.puntosAsignados);
  const erroresRequisito: string[] = validarRequisitos(plan.equipo, conPuntos);
  if (erroresRequisito.length > 0) {
    return { ok: false, errores: erroresRequisito };
  }

  const finales: Atributos = aplicarEquipo(conPuntos, plan.equipo);
  return {
    ok: true,
    build: {
      nombre: plan.nombre,
      clase: plan.clase,
      nivel: plan.nivel,
      atributos: finales,
      puntosLibres: puntosDisponibles(plan.nivel) - sumarPuntos(plan.puntosAsignados),
      vida: calcularVida(finales, plan.nivel),
      poder: calcularPoder(finales, definicion.atributoPrincipal),
      arquetipo: clasificarArquetipo(finales),
    },
  };
}

function rankingPorPoder(builds: readonly BuildFinal[]): BuildFinal[] {
  return [...builds].sort((a: BuildFinal, b: BuildFinal): number => b.poder - a.poder);
}

// ===================== DATOS DE PRUEBA =====================

const planes: readonly PlanBuild[] = [
  {
    // Caso normal: guerrero con puntos de sobra
    nombre: "Brakka",
    clase: "guerrero",
    nivel: 10,
    puntosAsignados: { fuerza: 10, vitalidad: 12 },
    equipo: [espadaRunica, cotaMalla, anilloVida],
  },
  {
    // Caso limite: gasta EXACTAMENTE todos sus puntos y llega justo al requisito del baston (25)
    nombre: "Lyra",
    clase: "mago",
    nivel: 5,
    puntosAsignados: { inteligencia: 11, vitalidad: 1 },
    equipo: [bastonArcano, tunicaSeda],
  },
  {
    nombre: "Vex",
    clase: "picaro",
    nivel: 12,
    puntosAsignados: { destreza: 18, fuerza: 8, vitalidad: 7 },
    equipo: [dagasGemelas, amuletoSombra, cotaMalla],
  },
  {
    // Invalido: se pasa de puntos y repite ranura de arma
    nombre: "Torp",
    clase: "guerrero",
    nivel: 4,
    puntosAsignados: { fuerza: 8, vitalidad: 4 },
    equipo: [espadaRunica, dagasGemelas],
  },
  {
    // Invalido: no cumple el requisito del baston (el bonus de la tunica no cuenta)
    nombre: "Nim",
    clase: "mago",
    nivel: 3,
    puntosAsignados: { inteligencia: 6 },
    equipo: [bastonArcano, tunicaSeda],
  },
  {
    // Invalido: nivel fuera de rango
    nombre: "Glitch",
    clase: "picaro",
    nivel: 0,
    puntosAsignados: {},
    equipo: [],
  },
];

// ===================== SALIDA POR CONSOLA =====================

function formatearAtributos(a: Atributos): string {
  return `FUE ${a.fuerza} | DES ${a.destreza} | INT ${a.inteligencia} | VIT ${a.vitalidad}`;
}

function main(): void {
  const validas: BuildFinal[] = [];

  console.log("================ BUILDER RPG ================");
  for (const plan of planes) {
    const resultado: ResultadoBuild = construirBuild(plan);
    if (resultado.ok) {
      const b: BuildFinal = resultado.build;
      validas.push(b);
      console.log(`\nOK  ${b.nombre} - ${b.clase} nivel ${b.nivel} [${b.arquetipo}]`);
      console.log(`    ${formatearAtributos(b.atributos)}`);
      console.log(`    Vida ${b.vida} | Poder ${b.poder} | Puntos libres ${b.puntosLibres}`);
      console.log(`    Equipo: ${plan.equipo.map((e: Equipo): string => e.nombre).join(", ")}`);
    } else {
      console.log(`\nX   ${plan.nombre} - build invalida:`);
      resultado.errores.forEach((e: string): void => console.log(`    - ${e}`));
    }
  }

  console.log("\n================ RANKING POR PODER ================");
  rankingPorPoder(validas).forEach((b: BuildFinal, i: number): void => {
    console.log(`${i + 1}. ${b.nombre.padEnd(7)} ${b.clase.padEnd(9)} Poder ${String(b.poder).padStart(3)} | Vida ${b.vida}`);
  });
  console.log(`Builds validas: ${validas.length} de ${planes.length}`);
}

main();
