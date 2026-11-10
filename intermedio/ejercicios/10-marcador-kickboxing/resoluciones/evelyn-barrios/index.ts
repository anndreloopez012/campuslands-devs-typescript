export {};

type CategoriaPeso = "Pluma" | "Ligero" | "Welter" | "Medio" | "Pesado";
type ResultadoFallo = "Decision Unanime" | "Decision Dividida" | "Empate" | "KO / TKO";

interface TarjetaJuezRound {
  readonly juezId: string;
  readonly puntosRojo: number;
  readonly puntosAzul: number;
}

interface Asalto {
  readonly numero: number;
  readonly puntuacionesJueces: readonly TarjetaJuezRound[];
}

interface CombateKickboxing {
  readonly id: string;
  readonly peleadorRojo: string;
  readonly peleadorAzul: string;
  readonly categoria: CategoriaPeso;
  readonly asaltos: readonly Asalto[];
}

interface ResumenPuntuacion {
  readonly peleadorRojo: string;
  readonly peleadorAzul: string;
  readonly puntosTotalesRojo: number;
  readonly puntosTotalesAzul: number;
  readonly ganador: string;
  readonly fallo: ResultadoFallo;
}

function calcularVeredictoCombate(combate: CombateKickboxing): ResumenPuntuacion {
  let totalRojo = 0;
  let totalAzul = 0;

  for (const asalto of combate.asaltos) {
    for (const tarjeta of asalto.puntuacionesJueces) {
      totalRojo += tarjeta.puntosRojo;
      totalAzul += tarjeta.puntosAzul;
    }
  }

  let ganador = "Empate";
  let fallo: ResultadoFallo = "Empate";

  if (totalRojo > totalAzul) {
    ganador = combate.peleadorRojo;
    fallo = "Decision Unanime";
  } else if (totalAzul > totalRojo) {
    ganador = combate.peleadorAzul;
    fallo = "Decision Unanime";
  }

  return {
    peleadorRojo: combate.peleadorRojo,
    peleadorAzul: combate.peleadorAzul,
    puntosTotalesRojo: totalRojo,
    puntosTotalesAzul: totalAzul,
    ganador,
    fallo,
  };
}

const combateEjemplo: CombateKickboxing = {
  id: "kb-title-01",
  peleadorRojo: "Alex Pereira",
  peleadorAzul: "Israel Adesanya",
  categoria: "Medio",
  asaltos: [
    {
      numero: 1,
      puntuacionesJueces: [
        { juezId: "J1", puntosRojo: 10, puntosAzul: 9 },
        { juezId: "J2", puntosRojo: 10, puntosAzul: 9 },
        { juezId: "J3", puntosRojo: 9, puntosAzul: 10 },
      ],
    },
    {
      numero: 2,
      puntuacionesJueces: [
        { juezId: "J1", puntosRojo: 10, puntosAzul: 9 },
        { juezId: "J2", puntosRojo: 10, puntosAzul: 9 },
        { juezId: "J3", puntosRojo: 10, puntosAzul: 9 },
      ],
    },
  ],
};

console.log("=== MARCADOR OFICIAL DE KICKBOXING ===");
const veredicto = calcularVeredictoCombate(combateEjemplo);
console.log(`Combate: ${veredicto.peleadorRojo} vs ${veredicto.peleadorAzul}`);
console.log(`Puntuacion: ${veredicto.puntosTotalesRojo} - ${veredicto.puntosTotalesAzul}`);
console.log(`Veredicto: Ganador ${veredicto.ganador} por ${veredicto.fallo}`);