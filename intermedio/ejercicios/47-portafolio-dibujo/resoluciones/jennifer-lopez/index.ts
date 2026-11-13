export {};

type TecnicaDibujo = 'Carboncillo' | 'Grafito' | 'Tintas' | 'Pastel' | 'Digital';
type FormatoPapel = 'A4' | 'A3' | 'A2' | 'LienzoPersonalizado';
type EstadoObra = 'Finalizado' | 'EnProceso' | 'BorradorPreliminar';

interface DetalleObraArte {
  readonly obraId: string;
  readonly tituloObra: string;
  readonly tecnica: TecnicaDibujo;
  readonly formato: FormatoPapel;
  readonly horasInvertidas: number;
  readonly calificacionTecnica: number; 
  readonly estado: EstadoObra;
}

interface PortafolioArtista {
  readonly artistaId: string;
  readonly nombreIlustrador: string;
  readonly estiloDominante: 'Realismo' | 'Anime' | 'Cyberpunk' | 'Fantasia' | 'Abstracto';
  readonly obrasRegistradas: readonly DetalleObraArte[];
}

interface ReportePortafolioDibujo {
  readonly ilustrador: string;
  readonly estilo: string;
  readonly totalObrasTerminadas: number;
  readonly horasTotalesTrabajo: number;
  readonly promedioCalificacion: number;
  readonly nivelCuraduria: 'Galeria' | 'Estudio' | 'Borrador';
}

const registroGaleriaIlustracion: readonly PortafolioArtista[] = [
  {
    artistaId: "DRW-4701",
    nombreIlustrador: "Lysandra Kaelen",
    estiloDominante: "Fantasia",
    obrasRegistradas: [
      { obraId: "OB-01", tituloObra: "Santuario de los Susurros", tecnica: "Carboncillo", formato: "A3", horasInvertidas: 24, calificacionTecnica: 92, estado: "Finalizado" },
      { obraId: "OB-02", tituloObra: "Guardian del Bosque Ancestral", tecnica: "Tintas", formato: "A2", horasInvertidas: 35, calificacionTecnica: 95, estado: "Finalizado" },
      { obraId: "OB-03", tituloObra: "Boceto de Dragon Sombrio", tecnica: "Grafito", formato: "A4", horasInvertidas: 8, calificacionTecnica: 78, estado: "BorradorPreliminar" }
    ]
  },
  {
    artistaId: "DRW-4702",
    nombreIlustrador: "Thorne Alistair",
    estiloDominante: "Cyberpunk",
    obrasRegistradas: [
      { obraId: "OB-04", tituloObra: "Neón y Acero en Neo-Tokio", tecnica: "Digital", formato: "LienzoPersonalizado", horasInvertidas: 40, calificacionTecnica: 96, estado: "Finalizado" },
      { obraId: "OB-05", tituloObra: "Ciborg con Implantes Neurometricos", tecnica: "Digital", formato: "A3", horasInvertidas: 28, calificacionTecnica: 88, estado: "Finalizado" }
    ]
  },
  {
    artistaId: "DRW-4703",
    nombreIlustrador: "Zephyrine Vesper",
    estiloDominante: "Realismo",
    obrasRegistradas: [
      { obraId: "OB-06", tituloObra: "Estudio Anatomico de Manos", tecnica: "Grafito", formato: "A4", horasInvertidas: 15, calificacionTecnica: 90, estado: "Finalizado" },
      { obraId: "OB-07", tituloObra: "Retrato de Anciano con Pipa", tecnica: "Carboncillo", formato: "A3", horasInvertidas: 32, calificacionTecnica: 94, estado: "Finalizado" }
    ]
  },
  {
    artistaId: "DRW-4704",
    nombreIlustrador: "Mireia Soldevila",
    estiloDominante: "Abstracto",
    obrasRegistradas: [
      { obraId: "OB-08", tituloObra: "Geometria Onirica Cromatica", tecnica: "Pastel", formato: "A2", horasInvertidas: 18, calificacionTecnica: 82, estado: "EnProceso" }
    ]
  }
];

class GestorPortafolioDibujo<T extends PortafolioArtista> {
  private readonly portafolios: readonly T[];

  constructor(portafolios: readonly T[]) {
    this.portafolios = portafolios;
  }

  public validarObraTerminada(obra: DetalleObraArte): boolean {
    return obra.estado === "Finalizado" && obra.horasInvertidas > 0;
  }

  public calcularHorasTotales(obras: readonly DetalleObraArte[]): number {
    return obras
      .filter(obra => this.validarObraTerminada(obra))
      .reduce((acc, obra) => acc + obra.horasInvertidas, 0);
  }

  public calcularCalificacionPromedio(obras: readonly DetalleObraArte[]): number {
    const terminadas = obras.filter(obra => this.validarObraTerminada(obra));
    if (terminadas.length === 0) return 0;
    const suma = terminadas.reduce((acc, obra) => acc + obra.calificacionTecnica, 0);
    return Number((suma / terminadas.length).toFixed(1));
  }

  public procesarReportesPortafolio(): readonly ReportePortafolioDibujo[] {
    return this.portafolios
      .map(portafolio => {
        const obrasTerminadas = portafolio.obrasRegistradas.filter(obra => this.validarObraTerminada(obra));
        const horasTotales = this.calcularHorasTotales(portafolio.obrasRegistradas);
        const promedioCal = this.calcularCalificacionPromedio(portafolio.obrasRegistradas);

        let curaduria: 'Galeria' | 'Estudio' | 'Borrador' = 'Estudio';
        if (obrasTerminadas.length >= 2 && promedioCal >= 90) {
          curaduria = 'Galeria';
        } else if (obrasTerminadas.length === 0) {
          curaduria = 'Borrador';
        }

        return {
          ilustrador: `${portafolio.nombreIlustrador} [${portafolio.artistaId}]`,
          estilo: portafolio.estiloDominante,
          totalObrasTerminadas: obrasTerminadas.length,
          horasTotalesTrabajo: horasTotales,
          promedioCalificacion: promedioCal,
          nivelCuraduria: curaduria,
        };
      })
      .filter(reporte => reporte.totalObrasTerminadas > 0)
      .sort((a, b) => b.promedioCalificacion - a.promedioCalificacion);
  }
}

function imprimirReportePortafolios(titulo: string, reportes: readonly ReportePortafolioDibujo[]): void {
  console.log(`=== [PORTAFOLIO DE DIBUJO - ILUSTRACION] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Artista: ${item.ilustrador} | Estilo: ${item.estilo} | Obras Fin: ${item.totalObrasTerminadas} | Horas: ${item.horasTotalesTrabajo}h | Score Prom: ${item.promedioCalificacion} | Curaduría: ${item.nivelCuraduria}`
    );
  });
  console.log("====================================================================================================================\n");
}

const gestorDibujoOficial = new GestorPortafolioDibujo(registroGaleriaIlustracion);
const reporteDibujoOficial = gestorDibujoOficial.procesarReportesPortafolio();
imprimirReportePortafolios("Evaluacion Oficial de Portafolios Artísticos", reporteDibujoOficial);

// caso: Artista con obras unicamente en borrador preliminar y sin trabajos finalizados
const portafolioCasoLimite: readonly PortafolioArtista[] = [
  {
    artistaId: "DRW-9999",
    nombreIlustrador: "Cassian Kross",
    estiloDominante: "Anime",
    obrasRegistradas: [
      { obraId: "OB-99", tituloObra: "Concepto de Rostro Base", tecnica: "Grafito", formato: "A4", horasInvertidas: 3, calificacionTecnica: 65, estado: "BorradorPreliminar" }
    ]
  }
];

const gestorDibujoLimite = new GestorPortafolioDibujo(portafolioCasoLimite);
const reporteDibujoLimite = gestorDibujoLimite.procesarReportesPortafolio();
imprimirReportePortafolios("caso: Artista con obras unicamente en borrador preliminar y sin trabajos finalizados", reporteDibujoLimite);