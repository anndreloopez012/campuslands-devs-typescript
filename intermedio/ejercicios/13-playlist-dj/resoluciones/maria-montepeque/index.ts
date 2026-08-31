export {};

type GeneroMusical = "electronica" | "reggaeton" | "rock" | "pop" | "hiphop";

interface Cancion {
  readonly id: number;
  readonly titulo: string;
  readonly artista: string;
  readonly genero: GeneroMusical;
  readonly duracionSegundos: number;
  readonly energia: number;
  readonly explicita: boolean;
}

interface ConteoGenero {
  readonly genero: GeneroMusical;
  readonly cantidad: number;
}

interface SetDeFiesta {
  readonly seleccionadas: readonly Cancion[];
  readonly duracionTotalSegundos: number;
}

const PRESUPUESTO_SEGUNDOS = 720;

const catalogo: readonly Cancion[] = [
  {
    id: 1,
    titulo: "Luces de Neon",
    artista: "Kira Vox",
    genero: "electronica",
    duracionSegundos: 210,
    energia: 9,
    explicita: false,
  },
  {
    id: 2,
    titulo: "Calle Caliente",
    artista: "Tono Real",
    genero: "reggaeton",
    duracionSegundos: 195,
    energia: 8,
    explicita: true,
  },
  {
    id: 3,
    titulo: "Motor de Fuego",
    artista: "Los Filos",
    genero: "rock",
    duracionSegundos: 240,
    energia: 7,
    explicita: false,
  },
  {
    id: 4,
    titulo: "Corazon Sintetico",
    artista: "Kira Vox",
    genero: "pop",
    duracionSegundos: 180,
    energia: 6,
    explicita: false,
  },
  {
    id: 5,
    titulo: "Ritmo Sin Freno",
    artista: "MC Andes",
    genero: "hiphop",
    duracionSegundos: 205,
    energia: 8,
    explicita: false,
  },
  {
    id: 6,
    titulo: "Bajo Presion",
    artista: "Tono Real",
    genero: "reggaeton",
    duracionSegundos: 200,
    energia: 9,
    explicita: false,
  },
  {
    id: 7,
    titulo: "Voltaje",
    artista: "Kira Vox",
    genero: "electronica",
    duracionSegundos: 0,
    energia: 9,
    explicita: false,
  },
  {
    id: 8,
    titulo: "Cenizas de Ayer",
    artista: "Los Filos",
    genero: "rock",
    duracionSegundos: 260,
    energia: 12,
    explicita: false,
  },
  {
    id: 9,
    titulo: "Vuelo Nocturno",
    artista: "MC Andes",
    genero: "hiphop",
    duracionSegundos: 215,
    energia: 5,
    explicita: true,
  },
  {
    id: 10,
    titulo: "",
    artista: "Tono Real",
    genero: "pop",
    duracionSegundos: 190,
    energia: 7,
    explicita: false,
  },
];

const esCancionValida = (cancion: Cancion): boolean =>
  cancion.duracionSegundos > 0 &&
  cancion.energia >= 1 &&
  cancion.energia <= 10 &&
  cancion.titulo.trim().length > 0 &&
  cancion.artista.trim().length > 0;

const contarPorGenero = (canciones: readonly Cancion[]): ConteoGenero[] => {
  const acumulado = new Map<GeneroMusical, number>();

  canciones.forEach((cancion) => {
    acumulado.set(cancion.genero, (acumulado.get(cancion.genero) ?? 0) + 1);
  });

  return Array.from(acumulado, ([genero, cantidad]) => ({ genero, cantidad })).sort(
    (a, b) => b.cantidad - a.cantidad,
  );
};

const construirSetDeFiesta = (
  canciones: readonly Cancion[],
  presupuestoSegundos: number,
  permitirExplicitas: boolean,
): SetDeFiesta => {
  const candidatas = [...canciones]
    .filter((cancion) => permitirExplicitas || !cancion.explicita)
    .sort((a, b) => b.energia - a.energia);

  const seleccionadas: Cancion[] = [];
  let duracionTotalSegundos = 0;

  candidatas.forEach((cancion) => {
    if (duracionTotalSegundos + cancion.duracionSegundos <= presupuestoSegundos) {
      seleccionadas.push(cancion);
      duracionTotalSegundos += cancion.duracionSegundos;
    }
  });

  return { seleccionadas, duracionTotalSegundos };
};

const procesarPlaylist = (canciones: readonly Cancion[]) => {
  const validas = canciones.filter(esCancionValida);
  const invalidas = canciones.filter((cancion) => !esCancionValida(cancion));
  const energiaPromedio =
    validas.reduce((suma, cancion) => suma + cancion.energia, 0) / validas.length;

  return {
    validas,
    invalidas,
    energiaPromedio: Math.round(energiaPromedio * 100) / 100,
    porGenero: contarPorGenero(validas),
    setDeFiesta: construirSetDeFiesta(validas, PRESUPUESTO_SEGUNDOS, false),
  };
};

// --- Render del Sistema ---
const resumen = procesarPlaylist(catalogo);

console.log(
  `Ejercicio 13: Curador de playlist\nCanciones totales: ${catalogo.length}\nCanciones validas: ${resumen.validas.length}\nCanciones invalidas: ${resumen.invalidas.length}\nEnergia promedio: ${resumen.energiaPromedio}`,
);

resumen.invalidas.forEach((cancion) =>
  console.log(`  - #${cancion.id} "${cancion.titulo || "(sin titulo)"}" tiene datos invalidos`),
);

console.log("Canciones por genero:");
resumen.porGenero.forEach((item) =>
  console.log(`  ${item.genero}: ${item.cantidad}`),
);

console.log(
  `Set de fiesta (sin explicitas, presupuesto ${PRESUPUESTO_SEGUNDOS}s, duracion usada ${resumen.setDeFiesta.duracionTotalSegundos}s):`,
);
resumen.setDeFiesta.seleccionadas.forEach((cancion, index) =>
  console.log(
    `${index + 1}. ${cancion.titulo} - ${cancion.artista} (energia ${cancion.energia})`,
  ),
);
