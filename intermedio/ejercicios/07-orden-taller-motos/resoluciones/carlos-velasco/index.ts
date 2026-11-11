export {};

// tipos
type EstadoOrden = 'recibida' | 'en_proceso' | 'lista' | 'entregada';

interface OrdenTaller {
  readonly id: number;
  readonly moto: string;
  cliente: string;
  estado: EstadoOrden;
  tareas: string[];
  costoTareas: number[];
  prioridad: number;
}

// datos
const ordenes: OrdenTaller[] = [
  { id: 1, moto: 'RSV Turbo', cliente: 'Ana Cruz', estado: 'recibida', tareas: ['cambio de aceite', 'frenos'], costoTareas: [40, 90], prioridad: 2 },
  { id: 2, moto: 'Nova 600', cliente: 'Luis Prado', estado: 'en_proceso', tareas: ['llantas', 'cadena'], costoTareas: [180, 35], prioridad: 3 },
  { id: 3, moto: 'Kero 125', cliente: 'Sara Diaz', estado: 'lista', tareas: ['revision general'], costoTareas: [25], prioridad: 1 },
  { id: 4, moto: 'RSV Turbo', cliente: 'Ana Cruz', estado: 'recibida', tareas: ['electricidad', 'suspension'], costoTareas: [120, 150], prioridad: 1 },
];

// reglas
const estadosPermitidos: EstadoOrden[] = ['recibida', 'en_proceso', 'lista', 'entregada'];

// validacion
function validarOrden(orden: OrdenTaller): string[] {
  const errores: string[] = [];

  if (!estadosPermitidos.includes(orden.estado)) errores.push(`Orden ${orden.id}: estado invalido`);
  if (orden.tareas.length !== orden.costoTareas.length) errores.push(`Orden ${orden.id}: tareas y costos desalineados`);
  if (orden.prioridad < 1 || orden.prioridad > 3) errores.push(`Orden ${orden.id}: prioridad fuera de rango`);

  return errores;
}

// calculos
function costoTotal(orden: OrdenTaller): number {
  return orden.costoTareas.reduce((total, costo) => total + costo, 0);
}

function ordenesPendientes(ordenes: OrdenTaller[]): OrdenTaller[] {
  return ordenes
    .filter((orden) => orden.estado !== 'entregada')
    .sort((a, b) => a.prioridad - b.prioridad || costoTotal(b) - costoTotal(a));
}

function avanzarEstado(orden: OrdenTaller): EstadoOrden {
  const indice = estadosPermitidos.indexOf(orden.estado);
  const siguiente = estadosPermitidos[indice + 1] ?? orden.estado;
  orden.estado = siguiente;
  return siguiente;
}

function totalFacturado(ordenes: OrdenTaller[]): number {
  return ordenes.filter((orden) => orden.estado === 'entregada').reduce((total, orden) => total + costoTotal(orden), 0);
}

// salida
function mostrarResumen(ordenes: OrdenTaller[]): void {
  console.log('=== Ordenes de taller de motos ===');
  console.log('Pendientes por prioridad:');
  ordenesPendientes(ordenes).forEach((orden) => {
    const errores = validarOrden(orden);
    console.log(`- Orden ${orden.id} (${orden.moto}) | ${orden.estado} | Costo: $${costoTotal(orden)} | Prioridad: ${orden.prioridad}${errores.length > 0 ? ` | ${errores.join('; ')}` : ''}`);
  });

  avanzarEstado(ordenes[0]);
  console.log(`Orden 1 avanzo a: ${ordenes[0].estado}`);
  console.log(`Total facturado en entregadas: $${totalFacturado(ordenes)}`);
}

mostrarResumen(ordenes);
