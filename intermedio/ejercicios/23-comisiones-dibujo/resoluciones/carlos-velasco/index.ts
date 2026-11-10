export {};

// tipos
type TipoComision = 'retrato' | 'personaje' | 'paisaje' | 'grupo';
type EstadoComision = 'espera' | 'en_progreso' | 'entregada' | 'cancelada';

interface Comision {
  readonly id: number;
  readonly cliente: string;
  tipo: TipoComision;
  precioBase: number;
  caracterizacion: boolean;
  estado: EstadoComision;
}

// datos
const comisiones: Comision[] = [
  { id: 1, cliente: 'Ana', tipo: 'retrato', precioBase: 60, caracterizacion: true, estado: 'entregada' },
  { id: 2, cliente: 'Bruno', tipo: 'personaje', precioBase: 45, caracterizacion: false, estado: 'en_progreso' },
  { id: 3, cliente: 'Carla', tipo: 'grupo', precioBase: 120, caracterizacion: true, estado: 'espera' },
  { id: 4, cliente: 'Dani', tipo: 'paisaje', precioBase: -10, caracterizacion: false, estado: 'cancelada' },
];

// reglas
const recargoCaracterizacion = 0.25;
const recargoPorPersonaje = 20;

// validacion
function validarComision(comision: Comision): string[] {
  const errores: string[] = [];

  if (comision.precioBase < 0) errores.push(`Comision ${comision.id}: precio negativo`);
  if (comision.tipo === 'grupo' && !comision.caracterizacion) errores.push(`Comision ${comision.id}: las comisiones de grupo requieren caracterizacion`);

  return errores;
}

// calculos
function precioFinal(comision: Comision): number {
  let precio = comision.precioBase;
  if (comision.caracterizacion) precio += comision.precioBase * recargoCaracterizacion;
  if (comision.tipo === 'grupo') precio += recargoPorPersonaje;
  return Number(precio.toFixed(2));
}

function ingresosPorTipo(comisiones: Comision[]): Record<TipoComision, number> {
  const totales: Record<TipoComision, number> = { retrato: 0, personaje: 0, paisaje: 0, grupo: 0 };
  comisiones
    .filter((comision) => comision.estado === 'entregada')
    .forEach((comision) => {
      totales[comision.tipo] += precioFinal(comision);
    });
  return totales;
}

function agruparPorEstado(comisiones: Comision[]): Map<EstadoComision, number> {
  return comisiones.reduce<Map<EstadoComision, number>>((mapa, comision) => {
    mapa.set(comision.estado, (mapa.get(comision.estado) ?? 0) + 1);
    return mapa;
  }, new Map());
}

function clientesUnicos(comisiones: Comision[]): Set<string> {
  return new Set(comisiones.map((comision) => comision.cliente));
}

// salida
function mostrarResumen(comisiones: Comision[]): void {
  console.log('=== Comisiones de dibujo ===');
  console.log('Ingresos por tipo:', ingresosPorTipo(comisiones));
  agruparPorEstado(comisiones).forEach((cantidad, estado) => {
    console.log(`${estado}: ${cantidad}`);
  });
  console.log(`Clientes unicos: ${[...clientesUnicos(comisiones)].join(', ')}`);

  comisiones.forEach((comision) => {
    const errores = validarComision(comision);
    console.log(`Comision ${comision.id} (${comision.tipo}) | Precio final: $${precioFinal(comision)}${errores.length > 0 ? ` | ${errores.join('; ')}` : ''}`);
  });
}

mostrarResumen(comisiones);
