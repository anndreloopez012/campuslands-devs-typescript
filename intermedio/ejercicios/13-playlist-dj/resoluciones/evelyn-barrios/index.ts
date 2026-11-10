export {};

type GeneroMusical = "House" | "Techno" | "Trance" | "Drum and Bass" | "Ambient";

interface PistaAudio {
  readonly id: string;
  readonly titulo: string;
  readonly artista: string;
  readonly genero: GeneroMusical;
  readonly duracionSegundos: number;
  readonly bpm: number;
  readonly claveArmonica: string;
}

interface SesionDJ {
  readonly nombreSet: string;
  readonly pistas: readonly PistaAudio[];
}

interface EstadisticasSet {
  readonly totalPistas: number;
  readonly duracionFormateada: string;
  readonly bpmPromedio: number;
  readonly transicionOptima: boolean;
}

function formatearSegundos(segundosTotales: number): string {
  const minutos = Math.floor(segundosTotales / 60);
  const segundos = segundosTotales % 60;
  return `${minutos}m ${segundos.toString().padStart(2, "0")}s`;
}

function analizarSet(sesion: SesionDJ): EstadisticasSet {
  const totalPistas = sesion.pistas.length;
  if (totalPistas === 0) {
    return { totalPistas: 0, duracionFormateada: "0m 00s", bpmPromedio: 0, transicionOptima: true };
  }

  const duracionTotal = sesion.pistas.reduce((acc, p) => acc + p.duracionSegundos, 0);
  const sumaBpm = sesion.pistas.reduce((acc, p) => acc + p.bpm, 0);
  const bpmPromedio = Math.round(sumaBpm / totalPistas);

  let transicionOptima = true;
  for (let i = 0; i < totalPistas - 1; i++) {
    const diffBpm = Math.abs(sesion.pistas[i].bpm - sesion.pistas[i + 1].bpm);
    if (diffBpm > 8) {
      transicionOptima = false;
      break;
    }
  }

  return {
    totalPistas,
    duracionFormateada: formatearSegundos(duracionTotal),
    bpmPromedio,
    transicionOptima,
  };
}

const miSet: SesionDJ = {
  nombreSet: "Sunset Rooftop Mix",
  pistas: [
    { id: "tr-01", titulo: "Deep Resonance", artista: "Boris Brejcha", genero: "Techno", duracionSegundos: 340, bpm: 125, claveArmonica: "8A" },
    { id: "tr-02", titulo: "Solar Energy", artista: "Artbat", genero: "Techno", duracionSegundos: 390, bpm: 126, claveArmonica: "9A" },
    { id: "tr-03", titulo: "Mirage", artista: "CamelPhat", genero: "House", duracionSegundos: 320, bpm: 124, claveArmonica: "9B" },
  ],
};

console.log("=== CURADOR DE PLAYLIST DJ ===");
const metrics = analizarSet(miSet);
console.log(`Set: ${miSet.nombreSet} | Pistas: ${metrics.totalPistas} | DuraciÃ³n: ${metrics.duracionFormateada}`);
console.log(`BPM Promedio: ${metrics.bpmPromedio} | Fluidez armÃ³nica: ${metrics.transicionOptima ? "Transiciones suaves" : "Saltos bruscos de tempo"}`);