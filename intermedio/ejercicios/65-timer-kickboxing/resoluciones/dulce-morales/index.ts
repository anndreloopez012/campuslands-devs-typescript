export {};

// Intermedio 65: Timer de rounds kickboxing
// Tematica: kickboxing
// Resolucion: Dulce Morales
//
// Problema: el cronometro de una pelea de kickboxing es una maquina de estados:
// listo -> round 1 -> descanso -> round 2 -> ... -> terminado. Se puede pausar (y al reanudar vuelve
// exactamente a donde estaba), y un KO termina la pelea antes. El reducer es puro: recibe el estado
// y un evento, y devuelve el estado nuevo junto con los "efectos" que la app debe ejecutar
// (sonar la campana, el aviso de 10 segundos), sin ejecutarlos el mismo.

// ===================== TIPOS =====================

interface Config {
  readonly rounds: number;
  readonly duracionRound: number; // segundos
  readonly duracionDescanso: number;
  readonly aviso: number; // segundos antes del final para el aviso
}

type EnCurso =
  | { readonly fase: "round"; readonly round: number; readonly restante: number }
  | { readonly fase: "descanso"; readonly despuesDe: number; readonly restante: number };

type Estado =
  | { readonly fase: "listo" }
  | EnCurso
  | { readonly fase: "pausado"; readonly anterior: EnCurso }
  | { readonly fase: "terminado"; readonly motivo: string };

type Evento =
  | { readonly tipo: "INICIAR" }
  | { readonly tipo: "TICK"; readonly segundos: number }
  | { readonly tipo: "PAUSAR" }
  | { readonly tipo: "REANUDAR" }
  | { readonly tipo: "KO"; readonly ganador: string }
  | { readonly tipo: "REINICIAR" };

// Efectos que la app debe ejecutar (el reducer solo los describe)
type Efecto =
  | { readonly tipo: "campana"; readonly veces: 1 | 3 }
  | { readonly tipo: "aviso"; readonly texto: string }
  | { readonly tipo: "error"; readonly texto: string };

interface Resultado {
  readonly estado: Estado;
  readonly efectos: readonly Efecto[];
}

// ===================== REDUCER PURO =====================

function avanzar(c: Config, s: EnCurso, seg: number, efectos: Efecto[]): Estado {
  let actual: EnCurso | { fase: "terminado"; motivo: string } = s;
  let quedan: number = seg;
  while (quedan > 0 && actual.fase !== "terminado") {
    const paso: number = Math.min(quedan, actual.restante);
    const antes: number = actual.restante;
    const ahora: number = antes - paso;
    quedan -= paso;
    // Aviso cuando se cruza la marca de los ultimos N segundos (solo en rounds)
    if (actual.fase === "round" && antes > c.aviso && ahora <= c.aviso) efectos.push({ tipo: "aviso", texto: `ultimos ${c.aviso} segundos del round ${actual.round}` });
    if (ahora > 0) {
      actual = { ...actual, restante: ahora };
      continue;
    }
    // Se acabo el tiempo de la fase actual
    if (actual.fase === "round") {
      if (actual.round === c.rounds) {
        efectos.push({ tipo: "campana", veces: 3 });
        actual = { fase: "terminado", motivo: `fin de los ${c.rounds} rounds: decision de los jueces` };
      } else {
        efectos.push({ tipo: "campana", veces: 1 });
        actual = { fase: "descanso", despuesDe: actual.round, restante: c.duracionDescanso };
      }
    } else {
      efectos.push({ tipo: "campana", veces: 1 });
      actual = { fase: "round", round: actual.despuesDe + 1, restante: c.duracionRound };
    }
  }
  return actual;
}

function reducer(c: Config, s: Estado, e: Evento): Resultado {
  const error = (texto: string): Resultado => ({ estado: s, efectos: [{ tipo: "error", texto }] });
  switch (e.tipo) {
    case "INICIAR":
      if (s.fase !== "listo") return error(`no se puede iniciar en "${s.fase}"`);
      return { estado: { fase: "round", round: 1, restante: c.duracionRound }, efectos: [{ tipo: "campana", veces: 1 }] };
    case "TICK": {
      if (s.fase !== "round" && s.fase !== "descanso") return { estado: s, efectos: [] }; // el reloj esta parado
      const efectos: Efecto[] = [];
      return { estado: avanzar(c, s, e.segundos, efectos), efectos };
    }
    case "PAUSAR":
      if (s.fase !== "round" && s.fase !== "descanso") return error(`no hay nada que pausar en "${s.fase}"`);
      return { estado: { fase: "pausado", anterior: s }, efectos: [] };
    case "REANUDAR":
      if (s.fase !== "pausado") return error("el reloj no esta pausado");
      return { estado: s.anterior, efectos: [] };
    case "KO": {
      // Vale durante un round, aunque el reloj este pausado
      const round: number | null = s.fase === "round" ? s.round : s.fase === "pausado" && s.anterior.fase === "round" ? s.anterior.round : null;
      if (round === null) return error("un KO solo puede ocurrir durante un round");
      return { estado: { fase: "terminado", motivo: `KO de ${e.ganador} en el round ${round}` }, efectos: [{ tipo: "campana", veces: 3 }] };
    }
    case "REINICIAR":
      return { estado: { fase: "listo" }, efectos: [] };
  }
}

// ===================== VISTA =====================

function reloj(seg: number): string {
  return `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, "0")}`;
}

function pantalla(s: Estado): string {
  switch (s.fase) {
    case "listo":
      return "LISTO";
    case "round":
      return `ROUND ${s.round}  ${reloj(s.restante)}`;
    case "descanso":
      return `DESCANSO  ${reloj(s.restante)}`;
    case "pausado":
      return `PAUSA (${pantalla(s.anterior)})`;
    case "terminado":
      return `TERMINADO: ${s.motivo}`;
  }
}

function efectoTexto(e: Efecto): string {
  switch (e.tipo) {
    case "campana":
      return e.veces === 1 ? "DING" : "DING DING DING";
    case "aviso":
      return `[aviso] ${e.texto}`;
    case "error":
      return `X ${e.texto}`;
  }
}

function simular(titulo: string, c: Config, eventos: readonly Evento[]): void {
  console.log(`================ ${titulo} ================`);
  let s: Estado = { fase: "listo" };
  for (const ev of eventos) {
    const r: Resultado = reducer(c, s, ev);
    s = r.estado;
    const ev2: string = ev.tipo === "TICK" ? `TICK +${ev.segundos}s` : ev.tipo === "KO" ? `KO (${ev.ganador})` : ev.tipo;
    const efectos: string = r.efectos.map(efectoTexto).join(" | ");
    console.log(`${ev2.padEnd(14)} -> ${pantalla(s).padEnd(28)}${efectos ? `  ${efectos}` : ""}`.trimEnd());
  }
  console.log("");
}

function main(): void {
  const c: Config = { rounds: 3, duracionRound: 120, duracionDescanso: 60, aviso: 10 };
  const t = (segundos: number): Evento => ({ tipo: "TICK", segundos });

  simular("Pelea completa (3 rounds de 2:00, descansos de 1:00)", c, [
    { tipo: "TICK", segundos: 5 }, // aun no se inicio: el reloj no avanza
    { tipo: "INICIAR" },
    t(100),
    t(10), // limite: queda EXACTAMENTE 0:10 -> aviso
    { tipo: "PAUSAR" },
    t(30), // pausado: no avanza
    { tipo: "REANUDAR" },
    t(15), // termina el round 1 y entran 5 s de descanso
    t(55), // termina el descanso -> round 2
    t(250), // un salto grande cruza round 2, descanso y entra al round 3
    t(200), // termina la pelea
    { tipo: "INICIAR" }, // error: ya termino
  ]);

  simular("Pelea con KO", c, [
    { tipo: "INICIAR" },
    t(120),
    t(60),
    t(45),
    { tipo: "PAUSAR" },
    { tipo: "KO", ganador: "Camila Torres" }, // el KO se marca aunque el reloj estuviera pausado
    { tipo: "REANUDAR" }, // error: no esta pausado
    { tipo: "REINICIAR" },
  ]);
}

main();
