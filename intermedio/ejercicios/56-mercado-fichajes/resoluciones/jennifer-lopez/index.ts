export {};

type PosicionFutbol = 'Portero' | 'Defensa' | 'Mediocampista' | 'Delantero';
type EstadoNegociacion = 'FichajeCompletado' | 'EnNegociacion' | 'RechazadoPorClausula' | 'Cancelado';
type CategoriaValorMercado = 'EstrellaMundial' | 'ClaseAlta' | 'Promesa' | 'Rotacion';

interface OfertaFichaje {
  readonly ofertaId: string;
  readonly clubComprador: string;
  readonly montoOfrecidoMUSD: number;
  readonly salarioAnualMUSD: number;
  readonly porcentajeClausulaRescision: number;
  readonly estado: EstadoNegociacion;
}

interface FutbolistaMercado {
  readonly jugadorId: string;
  readonly nombreCompleto: string;
  readonly posicion: PosicionFutbol;
  readonly edad: number;
  readonly valorMercadoMUSD: number;
  readonly categoria: CategoriaValorMercado;
  readonly ofertasRecibidas: readonly OfertaFichaje[];
}

interface ReporteMercadoFichajes {
  readonly futbolista: string;
  readonly posicion: PosicionFutbol;
  readonly valorBaseMUSD: number;
  readonly mejorOfertaMUSD: number;
  readonly totalOfertasValidas: number;
  readonly estatusTraspaso: 'Exitoso' | 'BajoValor' | 'Bloqueado';
}

const registroFutbolistasMercado: readonly FutbolistaMercado[] = [
  {
    jugadorId: "FTB-5601",
    nombreCompleto: "Kylian Vane",
    posicion: "Delantero",
    edad: 26,
    valorMercadoMUSD: 180,
    categoria: "EstrellaMundial",
    ofertasRecibidas: [
      { ofertaId: "OF-01", clubComprador: "Galactic FC", montoOfrecidoMUSD: 195, salarioAnualMUSD: 25, porcentajeClausulaRescision: 100, estado: "FichajeCompletado" },
      { ofertaId: "OF-02", clubComprador: "Royal United", montoOfrecidoMUSD: 170, salarioAnualMUSD: 22, porcentajeClausulaRescision: 85, estado: "EnNegociacion" }
    ]
  },
  {
    jugadorId: "FTB-5602",
    nombreCompleto: "Jude Althaus",
    posicion: "Mediocampista",
    edad: 21,
    valorMercadoMUSD: 150,
    categoria: "EstrellaMundial",
    ofertasRecibidas: [
      { ofertaId: "OF-03", clubComprador: "Bavaria Athletic", montoOfrecidoMUSD: 160, salarioAnualMUSD: 18, porcentajeClausulaRescision: 90, estado: "FichajeCompletado" }
    ]
  },
  {
    jugadorId: "FTB-5603",
    nombreCompleto: "Thibaut Kurosaki",
    posicion: "Portero",
    edad: 32,
    valorMercadoMUSD: 45,
    categoria: "ClaseAlta",
    ofertasRecibidas: [
      { ofertaId: "OF-04", clubComprador: "Anatolian Lions", montoOfrecidoMUSD: 40, salarioAnualMUSD: 8, porcentajeClausulaRescision: 70, estado: "RechazadoPorClausula" }
    ]
  },
  {
    jugadorId: "FTB-5604",
    nombreCompleto: "William Saliba-Moreau",
    posicion: "Defensa",
    edad: 23,
    valorMercadoMUSD: 80,
    categoria: "ClaseAlta",
    ofertasRecibidas: [
      { ofertaId: "OF-05", clubComprador: "Metropolitan SC", montoOfrecidoMUSD: 85, salarioAnualMUSD: 12, porcentajeClausulaRescision: 95, estado: "FichajeCompletado" }
    ]
  }
];

class GestorMercadoFichajes<T extends FutbolistaMercado> {
  private readonly futbolistas: readonly T[];

  constructor(futbolistas: readonly T[]) {
    this.futbolistas = futbolistas;
  }

  public async validarJugadorMercadoAsync(jugador: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!jugador.jugadorId || jugador.valorMercadoMUSD <= 0) {
          reject(new Error(`Futbolista inválido en el mercado de fichajes: ${jugador.nombreCompleto}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public obtenerMejorOferta(ofertas: readonly OfertaFichaje[]): number {
    const validas = ofertas.filter(o => o.estado === "FichajeCompletado" || o.estado === "EnNegociacion");
    if (validas.length === 0) return 0;
    return Math.max(...validas.map(o => o.montoOfrecidoMUSD));
  }

  public async procesarReportesMercadoAsync(): Promise<readonly ReporteMercadoFichajes[]> {
    const reportes: ReporteMercadoFichajes[] = [];

    for (const jugador of this.futbolistas) {
      try {
        await this.validarJugadorMercadoAsync(jugador);
        const mejorOferta = this.obtenerMejorOferta(jugador.ofertasRecibidas);
        const ofertasValidas = jugador.ofertasRecibidas.filter(o => o.estado !== "Cancelado").length;

        const tieneRechazoClausula = jugador.ofertasRecibidas.some(o => o.estado === "RechazadoPorClausula");

        let estatus: 'Exitoso' | 'BajoValor' | 'Bloqueado' = 'Exitoso';
        if (tieneRechazoClausula) {
          estatus = 'Bloqueado';
        } else if (mejorOferta < jugador.valorMercadoMUSD) {
          estatus = 'BajoValor';
        }

        reportes.push({
          futbolista: `${jugador.nombreCompleto} [${jugador.jugadorId}]`,
          posicion: jugador.posicion,
          valorBaseMUSD: jugador.valorMercadoMUSD,
          mejorOfertaMUSD: mejorOferta,
          totalOfertasValidas: ofertasValidas,
          estatusTraspaso: estatus,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[Mercado Fichajes Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => b.mejorOfertaMUSD - a.mejorOfertaMUSD);
  }
}

function imprimirReporteFichajes(titulo: string, reportes: readonly ReporteMercadoFichajes[]): void {
  console.log(`=== [MERCADO DE FICHAJES FUTBOL - FUTBOL] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Jugador: ${item.futbolista} | Posición: ${item.posicion} | Valor Base: $${item.valorBaseMUSD}M | Mejor Oferta: $${item.mejorOfertaMUSD}M | Ofertas Válidas: ${item.totalOfertasValidas} | Estatus: ${item.estatusTraspaso}`
    );
  });
  console.log("====================================================================================================================\n");
}

async function ejecutarFlujoMercadoFichajes(): Promise<void> {
  const gestorOficial = new GestorMercadoFichajes(registroFutbolistasMercado);
  const reporteOficial = await gestorOficial.procesarReportesMercadoAsync();
  imprimirReporteFichajes("Reporte Oficial de Mercado de Fichajes y Traspasos", reporteOficial);

  // caso: Futbolista con oferta rechazada por clausula de rescision y bloqueo institucional
  const jugadorCasoLimite: readonly FutbolistaMercado[] = [
    {
      jugadorId: "FTB-9999",
      nombreCompleto: "Orion Sotomayor",
      posicion: "Delantero",
      edad: 28,
      valorMercadoMUSD: 110,
      categoria: "EstrellaMundial",
      ofertasRecibidas: [
        { ofertaId: "OF-99", clubComprador: "Forbidden Club", montoOfrecidoMUSD: 90, salarioAnualMUSD: 15, porcentajeClausulaRescision: 50, estado: "RechazadoPorClausula" }
      ]
    }
  ];

  const gestorLimite = new GestorMercadoFichajes(jugadorCasoLimite);
  const reporteLimite = await gestorLimite.procesarReportesMercadoAsync();
  imprimirReporteFichajes("caso: Futbolista con oferta rechazada por clausula de rescision y bloqueo institucional", reporteLimite);
}

ejecutarFlujoMercadoFichajes();