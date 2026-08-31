export {};

type MetodoVictoria = "decision" | "ko" | "tko" | "empate";

interface TarjetaJuez {
  readonly juez: string;
  readonly puntosRojo: number;
  readonly puntosAzul: number;
}

interface Combate {
  readonly id: number;
  readonly categoria: string;
  readonly rojo: string;
  readonly azul: string;
  readonly rounds: number;
  readonly metodo: MetodoVictoria;
  readonly tarjetas: readonly TarjetaJuez[];
  readonly ganadorForzado: string | null;
}

interface RankingPeleador {
  readonly peleador: string;
  readonly victorias: number;
  readonly combates: number;
}

const cartelera: readonly Combate[] = [
  {
    id: 1,
    categoria: "-70kg",
    rojo: "Marco Diaz",
    azul: "Elena Ruiz",
    rounds: 3,
    metodo: "decision",
    tarjetas: [
      { juez: "Juez 1", puntosRojo: 29, puntosAzul: 28 },
      { juez: "Juez 2", puntosRojo: 30, puntosAzul: 27 },
      { juez: "Juez 3", puntosRojo: 28, puntosAzul: 29 },
    ],
    ganadorForzado: null,
  },
  {
    id: 2,
    categoria: "-70kg",
    rojo: "Elena Ruiz",
    azul: "Sofia Leon",
    rounds: 2,
    metodo: "ko",
    tarjetas: [],
    ganadorForzado: "Elena Ruiz",
  },
  {
    id: 3,
    categoria: "-80kg",
    rojo: "Bruno Cabrera",
    azul: "Diego Marroquin",
    rounds: 3,
    metodo: "tko",
    tarjetas: [],
    ganadorForzado: "Diego Marroquin",
  },
  {
    id: 4,
    categoria: "-80kg",
    rojo: "Bruno Cabrera",
    azul: "Hugo Pineda",
    rounds: 3,
    metodo: "decision",
    tarjetas: [
      { juez: "Juez 1", puntosRojo: 30, puntosAzul: 27 },
      { juez: "Juez 2", puntosRojo: 30, puntosAzul: 27 },
      { juez: "Juez 3", puntosRojo: 29, puntosAzul: 28 },
    ],
    ganadorForzado: null,
  },
  {
    id: 5,
    categoria: "-60kg",
    rojo: "Sofia Leon",
    azul: "Hugo Pineda",
    rounds: 3,
    metodo: "empate",
    tarjetas: [
      { juez: "Juez 1", puntosRojo: 28, puntosAzul: 28 },
      { juez: "Juez 2", puntosRojo: 29, puntosAzul: 29 },
      { juez: "Juez 3", puntosRojo: 27, puntosAzul: 27 },
    ],
    ganadorForzado: null,
  },
  {
    id: 6,
    categoria: "-60kg",
    rojo: "Marco Diaz",
    azul: "Marco Diaz",
    rounds: 3,
    metodo: "decision",
    tarjetas: [
      { juez: "Juez 1", puntosRojo: 29, puntosAzul: 28 },
      { juez: "Juez 2", puntosRojo: 29, puntosAzul: 28 },
      { juez: "Juez 3", puntosRojo: 29, puntosAzul: 28 },
    ],
    ganadorForzado: null,
  },
  {
    id: 7,
    categoria: "-70kg",
    rojo: "Diego Marroquin",
    azul: "Elena Ruiz",
    rounds: 3,
    metodo: "decision",
    tarjetas: [
      { juez: "Juez 1", puntosRojo: 28, puntosAzul: 29 },
      { juez: "Juez 2", puntosRojo: 30, puntosAzul: 27 },
    ],
    ganadorForzado: null,
  },
];

const esCombateValido = (combate: Combate): boolean => {
  if (combate.rojo === combate.azul) {
    return false;
  }

  if (combate.metodo === "ko" || combate.metodo === "tko") {
    return (
      combate.ganadorForzado === combate.rojo ||
      combate.ganadorForzado === combate.azul
    );
  }

  return (
    combate.tarjetas.length === 3 &&
    combate.tarjetas.every(
      (tarjeta) => tarjeta.puntosRojo > 0 && tarjeta.puntosAzul > 0,
    )
  );
};

const determinarGanadorDecision = (combate: Combate): string | null => {
  let votosRojo = 0;
  let votosAzul = 0;

  combate.tarjetas.forEach((tarjeta) => {
    if (tarjeta.puntosRojo > tarjeta.puntosAzul) {
      votosRojo += 1;
    } else if (tarjeta.puntosAzul > tarjeta.puntosRojo) {
      votosAzul += 1;
    }
  });

  if (votosRojo > votosAzul) {
    return combate.rojo;
  }

  if (votosAzul > votosRojo) {
    return combate.azul;
  }

  return null;
};

const determinarGanador = (combate: Combate): string | null => {
  if (combate.metodo === "ko" || combate.metodo === "tko") {
    return combate.ganadorForzado;
  }

  if (combate.metodo === "empate") {
    return null;
  }

  return determinarGanadorDecision(combate);
};

const calcularRanking = (
  combates: readonly Combate[],
): RankingPeleador[] => {
  const acumulado = new Map<string, { victorias: number; combates: number }>();

  const contar = (peleador: string, sumaVictoria: number): void => {
    const previo = acumulado.get(peleador) ?? { victorias: 0, combates: 0 };
    acumulado.set(peleador, {
      victorias: previo.victorias + sumaVictoria,
      combates: previo.combates + 1,
    });
  };

  combates.forEach((combate) => {
    const ganador = determinarGanador(combate);

    contar(combate.rojo, ganador === combate.rojo ? 1 : 0);
    contar(combate.azul, ganador === combate.azul ? 1 : 0);
  });

  return Array.from(acumulado, ([peleador, datos]) => ({
    peleador,
    victorias: datos.victorias,
    combates: datos.combates,
  })).sort((a, b) => b.victorias - a.victorias);
};

const procesarCartelera = (combates: readonly Combate[]) => {
  const validos = combates.filter(esCombateValido);
  const invalidos = combates.filter((combate) => !esCombateValido(combate));
  const empates = validos.filter((combate) => determinarGanador(combate) === null);

  return {
    validos,
    invalidos,
    empatesCount: empates.length,
    ranking: calcularRanking(validos),
  };
};

// --- Render del Sistema ---
const resumen = procesarCartelera(cartelera);

console.log(
  `Ejercicio 10: Marcador de kickboxing\nCombates totales: ${cartelera.length}\nCombates validos: ${resumen.validos.length}\nCombates invalidos: ${resumen.invalidos.length}\nEmpates: ${resumen.empatesCount}`,
);

resumen.invalidos.forEach((combate) =>
  console.log(`  - Combate #${combate.id} (${combate.rojo} vs ${combate.azul}) tiene datos invalidos`),
);

console.log("Ranking de peleadores por victorias:");
resumen.ranking.forEach((item, index) =>
  console.log(
    `${index + 1}. ${item.peleador} - ${item.victorias} victoria(s) en ${item.combates} combate(s)`,
  ),
);
