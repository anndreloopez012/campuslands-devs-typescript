export {};

interface PistaAudio {
  readonly id: string;
  readonly titulo: string;
  readonly artista: string;
  readonly duracionSegundos: number;
}

type EstadoReproduccion = "Reproduciendo" | "Pausado" | "Detenido";

type AccionReproductor =
  | { readonly tipo: "PLAY" }
  | { readonly tipo: "PAUSE" }
  | { readonly tipo: "SIGUIENTE_PISTA" }
  | { readonly tipo: "ANTERIOR_PISTA" }
  | { readonly tipo: "AJUSTAR_VOLUMEN"; readonly volumen: number };

interface EstadoPlaylist {
  readonly colaPistas: readonly PistaAudio[];
  readonly indiceActual: number;
  readonly estado: EstadoReproduccion;
  readonly volumenPorcentaje: number;
}

function reductorReproductor(
  actual: EstadoPlaylist,
  accion: AccionReproductor
): EstadoPlaylist {
  switch (accion.tipo) {
    case "PLAY":
      return { ...actual, estado: "Reproduciendo" };
    case "PAUSE":
      return { ...actual, estado: "Pausado" };
    case "SIGUIENTE_PISTA": {
      const siguiente = (actual.indiceActual + 1) % actual.colaPistas.length;
      return { ...actual, indiceActual: siguiente, estado: "Reproduciendo" };
    }
    case "ANTERIOR_PISTA": {
      const anterior = actual.indiceActual === 0 ? actual.colaPistas.length - 1 : actual.indiceActual - 1;
      return { ...actual, indiceActual: anterior, estado: "Reproduciendo" };
    }
    case "AJUSTAR_VOLUMEN":
      return { ...actual, volumenPorcentaje: Math.max(0, Math.min(100, accion.volumen)) };
  }
}

function main() {
  console.log("=== PLAYLIST INTERACTIVA (REDUCER REPRODUCTOR) ===");
  const pistas: PistaAudio[] = [
    { id: "trk-1", titulo: "Midnight City", artista: "M83", duracionSegundos: 243 },
    { id: "trk-2", titulo: "Get Lucky", artista: "Daft Punk", duracionSegundos: 248 },
    { id: "trk-3", titulo: "Starlight", artista: "Muse", duracionSegundos: 240 },
  ];

  let player: EstadoPlaylist = {
    colaPistas: pistas,
    indiceActual: 0,
    estado: "Detenido",
    volumenPorcentaje: 75,
  };

  player = reductorReproductor(player, { tipo: "PLAY" });
  console.log(`[${player.estado}] Reproduciendo: ${player.colaPistas[player.indiceActual].titulo} (Volumen: ${player.volumenPorcentaje}%)`);

  player = reductorReproductor(player, { tipo: "SIGUIENTE_PISTA" });
  console.log(`[${player.estado}] Siguiente pista: ${player.colaPistas[player.indiceActual].titulo}`);

  player = reductorReproductor(player, { tipo: "AJUSTAR_VOLUMEN", volumen: 90 });
  console.log(`Volumen actualizado a: ${player.volumenPorcentaje}%`);
}

main();
