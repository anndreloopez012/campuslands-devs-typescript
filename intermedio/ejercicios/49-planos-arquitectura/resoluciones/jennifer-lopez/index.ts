export {};

type SoftwareCad = 'Revit' | 'AutoCAD' | 'Rhino3D' | 'BlenderBIM' | 'SketchUp';
type CategoriaPlano = 'Estructural' | 'Topografico' | 'Instalaciones' | 'Fachadas' | 'Interiorismo';
type EstadoPlano = 'Aprobado' | 'RevisionPendiente' | 'RechazadoPorNormativa' | 'Borrador';

interface DetalleCapaPlano {
  readonly capaId: string;
  readonly nombreCapa: string;
  readonly categoria: CategoriaPlano;
  readonly elementosPoligonales: number;
  readonly pesoArchivoMb: number;
  readonly estado: EstadoPlano;
}

interface ProyectoArquitectura3D {
  readonly proyectoId: string;
  readonly nombreProyecto: string;
  readonly arquitectoLider: string;
  readonly softwareUtilizado: SoftwareCad;
  readonly capasPlanos: readonly DetalleCapaPlano[];
}

interface ReporteControlPlanos {
  readonly proyecto: string;
  readonly lider: string;
  readonly software: SoftwareCad;
  readonly totalCapasAprobadas: number;
  readonly pesoTotalArchivoMb: number;
  readonly promedioElementosPoligonales: number;
  readonly estatusBIM: 'Certificado' | 'EnValidacion' | 'NoConforme';
}

const registroProyectosArquitectura: readonly ProyectoArquitectura3D[] = [
  {
    proyectoId: "ARC-4901",
    nombreProyecto: "Complex Residencial Bioclimatico Kaelen",
    arquitectoLider: "Zephyrine Althaus",
    softwareUtilizado: "Revit",
    capasPlanos: [
      { capaId: "CP-01", nombreCapa: "Cimentacion y Muros Carga", categoria: "Estructural", elementosPoligonales: 1420, pesoArchivoMb: 45.5, estado: "Aprobado" },
      { capaId: "CP-02", nombreCapa: "Red Hidraulica y Sanitaria", categoria: "Instalaciones", elementosPoligonales: 890, pesoArchivoMb: 28.0, estado: "Aprobado" },
      { capaId: "CP-03", nombreCapa: "Topografia y Curvas Nivel", categoria: "Topografico", elementosPoligonales: 2100, pesoArchivoMb: 62.4, estado: "Aprobado" }
    ]
  },
  {
    proyectoId: "ARC-4902",
    nombreProyecto: "Museo de Arte Contemporaneo Vane",
    arquitectoLider: "Lysandra Kurosaki",
    softwareUtilizado: "Rhino3D",
    capasPlanos: [
      { capaId: "CP-04", nombreCapa: "Fachada Parametrica Vidrio", categoria: "Fachadas", elementosPoligonales: 3400, pesoArchivoMb: 95.2, estado: "Aprobado" },
      { capaId: "CP-05", nombreCapa: "Instalacion Electrica y HVAC", categoria: "Instalaciones", elementosPoligonales: 1150, pesoArchivoMb: 34.0, estado: "Aprobado" }
    ]
  },
  {
    proyectoId: "ARC-4903",
    nombreProyecto: "Torre Corporativa Biomecanica",
    arquitectoLider: "Thalassa Moreau",
    softwareUtilizado: "BlenderBIM",
    capasPlanos: [
      { capaId: "CP-06", nombreCapa: "Estructura Metalica Principal", categoria: "Estructural", elementosPoligonales: 2800, pesoArchivoMb: 80.5, estado: "Aprobado" },
      { capaId: "CP-07", nombreCapa: "Interiorismo y Mobiliario", categoria: "Interiorismo", elementosPoligonales: 950, pesoArchivoMb: 22.0, estado: "RevisionPendiente" }
    ]
  },
  {
    proyectoId: "ARC-4904",
    nombreProyecto: "Pabellon Botanico Sostenible",
    arquitectoLider: "Cassian Sotomayor",
    softwareUtilizado: "SketchUp",
    capasPlanos: [
      { capaId: "CP-08", nombreCapa: "Cubierta Tensada", categoria: "Fachadas", elementosPoligonales: 780, pesoArchivoMb: 19.5, estado: "Aprobado" }
    ]
  }
];

class GestorControlPlanos<T extends ProyectoArquitectura3D> {
  private readonly proyectos: readonly T[];

  constructor(proyectos: readonly T[]) {
    this.proyectos = proyectos;
  }

  public validarCapaAprobada(capa: DetalleCapaPlano): boolean {
    return capa.estado === "Aprobado" && capa.pesoArchivoMb > 0;
  }

  public calcularPesoTotalMb(capas: readonly DetalleCapaPlano[]): number {
    const totalMb = capas
      .filter(capa => this.validarCapaAprobada(capa))
      .reduce((acc, capa) => acc + capa.pesoArchivoMb, 0);
    return Number(totalMb.toFixed(2));
  }

  public calcularPromedioPoligonos(capas: readonly DetalleCapaPlano[]): number {
    const aprobadas = capas.filter(capa => this.validarCapaAprobada(capa));
    if (aprobadas.length === 0) return 0;
    const sumaPoligonos = aprobadas.reduce((acc, capa) => acc + capa.elementosPoligonales, 0);
    return Number((sumaPoligonos / aprobadas.length).toFixed(1));
  }

  public procesarReportesControl(): readonly ReporteControlPlanos[] {
    return this.proyectos
      .map(proyecto => {
        const capasAprobadas = proyecto.capasPlanos.filter(capa => this.validarCapaAprobada(capa));
        const pesoTotal = this.calcularPesoTotalMb(proyecto.capasPlanos);
        const promedioPoly = this.calcularPromedioPoligonos(proyecto.capasPlanos);

        const tieneRechazos = proyecto.capasPlanos.some(c => c.estado === "RechazadoPorNormativa");

        let estatus: 'Certificado' | 'EnValidacion' | 'NoConforme' = 'EnValidacion';
        if (tieneRechazos) {
          estatus = 'NoConforme';
        } else if (capasAprobadas.length === proyecto.capasPlanos.length && pesoTotal < 250) {
          estatus = 'Certificado';
        }

        return {
          proyecto: `${proyecto.nombreProyecto} [${proyecto.proyectoId}]`,
          lider: proyecto.arquitectoLider,
          software: proyecto.softwareUtilizado,
          totalCapasAprobadas: capasAprobadas.length,
          pesoTotalArchivoMb: pesoTotal,
          promedioElementosPoligonales: promedioPoly,
          estatusBIM: estatus,
        };
      })
      .filter(reporte => reporte.totalCapasAprobadas > 0)
      .sort((a, b) => b.pesoTotalArchivoMb - a.pesoTotalArchivoMb);
  }
}

function imprimirReportePlanos(titulo: string, reportes: readonly ReporteControlPlanos[]): void {
  console.log(`=== [CONTROL DE PLANOS 3D - ARQUITECTURA] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Proyecto: ${item.proyecto} | Líder: ${item.lider} | CAD: ${item.software} | Capas OK: ${item.totalCapasAprobadas} | Peso: ${item.pesoTotalArchivoMb} MB | Polígonos Prom: ${item.promedioElementosPoligonales} | Estatus: ${item.estatusBIM}`
    );
  });
  console.log("==========================================================================================================================\n");
}

const gestorPlanosOficial = new GestorControlPlanos(registroProyectosArquitectura);
const reportePlanosOficial = gestorPlanosOficial.procesarReportesControl();
imprimirReportePlanos("Control Oficial de Planos y Validación BIM", reportePlanosOficial);

// caso: Proyecto arquitectonico con capas rechazadas por normativa y sobrecarga de poligonos
const proyectoCasoLimite: readonly ProyectoArquitectura3D[] = [
  {
    proyectoId: "ARC-9999",
    nombreProyecto: "Megaproyecto Urbanistico Irregular",
    arquitectoLider: "Orion Vestergaard",
    softwareUtilizado: "AutoCAD",
    capasPlanos: [
      { capaId: "CP-99", nombreCapa: "Zonificacion Urbana No Autorizada", categoria: "Topografico", elementosPoligonales: 15000, pesoArchivoMb: 350.0, estado: "RechazadoPorNormativa" }
    ]
  }
];

const gestorPlanosLimite = new GestorControlPlanos(proyectoCasoLimite);
const reportePlanosLimite = gestorPlanosLimite.procesarReportesControl();
imprimirReportePlanos("caso: Proyecto arquitectonico con capas rechazadas por normativa y sobrecarga de poligonos", reportePlanosLimite);