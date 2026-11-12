export {};

// tipos
type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

interface Reserva {
  readonly id: number;
  readonly cliente: string;
  fecha: Date;
  personas: number;
  estado: EstadoReserva;
}

// clases
class GestorReservas<T extends { id: number; estado: EstadoReserva; fecha: Date }> {
  private readonly reservas = new Map<number, T>();

  agregar(reserva: T): void {
    this.reservas.set(reserva.id, reserva);
  }

  cambiarEstado(id: number, estado: EstadoReserva): boolean {
    const reserva = this.reservas.get(id);
    if (!reserva) return false;
    reserva.estado = estado;
    return true;
  }

  delDia(fecha: Date): T[] {
    return [...this.reservas.values()].filter((reserva) => esMismoDia(reserva.fecha, fecha));
  }

  reporte(): Record<EstadoReserva, number> {
    return [...this.reservas.values()].reduce<Record<EstadoReserva, number>>((conteo, reserva) => {
      conteo[reserva.estado] += 1;
      return conteo;
    }, { pendiente: 0, confirmada: 0, cancelada: 0, completada: 0 });
  }
}

// validacion
function esMismoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function validarReserva(reserva: Reserva): string[] {
  const errores: string[] = [];

  if (reserva.personas < 1) errores.push(`Reserva ${reserva.id}: numero de personas invalido`);
  if (reserva.fecha.getTime() < Date.now() - 86_400_000) errores.push(`Reserva ${reserva.id}: fecha en el pasado`);

  return errores;
}

// datos
const hoy = new Date();
const manana = new Date(hoy.getTime() + 86_400_000);
const ayer = new Date(hoy.getTime() - 86_400_000);

const datos: Reserva[] = [
  { id: 1, cliente: 'Ana', fecha: new Date(hoy.setHours(20, 0, 0, 0)), personas: 4, estado: 'confirmada' },
  { id: 2, cliente: 'Bruno', fecha: manana, personas: 2, estado: 'pendiente' },
  { id: 3, cliente: 'Carla', fecha: new Date(manana.setHours(21, 30, 0, 0)), personas: 6, estado: 'confirmada' },
  { id: 4, cliente: 'Dani', fecha: ayer, personas: 0, estado: 'cancelada' },
];

// salida
function mostrarReserva(reserva: Reserva, gestor: GestorReservas<Reserva>): void {
  const errores = validarReserva(reserva);
  const fechaTexto = reserva.fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  console.log(`Reserva ${reserva.id} | ${reserva.cliente} | ${fechaTexto} | ${reserva.personas} personas | ${reserva.estado}${errores.length > 0 ? ` | ${errores.join('; ')}` : ''}`);
}

function mostrarResumen(): void {
  console.log('=== Reservas de restaurante ===');
  const gestor = new GestorReservas<Reserva>();
  datos.forEach((reserva) => gestor.agregar(reserva));

  console.log('Reservas de hoy:');
  gestor.delDia(new Date(hoy.setHours(0, 0, 0, 0))).forEach((reserva) => mostrarReserva(reserva, gestor));

  gestor.cambiarEstado(2, 'confirmada');
  console.log(`Reporte: ${JSON.stringify(gestor.reporte())}`);
}

mostrarResumen();
