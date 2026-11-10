export {};

type FaseTorneo = "Cuartos" | "Semifinal" | "Final" | "CampeonCoronado";

interface PartidoFutbol {
  readonly idPartido: string;
  readonly equipoLocal: string;
  readonly equipoVisitante: string;
  readonly golesLocal: number;
  readonly golesVisitante: number;
}

type AccionTorneo =
  | { readonly tipo: "JUGAR_CUARTOS"; readonly resultados: readonly PartidoFutbol[] }
  | { readonly tipo: "JUGAR_SEMIFINAL"; readonly resultados: readonly PartidoFutbol[] }
  | { readonly tipo: "JUGAR_FINAL"; readonly resultado: PartidoFutbol };

interface EstadoTorneo {
  readonly fase: FaseTorneo;
  readonly clasificados: readonly string[];
  readonly campeon?: string;
}

function reductorTorneo(estado: EstadoTorneo, accion: AccionTorneo): EstadoTorneo {
  switch (accion.tipo) {
    case "JUGAR_CUARTOS": {
      const ganadores = accion.resultados.map((p) => (p.golesLocal >= p.golesVisitante ? p.equipoLocal : p.equipoVisitante));
      return {
        fase: "Semifinal",
        clasificados: ganadores,
      };
    }
    case "JUGAR_SEMIFINAL": {
      const finalistas = accion.resultados.map((p) => (p.golesLocal >= p.golesVisitante ? p.equipoLocal : p.equipoVisitante));
      return {
        fase: "Final",
        clasificados: finalistas,
      };
    }
    case "JUGAR_FINAL": {
      const p = accion.resultado;
      const champ = p.golesLocal >= p.golesVisitante ? p.equipoLocal : p.equipoVisitante;
      return {
        fase: "CampeonCoronado",
        clasificados: [champ],
        campeon: champ,
      };
    }
  }
}

function main() {
  console.log("=== TORNEO DE FUTBOL ASINCRONO CON REDUCER ===");
  let estado: EstadoTorneo = {
    fase: "Cuartos",
    clasificados: ["Real Madrid", "Bayern", "Arsenal", "PSG", "Barcelona", "Inter", "Man City", "Atletico"],
  };

  const cuartos: PartidoFutbol[] = [
    { idPartido: "qf-1", equipoLocal: "Real Madrid", equipoVisitante: "Man City", golesLocal: 3, golesVisitante: 2 },
    { idPartido: "qf-2", equipoLocal: "Arsenal", equipoVisitante: "Bayern", golesLocal: 1, golesVisitante: 2 },
  ];
  estado = reductorTorneo(estado, { tipo: "JUGAR_CUARTOS", resultados: cuartos });
  console.log(`Fase actual: ${estado.fase} | Clasificados: ${estado.clasificados.join(", ")}`);

  const final: PartidoFutbol = { idPartido: "fn-1", equipoLocal: "Real Madrid", equipoVisitante: "Bayern", golesLocal: 2, golesVisitante: 1 };
  estado = reductorTorneo(estado, { tipo: "JUGAR_FINAL", resultado: final });
  console.log(`Fase actual: ${estado.fase} | ¡CAMPEON DEL TORNEO!: ${estado.campeon}`);
}

main();
