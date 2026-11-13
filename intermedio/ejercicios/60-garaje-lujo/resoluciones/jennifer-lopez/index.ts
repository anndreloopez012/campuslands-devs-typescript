export {};

type TransmisionVehiculo = 'SecuencialDCT' | 'Manual' | 'AutomaticaConPaddleShifters' | 'DirectaEV';
type EstadoMantenimiento = 'Optimizado' | 'RevisionPendiente' | 'EnReparacionCritica' | 'AlmacenadoExhibicion';
type CategoriaGaraje = 'ExhibicionPrincipal' | 'TallerMecanico' | 'AreaRestauracion' | 'BovedaSeguridad';

interface DetallePersonalizacion {
  readonly modId: string;
  readonly nombreMejora: string;
  readonly costoAdicionalMUSD: number;
  readonly esExclusivaFibraCarbono: boolean;
}

interface AutomovilGarajeLujo {
  readonly autoId: string;
  readonly marcaModelo: string;
  readonly anioFabricacion: number;
  readonly transmision: TransmisionVehiculo;
  readonly valorAseguradoMUSD: number;
  readonly estadoMantenimiento: EstadoMantenimiento;
  readonly personalizaciones: readonly DetallePersonalizacion[];
}

interface SectorGaraje {
  readonly sectorId: string;
  readonly nombreSector: string;
  readonly categoria: CategoriaGaraje;
  readonly capacidadMaxima: number;
  readonly vehiculosAlmacenados: readonly AutomovilGarajeLujo[];
}

interface ReporteGarajeLujo {
  readonly sector: string;
  readonly categoria: CategoriaGaraje;
  readonly totalVehiculos: number;
  readonly valorTotalAseguradoMUSD: number;
  readonly costoTotalPersonalizacionesMUSD: number;
  readonly estatusSeguridad: 'CertificadoVIP' | 'MonitoreoActivo' | 'AlertaRiesgo';
}

const registroSsectorsGaraje: readonly SectorGaraje[] = [
  {
    sectorId: "GAR-6001",
    nombreSector: "Boveda Subterranea Alpha",
    categoria: "BovedaSeguridad",
    capacidadMaxima: 5,
    vehiculosAlmacenados: [
      {
        autoId: "AUT-01",
        marcaModelo: "Bugatti La Voiture Noire",
        anioFabricacion: 2023,
        transmision: "SecuencialDCT",
        valorAseguradoMUSD: 18.5,
        estadoMantenimiento: "Optimizado",
        personalizaciones: [
          { modId: "MOD-01", nombreMejora: "Carroceria Completa Carbono Visible", costoAdicionalMUSD: 2.5, esExclusivaFibraCarbono: true },
          { modId: "MOD-02", nombreMejora: "Llantas Monotuerca Forjadas", costoAdicionalMUSD: 0.15, esExclusivaFibraCarbono: false }
        ]
      },
      {
        autoId: "AUT-02",
        marcaModelo: "Pagani Zonda HP Barchetta",
        anioFabricacion: 2022,
        transmision: "Manual",
        valorAseguradoMUSD: 17.6,
        estadoMantenimiento: "AlmacenadoExhibicion",
        personalizaciones: [
          { modId: "MOD-03", nombreMejora: "Aerodinamica Activa de Titanio", costoAdicionalMUSD: 1.2, esExclusivaFibraCarbono: false }
        ]
      }
    ]
  },
  {
    sectorId: "GAR-6002",
    nombreSector: "Exhibicion Principal Cristales",
    categoria: "ExhibicionPrincipal",
    capacidadMaxima: 4,
    vehiculosAlmacenados: [
      {
        autoId: "AUT-03",
        marcaModelo: "Koenigsegg Jesko Absolut",
        anioFabricacion: 2024,
        transmision: "AutomaticaConPaddleShifters",
        valorAseguradoMUSD: 3.4,
        estadoMantenimiento: "Optimizado",
        personalizaciones: [
          { modId: "MOD-04", nombreMejora: "Paquete Aerodinamico Extremo", costoAdicionalMUSD: 0.4, esExclusivaFibraCarbono: true }
        ]
      }
    ]
  },
  {
    sectorId: "GAR-6003",
    nombreSector: "Taller Mecanico Especializado",
    categoria: "TallerMecanico",
    capacidadMaxima: 3,
    vehiculosAlmacenados: [
      {
        autoId: "AUT-04",
        marcaModelo: "McLaren P1 GTR Track",
        anioFabricacion: 2021,
        transmision: "SecuencialDCT",
        valorAseguradoMUSD: 4.2,
        estadoMantenimiento: "RevisionPendiente",
        personalizaciones: []
      }
    ]
  },
  {
    sectorId: "GAR-6004",
    nombreSector: "Area de Restauracion Clasicos",
    categoria: "AreaRestauracion",
    capacidadMaxima: 2,
    vehiculosAlmacenados: [
      {
        autoId: "AUT-05",
        marcaModelo: "Ferrari F40 Competizione",
        anioFabricacion: 1992,
        transmision: "Manual",
        valorAseguradoMUSD: 5.5,
        estadoMantenimiento: "Optimizado",
        personalizaciones: [
          { modId: "MOD-05", nombreMejora: "Escape Deportivo de Inconel", costoAdicionalMUSD: 0.1, esExclusivaFibraCarbono: false }
        ]
      }
    ]
  }
];

class GestorGarajeLujo<T extends SectorGaraje> {
  private readonly sectores: readonly T[];

  constructor(sectores: readonly T[]) {
    this.sectores = sectores;
  }

  public async validarSectorGarajeAsync(sector: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!sector.sectorId || sector.capacidadMaxima <= 0) {
          reject(new Error(`Sector de garaje inválido o sin capacidad definida: ${sector.nombreSector}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public calcularValorTotalVehiculos(vehiculos: readonly AutomovilGarajeLujo[]): number {
    const total = vehiculos.reduce((acc, auto) => acc + auto.valorAseguradoMUSD, 0);
    return Number(total.toFixed(2));
  }

  public calcularCostoPersonalizaciones(vehiculos: readonly AutomovilGarajeLujo[]): number {
    const total = vehiculos.reduce((acc, auto) => {
      const sumaMods = auto.personalizaciones.reduce((mAcc, mod) => mAcc + mod.costoAdicionalMUSD, 0);
      return acc + sumaMods;
    }, 0);
    return Number(total.toFixed(2));
  }

  public async procesarReportesGarajeAsync(): Promise<readonly ReporteGarajeLujo[]> {
    const reportes: ReporteGarajeLujo[] = [];

    for (const sector of this.sectores) {
      try {
        await this.validarSectorGarajeAsync(sector);
        const valorAsegurado = this.calcularValorTotalVehiculos(sector.vehiculosAlmacenados);
        const costoMods = this.calcularCostoPersonalizaciones(sector.vehiculosAlmacenados);

        const tieneReparacionCritica = sector.vehiculosAlmacenados.some(
          a => a.estadoMantenimiento === "EnReparacionCritica"
        );
        const tieneRevisionPendiente = sector.vehiculosAlmacenados.some(
          a => a.estadoMantenimiento === "RevisionPendiente"
        );

        let estatusSeguridad: 'CertificadoVIP' | 'MonitoreoActivo' | 'AlertaRiesgo' = 'CertificadoVIP';
        if (tieneReparacionCritica) {
          estatusSeguridad = 'AlertaRiesgo';
        } else if (tieneRevisionPendiente || sector.categoria === "TallerMecanico") {
          estatusSeguridad = 'MonitoreoActivo';
        }

        reportes.push({
          sector: `${sector.nombreSector} [${sector.sectorId}]`,
          categoria: sector.categoria,
          totalVehiculos: sector.vehiculosAlmacenados.length,
          valorTotalAseguradoMUSD: valorAsegurado,
          costoTotalPersonalizacionesMUSD: costoMods,
          estatusSeguridad: estatusSeguridad,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[Garaje Lujo Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => b.valorTotalAseguradoMUSD - a.valorTotalAseguradoMUSD);
  }
}

function imprimirReporteGarajeLujo(titulo: string, reportes: readonly ReporteGarajeLujo[]): void {
  console.log(`=== [GARAJE DE LUJO - AUTOS HIPERDEPORTIVOS] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Sector: ${item.sector} | Categoría: ${item.categoria} | Vehículos: ${item.totalVehiculos} | Valor Asegurado: $${item.valorTotalAseguradoMUSD}M | Mods Totales: $${item.costoTotalPersonalizacionesMUSD}M | Seguridad: ${item.estatusSeguridad}`
    );
  });
  console.log("====================================================================================================================\n");
}

async function ejecutarFlujoGarajeLujo(): Promise<void> {
  const gestorOficial = new GestorGarajeLujo(registroSsectorsGaraje);
  const reporteOficial = await gestorOficial.procesarReportesGarajeAsync();
  imprimirReporteGarajeLujo("Control Oficial de Inventario y Valoración en Garaje de Lujo", reporteOficial);

  // caso: Sector de garaje con vehiculo en reparacion critica e incidencia grave de seguridad estructural
  const sectorCasoLimite: readonly SectorGaraje[] = [
    {
      sectorId: "GAR-9999",
      nombreSector: "Zona de Incidencias y Fallas Estructurales",
      categoria: "TallerMecanico",
      capacidadMaxima: 2,
      vehiculosAlmacenados: [
        {
          autoId: "AUT-99",
          marcaModelo: "Prototipo Hypercar Dañado",
          anioFabricacion: 2025,
          transmision: "DirectaEV",
          valorAseguradoMUSD: 2.1,
          estadoMantenimiento: "EnReparacionCritica",
          personalizaciones: []
        }
      ]
    }
  ];

  const gestorLimite = new GestorGarajeLujo(sectorCasoLimite);
  const reporteLimite = await gestorLimite.procesarReportesGarajeAsync();
  imprimirReporteGarajeLujo("caso: Sector de garaje con vehiculo en reparacion critica e incidencia grave de seguridad estructural", reporteLimite);
}

ejecutarFlujoGarajeLujo();