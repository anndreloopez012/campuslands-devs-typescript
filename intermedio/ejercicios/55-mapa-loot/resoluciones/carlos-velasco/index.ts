export {};

// tipos
type ZonaMapa = 'norte' | 'sur' | 'este' | 'oeste';
type TipoLoot = 'arma' | 'curacion' | 'municion' | 'equipo';

interface PuntoLoot {
  readonly id: number;
  readonly nombre: string;
  zona: ZonaMapa;
  botin: TipoLoot[];
  nivelRiesgo: number;
}

// errores
class ErrorZonaDesconocida extends Error {
  constructor(zona: string) {
    super(`zona "${zona}" no existe en el mapa`);
    this.name = 'ErrorZonaDesconocida';
  }
}

// clases
class MapaLoot {
  private readonly puntos = new Map<number, PuntoLoot>();

  agregar(punto: PuntoLoot): void {
    this.puntos.set(punto.id, punto);
  }

  async buscarPorZona(zona: string): Promise<PuntoLoot[]> {
    await new Promise((resolver) => setTimeout(resolver, 10));
    if (!esZonaValida(zona)) throw new ErrorZonaDesconocida(zona);

    return [...this.puntos.values()]
      .filter((punto) => punto.zona === zona)
      .sort((a, b) => a.nivelRiesgo - b.nivelRiesgo);
  }

  botinTotal(): Record<TipoLoot, number> {
    return [...this.puntos.values()].reduce<Record<TipoLoot, number>>((conteo, punto) => {
      punto.botin.forEach((tipo) => {
        conteo[tipo] += 1;
      });
      return conteo;
    }, { arma: 0, curacion: 0, municion: 0, equipo: 0 });
  }

  rutaSegura(): PuntoLoot[] {
    return [...this.puntos.values()].sort((a, b) => a.nivelRiesgo - b.nivelRiesgo).slice(0, 3);
  }
}

// validacion
function esZonaValida(zona: string): zona is ZonaMapa {
  return ['norte', 'sur', 'este', 'oeste'].includes(zona);
}

// datos
const puntos: PuntoLoot[] = [
  { id: 1, nombre: 'Gasolinera', zona: 'sur', botin: ['arma', 'municion'], nivelRiesgo: 4 },
  { id: 2, nombre: 'Granja abandonada', zona: 'norte', botin: ['curacion', 'equipo'], nivelRiesgo: 1 },
  { id: 3, nombre: 'Central electrica', zona: 'este', botin: ['arma', 'equipo', 'municion'], nivelRiesgo: 5 },
  { id: 4, nombre: 'Cabaña del lago', zona: 'oeste', botin: ['curacion'], nivelRiesgo: 2 },
];

// salida
function mostrarResumen(): void {
  console.log('=== Mapa de loot battle royale ===');
  const mapa = new MapaLoot();
  puntos.forEach((punto) => mapa.agregar(punto));

  void (async () => {
    for (const zona of ['sur', 'centro']) {
      try {
        const encontrados = await mapa.buscarPorZona(zona);
        console.log(`${zona}: ${encontrados.map((punto) => punto.nombre).join(', ') || 'vacio'}`);
      } catch (error) {
        console.log(`Busqueda fallida: ${error instanceof Error ? error.message : 'desconocido'}`);
      }
    }

    console.log('Botin total del mapa:', JSON.stringify(mapa.botinTotal()));
    console.log('Ruta segura:', mapa.rutaSegura().map((punto) => punto.nombre).join(' -> '));
  })();
}

mostrarResumen();
