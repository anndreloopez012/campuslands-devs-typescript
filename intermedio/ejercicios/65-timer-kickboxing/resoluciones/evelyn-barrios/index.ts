export {};

type FaseCampana = "DescansoPrevio" | "Peleando" | "DescansoEntreRounds" | "PeleaConcluida";

type EventoCampana =
  | { readonly tipo: "SONAR_CAMPANA_INICIO_ROUND" }
  | { readonly tipo: "TICK_SEGUNDO"; readonly segundosRestantes: number }
  | { readonly tipo: "SONAR_CAMPANA_FIN_ROUND" }
  | { readonly tipo: "DETENCION_REFEREE_TKO" };

interface EstadoTimerCombate {
  readonly roundActual: number;
  readonly totalRounds: number;
  readonly duracionRoundSegundos: number;
  readonly fase: FaseCampana;
}

function reductorTimerKickboxing(estado: EstadoTimerCombate, evento: EventoCampana): EstadoTimerCombate {
  switch (evento.tipo) {
    case "SONAR_CAMPANA_INICIO_ROUND":
      return {
        ...estado,
        fase: "Peleando",
      };
    case "TICK_SEGUNDO":
      return estado;
    case "SONAR_CAMPANA_FIN_ROUND":
      if (estado.roundActual >= estado.totalRounds) {
        return { ...estado, fase: "PeleaConcluida" };
      }
      return {
        ...estado,
        roundActual: estado.roundActual + 1,
        fase: "DescansoEntreRounds",
      };
    case "DETENCION_REFEREE_TKO":
      return {
        ...estado,
        fase: "PeleaConcluida",
      };
  }
}

function main() {
  console.log("=== TIMER DE ROUNDS KICKBOXING (STATE MACHINE / REDUCER) ===");
  let timer: EstadoTimerCombate = {
    roundActual: 1,
    totalRounds: 3,
    duracionRoundSegundos: 180,
    fase: "DescansoPrevio",
  };

  const eventos: EventoCampana[] = [
    { tipo: "SONAR_CAMPANA_INICIO_ROUND" },
    { tipo: "SONAR_CAMPANA_FIN_ROUND" },
    { tipo: "SONAR_CAMPANA_INICIO_ROUND" },
    { tipo: "DETENCION_REFEREE_TKO" },
  ];

  for (const ev of eventos) {
    timer = reductorTimerKickboxing(timer, ev);
    console.log(`[EVENTO: ${ev.tipo}] -> Round: ${timer.roundActual}/${timer.totalRounds} | Estado: ${timer.fase}`);
  }
}

main();
