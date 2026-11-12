export {};

// tipos
type TipoClima = 'soleado' | 'lluvia' | 'frio' | 'ventoso';
type EstiloOutfit = 'casual' | 'formal' | 'deportivo';

interface RegistroClima {
  readonly fecha: Date;
  readonly ciudad: string;
  tipo: TipoClima;
  temperaturaC: number;
}

interface PrendaOutfit {
  readonly nombre: string;
  readonly estilos: EstiloOutfit[];
  climas: TipoClima[];
}

interface OutfitSugerido {
  readonly fecha: Date;
  readonly ciudad: string;
  prendas: string[];
}

// clases
class SugeridorOutfit {
  constructor(private readonly prendas: PrendaOutfit[]) {}

  sugerir(registro: RegistroClima): OutfitSugerido {
    const coincidencias = this.prendas
      .filter((prenda) => prenda.climas.includes(registro.tipo))
      .map((prenda) => prenda.nombre);

    return { fecha: registro.fecha, ciudad: registro.ciudad, prendas: [...new Set(coincidencias)] };
  }
}

// validacion
function validarRegistro(registro: RegistroClima): string[] {
  const errores: string[] = [];

  if (registro.temperaturaC < -30 || registro.temperaturaC > 55) errores.push(`${registro.ciudad}: temperatura fuera de rango`);
  if (registro.fecha.getTime() > Date.now()) errores.push(`${registro.ciudad}: fecha futura`);

  return errores;
}

// datos
const prendas: PrendaOutfit[] = [
  { nombre: 'Camiseta ligera', estilos: ['casual', 'deportivo'], climas: ['soleado', 'ventoso'] },
  { nombre: 'Chaqueta impermeable', estilos: ['casual'], climas: ['lluvia', 'ventoso'] },
  { nombre: 'Sueter grueso', estilos: ['casual', 'formal'], climas: ['frio'] },
  { nombre: 'Pantalon de vestir', estilos: ['formal'], climas: ['soleado', 'frio'] },
  { nombre: 'Pantalon corto', estilos: ['casual', 'deportivo'], climas: ['soleado'] },
];

const registros: RegistroClima[] = [
  { fecha: new Date('2026-11-09'), ciudad: 'Bogota', tipo: 'frio', temperaturaC: 12 },
  { fecha: new Date('2026-11-10'), ciudad: 'Bogota', tipo: 'lluvia', temperaturaC: 15 },
  { fecha: new Date('2026-11-11'), ciudad: 'Santa Marta', tipo: 'soleado', temperaturaC: 90 },
  { fecha: new Date('2026-11-12'), ciudad: 'Medellin', tipo: 'ventoso', temperaturaC: 20 },
];

// reportes
function reportePorClima(registros: RegistroClima[]): Record<TipoClima, number> {
  return registros.reduce<Record<TipoClima, number>>((conteo, registro) => {
    conteo[registro.tipo] += 1;
    return conteo;
  }, { soleado: 0, lluvia: 0, frio: 0, ventoso: 0 });
}

function promedioTemperatura(registros: RegistroClima[]): number {
  if (registros.length === 0) return 0;
  const suma = registros.reduce((total, registro) => total + registro.temperaturaC, 0);
  return Number((suma / registros.length).toFixed(1));
}

// salida
function mostrarResumen(sugeridor: SugeridorOutfit): void {
  console.log('=== Outfit segun clima ===');
  console.log('Dias por clima:', reportePorClima(registros));
  console.log(`Temperatura promedio: ${promedioTemperatura(registros)} C`);

  registros.forEach((registro) => {
    const errores = validarRegistro(registro);
    const outfit = sugeridor.sugerir(registro);
    const fechaTexto = registro.fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    console.log(`${fechaTexto} (${registro.ciudad}, ${registro.tipo}): ${outfit.prendas.join(', ') || 'sin prendas'}${errores.length > 0 ? ` | ${errores.join('; ')}` : ''}`);
  });
}

mostrarResumen(new SugeridorOutfit(prendas));
