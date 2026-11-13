export {};

// tipos
type TipoEspacio = 'habitacion' | 'sala' | 'cocina' | 'exterior';

interface EspacioCotizado {
  readonly id: number;
  readonly nombre: string;
  tipo: TipoEspacio;
  areaM2: number;
  nivelDetalle: 'basico' | 'medio' | 'alto';
}

interface Cotizacion {
  readonly espacios: EspacioCotizado[];
  totalUsd: number;
  porEspacio: Record<number, number>;
}

// persistencia simulada
interface AlmacenCotizacion {
  guardar(cotizacion: Cotizacion): void;
  leer(): Cotizacion | null;
}

class AlmacenCotizacionMemoria implements AlmacenCotizacion {
  private cotizacion: Cotizacion | null = null;

  guardar(cotizacion: Cotizacion): void {
    this.cotizacion = JSON.parse(JSON.stringify(cotizacion)) as Cotizacion;
  }

  leer(): Cotizacion | null {
    return this.cotizacion ? JSON.parse(JSON.stringify(this.cotizacion)) as Cotizacion : null;
  }
}

// reglas
const tarifaPorM2: Record<TipoEspacio, number> = {
  habitacion: 35,
  sala: 45,
  cocina: 60,
  exterior: 25,
};

const factorDetalle: Record<EspacioCotizado['nivelDetalle'], number> = {
  basico: 1,
  medio: 1.4,
  alto: 2,
};

// clases
class CotizadorArquitectura {
  private espacios: EspacioCotizado[] = [];

  constructor(private readonly almacen: AlmacenCotizacion) {}

  agregar(espacio: EspacioCotizado): boolean {
    if (espacio.areaM2 <= 0) return false;
    this.espacios.push(espacio);
    return true;
  }

  cotizar(): Cotizacion {
    const porEspacio: Record<number, number> = {};

    this.espacios.forEach((espacio) => {
      porEspacio[espacio.id] = Number((espacio.areaM2 * tarifaPorM2[espacio.tipo] * factorDetalle[espacio.nivelDetalle]).toFixed(2));
    });

    const cotizacion: Cotizacion = {
      espacios: [...this.espacios],
      porEspacio,
      totalUsd: Number(Object.values(porEspacio).reduce((total, monto) => total + monto, 0).toFixed(2)),
    };

    this.almacen.guardar(cotizacion);
    return cotizacion;
  }

  restaurar(): boolean {
    const cotizacion = this.almacen.leer();
    if (!cotizacion) return false;
    this.espacios = cotizacion.espacios;
    return true;
  }
}

// datos
const espacios: EspacioCotizado[] = [
  { id: 1, nombre: 'Dormitorio principal', tipo: 'habitacion', areaM2: 18, nivelDetalle: 'medio' },
  { id: 2, nombre: 'Sala doble altura', tipo: 'sala', areaM2: 32, nivelDetalle: 'alto' },
  { id: 3, nombre: 'Terraza', tipo: 'exterior', areaM2: 0, nivelDetalle: 'basico' },
];

// salida
function mostrarResumen(): void {
  console.log('=== Cotizador arquitectura 3D ===');
  const cotizador = new CotizadorArquitectura(new AlmacenCotizacionMemoria());

  espacios.forEach((espacio) => {
    const agregado = cotizador.agregar(espacio);
    console.log(`Espacio ${espacio.nombre}: ${agregado ? 'agregado' : 'rechazado'}`);
  });

  const cotizacion = cotizador.cotizar();
  Object.entries(cotizacion.porEspacio).forEach(([id, monto]) => {
    const espacio = cotizacion.espacios.find((item) => item.id === Number(id));
    console.log(`- ${espacio?.nombre}: $${monto}`);
  });
  console.log(`Total: $${cotizacion.totalUsd}`);
  console.log(`Restauracion: ${cotizador.restaurar() ? 'exitosa' : 'sin datos'}`);
}

mostrarResumen();
