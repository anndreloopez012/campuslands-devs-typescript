export {};

// tipos
type EstadoOrden = 'cotizada' | 'aprobada' | 'en_taller' | 'entregada' | 'anulada';

interface ClienteCRM {
  readonly id: number;
  readonly nombre: string;
  telefono: string;
  ordenesActivas: number;
}

interface OrdenCRM {
  readonly id: number;
  readonly clienteId: number;
  servicio: string;
  costoUsd: number;
  estado: EstadoOrden;
}

// errores
class ErrorClienteNoEncontrado extends Error {
  constructor(id: number) {
    super(`cliente ${id} no registrado`);
    this.name = 'ErrorClienteNoEncontrado';
  }
}

// datos remotos simulados
async function obtenerCliente(clientes: Map<number, ClienteCRM>, id: number): Promise<ClienteCRM> {
  await new Promise((resolver) => setTimeout(resolver, 5));
  const cliente = clientes.get(id);
  if (!cliente) throw new ErrorClienteNoEncontrado(id);
  return cliente;
}

// clases
class CRMTaller {
  private readonly ordenes: OrdenCRM[] = [];

  registrarOrden(orden: OrdenCRM): boolean {
    if (orden.costoUsd < 0 || orden.estado === 'anulada') return false;
    this.ordenes.push(orden);
    return true;
  }

  avanzar(id: number): EstadoOrden | null {
    const flujo: EstadoOrden[] = ['cotizada', 'aprobada', 'en_taller', 'entregada'];
    const orden = this.ordenes.find((item) => item.id === id);
    if (!orden) return null;

    const indice = flujo.indexOf(orden.estado);
    if (indice === -1 || indice === flujo.length - 1) return orden.estado;

    orden.estado = flujo[indice + 1];
    return orden.estado;
  }

  facturacion(): Record<string, number> {
    return this.ordenes
      .filter((orden) => orden.estado === 'entregada')
      .reduce<Record<string, number>>((totales, orden) => {
        totales[orden.servicio] = (totales[orden.servicio] ?? 0) + orden.costoUsd;
        return totales;
      }, {});
  }

  totalFacturado(): number {
    return Number(this.ordenes
      .filter((orden) => orden.estado === 'entregada')
      .reduce((total, orden) => total + orden.costoUsd, 0)
      .toFixed(2));
  }
}

// datos
const clientes = new Map<number, ClienteCRM>([
  [1, { id: 1, nombre: 'Ana Cruz', telefono: '555-0101', ordenesActivas: 1 }],
  [2, { id: 2, nombre: 'Luis Prado', telefono: '555-0102', ordenesActivas: 2 }],
]);

const ordenes: OrdenCRM[] = [
  { id: 100, clienteId: 1, servicio: 'cambio de aceite', costoUsd: 40, estado: 'cotizada' },
  { id: 101, clienteId: 2, servicio: 'frenos', costoUsd: 120, estado: 'aprobada' },
  { id: 102, clienteId: 2, servicio: 'electricidad', costoUsd: 90, estado: 'cotizada' },
  { id: 103, clienteId: 99, servicio: 'diagnostico', costoUsd: 25, estado: 'cotizada' },
];

// salida
function mostrarResumen(): void {
  console.log('=== Mini CRM de taller ===');
  const crm = new CRMTaller();

  void (async () => {
    for (const orden of ordenes) {
      try {
        const cliente = await obtenerCliente(clientes, orden.clienteId);
        const registrada = crm.registrarOrden(orden);
        console.log(`Orden ${orden.id} de ${cliente.nombre}: ${registrada ? 'registrada' : 'rechazada'}`);
      } catch (error) {
        console.log(`Orden ${orden.id}: ${error instanceof Error ? error.message : 'desconocido'}`);
      }
    }

    [100, 101, 100].forEach((id) => {
      const nuevoEstado = crm.avanzar(id);
      console.log(`Orden ${id}: ${nuevoEstado ?? 'sin cambios'}`);
    });

    console.log('Facturacion por servicio:', JSON.stringify(crm.facturacion()));
    console.log(`Total facturado: $${crm.totalFacturado()}`);
  })();
}

mostrarResumen();
