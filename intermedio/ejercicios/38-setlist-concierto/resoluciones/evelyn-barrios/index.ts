export {};

type BloqueConcierto = "Apertura" | "Set Principal" | "Acustico" | "Encore";

interface CancionSetlist {
  readonly id: string;
  readonly titulo: string;
  readonly duracionSegundos: number;
  readonly bloque: BloqueConcierto;
  readonly afinacionGuitarra: "E Standard" | "Drop D" | "Half Step Down";
}

interface ConciertoEnVivo {
  readonly banda: string;
  readonly gira: string;
  readonly tiempoLimiteMinutos: number;
  readonly repertorio: readonly CancionSetlist[];
}

interface AuditoriaShow {
  readonly totalCanciones: number;
  readonly duracionTotalMinutos: number;
  readonly cambiosDeAfinacion: number;
  readonly dentroDelLimite: boolean;
}

function auditarConcierto(show: ConciertoEnVivo): AuditoriaShow {
  const duracionTotalSeg = show.repertorio.reduce((acc, c) => acc + c.duracionSegundos, 0);
  const duracionTotalMin = Number((duracionTotalSeg / 60).toFixed(1));

  let cambiosAfinacion = 0;
  for (let i = 0; i < show.repertorio.length - 1; i++) {
    if (show.repertorio[i].afinacionGuitarra !== show.repertorio[i + 1].afinacionGuitarra) {
      cambiosAfinacion += 1;
    }
  }

  return {
    totalCanciones: show.repertorio.length,
    duracionTotalMinutos: duracionTotalMin,
    cambiosDeAfinacion: cambiosAfinacion,
    dentroDelLimite: duracionTotalMin <= show.tiempoLimiteMinutos,
  };
}

const showMetallica: ConciertoEnVivo = {
  banda: "Metallica",
  gira: "M72 World Tour",
  tiempoLimiteMinutos: 120,
  repertorio: [
    { id: "c-01", titulo: "Creeping Death", duracionSegundos: 390, bloque: "Apertura", afinacionGuitarra: "E Standard" },
    { id: "c-02", titulo: "Sad but True", duracionSegundos: 320, bloque: "Set Principal", afinacionGuitarra: "Drop D" },
    { id: "c-03", titulo: "Master of Puppets", duracionSegundos: 515, bloque: "Encore", afinacionGuitarra: "E Standard" },
  ],
};

console.log("=== SETLIST DE CONCIERTO EN VIVO ===");
const metricasShow = auditarConcierto(showMetallica);
console.log(`Banda: ${showMetallica.banda} | Canciones: ${metricasShow.totalCanciones} temas`);
console.log(`Duracion estimada: ${metricasShow.duracionTotalMinutos} min / Limite: ${showMetallica.tiempoLimiteMinutos} min`);
console.log(`Ajuste de tiempos: ${metricasShow.dentroDelLimite ? "Programa dentro de horario" : "Riesgo de corte por toque de queda"}`);