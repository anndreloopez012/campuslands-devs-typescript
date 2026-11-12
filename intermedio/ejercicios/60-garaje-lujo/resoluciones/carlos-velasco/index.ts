export {};

// tipos
type EstadoVehiculo = 'disponible' | 'en_mantenimiento' | 'reservado';

interface VehiculoLujo {
  readonly id: number;
  readonly modelo: string;
  estado: EstadoVehiculo;
  valorUsd: number;
  ultimoServicio: Date;
}

// eventos tipados
class BusVehiculos<TEventos extends Record<string, unknown>> {
  private readonly oyentes = new Map<keyof TEventos, Array<(dato: unknown) => void>>();

  on<K extends keyof TEventos>(evento: K, oyente: (dato: TEventos[K]) => void): void {
    const lista = this.oyentes.get(evento) ?? [];
    lista.push(oyente as (dato: unknown) => void);
    this.oyentes.set(evento, lista);
  }

  emit<K extends keyof TEventos>(evento: K, dato: TEventos[K]): void {
    (this.oyentes.get(evento) ?? []).forEach((oyente) => oyente(dato));
  }
}

// clases
class GarajeLujo {
  private readonly vehiculos = new Map<number, VehiculoLujo>();
  private readonly bus = new BusVehiculos<{ reservado: VehiculoLujo; servicio: VehiculoLujo }>();

  constructor() {
    this.bus.on('reservado', (vehiculo) => console.log(`[EVENTO] ${vehiculo.modelo} reservado`));
    this.bus.on('servicio', (vehiculo) => console.log(`[EVENTO] ${vehiculo.modelo} entro a mantenimiento`));
  }

  agregar(vehiculo: VehiculoLujo): void {
    this.vehiculos.set(vehiculo.id, vehiculo);
  }

  reservar(id: number): boolean {
    const vehiculo = this.vehiculos.get(id);
    if (!vehiculo || vehiculo.estado !== 'disponible') return false;
    vehiculo.estado = 'reservado';
    this.bus.emit('reservado', vehiculo);
    return true;
  }

  enviarServicio(id: number): boolean {
    const vehiculo = this.vehiculos.get(id);
    if (!vehiculo || vehiculo.estado === 'en_mantenimiento') return false;
    vehiculo.estado = 'en_mantenimiento';
    this.bus.emit('servicio', vehiculo);
    return true;
  }

  valorTotal(): number {
    return [...this.vehiculos.values()].reduce((total, vehiculo) => total + vehiculo.valorUsd, 0);
  }

  necesitanServicio(diasLimite: number): VehiculoLujo[] {
    const limite = Date.now() - diasLimite * 86_400_000;
    return [...this.vehiculos.values()].filter((vehiculo) => vehiculo.ultimoServicio.getTime() < limite);
  }
}

// datos
const hace100Dias = new Date(Date.now() - 100 * 86_400_000);
const hace30Dias = new Date(Date.now() - 30 * 86_400_000);

const vehiculos: VehiculoLujo[] = [
  { id: 1, modelo: 'Solaris GT', estado: 'disponible', valorUsd: 2_900_000, ultimoServicio: hace30Dias },
  { id: 2, modelo: 'Vendetta R', estado: 'disponible', valorUsd: 1_400_000, ultimoServicio: hace100Dias },
  { id: 3, modelo: 'Nube Evo', estado: 'reservado', valorUsd: 2_200_000, ultimoServicio: hace30Dias },
];

// salida
function mostrarResumen(): void {
  console.log('=== Garaje de lujo ===');
  const garaje = new GarajeLujo();
  vehiculos.forEach((vehiculo) => garaje.agregar(vehiculo));

  console.log(`Reserva de Nube Evo: ${garaje.reservar(3) ? 'aceptada' : 'rechazada'}`);
  console.log(`Reserva de Solaris GT: ${garaje.reservar(1) ? 'aceptada' : 'rechazada'}`);
  console.log(`Mantenimiento de Vendetta R: ${garaje.enviarServicio(2) ? 'programado' : 'rechazado'}`);

  console.log(`Valor total del garaje: $${garaje.valorTotal()}`);
  console.log('Necesitan servicio:', garaje.necesitanServicio(90).map((vehiculo) => vehiculo.modelo).join(', '));
}

mostrarResumen();
