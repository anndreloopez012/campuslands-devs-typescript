export {};

// tipos
type EstadoFichaje = 'interese' | 'oferta' | 'cerrado' | 'cancelado';

interface Fichaje {
  readonly id: number;
  readonly jugador: string;
  readonly clubOrigen: string;
  readonly clubDestino: string;
  montoUsd: number;
  estado: EstadoFichaje;
}

interface ReporteMercado {
  totalInvertidoUsd: number;
  porClub: Record<string, number>;
  fichajesCerrados: number;
  fichajeCaro: Fichaje | null;
}

// errores
class ErrorMontoInvalido extends Error {
  constructor(id: number) {
    super(`fichaje ${id} con monto invalido`);
    this.name = 'ErrorMontoInvalido';
  }
}

// clases
class MercadoFichajes {
  private readonly fichajes: Fichaje[] = [];

  async registrar(fichaje: Fichaje): Promise<void> {
    await new Promise((resolver) => setTimeout(resolver, 5));
    if (fichaje.montoUsd < 0) throw new ErrorMontoInvalido(fichaje.id);
    this.fichajes.push(fichaje);
  }

  cerrar(id: number): boolean {
    const fichaje = this.fichajes.find((item) => item.id === id);
    if (!fichaje || fichaje.estado === 'cerrado') return false;
    fichaje.estado = 'cerrado';
    return true;
  }

  reportar(): ReporteMercado {
    const cerrados = this.fichajes.filter((fichaje) => fichaje.estado === 'cerrado');

    return {
      totalInvertidoUsd: Number(cerrados.reduce((total, fichaje) => total + fichaje.montoUsd, 0).toFixed(0)),
      porClub: agruparPorClub(cerrados),
      fichajesCerrados: cerrados.length,
      fichajeCaro: cerrados.reduce<Fichaje | null>((caro, fichaje) => (caro === null || fichaje.montoUsd > caro.montoUsd ? fichaje : caro), null),
    };
  }
}

// validacion
function agruparPorClub(fichajes: Fichaje[]): Record<string, number> {
  return fichajes.reduce<Record<string, number>>((totales, fichaje) => {
    totales[fichaje.clubDestino] = (totales[fichaje.clubDestino] ?? 0) + fichaje.montoUsd;
    return totales;
  }, {});
}

// datos
const fichajes: Fichaje[] = [
  { id: 1, jugador: 'Dante Rio', clubOrigen: 'Rio FC', clubDestino: 'Aurelia SC', montoUsd: 18_000_000, estado: 'interese' },
  { id: 2, jugador: 'Aroa Silva', clubOrigen: 'Norte FC', clubDestino: 'Aurelia SC', montoUsd: 25_500_000, estado: 'oferta' },
  { id: 3, jugador: 'Luca Mano', clubOrigen: 'Puerto FC', clubDestino: 'Corvus UD', montoUsd: -1, estado: 'interese' },
  { id: 4, jugador: 'Muro Ferro', clubOrigen: 'Rio FC', clubDestino: 'Corvus UD', montoUsd: 9_000_000, estado: 'oferta' },
];

// salida
function mostrarResumen(): void {
  console.log('=== Mercado de fichajes futbol ===');
  const mercado = new MercadoFichajes();

  void (async () => {
    for (const fichaje of fichajes) {
      try {
        await mercado.registrar(fichaje);
        console.log(`Fichaje ${fichaje.id} (${fichaje.jugador}): registrado`);
      } catch (error) {
        console.log(`Fichaje ${fichaje.id}: ${error instanceof Error ? error.message : 'desconocido'}`);
      }
    }

    mercado.cerrar(1);
    mercado.cerrar(2);
    mercado.cerrar(1);

    const reporte = mercado.reportar();
    console.log(`Total invertido: $${reporte.totalInvertidoUsd} | Cerrados: ${reporte.fichajesCerrados}`);
    console.log('Por club:', JSON.stringify(reporte.porClub));
    console.log(`Fichaje mas caro: ${reporte.fichajeCaro ? `${reporte.fichajeCaro.jugador} ($${reporte.fichajeCaro.montoUsd})` : 'ninguno'}`);
  })();
}

mostrarResumen();
