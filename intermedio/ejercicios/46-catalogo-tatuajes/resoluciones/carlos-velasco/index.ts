export {};

// tipos
type EstiloTattoo = 'realismo' | 'blackwork' | 'acua' | 'tradicional';
type TamanoTattoo = 'mini' | 'medio' | 'gran_formato';

interface DisenoTattoo {
  readonly id: number;
  readonly nombre: string;
  estilo: EstiloTattoo;
  tamano: TamanoTattoo;
  horasEstimadas: number;
  fechaDiseno: Date;
}

// clases
class CatalogoTattoo<T extends DisenoTattoo> {
  private readonly disenos = new Map<number, T>();

  agregar(diseno: T): boolean {
    if (diseno.horasEstimadas <= 0 || diseno.fechaDiseno > new Date()) return false;
    this.disenos.set(diseno.id, diseno);
    return true;
  }

  porEstilo(estilo: EstiloTattoo): T[] {
    return [...this.disenos.values()].filter((diseno) => diseno.estilo === estilo);
  }

  masAntiguos(dias: number): T[] {
    const limite = Date.now() - dias * 86_400_000;
    return [...this.disenos.values()].filter((diseno) => diseno.fechaDiseno.getTime() < limite);
  }

  horasTotales(estilo: EstiloTattoo): number {
    return this.porEstilo(estilo).reduce((total, diseno) => total + diseno.horasEstimadas, 0);
  }

  conteoPorTamano(): Record<TamanoTattoo, number> {
    return [...this.disenos.values()].reduce<Record<TamanoTattoo, number>>((conteo, diseno) => {
      conteo[diseno.tamano] += 1;
      return conteo;
    }, { mini: 0, medio: 0, gran_formato: 0 });
  }
}

// datos
const hace90Dias = new Date(Date.now() - 90 * 86_400_000);
const hace20Dias = new Date(Date.now() - 20 * 86_400_000);

const disenos: DisenoTattoo[] = [
  { id: 1, nombre: 'Lobo geometrico', estilo: 'blackwork', tamano: 'medio', horasEstimadas: 5, fechaDiseno: hace90Dias },
  { id: 2, nombre: 'Retrato abuelo', estilo: 'realismo', tamano: 'gran_formato', horasEstimadas: 12, fechaDiseno: hace20Dias },
  { id: 3, nombre: 'Ola mini', estilo: 'acua', tamano: 'mini', horasEstimadas: 1.5, fechaDiseno: hace20Dias },
  { id: 4, nombre: 'Golondrina clasica', estilo: 'tradicional', tamano: 'medio', horasEstimadas: -2, fechaDiseno: hace90Dias },
];

// salida
function mostrarResumen(): void {
  console.log('=== Catalogo de estilos tattoo ===');
  const catalogo = new CatalogoTattoo<DisenoTattoo>();

  disenos.forEach((diseno) => {
    const agregado = catalogo.agregar(diseno);
    console.log(`Diseno ${diseno.id} (${diseno.estilo}): ${agregado ? 'agregado' : 'rechazado'}`);
  });

  console.log(`Horas estimadas en blackwork: ${catalogo.horasTotales('blackwork')}`);
  console.log('Por tamano:', JSON.stringify(catalogo.conteoPorTamano()));
  console.log('Diseños con mas de 60 dias:', catalogo.masAntiguos(60).map((diseno) => diseno.nombre).join(', '));
  console.log('Realismo disponible:', catalogo.porEstilo('realismo').map((diseno) => diseno.nombre).join(', '));
}

mostrarResumen();
