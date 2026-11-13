export {};

type EstiloTattoo = 'NeoTradicional' | 'Blackwork' | 'Realismo' | 'Japones' | 'Minimalista';
type ComplejidadDiseno = 'Baja' | 'Media' | 'Alta' | 'Extrema';
type EstadoDisponibilidad = 'Disponible' | 'EnAgenda' | 'Agotado';

interface ElementoPortfolio {
  readonly piezaId: string;
  readonly tituloPieza: string;
  readonly estilo: EstiloTattoo;
  readonly sesionesEstimadas: number;
  readonly costoBaseUSD: number;
  readonly complejidad: ComplejidadDiseno;
  readonly estado: EstadoDisponibilidad;
}

interface ArtistaTatuadorPortfolio {
  readonly artistaId: string;
  readonly nombreArtistico: string;
  readonly especialidadPrincipal: EstiloTattoo;
  readonly anosExperiencia: number;
  readonly portfolioPiezas: readonly ElementoPortfolio[];
}

interface ReporteCatalogoTattoo {
  readonly artista: string;
  readonly especialidad: EstiloTattoo;
  readonly totalPiezasPortfolio: number;
  readonly costoPromedioUSD: number;
  readonly sesionesMaximas: number;
  readonly calificacionRendimiento: 'Estelar' | 'Especializado' | 'EnRevision';
}

const registroEstudiosTattoo: readonly ArtistaTatuadorPortfolio[] = [
  {
    artistaId: "TAT-4601",
    nombreArtistico: "Zephyrine Vane",
    especialidadPrincipal: "NeoTradicional",
    anosExperiencia: 9,
    portfolioPiezas: [
      { piezaId: "P-01", tituloPieza: "Pantera y Rosas Silvestres", estilo: "NeoTradicional", sesionesEstimadas: 2, costoBaseUSD: 450, complejidad: "Media", estado: "Disponible" },
      { piezaId: "P-02", tituloPieza: "Sacerdotisa Astrologica", estilo: "NeoTradicional", sesionesEstimadas: 4, costoBaseUSD: 900, complejidad: "Alta", estado: "EnAgenda" }
    ]
  },
  {
    artistaId: "TAT-4602",
    nombreArtistico: "Kaelen Kurosaki",
    especialidadPrincipal: "Blackwork",
    anosExperiencia: 7,
    portfolioPiezas: [
      { piezaId: "P-03", tituloPieza: "Mandalas Geometricos Sagrados", estilo: "Blackwork", sesionesEstimadas: 3, costoBaseUSD: 600, complejidad: "Alta", estado: "Disponible" },
      { piezaId: "P-04", tituloPieza: "Kitsune Mitologico", estilo: "Blackwork", sesionesEstimadas: 5, costoBaseUSD: 1200, complejidad: "Extrema", estado: "EnAgenda" },
      { piezaId: "P-05", tituloPieza: "Banda Minimalista Ouroboros", estilo: "Minimalista", sesionesEstimadas: 1, costoBaseUSD: 180, complejidad: "Baja", estado: "Disponible" }
    ]
  },
  {
    artistaId: "TAT-4603",
    nombreArtistico: "Thalassa Althaus",
    especialidadPrincipal: "Realismo",
    anosExperiencia: 12,
    portfolioPiezas: [
      { piezaId: "P-06", tituloPieza: "Retrato de Leon en Claroscuro", estilo: "Realismo", sesionesEstimadas: 4, costoBaseUSD: 1100, complejidad: "Extrema", estado: "EnAgenda" },
      { piezaId: "P-07", tituloPieza: "Nebulosa Galactica Espacial", estilo: "Realismo", sesionesEstimadas: 3, costoBaseUSD: 850, complejidad: "Alta", estado: "Disponible" }
    ]
  },
  {
    artistaId: "TAT-4604",
    nombreArtistico: "Zephyrin Moreau",
    especialidadPrincipal: "Japones",
    anosExperiencia: 6,
    portfolioPiezas: [
      { piezaId: "P-08", tituloPieza: "Dragon Torso Completo", estilo: "Japones", sesionesEstimadas: 8, costoBaseUSD: 2500, complejidad: "Extrema", estado: "Agotado" }
    ]
  }
];

class AdministradorCatalogoTattoo<T extends ArtistaTatuadorPortfolio> {
  private readonly artistas: readonly T[];

  constructor(artistas: readonly T[]) {
    this.artistas = artistas;
  }

  public validarArtistaActivo(artista: T): boolean {
    return artista.anosExperiencia >= 3 && artista.portfolioPiezas.length > 0;
  }

  public calcularCostoPromedio(piezas: readonly ElementoPortfolio[]): number {
    if (piezas.length === 0) return 0;
    const suma = piezas.reduce((acc, p) => acc + p.costoBaseUSD, 0);
    return Number((suma / piezas.length).toFixed(2));
  }

  public obtenerSesionesMaximas(piezas: readonly ElementoPortfolio[]): number {
    if (piezas.length === 0) return 0;
    return Math.max(...piezas.map(p => p.sesionesEstimadas));
  }

  public procesarReportesCatalogo(): readonly ReporteLogTattoo[] {
    return this.artistas
      .filter(artista => this.validarArtistaActivo(artista))
      .map(artista => {
        const costoProm = this.calcularCostoPromedio(artista.portfolioPiezas);
        const maxSesiones = this.obtenerSesionesMaximas(artista.portfolioPiezas);
        const totalPiezas = artista.portfolioPiezas.length;

        let calificacion: 'Estelar' | 'Especializado' | 'EnRevision' = 'Especializado';
        if (totalPiezas >= 3 && artista.anosExperiencia >= 8) {
          calificacion = 'Estelar';
        } else if (totalPiezas === 1) {
          calificacion = 'EnRevision';
        }

        return {
          artista: `${artista.nombreArtistico} [${artista.artistaId}]`,
          especialidad: artista.especialidadPrincipal,
          totalPiezasPortfolio: totalPiezas,
          costoPromedioUSD: costoProm,
          sesionesMaximas: maxSesiones,
          calificacionRendimiento: calificacion,
        };
      })
      .sort((a, b) => b.totalPiezasPortfolio - a.totalPiezasPortfolio);
  }
}

type ReporteLogTattoo = ReporteCatalogoTattoo;

function imprimirReporteCatalogo(titulo: string, reportes: readonly ReporteCatalogoTattoo[]): void {
  console.log(`=== [CATALOGO DE ESTILOS TATTOO - TATUAJES] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Artista: ${item.artista} | Especialidad: ${item.especialidad} | Piezas: ${item.totalPiezasPortfolio} | Costo Prom: $${item.costoPromedioUSD} | Sesiones Máx: ${item.sesionesMaximas} | Nivel: ${item.calificacionRendimiento}`
    );
  });
  console.log("====================================================================================================================\n");
}

const adminTattooOficial = new AdministradorCatalogoTattoo(registroEstudiosTattoo);
const reporteCatalogoOficial = adminTattooOficial.procesarReportesCatalogo();
imprimirReporteCatalogo("Directorio Oficial de Artistas y Portfolio", reporteCatalogoOficial);

// caso: Artista junior con bajo stock en portfolio y piezas agotadas unicamente
const artistaCasoLimite: readonly ArtistaTatuadorPortfolio[] = [
  {
    artistaId: "TAT-9999",
    nombreArtistico: "Xanthe Belmonte",
    especialidadPrincipal: "Minimalista",
    anosExperiencia: 2,
    portfolioPiezas: [
      { piezaId: "P-99", tituloPieza: "Simbolo Runico Arcano", estilo: "Minimalista", sesionesEstimadas: 1, costoBaseUSD: 90, complejidad: "Baja", estado: "Agotado" }
    ]
  }
];

const adminTattooLimite = new AdministradorCatalogoTattoo(artistaCasoLimite);
const reporteCatalogoLimite = adminTattooLimite.procesarReportesCatalogo();
imprimirReporteCatalogo("caso: Artista junior con bajo stock en portfolio y piezas agotadas unicamente", reporteCatalogoLimite);