export {};

// Intermedio 67: Marcador pingpong DOM
// Tematica: pingpong
// Resolucion: Dulce Morales
//
// Problema: un marcador electronico de pingpong con botones: "+1 Ana", "+1 Beto" y "Deshacer".
// El reducer lleva el puntaje del set, los sets ganados, quien saca (cambia cada 2 puntos, y a partir
// del 10-10 cada punto) y cuando se gana un set (11 con 2 de ventaja) o el partido (mejor de 5).
// "Deshacer" vuelve al estado anterior guardando un historial de estados (una pila).
//
// Nota: se ejecuta con Node, sin navegador. Los botones se simulan como eventos y render()
// devuelve lo que mostraria la pantalla del marcador.

// ===================== TIPOS =====================

type Jugador = "A" | "B";

interface Marcador {
  readonly puntos: Readonly<Record<Jugador, number>>;
  readonly sets: Readonly<Record<Jugador, number>>;
  readonly saca: Jugador;
  readonly empiezaSacandoSet: Jugador; // quien saco primero en este set (alterna cada set)
  readonly historialSets: readonly string[];
  readonly ganador: Jugador | null;
}

interface Estado {
  readonly actual: Marcador;
  readonly anteriores: readonly Marcador[]; // pila para deshacer
  readonly mensaje: string | null;
}

type Evento = { readonly tipo: "PUNTO"; readonly jugador: Jugador } | { readonly tipo: "DESHACER" } | { readonly tipo: "NUEVO_PARTIDO" };

const NOMBRES: Readonly<Record<Jugador, string>> = { A: "Ana", B: "Beto" };
const SETS_PARA_GANAR: number = 3;

const otro = (j: Jugador): Jugador => (j === "A" ? "B" : "A");

// ===================== REGLAS PURAS =====================

function ganoSet(p: Readonly<Record<Jugador, number>>, j: Jugador): boolean {
  return p[j] >= 11 && p[j] - p[otro(j)] >= 2;
}

// Saque: cada 2 puntos; con 10-10 o mas, cada punto
function quienSaca(p: Readonly<Record<Jugador, number>>, empieza: Jugador): Jugador {
  const total: number = p.A + p.B;
  const deuce: boolean = p.A >= 10 && p.B >= 10;
  const turnos: number = deuce ? 10 + (total - 20) : Math.floor(total / 2);
  return turnos % 2 === 0 ? empieza : otro(empieza);
}

function marcarPunto(m: Marcador, j: Jugador): { marcador: Marcador; mensaje: string | null } {
  const puntos = { ...m.puntos, [j]: m.puntos[j] + 1 } satisfies Record<Jugador, number>;
  if (!ganoSet(puntos, j)) {
    return { marcador: { ...m, puntos, saca: quienSaca(puntos, m.empiezaSacandoSet) }, mensaje: puntos.A >= 10 && puntos.B >= 10 && puntos.A === puntos.B ? "IGUALES" : null };
  }
  const sets = { ...m.sets, [j]: m.sets[j] + 1 } satisfies Record<Jugador, number>;
  const historialSets: string[] = [...m.historialSets, `${puntos.A}-${puntos.B}`];
  if (sets[j] === SETS_PARA_GANAR) {
    return { marcador: { ...m, puntos, sets, historialSets, ganador: j }, mensaje: `${NOMBRES[j]} GANA EL PARTIDO ${sets.A}-${sets.B}` };
  }
  const empieza: Jugador = otro(m.empiezaSacandoSet);
  return {
    marcador: { puntos: { A: 0, B: 0 }, sets, saca: empieza, empiezaSacandoSet: empieza, historialSets, ganador: null },
    mensaje: `set para ${NOMBRES[j]} ${puntos.A}-${puntos.B} (cambio de lado)`,
  };
}

// ===================== REDUCER =====================

const NUEVO: Marcador = { puntos: { A: 0, B: 0 }, sets: { A: 0, B: 0 }, saca: "A", empiezaSacandoSet: "A", historialSets: [], ganador: null };

function reducer(s: Estado, e: Evento): Estado {
  switch (e.tipo) {
    case "PUNTO": {
      if (s.actual.ganador !== null) return { ...s, mensaje: "X el partido ya termino (usar Nuevo partido o Deshacer)" };
      const { marcador, mensaje } = marcarPunto(s.actual, e.jugador);
      return { actual: marcador, anteriores: [...s.anteriores, s.actual], mensaje };
    }
    case "DESHACER": {
      const previo: Marcador | undefined = s.anteriores[s.anteriores.length - 1];
      if (previo === undefined) return { ...s, mensaje: "X no hay nada que deshacer" };
      return { actual: previo, anteriores: s.anteriores.slice(0, -1), mensaje: "se deshizo el ultimo punto" };
    }
    case "NUEVO_PARTIDO":
      return { actual: NUEVO, anteriores: [], mensaje: "nuevo partido" };
  }
}

// ===================== PANTALLA =====================

function render(s: Estado): string {
  const m: Marcador = s.actual;
  const fila = (j: Jugador): string => `${m.saca === j && m.ganador === null ? "*" : " "} ${NOMBRES[j].padEnd(5)} sets ${m.sets[j]}  puntos ${String(m.puntos[j]).padStart(2)}`;
  const extra: string = m.historialSets.length > 0 ? `  [sets: ${m.historialSets.join(", ")}]` : "";
  return `${fila("A")} | ${fila("B")}${extra}${s.mensaje ? `  -> ${s.mensaje}` : ""}`;
}

// ===================== SIMULACION DE BOTONES =====================

function puntos(secuencia: string): Evento[] {
  return [...secuencia].map((c): Evento => (c === "<" ? { tipo: "DESHACER" } : { tipo: "PUNTO", jugador: c === "A" ? "A" : "B" }));
}

// Puntos alternados A, B, A, B... y luego los que sobran, para llegar a un marcador exacto
function alternados(a: number, b: number): string {
  const parejos: number = Math.min(a, b);
  return "AB".repeat(parejos) + "A".repeat(a - parejos) + "B".repeat(b - parejos);
}

function main(): void {
  let s: Estado = { actual: NUEVO, anteriores: [], mensaje: null };
  const pasos: readonly [string, readonly Evento[]][] = [
    ["Deshacer sin puntos", [{ tipo: "DESHACER" }]],
    ["Set 1: Ana gana 11-6", puntos(alternados(11, 6))],
    ["Set 2: llegan a 10-10 (desde aqui el saque cambia en cada punto)", puntos(alternados(10, 10))],
    ["Beto se pone 11-10 (ventaja); Ana iguala 11-11", puntos("BA")],
    ["Se marca un punto de mas para Beto y se corrige con Deshacer", puntos("B<")],
    ["Ana gana el set 13-11 (limite: 2 de ventaja)", puntos("AA")],
    ["Set 3: Beto gana 11-3", puntos(alternados(3, 11))],
    ["Set 4: Ana gana 11-9 y el partido", puntos(alternados(11, 9))],
    ["Punto despues de terminar", puntos("B")],
    ["Deshacer el punto ganador (vuelve a 10-9)", puntos("<")],
  ];

  console.log("* = quien saca");
  for (const [titulo, eventos] of pasos) {
    for (const ev of eventos) s = reducer(s, ev);
    console.log(`\n${titulo}`);
    console.log(`  ${render(s)}`);
  }
}

main();
