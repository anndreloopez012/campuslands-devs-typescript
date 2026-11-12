export {};

type ProcesoSoldadura = 'SMAW (Electrodo)' | 'GMAW (MIG/MAG)' | 'GTAW (TIG)' | 'FCAW' | 'Oxiacetilenica';
type EstadoInspeccion = 'Aprobado Radiografia' | 'Aprobado Visual' | 'RequiereReparacion' | 'RechazadoDefinitivo';

interface FichaInspeccionSoldadura {
  readonly soldaduraId: string;
  readonly codigoComponente: string;
  readonly soldadorCertificado: string;
  readonly proceso: ProcesoSoldadura;
  readonly amperajeUsado: number;
  readonly longitudCordonesMm: number;
  readonly estadoInspeccion: EstadoInspeccion;
}

interface ResumenAgrupadoSoldadura {
  readonly proceso: ProcesoSoldadura;
  readonly totalInspecciones: number;
  readonly longitudTotalCordonesMm: number;
  readonly promedioAmperaje: number;
  readonly soldadoresCertificados: readonly string[];
}

const registroTallerMetalmecanico: readonly FichaInspeccionSoldadura[] = [
  {
    soldaduraId: "WLD-401",
    codigoComponente: "CHASIS-EXO-01",
    soldadorCertificado: "Aether Vance",
    proceso: "GTAW (TIG)",
    amperajeUsado: 145,
    longitudCordonesMm: 450,
    estadoInspeccion: "Aprobado Radiografia",
  },
  {
    soldaduraId: "WLD-402",
    codigoComponente: "ESTRUCTURA-PUENTE-02",
    soldadorCertificado: "Soren Vestergaard",
    proceso: "SMAW (Electrodo)",
    amperajeUsado: 180,
    longitudCordonesMm: 850,
    estadoInspeccion: "Aprobado Visual",
  },
  {
    soldaduraId: "WLD-403",
    codigoComponente: "TANQUE-PRESION-05",
    soldadorCertificado: "Kenshin Takahashi",
    proceso: "GMAW (MIG/MAG)",
    amperajeUsado: 210,
    longitudCordonesMm: 1200,
    estadoInspeccion: "Aprobado Radiografia",
  },
  {
    soldaduraId: "WLD-404",
    codigoComponente: "BASTIDOR-ROBOT-03",
    soldadorCertificado: "Aether Vance",
    proceso: "GTAW (TIG)",
    amperajeUsado: 135,
    longitudCordonesMm: 320,
    estadoInspeccion: "Aprobado Visual",
  },
  {
    soldaduraId: "WLD-405",
    codigoComponente: " SOPORTE-MOTOR-08",
    soldadorCertificado: "Soren Vestergaard",
    proceso: "FCAW",
    amperajeUsado: 250,
    longitudCordonesMm: 600,
    estadoInspeccion: "RequiereReparacion",
  },
  {
    soldaduraId: "WLD-406",
    codigoComponente: "TUBERIA-EXHAUST-09",
    soldadorCertificado: "Kenshin Takahashi",
    proceso: "Oxiacetilenica",
    amperajeUsado: 90,
    longitudCordonesMm: 150,
    estadoInspeccion: "RechazadoDefinitivo",
  }
];

function validarInspeccionValida(ficha: FichaInspeccionSoldadura): boolean {
  return ficha.estadoInspeccion !== "RechazadoDefinitivo" && ficha.longitudCordonesMm > 0 && ficha.amperajeUsado > 0;
}

function agruparPorProcesoSoldadura(fichas: readonly FichaInspeccionSoldadura[]): Record<ProcesoSoldadura, readonly FichaInspeccionSoldadura[]> {
  const estadoInicial: Record<ProcesoSoldadura, readonly FichaInspeccionSoldadura[]> = {
    'SMAW (Electrodo)': [],
    'GMAW (MIG/MAG)': [],
    'GTAW (TIG)': [],
    'FCAW': [],
    'Oxiacetilenica': [],
  };

  return fichas.reduce(
    (acumulado, ficha) => ({
      ...acumulado,
      [ficha.proceso]: [...acumulado[ficha.proceso], ficha],
    }),
    estadoInicial
  );
}

function calcularEstadisticasProceso(
  proceso: ProcesoSoldadura,
  fichas: readonly FichaInspeccionSoldadura[]
): ResumenAgrupadoSoldadura {
  const longitudTotal = fichas.reduce((acc, f) => acc + f.longitudCordonesMm, 0);
  const amperajeTotal = fichas.reduce((acc, f) => acc + f.amperajeUsado, 0);
  const soldadoresUnicos = Array.from(new Set(fichas.map(f => f.soldadorCertificado)));

  return {
    proceso,
    totalInspecciones: fichas.length,
    longitudTotalCordonesMm: longitudTotal,
    promedioAmperaje: Math.round(amperajeTotal / fichas.length),
    soldadoresCertificados: soldadoresUnicos,
  };
}

function procesarControlSoldadura(fichas: readonly FichaInspeccionSoldadura[]): readonly ResumenAgrupadoSoldadura[] {
  const fichasValidas = fichas.filter(validarInspeccionValida);
  const agrupadas = agruparPorProcesoSoldadura(fichasValidas);
  const procesos = Object.keys(agrupadas) as ProcesoSoldadura[];

  return procesos
    .filter(proceso => agrupadas[proceso].length > 0)
    .map(proceso => calcularEstadisticasProceso(proceso, agrupadas[proceso]))
    .sort((a, b) => b.longitudTotalCordonesMm - a.longitudTotalCordonesMm);
}

function imprimirReporteSoldadura(titulo: string, resumen: readonly ResumenAgrupadoSoldadura[]): void {
  console.log(`=== [CONTROL DE SOLDADURA] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Proceso: ${item.proceso} | Inspecciones: ${item.totalInspecciones} | Longitud Cordones: ${item.longitudTotalCordonesMm} mm | Amperaje Promedio: ${item.promedioAmperaje} A | Soldadores: ${item.soldadoresCertificados.join(', ')}`
    );
  });
  console.log("=================================================================================\n");
}

const reporteSoldaduraOficial = procesarControlSoldadura(registroTallerMetalmecanico);
imprimirReporteSoldadura("Resumen Agrupado por Proceso de Soldadura", reporteSoldaduraOficial);

// Caso: Cordón estructural masivo de alta responsabilidad certificado mediante ensayo no destructivo
const soldaduraCasoEstructural: readonly FichaInspeccionSoldadura[] = [
  {
    soldaduraId: "WLD-999",
    codigoComponente: "VIGA-MAESTRA-CRITICA",
    soldadorCertificado: "Aether Vance",
    proceso: "GTAW (TIG)",
    amperajeUsado: 280,
    longitudCordonesMm: 2500,
    estadoInspeccion: "Aprobado Radiografia",
  }
];

const resultadoEstructural = procesarControlSoldadura(soldaduraCasoEstructural);
imprimirReporteSoldadura("Caso: Cordón Estructural Crítico de Alta Longitud", resultadoEstructural);