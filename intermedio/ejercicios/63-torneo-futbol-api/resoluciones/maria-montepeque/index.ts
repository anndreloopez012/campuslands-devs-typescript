export {};

interface ResultadoPartido {
  readonly local: string;
  readonly visita: string;
  readonly golesLocal: number;
  readonly golesVisita: number;
}

type Fila = { puntos: number; jugados: number; dg: number };

interface Estado {
  readonly fase: "inactivo" | "cargando" | "completo";
  readonly tabla: Readonly<Record<string, Fila>>;
  readonly errores: readonly string[];
}

type Accion =
  | { readonly tipo: "inicio" }
  | { readonly tipo: "resultado"; readonly datos: ResultadoPartido }
  | { readonly tipo: "fallo"; readonly partido: string; readonly motivo: string }
  | { readonly tipo: "fin" };

const esperar = (ms: number): Promise<void> => new Promise((resolver) => setTimeout(resolver, ms));

const sumarFila = (fila: Fila | undefined, goles: number, contra: number): Fila => {
  const previa = fila ?? { puntos: 0, jugados: 0, dg: 0 };
  const puntos = goles > contra ? 3 : goles === contra ? 1 : 0;
  return { puntos: previa.puntos + puntos, jugados: previa.jugados + 1, dg: previa.dg + goles - contra };
};

const reducer = (estado: Estado, accion: Accion): Estado => {
  switch (accion.tipo) {
    case "inicio":
      return { fase: "cargando", tabla: {}, errores: [] };
    case "resultado": {
      const { local, visita, golesLocal, golesVisita } = accion.datos;
      return {
        ...estado,
        tabla: {
          ...estado.tabla,
          [local]: sumarFila(estado.tabla[local], golesLocal, golesVisita),
          [visita]: sumarFila(estado.tabla[visita], golesVisita, golesLocal),
        },
      };
    }
    case "fallo":
      return { ...estado, errores: [...estado.errores, `${accion.partido}: ${accion.motivo}`] };
    case "fin":
      return { ...estado, fase: "completo" };
  }
};

const fixture: readonly [string, string][] = [
  ["Rayo", "Union"], ["Atletico", "Estrella"], ["Rayo", "Atletico"], ["Union", "Estrella"],
  ["Rayo", "Estrella"], ["Union", "Atletico"], ["Rayo", "Fantasma"],
];
const marcadores: Record<string, [number, number]> = {
  "Rayo-Union": [2, 0], "Atletico-Estrella": [1, 1], "Rayo-Atletico": [0, 0], "Union-Estrella": [3, 2], "Rayo-Estrella": [1, 0],
};

const pedirResultado = async ([local, visita]: readonly [string, string]): Promise<ResultadoPartido> => {
  await esperar(local === "Rayo" ? 15 : 5);
  const marcador = marcadores[`${local}-${visita}`];
  if (!marcador) throw new Error("el servidor no tiene este partido");
  return { local, visita, golesLocal: marcador[0], golesVisita: marcador[1] };
};

const main = async (): Promise<void> => {
  console.log("Ejercicio 63: Torneo futbol asincrono");
  let estado: Estado = { fase: "inactivo", tabla: {}, errores: [] };
  const despachar = (accion: Accion): void => {
    estado = reducer(estado, accion);
  };

  despachar({ tipo: "inicio" });
  console.log(`Fase: ${estado.fase}`);

  // Cada respuesta se despacha cuando llega, sin importar el orden de la peticion.
  await Promise.all(
    fixture.map(async (partido) => {
      try {
        const datos = await pedirResultado(partido);
        despachar({ tipo: "resultado", datos });
      } catch (error) {
        despachar({ tipo: "fallo", partido: partido.join(" vs "), motivo: error instanceof Error ? error.message : "error" });
      }
    }),
  );
  despachar({ tipo: "fin" });

  console.log(`Fase: ${estado.fase}`);
  Object.entries(estado.tabla)
    .sort(([, a], [, b]) => b.puntos - a.puntos || b.dg - a.dg)
    .forEach(([equipo, f], i) => console.log(`${i + 1}. ${equipo} - ${f.puntos} pts (PJ ${f.jugados}, DG ${f.dg})`));
  estado.errores.forEach((e) => console.log(`  ! ${e}`));
};

void main();
