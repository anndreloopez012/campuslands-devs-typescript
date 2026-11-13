export {};

type ModalidadSalto = 'Tandem' | 'AFF' | 'Freefly' | 'Wingsuit' | 'Precision';
type EstadoSalto = 'Completado' | 'CanceladoPorViento' | 'PendienteRevision';
type CondicionClimatica = 'Excelente' | 'Moderada' | 'Marginal';

interface DetalleSalto {
  readonly saltoId: string;
  readonly numeroSalto: number;
  readonly modalidad: ModalidadSalto;
  readonly alturaSalidaPies: number;
  readonly tiempoCaidaLibreSeg: number;
  readonly condicionClima: CondicionClimatica;
  readonly estado: EstadoSalto;
}

interface BitacoraParacaidista {
  readonly paracaidistaId: string;
  readonly nombreCompleto: string;
  readonly licenciaNivel: 'Alumno' | 'Licencia A' | 'Licencia B' | 'Licencia C' | 'Licencia D';
  readonly saltosRegistrados: readonly DetalleSalto[];
}

interface ReporteLogSaltos {
  readonly paracaidista: string;
  readonly nivelLicencia: string;
  readonly totalSaltosExitosos: number;
  readonly tiempoTotalCaidaLibreMin: number;
  readonly alturaMaximaAlcanzadaPies: number;
  readonly estadoBitacora: 'Aprobado' | 'RequiereAuditoria';
}

const registroBitacorasSkydive: readonly BitacoraParacaidista[] = [
  {
    paracaidistaId: "SK-4501",
    nombreCompleto: "Damián Sotomayor",
    licenciaNivel: "Licencia C",
    saltosRegistrados: [
      { saltoId: "S-101", numeroSalto: 250, modalidad: "Freefly", alturaSalidaPies: 15000, tiempoCaidaLibreSeg: 65, condicionClima: "Excelente", estado: "Completado" },
      { saltoId: "S-102", numeroSalto: 251, modalidad: "Wingsuit", alturaSalidaPies: 13500, tiempoCaidaLibreSeg: 110, condicionClima: "Excelente", estado: "Completado" },
      { saltoId: "S-103", numeroSalto: 252, modalidad: "Precision", alturaSalidaPies: 10000, tiempoCaidaLibreSeg: 45, condicionClima: "Moderada", estado: "Completado" }
    ]
  },
  {
    paracaidistaId: "SK-4502",
    nombreCompleto: "Valeria Monteverde",
    licenciaNivel: "Licencia D",
    saltosRegistrados: [
      { saltoId: "S-104", numeroSalto: 520, modalidad: "Wingsuit", alturaSalidaPies: 16000, tiempoCaidaLibreSeg: 125, condicionClima: "Excelente", estado: "Completado" },
      { saltoId: "S-105", numeroSalto: 521, modalidad: "Freefly", alturaSalidaPies: 15000, tiempoCaidaLibreSeg: 68, condicionClima: "Excelente", estado: "Completado" }
    ]
  },
  {
    paracaidistaId: "SK-4503",
    nombreCompleto: "Esteban Carvajal",
    licenciaNivel: "Licencia A",
    saltosRegistrados: [
      { saltoId: "S-106", numeroSalto: 35, modalidad: "AFF", alturaSalidaPies: 14000, tiempoCaidaLibreSeg: 60, condicionClima: "Moderada", estado: "Completado" },
      { saltoId: "S-107", numeroSalto: 36, modalidad: "Tandem", alturaSalidaPies: 12000, tiempoCaidaLibreSeg: 50, condicionClima: "Marginal", estado: "CanceladoPorViento" }
    ]
  },
  {
    paracaidistaId: "SK-4504",
    nombreCompleto: "Camila Arriaza",
    licenciaNivel: "Licencia B",
    saltosRegistrados: [
      { saltoId: "S-108", numeroSalto: 110, modalidad: "Freefly", alturaSalidaPies: 15000, tiempoCaidaLibreSeg: 62, condicionClima: "Excelente", estado: "Completado" }
    ]
  }
];

class AdministradorLogSaltos<T extends BitacoraParacaidista> {
  private readonly bitacoras: readonly T[];

  constructor(bitacoras: readonly T[]) {
    this.bitacoras = bitacoras;
  }

  public validarSaltoExitoso(salto: DetalleSalto): boolean {
    return salto.estado === "Completado" && salto.alturaSalidaPies > 0;
  }

  public calcularTiempoTotalMinutos(saltos: readonly DetalleSalto[]): number {
    const totalSegundos = saltos
      .filter(salto => this.validarSaltoExitoso(salto))
      .reduce((acc, salto) => acc + salto.tiempoCaidaLibreSeg, 0);
    return Number((totalSegundos / 60).toFixed(2));
  }

  public obtenerAlturaMaxima(saltos: readonly DetalleSalto[]): number {
    const exitosos = saltos.filter(salto => this.validarSaltoExitoso(salto));
    if (exitosos.length === 0) return 0;
    return Math.max(...exitosos.map(salto => salto.alturaSalidaPies));
  }

  public procesarReportesBitacora(): readonly ReporteLogSaltos[] {
    return this.bitacoras
      .map(bitacora => {
        const saltosValidos = bitacora.saltosRegistrados.filter(salto => this.validarSaltoExitoso(salto));
        const tiempoMinutos = this.calcularTiempoTotalMinutos(bitacora.saltosRegistrados);
        const alturaMax = this.obtenerAlturaMaxima(bitacora.saltosRegistrados);

        const requiereRevision = bitacora.saltosRegistrados.some(s => s.estado === "PendienteRevision");
        const estadoBitacora: ReporteLogSaltos['estadoBitacora'] = requiereRevision
          ? 'RequiereAuditoria'
          : 'Aprobado';

        return {
          paracaidista: `${bitacora.nombreCompleto} [${bitacora.paracaidistaId}]`,
          nivelLicencia: bitacora.licenciaNivel,
          totalSaltosExitosos: saltosValidos.length,
          tiempoTotalCaidaLibreMin: tiempoMinutos,
          alturaMaximaAlcanzadaPies: alturaMax,
          estadoBitacora,
        };
      })
      .filter(reporte => reporte.totalSaltosExitosos > 0)
      .sort((a, b) => b.totalSaltosExitosos - a.totalSaltosExitosos);
  }
}

function imprimirReporteBitacoras(titulo: string, reportes: readonly ReporteLogSaltos[]): void {
  console.log(`=== [LOG AVANZADO DE SALTOS - PARACAIDISMO] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Atleta: ${item.paracaidista} | Licencia: ${item.nivelLicencia} | Exitosos: ${item.totalSaltosExitosos} | Caída Libre: ${item.tiempoTotalCaidaLibreMin} min | Altura Máx: ${item.alturaMaximaAlcanzadaPies} ft | Estado: ${item.estadoBitacora}`
    );
  });
  console.log("====================================================================================================================\n");
}

const adminOficial = new AdministradorLogSaltos(registroBitacorasSkydive);
const reporteOficial = adminOficial.procesarReportesBitacora();
imprimirReporteBitacoras("Control de Bitácoras de Salto Autorizadas", reporteOficial);

// caso: Bitacora con salto pendiente de revision y saltos unicamente cancelados por viento
const bitacoraCasoLimite: readonly BitacoraParacaidista[] = [
  {
    paracaidistaId: "SK-9999",
    nombreCompleto: "Orion Sterling",
    licenciaNivel: "Alumno",
    saltosRegistrados: [
      { saltoId: "S-999", numeroSalto: 5, modalidad: "Tandem", alturaSalidaPies: 10000, tiempoCaidaLibreSeg: 40, condicionClima: "Marginal", estado: "PendienteRevision" },
      { saltoId: "S-1000", numeroSalto: 6, modalidad: "AFF", alturaSalidaPies: 12000, tiempoCaidaLibreSeg: 45, condicionClima: "Marginal", estado: "CanceladoPorViento" }
    ]
  }
];

const adminLimite = new AdministradorLogSaltos(bitacoraCasoLimite);
const reporteLimite = adminLimite.procesarReportesBitacora();
imprimirReporteBitacoras("caso: Bitacora con salto pendiente de revision y saltos unicamente cancelados por viento", reporteLimite);