export {};

// tipos
interface AutoPremium {
  readonly id: number;
  readonly modelo: string;
  caballos: number;
  precioUsd: number;
  aceleracion0a100: number;
}

interface Comparacion {
  readonly mejorRendimiento: AutoPremium | null;
  readonly mejorPrecio: AutoPremium | null;
  readonly diferenciaPrecioUsd: number;
}

// errores
class ErrorCatalogoVacio extends Error {
  constructor() {
    super('no hay autos para comparar');
    this.name = 'ErrorCatalogoVacio';
  }
}

// datos remotos simulados
async function obtenerCatalogo(fuente: 'principal' | 'respaldo'): Promise<AutoPremium[]> {
  await new Promise((resolver) => setTimeout(resolver, 5));
  if (fuente === 'respaldo') throw new ErrorRedFuente();

  return [
    { id: 1, modelo: 'Solaris GT', caballos: 1500, precioUsd: 2_900_000, aceleracion0a100: 2.4 },
    { id: 2, modelo: 'Vendetta R', caballos: 1100, precioUsd: 1_400_000, aceleracion0a100: 2.9 },
    { id: 3, modelo: 'Nube Evo', caballos: 1350, precioUsd: 2_200_000, aceleracion0a100: 2.6 },
  ];
}

class ErrorRedFuente extends Error {
  constructor() {
    super('la fuente de datos no responde');
    this.name = 'ErrorRedFuente';
  }
}

// calculos
function scoreRendimiento(auto: AutoPremium): number {
  return Number((auto.caballos / auto.aceleracion0a100).toFixed(0));
}

function comparar(autos: AutoPremium[]): Comparacion {
  if (autos.length === 0) return { mejorRendimiento: null, mejorPrecio: null, diferenciaPrecioUsd: 0 };

  const porRendimiento = [...autos].sort((a, b) => scoreRendimiento(b) - scoreRendimiento(a));
  const porPrecio = [...autos].sort((a, b) => a.precioUsd - b.precioUsd);
  const mejorPrecio = porPrecio[0];
  const mejorPrecioAlto = porPrecio[porPrecio.length - 1];

  return {
    mejorRendimiento: porRendimiento[0],
    mejorPrecio,
    diferenciaPrecioUsd: mejorPrecioAlto.precioUsd - mejorPrecio.precioUsd,
  };
}

// salida
function mostrarResumen(): void {
  console.log('=== Comparador de autos premium ===');

  void (async () => {
    let autos: AutoPremium[] = [];
    for (const fuente of ['principal', 'respaldo'] as const) {
      try {
        autos = await obtenerCatalogo(fuente);
        console.log(`Catalogo obtenido de: ${fuente}`);
        break;
      } catch (error) {
        console.log(`Fuente ${fuente} fallo: ${error instanceof Error ? error.message : 'desconocido'}`);
      }
    }

    if (autos.length === 0) {
      console.log('ErrorCatalogoVacio: sin datos para comparar');
      return;
    }

    const comparacion = comparar(autos);
    autos.forEach((auto) => {
      console.log(`${auto.modelo} | Score: ${scoreRendimiento(auto)} | $${auto.precioUsd} | 0-100: ${auto.aceleracion0a100}s`);
    });
    console.log(`Mejor rendimiento: ${comparacion.mejorRendimiento?.modelo ?? 'n/a'}`);
    console.log(`Mejor precio: ${comparacion.mejorPrecio?.modelo ?? 'n/a'} | Brecha: $${comparacion.diferenciaPrecioUsd}`);
  })();
}

mostrarResumen();
