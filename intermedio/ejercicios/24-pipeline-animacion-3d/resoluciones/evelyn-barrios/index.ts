export {};

type EtapaProduccion = "Modelado" | "Rigging" | "Animacion" | "Iluminacion" | "Render Final";
type PrioridadToma = "Baja" | "Media" | "Critica";

interface TomaAnimacion {
  readonly idToma: string;
  readonly secuencia: string;
  readonly duracionFrames: number;
  readonly etapaActual: EtapaProduccion;
  readonly prioridad: PrioridadToma;
  readonly animadorAsignado: string;
  readonly aprobadaPorDirector: boolean;
}

interface MetricasPipeline {
  readonly totalTomas: number;
  readonly framesTotales: number;
  readonly tomasPorEtapa: Record<EtapaProduccion, number>;
  readonly porcentajeAprobacion: number;
}

function auditarPipeline3D(tomas: readonly TomaAnimacion[]): MetricasPipeline {
  const tomasPorEtapa: Record<EtapaProduccion, number> = {
    Modelado: 0,
    Rigging: 0,
    Animacion: 0,
    Iluminacion: 0,
    "Render Final": 0,
  };

  let totalFrames = 0;
  let aprobadas = 0;

  for (const toma of tomas) {
    tomasPorEtapa[toma.etapaActual] += 1;
    totalFrames += toma.duracionFrames;
    if (toma.aprobadaPorDirector) {
      aprobadas += 1;
    }
  }

  const cantidad = tomas.length === 0 ? 1 : tomas.length;
  const porcentaje = Number(((aprobadas / cantidad) * 100).toFixed(1));

  return {
    totalTomas: tomas.length,
    framesTotales: totalFrames,
    tomasPorEtapa,
    porcentajeAprobacion: porcentaje,
  };
}

const tomasProyecto: TomaAnimacion[] = [
  { idToma: "SH-010", secuencia: "Intro Batalla", duracionFrames: 240, etapaActual: "Animacion", prioridad: "Critica", animadorAsignado: "David Ruiz", aprobadaPorDirector: false },
  { idToma: "SH-020", secuencia: "Vuelo Dragon", duracionFrames: 360, etapaActual: "Iluminacion", prioridad: "Media", animadorAsignado: "Ana Silva", aprobadaPorDirector: true },
  { idToma: "SH-030", secuencia: "Primer Plano Heroe", duracionFrames: 120, etapaActual: "Render Final", prioridad: "Critica", animadorAsignado: "Carlos Rey", aprobadaPorDirector: true },
];

console.log("=== PIPELINE DE PRODUCCIÃ“N DE ANIMACIÃ“N 3D ===");
const metricas3D = auditarPipeline3D(tomasProyecto);
console.log(`Tomas en produccion: ${metricas3D.totalTomas} | Cuadros a renderizar: ${metricas3D.framesTotales} frames`);
console.log(`Tomas en Iluminacion: ${metricas3D.tomasPorEtapa.Iluminacion}, Render Final: ${metricas3D.tomasPorEtapa["Render Final"]}`);
console.log(`Avance aprobado por Direccion: ${metricas3D.porcentajeAprobacion}%`);