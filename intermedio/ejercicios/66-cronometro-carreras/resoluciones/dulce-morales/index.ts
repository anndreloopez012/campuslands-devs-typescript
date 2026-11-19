export {};

// Intermedio 66: Cronometro de vueltas
// Tematica: carreras
// Resolucion: Dulce Morales
//
// Problema: un cronometro de vueltas para una sesion de practica en pista. Recibe eventos con la
// marca de tiempo exacta (en milisegundos): arrancar, marcar vuelta, pausar por bandera roja,
// reanudar, invalidar la ultima vuelta (por salirse de la pista) y detener. Es una maquina de estados
// con un reducer puro. El tiempo en pausa no cuenta para la vuelta. Al final: tiempos por vuelta,
// mejor vuelta, diferencia contra la mejor y consistencia del piloto.

// ===================== TIPOS =====================

type Estado =
  | { readonly fase: "en espera" }
  | { readonly fase: "corriendo"; readonly inicioVuelta: number; readonly pausadoMs: number; readonly vueltas: readonly Vuelta[] }
  | { readonly fase: "bandera roja"; readonly inicioVuelta: number; readonly pausadoMs: number; readonly desde: number; readonly vueltas: readonly Vuelta[] }
  | { readonly fase: "finalizado"; readonly vueltas: readonly Vuelta[] };

interface Vuelta {
  readonly numero: number;
  readonly ms: number;
  readonly valida: boolean;
}

type Evento =
  | { readonly tipo: "ARRANCAR"; readonly t: number }
  | { readonly tipo: "VUELTA"; readonly t: number }
  | { readonly tipo: "BANDERA_ROJA"; readonly t: number }
  | { readonly tipo: "REANUDAR"; readonly t: number }
  | { readonly tipo: "INVALIDAR_ULTIMA" }
  | { readonly tipo: "DETENER"; readonly t: number };

interface Paso {
  readonly estado: Estado;
  readonly mensaje: string;
}

// ===================== FORMATO =====================

function tiempo(ms: number): string {
  const min: number = Math.floor(ms / 60000);
  const seg: string = ((ms % 60000) / 1000).toFixed(3).padStart(6, "0");
  return `${min}:${seg}`;
}

// ===================== REDUCER PURO =====================

const VUELTA_MINIMA_MS: number = 60_000; // menos de 1 minuto es imposible en este circuito: toque doble del boton

function reducer(s: Estado, e: Evento): Paso {
  const error = (m: string): Paso => ({ estado: s, mensaje: `X ${m}` });
  switch (e.tipo) {
    case "ARRANCAR":
      if (s.fase !== "en espera") return error(`no se puede arrancar en "${s.fase}"`);
      return { estado: { fase: "corriendo", inicioVuelta: e.t, pausadoMs: 0, vueltas: [] }, mensaje: "sesion iniciada" };

    case "VUELTA": {
      if (s.fase !== "corriendo") return error(`no se marca vuelta en "${s.fase}"`);
      const ms: number = e.t - s.inicioVuelta - s.pausadoMs;
      if (ms < VUELTA_MINIMA_MS) return error(`vuelta de ${tiempo(ms)}: demasiado corta, se ignora (doble toque)`);
      const v: Vuelta = { numero: s.vueltas.length + 1, ms, valida: true };
      return { estado: { ...s, inicioVuelta: e.t, pausadoMs: 0, vueltas: [...s.vueltas, v] }, mensaje: `vuelta ${v.numero}: ${tiempo(ms)}` };
    }

    case "BANDERA_ROJA":
      if (s.fase !== "corriendo") return error("bandera roja solo con la sesion corriendo");
      return { estado: { fase: "bandera roja", inicioVuelta: s.inicioVuelta, pausadoMs: s.pausadoMs, desde: e.t, vueltas: s.vueltas }, mensaje: "BANDERA ROJA: el reloj se detiene" };

    case "REANUDAR":
      if (s.fase !== "bandera roja") return error("no hay bandera roja que levantar");
      return {
        estado: { fase: "corriendo", inicioVuelta: s.inicioVuelta, pausadoMs: s.pausadoMs + (e.t - s.desde), vueltas: s.vueltas },
        mensaje: `se reanuda (pausa de ${tiempo(e.t - s.desde)} que no cuenta)`,
      };

    case "INVALIDAR_ULTIMA": {
      if (s.fase === "en espera") return error("no hay vueltas");
      const ultima: Vuelta | undefined = s.vueltas[s.vueltas.length - 1];
      if (ultima === undefined) return error("no hay vueltas que invalidar");
      if (!ultima.valida) return error(`la vuelta ${ultima.numero} ya estaba invalidada`);
      const vueltas: Vuelta[] = [...s.vueltas.slice(0, -1), { ...ultima, valida: false }];
      return { estado: { ...s, vueltas }, mensaje: `vuelta ${ultima.numero} invalidada (limites de pista)` };
    }

    case "DETENER":
      if (s.fase !== "corriendo" && s.fase !== "bandera roja") return error(`no se puede detener en "${s.fase}"`);
      return { estado: { fase: "finalizado", vueltas: s.vueltas }, mensaje: `sesion finalizada con ${s.vueltas.length} vuelta(s); la vuelta en curso se descarta` };
  }
}

// ===================== ESTADISTICAS =====================

function estadisticas(vueltas: readonly Vuelta[]): { mejor: Vuelta | null; promedio: number; desviacion: number } {
  const validas: Vuelta[] = vueltas.filter((v) => v.valida);
  if (validas.length === 0) return { mejor: null, promedio: 0, desviacion: 0 };
  const mejor: Vuelta = validas.reduce((m, v) => (v.ms < m.ms ? v : m));
  const promedio: number = validas.reduce((s, v) => s + v.ms, 0) / validas.length;
  const desviacion: number = Math.sqrt(validas.reduce((s, v) => s + (v.ms - promedio) ** 2, 0) / validas.length);
  return { mejor, promedio, desviacion };
}

// ===================== SESION =====================

// Tiempo en ms desde el inicio de la sesion
const s = (min: number, seg: number, ms: number = 0): number => min * 60000 + seg * 1000 + ms;

const eventos: readonly Evento[] = [
  { tipo: "VUELTA", t: s(0, 5) }, // error: no ha arrancado
  { tipo: "ARRANCAR", t: 0 },
  { tipo: "VUELTA", t: s(1, 32, 410) },
  { tipo: "VUELTA", t: s(1, 32, 900) }, // doble toque: se ignora
  { tipo: "VUELTA", t: s(3, 3, 120) },
  { tipo: "VUELTA", t: s(4, 33, 300) },
  { tipo: "INVALIDAR_ULTIMA" }, // se salio de la pista en la vuelta 3
  { tipo: "INVALIDAR_ULTIMA" }, // error: ya estaba invalidada
  { tipo: "BANDERA_ROJA", t: s(5, 10) },
  { tipo: "VUELTA", t: s(6, 0) }, // error: con bandera roja no se marca
  { tipo: "REANUDAR", t: s(9, 40) }, // 4:30 de pausa que no cuentan
  { tipo: "VUELTA", t: s(10, 34, 800) },
  { tipo: "VUELTA", t: s(12, 4, 500) },
  { tipo: "VUELTA", t: s(13, 35, 100) },
  { tipo: "DETENER", t: s(14, 10) },
  { tipo: "REANUDAR", t: s(14, 20) }, // error
];

function main(): void {
  let estado: Estado = { fase: "en espera" };
  console.log("==================== SESION DE PRACTICA ====================");
  for (const e of eventos) {
    const p: Paso = reducer(estado, e);
    estado = p.estado;
    const cuando: string = ("t" in e ? tiempo(e.t) : "-").padStart(9);
    console.log(`[${cuando}] ${e.tipo.padEnd(16)} ${p.mensaje}`);
  }

  const vueltas: readonly Vuelta[] = estado.fase === "en espera" ? [] : estado.vueltas;
  const { mejor, promedio, desviacion } = estadisticas(vueltas);
  console.log("\n==================== VUELTAS ====================");
  vueltas.forEach((v) => {
    const delta: string = !v.valida ? "INVALIDA" : mejor !== null && v === mejor ? "MEJOR VUELTA" : mejor !== null ? `+${((v.ms - mejor.ms) / 1000).toFixed(3)}` : "";
    console.log(`V${v.numero}  ${tiempo(v.ms)}  ${delta}`);
  });
  if (mejor !== null) {
    console.log(`\nMejor vuelta: V${mejor.numero} ${tiempo(mejor.ms)} | promedio (validas) ${tiempo(Math.round(promedio))} | consistencia: +-${(desviacion / 1000).toFixed(3)} s`);
  }
}

main();
