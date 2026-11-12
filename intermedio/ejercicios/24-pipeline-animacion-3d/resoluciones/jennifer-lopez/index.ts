export {};

type FasePipeline3D = 'Modelado' | 'Rigging' | 'Animacion' | 'Shading & Texturizado' | 'Renderizado';
type EstadoAsset = 'Aprobado' | 'EnRevision' | 'BloqueoTecnico' | 'Descartado';

interface AssetAnimacion3D {
  readonly assetId: string;
  readonly nombreAsset: string;
  readonly artistaEncargado: string;
  readonly faseActual: FasePipeline3D;
  readonly tiempoHorasInvertidas: number;
  readonly complejidadPoligonalK: number; // Miles de polígonos
  readonly estado: EstadoAsset;
}

interface ResumenAgrupadoFase3D {
  readonly fase: FasePipeline3D;
  readonly totalAssets: number;
  readonly horasTotalesPipeline: number;
  readonly promedioComplejidadK: number;
  readonly artistasParticipantes: readonly string[];
}

const pipelineEstudioVFX: readonly AssetAnimacion3D[] = [
  {
    assetId: "3D-101",
    nombreAsset: "Meca-Dragon Cybernetico Rig",
    artistaEncargado: "Aether Vance",
    faseActual: "Rigging",
    tiempoHorasInvertidas: 45,
    complejidadPoligonalK: 120.5,
    estado: "Aprobado",
  },
  {
    assetId: "3D-102",
    nombreAsset: "Entorno Ruinas Neón City",
    artistaEncargado: "Soren Vestergaard",
    faseActual: "Shading & Texturizado",
    tiempoHorasInvertidas: 32,
    complejidadPoligonalK: 85.0,
    estado: "Aprobado",
  },
  {
    assetId: "3D-103",
    nombreAsset: "Protagonista Exo-Suit Base",
    artistaEncargado: "Kenshin Takahashi",
    faseActual: "Modelado",
    tiempoHorasInvertidas: 50,
    complejidadPoligonalK: 95.2,
    estado: "EnRevision",
  },
  {
    assetId: "3D-104",
    nombreAsset: "Secuencia Combate Aéreo Keyframe",
    artistaEncargado: "Aether Vance",
    faseActual: "Animacion",
    tiempoHorasInvertidas: 60,
    complejidadPoligonalK: 110.0,
    estado: "Aprobado",
  },
  {
    assetId: "3D-105",
    nombreAsset: "Iluminación Volumétrica Escena 4",
    artistaEncargado: "Soren Vestergaard",
    faseActual: "Renderizado",
    tiempoHorasInvertidas: 24,
    complejidadPoligonalK: 150.0,
    estado: "Aprobado",
  },
  {
    assetId: "3D-106",
    nombreAsset: "Prop Arma Láser Prototipo",
    artistaEncargado: "Kenshin Takahashi",
    faseActual: "Modelado",
    tiempoHorasInvertidas: 15,
    complejidadPoligonalK: 45.0,
    estado: "BloqueoTecnico",
  }
];

function validarAssetActivo(asset: AssetAnimacion3D): boolean {
  return asset.estado !== "Descartado" && asset.tiempoHorasInvertidas > 0;
}

function agruparPorFasePipeline(assets: readonly AssetAnimacion3D[]): Record<FasePipeline3D, readonly AssetAnimacion3D[]> {
  const estadoInicial: Record<FasePipeline3D, readonly AssetAnimacion3D[]> = {
    'Modelado': [],
    'Rigging': [],
    'Animacion': [],
    'Shading & Texturizado': [],
    'Renderizado': [],
  };

  return assets.reduce(
    (acumulado, asset) => ({
      ...acumulado,
      [asset.faseActual]: [...acumulado[asset.faseActual], asset],
    }),
    estadoInicial
  );
}

function calcularEstadisticasFase(
  fase: FasePipeline3D,
  assets: readonly AssetAnimacion3D[]
): ResumenAgrupadoFase3D {
  const horasTotales = assets.reduce((acc, a) => acc + a.tiempoHorasInvertidas, 0);
  const poligonosTotales = assets.reduce((acc, a) => acc + a.complejidadPoligonalK, 0);
  const artistasUnicos = Array.from(new Set(assets.map(a => a.artistaEncargado)));

  return {
    fase,
    totalAssets: assets.length,
    horasTotalesPipeline: horasTotales,
    promedioComplejidadK: Number((poligonosTotales / assets.length).toFixed(2)),
    artistasParticipantes: artistasUnicos,
  };
}

function procesarPipelineAnimacion3D(assets: readonly AssetAnimacion3D[]): readonly ResumenAgrupadoFase3D[] {
  const assetsValidos = assets.filter(validarAssetActivo);
  const agrupados = agruparPorFasePipeline(assetsValidos);
  const fases = Object.keys(agrupados) as FasePipeline3D[];

  return fases
    .filter(fase => agrupados[fase].length > 0)
    .map(fase => calcularEstadisticasFase(fase, agrupados[fase]))
    .sort((a, b) => b.horasTotalesPipeline - a.horasTotalesPipeline);
}

function imprimirReportePipeline(titulo: string, resumen: readonly ResumenAgrupadoFase3D[]): void {
  console.log(`=== [PIPELINE DE ANIMACIÓN 3D] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Fase: ${item.fase} | Assets: ${item.totalAssets} | Horas: ${item.horasTotalesPipeline}h | Complejidad Promedio: ${item.promedioComplejidadK}k polígonos | Artistas: ${item.artistasParticipantes.join(', ')}`
    );
  });
  console.log("=================================================================================\n");
}

const reportePipelineOficial = procesarPipelineAnimacion3D(pipelineEstudioVFX);
imprimirReportePipeline("Resumen de Carga de Trabajo por Fase del Pipeline", reportePipelineOficial);

// Caso: Asset hiperdetallado de cinematográfica con complejidad extrema y renderizado masivo
const assetCasoCinematico: readonly AssetAnimacion3D[] = [
  {
    assetId: "3D-999",
    nombreAsset: "Nave nodriza titánica IMAX 8K",
    artistaEncargado: "Aether Vance",
    faseActual: "Renderizado",
    tiempoHorasInvertidas: 120,
    complejidadPoligonalK: 850.0,
    estado: "Aprobado",
  }
];

const resultadoCinematico = procesarPipelineAnimacion3D(assetCasoCinematico);
imprimirReportePipeline("Caso: Asset Cinematográfico de Ultra Alta Complejidad", resultadoCinematico);