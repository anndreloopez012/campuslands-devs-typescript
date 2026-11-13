export {};

type ProcesoSoldadura = 'SMAW' | 'GMAW' | 'GTAW' | 'FCAW' | 'SAW';
type PosicionSoldadura = '1G' | '2G' | '3G' | '4G' | '6G';
type DefectoSoldadura = 'Porosidad' | 'FaltaDeFusion' | 'Socavadura' | 'Grieta' | 'SinDefectos';
type EstadoInspeccion = 'Aprobado' | 'ReparacionRequerida' | 'RechazadoCritico';

interface CordonSoldadura {
  readonly cordonId: string;
  readonly numeroCordon: number;
  readonly proceso: ProcesoSoldadura;
  readonly posicion: PosicionSoldadura;
  readonly amperajeUsado: number;
  readonly defectoDetectado: DefectoSoldadura;
  readonly estado: EstadoInspeccion;
}

interface LoteEstructuraMetalica {
  readonly loteId: string;
  readonly codigoEstructura: string;
  readonly inspectorCertificado: string;
  readonly cordonesInspeccionados: readonly CordonSoldadura[];
}

interface ReporteInspeccionSoldadura {
  readonly estructura: string;
  readonly inspector: string;
  readonly totalCordonesAprobados: number;
  readonly amperajePromedio: number;
  readonly porcentajeDefectuosos: number;
  readonly dictamenCalidad: 'Conforme' | 'Observaciones' | 'NoConforme';
}

const registroLotesSoldadura: readonly LoteEstructuraMetalica[] = [
  {
    loteId: "WLD-5001",
    codigoEstructura: "Puente Tubukar C-12",
    inspectorCertificado: "Lysandra Vane",
    cordonesInspeccionados: [
      { cordonId: "C-01", numeroCordon: 10, proceso: "SMAW", posicion: "6G", amperajeUsado: 145, defectoDetectado: "SinDefectos", estado: "Aprobado" },
      { cordonId: "C-02", numeroCordon: 11, proceso: "GMAW", posicion: "3G", amperajeUsado: 180, defectoDetectado: "Porosidad", estado: "ReparacionRequerida" },
      { cordonId: "C-03", numeroCordon: 12, proceso: "GTAW", posicion: "1G", amperajeUsado: 130, defectoDetectado: "SinDefectos", estado: "Aprobado" }
    ]
  },
  {
    loteId: "WLD-5002",
    codigoEstructura: "Chasis Presion Hidraulica Titan",
    inspectorCertificado: "Thalassa Kurosaki",
    cordonesInspeccionados: [
      { cordonId: "C-04", numeroCordon: 20, proceso: "FCAW", posicion: "2G", amperajeUsado: 220, defectoDetectado: "SinDefectos", estado: "Aprobado" },
      { cordonId: "C-05", numeroCordon: 21, proceso: "FCAW", posicion: "4G", amperajeUsado: 225, defectoDetectado: "SinDefectos", estado: "Aprobado" }
    ]
  },
  {
    loteId: "WLD-5003",
    codigoEstructura: "Ducto de Gas Alto Flujo B-4",
    inspectorCertificado: "Zephyrin Moreau",
    cordonesInspeccionados: [
      { cordonId: "C-06", numeroCordon: 30, proceso: "GTAW", posicion: "6G", amperajeUsado: 125, defectoDetectado: "SinDefectos", estado: "Aprobado" },
      { cordonId: "C-07", numeroCordon: 31, proceso: "SMAW", posicion: "3G", amperajeUsado: 150, defectoDetectado: "Socavadura", estado: "ReparacionRequerida" }
    ]
  },
  {
    loteId: "WLD-5004",
    codigoEstructura: "Plataforma Offshore K-9",
    inspectorCertificado: "Cassian Sotomayor",
    cordonesInspeccionados: [
      { cordonId: "C-08", numeroCordon: 40, proceso: "SAW", posicion: "1G", amperajeUsado: 350, defectoDetectado: "SinDefectos", estado: "Aprobado" }
    ]
  }
];

class AdministradorInspeccionSoldadura<T extends LoteEstructuraMetalica> {
  private readonly lotes: readonly T[];

  constructor(lotes: readonly T[]) {
    this.lotes = lotes;
  }

  public validarCordonAprobado(cordon: CordonSoldadura): boolean {
    return cordon.estado === "Aprobado" && cordon.amperajeUsado > 0;
  }

  public calcularAmperajePromedio(cordones: readonly CordonSoldadura[]): number {
    if (cordones.length === 0) return 0;
    const suma = cordones.reduce((acc, c) => acc + c.amperajeUsado, 0);
    return Number((suma / cordones.length).toFixed(1));
  }

  public calcularPorcentajeDefectuosos(cordones: readonly CordonSoldadura[]): number {
    if (cordones.length === 0) return 0;
    const defectuosos = cordones.filter(c => c.estado !== "Aprobado").length;
    return Number(((defectuosos / cordones.length) * 100).toFixed(1));
  }

  public procesarReportesInspeccion(): readonly ReporteInspeccionSoldadura[] {
    return this.lotes
      .map(lote => {
        const cordonesAprobados = lote.cordonesInspeccionados.filter(c => this.validarCordonAprobado(c));
        const ampPromedio = this.calcularAmperajePromedio(lote.cordonesInspeccionados);
        const porcDefectos = this.calcularPorcentajeDefectuosos(lote.cordonesInspeccionados);

        const tieneRechazoCritico = lote.cordonesInspeccionados.some(c => c.estado === "RechazadoCritico");

        let dictamen: 'Conforme' | 'Observaciones' | 'NoConforme' = 'Conforme';
        if (tieneRechazoCritico || porcDefectos > 50) {
          dictamen = 'NoConforme';
        } else if (porcDefectos > 0) {
          dictamen = 'Observaciones';
        }

        return {
          estructura: `${lote.codigoEstructura} [${lote.loteId}]`,
          inspector: lote.inspectorCertificado,
          totalCordonesAprobados: cordonesAprobados.length,
          amperajePromedio: ampPromedio,
          porcentajeDefectuosos: porcDefectos,
          dictamenCalidad: dictamen,
        };
      })
      .filter(reporte => reporte.totalCordonesAprobados >= 0)
      .sort((a, b) => b.porcentajeDefectuosos - a.porcentajeDefectuosos);
  }
}

function imprimirReporteInspecciones(titulo: string, reportes: readonly ReporteInspeccionSoldadura[]): void {
  console.log(`=== [INSPECCION VISUAL SOLDADURA - SOLDADURA] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Estructura: ${item.estructura} | Inspector: ${item.inspector} | Aprobados: ${item.totalCordonesAprobados} | Amperaje Prom: ${item.amperajePromedio} A | Defectos: ${item.porcentajeDefectuosos}% | Dictamen: ${item.dictamenCalidad}`
    );
  });
  console.log("==========================================================================================================================\n");
}

const adminSoldaduraOficial = new AdministradorInspeccionSoldadura(registroLotesSoldadura);
const reporteSoldaduraOficial = adminSoldaduraOficial.procesarReportesInspeccion();
imprimirReporteInspecciones("Control Oficial de Calidad e Inspección de Cordones", reporteSoldaduraOficial);

// caso: Lote con grietas criticas y rechazo estructural por fallas en inspeccion visual
const loteCasoLimite: readonly LoteEstructuraMetalica[] = [
  {
    loteId: "WLD-9999",
    codigoEstructura: "Soporte Estructural Falla Critica",
    inspectorCertificado: "Orion Sterling",
    cordonesInspeccionados: [
      { cordonId: "C-99", numeroCordon: 99, proceso: "SMAW", posicion: "6G", amperajeUsado: 110, defectoDetectado: "Grieta", estado: "RechazadoCritico" }
    ]
  }
];

const adminSoldaduraLimite = new AdministradorInspeccionSoldadura(loteCasoLimite);
const reporteSoldaduraLimite = adminSoldaduraLimite.procesarReportesInspeccion();
imprimirReporteInspecciones("caso: Lote con grietas criticas y rechazo estructural por fallas en inspeccion visual", reporteSoldaduraLimite);