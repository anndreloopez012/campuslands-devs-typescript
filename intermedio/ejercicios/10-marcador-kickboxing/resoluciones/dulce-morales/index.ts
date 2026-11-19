export {};

// Intermedio 10: Marcador de kickboxing
// Tematica: kickboxing
// Resolucion: Dulce Morales
//
// Problema: calcular el resultado de una pelea con el sistema de 10 puntos.
// Tres jueces deciden quien gano cada round; las caidas y las faltas restan puntos.
// Si un peleador cae 3 veces en un mismo round, pierde por nocaut tecnico (TKO).
// Al final se suman las tarjetas y se decide el tipo de victoria.

// ===================== MODELO =====================

type Esquina = "roja" | "azul";
// Lo que decide un juez en un round: quien lo gano o si fue parejo
type DecisionJuez = Esquina | "parejo";

interface Peleador {
  readonly nombre: string;
  readonly esquina: Esquina;
}

interface Round {
  readonly numero: number;
  readonly jueces: readonly [DecisionJuez, DecisionJuez, DecisionJuez]; // exactamente 3 jueces
  readonly caidas: Readonly<Record<Esquina, number>>; // veces que cayo cada peleador
  readonly faltas: Readonly<Record<Esquina, number>>; // puntos descontados por el referi
}

interface Pelea {
  readonly titulo: string;
  readonly roja: Peleador;
  readonly azul: Peleador;
  readonly roundsProgramados: number;
  readonly rounds: readonly Round[];
}

type Puntos = Readonly<Record<Esquina, number>>;

type TipoDecision = "unanime" | "dividida" | "mayoritaria";

type ResultadoPelea =
  | { readonly tipo: "TKO"; readonly ganador: Peleador; readonly round: number; readonly motivo: string }
  | { readonly tipo: "decision"; readonly ganador: Peleador; readonly decision: TipoDecision; readonly tarjetas: readonly Puntos[] }
  | { readonly tipo: "empate"; readonly tarjetas: readonly Puntos[] }
  | { readonly tipo: "invalida"; readonly errores: readonly string[] };

// ===================== REGLAS =====================

const CAIDAS_PARA_TKO: number = 3;
const PUNTOS_GANADOR: number = 10;
const PUNTOS_PERDEDOR: number = 9;

// ===================== VALIDACION =====================

function esConteoValido(valor: number): boolean {
  return Number.isInteger(valor) && valor >= 0;
}

function validarPelea(pelea: Pelea): string[] {
  const errores: string[] = [];
  if (pelea.rounds.length === 0) errores.push("no hay rounds registrados");
  if (pelea.rounds.length > pelea.roundsProgramados) {
    errores.push(`hay ${pelea.rounds.length} rounds pero solo se programaron ${pelea.roundsProgramados}`);
  }
  pelea.rounds.forEach((r: Round, i: number): void => {
    if (r.numero !== i + 1) errores.push(`el round en la posicion ${i + 1} dice ser el ${r.numero}`);
    const conteos: number[] = [r.caidas.roja, r.caidas.azul, r.faltas.roja, r.faltas.azul];
    if (!conteos.every(esConteoValido)) errores.push(`round ${r.numero}: caidas o faltas negativas`);
  });
  return errores;
}

// ===================== CALCULOS (funciones puras) =====================

function rival(esquina: Esquina): Esquina {
  return esquina === "roja" ? "azul" : "roja";
}

// Puntos que da UN juez en UN round
function puntuarRound(decision: DecisionJuez, round: Round): Puntos {
  // Si fue parejo, los dos reciben 10; si no, el ganador 10 y el otro 9
  const base: Puntos = {
    roja: decision === "azul" ? PUNTOS_PERDEDOR : PUNTOS_GANADOR,
    azul: decision === "roja" ? PUNTOS_PERDEDOR : PUNTOS_GANADOR,
  };

  // Cada caida y cada falta resta 1 punto al que la sufre
  return {
    roja: base.roja - round.caidas.roja - round.faltas.roja,
    azul: base.azul - round.caidas.azul - round.faltas.azul,
  };
}

function sumarPuntos(a: Puntos, b: Puntos): Puntos {
  return { roja: a.roja + b.roja, azul: a.azul + b.azul };
}

// Tarjeta completa de un juez (indice 0, 1 o 2)
function tarjetaDeJuez(rounds: readonly Round[], juez: 0 | 1 | 2): Puntos {
  return rounds.reduce(
    (total: Puntos, r: Round): Puntos => sumarPuntos(total, puntuarRound(r.jueces[juez], r)),
    { roja: 0, azul: 0 },
  );
}

function ganadorDeTarjeta(t: Puntos): Esquina | "empate" {
  if (t.roja === t.azul) return "empate";
  return t.roja > t.azul ? "roja" : "azul";
}

function buscarTko(rounds: readonly Round[]): { round: number; perdedor: Esquina } | null {
  for (const r of rounds) {
    if (r.caidas.roja >= CAIDAS_PARA_TKO) return { round: r.numero, perdedor: "roja" };
    if (r.caidas.azul >= CAIDAS_PARA_TKO) return { round: r.numero, perdedor: "azul" };
  }
  return null;
}

function decidir(tarjetas: readonly Puntos[]): { ganador: Esquina; decision: TipoDecision } | null {
  const votos: (Esquina | "empate")[] = tarjetas.map(ganadorDeTarjeta);
  const roja: number = votos.filter((v): boolean => v === "roja").length;
  const azul: number = votos.filter((v): boolean => v === "azul").length;
  const empates: number = votos.filter((v): boolean => v === "empate").length;
  if (roja === azul) return null; // empate en jueces

  const ganador: Esquina = roja > azul ? "roja" : "azul";
  const aFavor: number = Math.max(roja, azul);
  if (aFavor === tarjetas.length) return { ganador, decision: "unanime" };
  if (empates > 0 && Math.min(roja, azul) === 0) return { ganador, decision: "mayoritaria" };
  return { ganador, decision: "dividida" };
}

function calcularResultado(pelea: Pelea): ResultadoPelea {
  const errores: string[] = validarPelea(pelea);
  if (errores.length > 0) return { tipo: "invalida", errores };

  const peleador = (e: Esquina): Peleador => (e === "roja" ? pelea.roja : pelea.azul);

  const tko = buscarTko(pelea.rounds);
  if (tko !== null) {
    return {
      tipo: "TKO",
      ganador: peleador(rival(tko.perdedor)),
      round: tko.round,
      motivo: `${peleador(tko.perdedor).nombre} cayo ${CAIDAS_PARA_TKO} veces en el round`,
    };
  }

  const tarjetas: Puntos[] = [tarjetaDeJuez(pelea.rounds, 0), tarjetaDeJuez(pelea.rounds, 1), tarjetaDeJuez(pelea.rounds, 2)];
  const decision = decidir(tarjetas);
  if (decision === null) return { tipo: "empate", tarjetas };
  return { tipo: "decision", ganador: peleador(decision.ganador), decision: decision.decision, tarjetas };
}

// ===================== DATOS DE PRUEBA =====================

const sinNada: Readonly<Record<Esquina, number>> = { roja: 0, azul: 0 };

function round(numero: number, jueces: [DecisionJuez, DecisionJuez, DecisionJuez], caidas: Partial<Record<Esquina, number>> = {}, faltas: Partial<Record<Esquina, number>> = {}): Round {
  return { numero, jueces, caidas: { ...sinNada, ...caidas }, faltas: { ...sinNada, ...faltas } };
}

const peleas: readonly Pelea[] = [
  {
    // Normal: dominio claro con una caida -> decision unanime
    titulo: "Pelea 1 - Peso ligero",
    roja: { nombre: "Camila Torres", esquina: "roja" },
    azul: { nombre: "Nadia Brooks", esquina: "azul" },
    roundsProgramados: 3,
    rounds: [
      round(1, ["roja", "roja", "roja"]),
      round(2, ["roja", "roja", "roja"], { azul: 1 }),
      round(3, ["azul", "roja", "azul"]),
    ],
  },
  {
    // Pelea cerrada: cada juez ve algo distinto -> decision dividida
    titulo: "Pelea 2 - Peso welter",
    roja: { nombre: "Diego Saenz", esquina: "roja" },
    azul: { nombre: "Ken Ito", esquina: "azul" },
    roundsProgramados: 3,
    rounds: [
      round(1, ["roja", "azul", "azul"]),
      round(2, ["azul", "roja", "azul"]),
      round(3, ["roja", "roja", "azul"]),
    ],
  },
  {
    // Caso limite: sin la falta, los 3 jueces darian ganadora a la roja.
    // Con la falta, el juez 3 la ve empatada -> decision mayoritaria
    titulo: "Pelea 3 - Peso pluma",
    roja: { nombre: "Lia Moreno", esquina: "roja" },
    azul: { nombre: "Eva Kraus", esquina: "azul" },
    roundsProgramados: 3,
    rounds: [
      round(1, ["roja", "roja", "roja"]),
      round(2, ["roja", "roja", "azul"], {}, { roja: 1 }),
      round(3, ["roja", "roja", "roja"]),
    ],
  },
  {
    // Caso limite: 3 caidas en el round 2 -> TKO, no importan las tarjetas
    titulo: "Pelea 4 - Peso pesado",
    roja: { nombre: "Bruno Vidal", esquina: "roja" },
    azul: { nombre: "Omar Diallo", esquina: "azul" },
    roundsProgramados: 3,
    rounds: [round(1, ["roja", "roja", "roja"]), round(2, ["azul", "azul", "azul"], { roja: 3 })],
  },
  {
    // Caso limite: tarjetas iguales -> empate
    titulo: "Pelea 5 - Peso medio",
    roja: { nombre: "Ana Ruiz", esquina: "roja" },
    azul: { nombre: "Sol Pena", esquina: "azul" },
    roundsProgramados: 3,
    rounds: [
      round(1, ["roja", "roja", "roja"]),
      round(2, ["azul", "azul", "azul"]),
      round(3, ["parejo", "parejo", "parejo"]),
    ],
  },
  {
    // Invalida: rounds desordenados y una caida negativa
    titulo: "Pelea 6 - Datos con error",
    roja: { nombre: "X", esquina: "roja" },
    azul: { nombre: "Y", esquina: "azul" },
    roundsProgramados: 3,
    rounds: [round(2, ["roja", "roja", "roja"], { azul: -1 })],
  },
];

// ===================== SALIDA POR CONSOLA =====================

function formatearTarjetas(tarjetas: readonly Puntos[]): string {
  return tarjetas.map((t: Puntos, i: number): string => `Juez ${i + 1}: ${t.roja}-${t.azul}`).join(" | ");
}

function describir(resultado: ResultadoPelea): string[] {
  switch (resultado.tipo) {
    case "TKO":
      return [`GANA ${resultado.ganador.nombre} por TKO en el round ${resultado.round} (${resultado.motivo})`];
    case "decision":
      return [`Tarjetas (roja-azul): ${formatearTarjetas(resultado.tarjetas)}`, `GANA ${resultado.ganador.nombre} por decision ${resultado.decision}`];
    case "empate":
      return [`Tarjetas (roja-azul): ${formatearTarjetas(resultado.tarjetas)}`, "EMPATE"];
    case "invalida":
      return resultado.errores.map((e: string): string => `X ${e}`);
  }
}

function main(): void {
  console.log("================= VELADA DE KICKBOXING =================");
  const conteo: Record<ResultadoPelea["tipo"], number> = { TKO: 0, decision: 0, empate: 0, invalida: 0 };

  for (const pelea of peleas) {
    const resultado: ResultadoPelea = calcularResultado(pelea);
    conteo[resultado.tipo] += 1;
    console.log(`\n${pelea.titulo}: ${pelea.roja.nombre} (roja) vs ${pelea.azul.nombre} (azul)`);
    describir(resultado).forEach((linea: string): void => console.log(`  ${linea}`));
  }

  console.log(`\nResumen: ${conteo.decision} por decision, ${conteo.TKO} TKO, ${conteo.empate} empate, ${conteo.invalida} invalida`);
}

main();
