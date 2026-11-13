export {};

type CategoriaAtractivo = 'Cultural' | 'Natural' | 'Gastronomico' | 'Aventura' | 'Historico';
type EstadoRuta = 'Optima' | 'Congestionada' | 'CerradaPorClima';
type NivelDificultad = 'Bajo' | 'Moderado' | 'Alto';

interface PuntoInteres {
  readonly puntoId: string;
  readonly nombre: string;
  readonly categoria: CategoriaAtractivo;
  readonly duracionEstimadaMin: number;
  readonly costoEntradaUSD: number;
  readonly calificacionVisitantes: number;
}

interface RutaTuristica {
  readonly rutaId: string;
  readonly nombreRuta: string;
  readonly ciudadRegion: string;
  readonly fechaProgramada: string;
  readonly dificultad: NivelDificultad;
  readonly estadoActual: EstadoRuta;
  readonly puntosInteres: readonly PuntoInteres[];
}

interface ReporteRutaInteligente {
  readonly ruta: string;
  readonly region: string;
  readonly totalParadas: number;
  readonly duracionTotalHoras: number;
  readonly inversionTotalUSD: number;
  readonly puntajeAtractivoPromedio: number;
  readonly disponibilidad: EstadoRuta;
}

const catalogoRutasTuristicas: readonly RutaTuristica[] = [
  {
    rutaId: "RT-4401",
    nombreRuta: "Circuito Colonial y Volcanes",
    ciudadRegion: "Antigua Guatemala",
    fechaProgramada: "2026-11-20",
    dificultad: "Moderado",
    estadoActual: "Optima",
    puntosInteres: [
      { puntoId: "PI-01", nombre: "Arco de Santa Catalina", categoria: "Historico", duracionEstimadaMin: 45, costoEntradaUSD: 0, calificacionVisitantes: 4.8 },
      { puntoId: "PI-02", nombre: "Cerro de la Cruz", categoria: "Natural", duracionEstimadaMin: 60, costoEntradaUSD: 0, calificacionVisitantes: 4.7 },
      { puntoId: "PI-03", nombre: "Convento Capuchinas", categoria: "Cultural", duracionEstimadaMin: 90, costoEntradaUSD: 6, calificacionVisitantes: 4.6 },
      { puntoId: "PI-04", nombre: "Mercado de Artesanias y Tipicos", categoria: "Gastronomico", duracionEstimadaMin: 75, costoEntradaUSD: 15, calificacionVisitantes: 4.5 }
    ]
  },
  {
    rutaId: "RT-4402",
    nombreRuta: "Expedicion Arqueologica Maya",
    ciudadRegion: "Peten",
    fechaProgramada: "2026-11-22",
    dificultad: "Alto",
    estadoActual: "Optima",
    puntosInteres: [
      { puntoId: "PI-05", nombre: "Gran Plaza de Tikal", categoria: "Historico", duracionEstimadaMin: 180, costoEntradaUSD: 22, calificacionVisitantes: 4.9 },
      { puntoId: "PI-06", nombre: "Templo IV Serpiente Bicefala", categoria: "Aventura", duracionEstimadaMin: 90, costoEntradaUSD: 0, calificacionVisitantes: 4.9 },
      { puntoId: "PI-07", nombre: "Isla de Flores", categoria: "Cultural", duracionEstimadaMin: 120, costoEntradaUSD: 10, calificacionVisitantes: 4.6 }
    ]
  },
  {
    rutaId: "RT-4403",
    nombreRuta: "Travesia Pueblos del Lago",
    ciudadRegion: "Solola - Atitlan",
    fechaProgramada: "2026-11-25",
    dificultad: "Moderado",
    estadoActual: "Congestionada",
    puntosInteres: [
      { puntoId: "PI-08", nombre: "San Juan La Laguna Cooperativas", categoria: "Cultural", duracionEstimadaMin: 110, costoEntradaUSD: 5, calificacionVisitantes: 4.8 },
      { puntoId: "PI-09", nombre: "Reserva Natural Atitlan", categoria: "Natural", duracionEstimadaMin: 150, costoEntradaUSD: 12, calificacionVisitantes: 4.7 }
    ]
  },
  {
    rutaId: "RT-4404",
    nombreRuta: "Sendero Pozas Turquesa",
    ciudadRegion: "Alta Verapaz",
    fechaProgramada: "2026-11-28",
    dificultad: "Alto",
    estadoActual: "CerradaPorClima",
    puntosInteres: [
      { puntoId: "PI-10", nombre: "Mirador Semuc Champey", categoria: "Aventura", duracionEstimadaMin: 120, costoEntradaUSD: 8, calificacionVisitantes: 4.9 },
      { puntoId: "PI-11", nombre: "Cuevas de Kanba", categoria: "Aventura", duracionEstimadaMin: 90, costoEntradaUSD: 10, calificacionVisitantes: 4.6 }
    ]
  }
];

class PlanificadorRutasTuristicas<T extends RutaTuristica> {
  private readonly rutas: readonly T[];

  constructor(rutas: readonly T[]) {
    this.rutas = rutas;
  }

  public validarRutaOperativa(ruta: T): boolean {
    return ruta.estadoActual !== "CerradaPorClima" && ruta.puntosInteres.length > 0;
  }

  public calcularDuracionHoras(puntos: readonly PuntoInteres[]): number {
    const totalMinutos = puntos.reduce((acc, punto) => acc + punto.duracionEstimadaMin, 0);
    return Number((totalMinutos / 60).toFixed(2));
  }

  public calcularCostoTotal(puntos: readonly PuntoInteres[]): number {
    return puntos.reduce((acc, punto) => acc + punto.costoEntradaUSD, 0);
  }

  public calcularPromedioCalificacion(puntos: readonly PuntoInteres[]): number {
    if (puntos.length === 0) return 0;
    const suma = puntos.reduce((acc, punto) => acc + punto.calificacionVisitantes, 0);
    return Number((suma / puntos.length).toFixed(2));
  }

  public generarReportes(): readonly ReporteRutaInteligente[] {
    return this.rutas
      .filter(ruta => this.validarRutaOperativa(ruta))
      .map(ruta => ({
        ruta: `${ruta.nombreRuta} [${ruta.rutaId}]`,
        region: ruta.ciudadRegion,
        totalParadas: ruta.puntosInteres.length,
        duracionTotalHoras: this.calcularDuracionHoras(ruta.puntosInteres),
        inversionTotalUSD: this.calcularCostoTotal(ruta.puntosInteres),
        puntajeAtractivoPromedio: this.calcularPromedioCalificacion(ruta.puntosInteres),
        disponibilidad: ruta.estadoActual,
      }))
      .sort((a, b) => b.puntajeAtractivoPromedio - a.puntajeAtractivoPromedio);
  }
}

function imprimirReporteRutas(titulo: string, reportes: readonly ReporteRutaInteligente[]): void {
  console.log(`=== [RUTAS TURISTICAS INTELIGENTES] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Ruta: ${item.ruta} | Region: ${item.region} | Paradas: ${item.totalParadas} | Duracion: ${item.duracionTotalHoras} hrs | Costo: $${item.inversionTotalUSD} | Rating: ${item.puntajeAtractivoPromedio}/5 | Estado: ${item.disponibilidad}`
    );
  });
  console.log("================================================================================================================\n");
}

const planificadorOficial = new PlanificadorRutasTuristicas(catalogoRutasTuristicas);
const reporteRutasActivas = planificadorOficial.generarReportes();
imprimirReporteRutas("Catalogo de Rutas Disponibles", reporteRutasActivas);

// caso: Ruta con cierre climatico y ruta sin puntos de interes registrados
const rutasCasoLimite: readonly RutaTuristica[] = [
  {
    rutaId: "RT-9998",
    nombreRuta: "Ascenso Volcan Acatenango Nocturno",
    ciudadRegion: "Sacatepequez",
    fechaProgramada: "2026-12-05",
    dificultad: "Alto",
    estadoActual: "CerradaPorClima",
    puntosInteres: [
      { puntoId: "PI-98", nombre: "Campamento Base", categoria: "Aventura", duracionEstimadaMin: 300, costoEntradaUSD: 15, calificacionVisitantes: 4.9 }
    ]
  },
  {
    rutaId: "RT-9999",
    nombreRuta: "Ruta en Construccion Sin Paradas",
    ciudadRegion: "Izabal",
    fechaProgramada: "2026-12-10",
    dificultad: "Bajo",
    estadoActual: "Optima",
    puntosInteres: []
  }
];

const planificadorLimite = new PlanificadorRutasTuristicas(rutasCasoLimite);
const reporteLimite = planificadorLimite.generarReportes();
imprimirReporteRutas("caso: Ruta con cierre climatico y ruta sin puntos de interes registrados", reporteLimite);