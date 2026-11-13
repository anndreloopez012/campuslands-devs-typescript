export {};

type CategoriaPelicula = 'SciFi' | 'Accion' | 'Drama' | 'Animacion' | 'Terror';
type EstadoAsiento = 'Disponible' | 'Reservado' | 'Ocupado' | 'VIP';

type EventoReservaCine =
  | { readonly tipo: 'RESERVAR_ASIENTO'; readonly asientoId: string; readonly clienteNombre: string }
  | { readonly tipo: 'LIBERAR_ASIENTO'; readonly asientoId: string }
  | { readonly tipo: 'BLOQUEAR_SALA'; readonly motivo: string };

interface AsientoCine {
  readonly asientoId: string;
  readonly fila: string;
  readonly numero: number;
  readonly precioUSD: number;
  readonly estado: EstadoAsiento;
}

interface FuncionCine {
  readonly funcionId: string;
  readonly tituloPelicula: string;
  readonly categoria: CategoriaPelicula;
  readonly salaNombre: string;
  readonly asientosSala: readonly AsientoCine[];
}

interface ReporteReservasCine {
  readonly funcion: string;
  readonly categoria: CategoriaPelicula;
  readonly sala: string;
  readonly totalAsientos: number;
  readonly asientosOcupadosOReservados: number;
  readonly recaudacionPotencialUSD: number;
  readonly estatusOcupacion: 'AltaDemanda' | 'Moderada' | 'BajaAsistencia';
}

const registroFuncionesCine: readonly FuncionCine[] = [
  {
    funcionId: "CIN-6901",
    tituloPelicula: "Interstellar: Remastered IMAX",
    categoria: "SciFi",
    salaNombre: "Sala IMAX 01",
    asientosSala: [
      { asientoId: "A-01", fila: "A", numero: 1, precioUSD: 12.5, estado: "Reservado" },
      { asientoId: "A-02", fila: "A", numero: 2, precioUSD: 12.5, estado: "Ocupado" },
      { asientoId: "A-03", fila: "A", numero: 3, precioUSD: 15.0, estado: "VIP" },
      { asientoId: "A-04", fila: "A", numero: 4, precioUSD: 15.0, estado: "Disponible" }
    ]
  },
  {
    funcionId: "CIN-6902",
    tituloPelicula: "Cyberpunk 2077: The Movie",
    categoria: "Accion",
    salaNombre: "Sala XD 03",
    asientosSala: [
      { asientoId: "B-01", fila: "B", numero: 1, precioUSD: 10.0, estado: "Ocupado" },
      { asientoId: "B-02", fila: "B", numero: 2, precioUSD: 10.0, estado: "Ocupado" },
      { asientoId: "B-03", fila: "B", numero: 3, precioUSD: 14.0, estado: "Reservado" }
    ]
  },
  {
    funcionId: "CIN-6903",
    tituloPelicula: "Studio Ghibli Retrospective",
    categoria: "Animacion",
    salaNombre: "Sala Clásica 02",
    asientosSala: [
      { asientoId: "C-01", fila: "C", numero: 1, precioUSD: 8.5, estado: "Disponible" },
      { asientoId: "C-02", fila: "C", numero: 2, precioUSD: 8.5, estado: "Disponible" }
    ]
  }
];

class GestorReservasCine<T extends FuncionCine> {
  private readonly funciones: readonly T[];

  constructor(funciones: readonly T[]) {
    this.funciones = funciones;
  }

  public async validarFuncionAsync(funcion: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!funcion.funcionId || !funcion.tituloPelicula) {
          reject(new Error(`Función de cine inválida o sin título: ${funcion.funcionId}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public aplicarReductorReserva(asientos: readonly AsientoCine[], evento: EventoReservaCine): readonly AsientoCine[] {
    switch (evento.tipo) {
      case 'RESERVAR_ASIENTO':
        return asientos.map(a => a.asientoId === evento.asientoId ? { ...a, estado: 'Reservado' } : a);
      case 'LIBERAR_ASIENTO':
        return asientos.map(a => a.asientoId === evento.asientoId ? { ...a, estado: 'Disponible' } : a);
      case 'BLOQUEAR_SALA':
        return asientos.map(a => ({ ...a, estado: 'Ocupado' as EstadoAsiento }));
      default:
        return asientos;
    }
  }

  public calcularRecaudacionPotencial(asientos: readonly AsientoCine[]): number {
    const total = asientos
      .filter(a => a.estado === 'Reservado' || a.estado === 'Ocupado' || a.estado === 'VIP')
      .reduce((acc, a) => acc + a.precioUSD, 0);
    return Number(total.toFixed(2));
  }

  public async procesarReportesReservasAsync(): Promise<readonly ReporteReservasCine[]> {
    const reportes: ReporteReservasCine[] = [];

    for (const func of this.funciones) {
      try {
        await this.validarFuncionAsync(func);
        const totalAsientos = func.asientosSala.length;
        const ocupadosRes = func.asientosSala.filter(
          a => a.estado === 'Reservado' || a.estado === 'Ocupado' || a.estado === 'VIP'
        ).length;
        const recaudacion = this.calcularRecaudacionPotencial(func.asientosSala);

        const porcentajeOcupacion = totalAsientos > 0 ? (ocupadosRes / totalAsientos) * 100 : 0;

        let estatus: 'AltaDemanda' | 'Moderada' | 'BajaAsistencia' = 'Moderada';
        if (porcentajeOcupacion >= 75) {
          estatus = 'AltaDemanda';
        } else if (porcentajeOcupacion < 30) {
          estatus = 'BajaAsistencia';
        }

        reportes.push({
          funcion: `${func.tituloPelicula} [${func.funcionId}]`,
          categoria: func.categoria,
          sala: func.salaNombre,
          totalAsientos: totalAsientos,
          asientosOcupadosOReservados: ocupadosRes,
          recaudacionPotencialUSD: recaudacion,
          estatusOcupacion: estatus,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[Cine Reservas Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => b.recaudacionPotencialUSD - a.recaudacionPotencialUSD);
  }
}

function imprimirReporteCine(titulo: string, reportes: readonly ReporteReservasCine[]): void {
  console.log(`=== [RESERVAS DE CINE DOM - PELICULAS] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Función: ${item.funcion} | Categoría: ${item.categoria} | Sala: ${item.sala} | Asientos Ocup/Res: ${item.asientosOcupadosOReservados}/${item.totalAsientos} | Recaudación: $${item.recaudacionPotencialUSD} | Estatus: ${item.estatusOcupacion}`
    );
  });
  console.log("====================================================================================================================\n");
}

async function ejecutarFlujoReservasCine(): Promise<void> {
  const gestorOficial = new GestorReservasCine(registroFuncionesCine);
  const reporteOficial = await gestorOficial.procesarReportesReservasAsync();
  imprimirReporteCine("Reporte Oficial de Reservas y Ocupación en Salas de Cine", reporteOficial);

  // caso: Funcion experimental con asientos totalmente disponibles y baja asistencia
  const funcionCasoLimite: readonly FuncionCine[] = [
    {
      funcionId: "CIN-9999",
      tituloPelicula: "Prototipo Indie Experimental",
      categoria: "Drama",
      salaNombre: "Sala Alternativa B",
      asientosSala: [
        { asientoId: "X-01", fila: "X", numero: 1, precioUSD: 5.0, estado: "Disponible" },
        { asientoId: "X-02", fila: "X", numero: 2, precioUSD: 5.0, estado: "Disponible" }
      ]
    }
  ];

  const gestorLimite = new GestorReservasCine(funcionCasoLimite);
  const reporteLimite = await gestorLimite.procesarReportesReservasAsync();
  imprimirReporteCine("caso: Funcion experimental con asientos totalmente disponibles y baja asistencia", reporteLimite);
}

ejecutarFlujoReservasCine();