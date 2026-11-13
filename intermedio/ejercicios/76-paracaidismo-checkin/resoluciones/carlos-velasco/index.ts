export {};

// tipos
type EstadoCheckin = 'abierto' | 'cerrado' | 'en_vuelo' | 'cancelado';

interface PasajeroSalto {
  readonly id: number;
  readonly nombre: string;
  pesoKg: number;
  licenciaVigente: boolean;
  estado: EstadoCheckin;
}

// persistencia simulada
interface AlmacenCheckin {
  guardar(id: number, estado: EstadoCheckin): void;
  leer(id: number): EstadoCheckin | null;
}

class AlmacenCheckinMemoria implements AlmacenCheckin {
  private readonly datos = new Map<number, EstadoCheckin>();

  guardar(id: number, estado: EstadoCheckin): void {
    this.datos.set(id, estado);
  }

  leer(id: number): EstadoCheckin | null {
    return this.datos.get(id) ?? null;
  }
}

// reglas
const pesoMaximoKg = 110;

// clases
class CheckinParacaidismo {
  private readonly pasajeros = new Map<number, PasajeroSalto>();

  constructor(private readonly almacen: AlmacenCheckin) {}

  cargar(pasajeros: PasajeroSalto[]): void {
    pasajeros.forEach((pasajero) => this.pasajeros.set(pasajero.id, pasajero));
  }

  hacerCheckin(id: number): string[] {
    const pasajero = this.pasajeros.get(id);
    if (!pasajero) return [`pasajero ${id} no registrado`];

    const errores: string[] = [];
    if (pasajero.pesoKg > pesoMaximoKg) errores.push(`${pasajero.nombre}: supera el peso maximo`);
    if (!pasajero.licenciaVigente) errores.push(`${pasajero.nombre}: licencia vencida`);
    if (errores.length > 0) return errores;

    pasajero.estado = 'en_vuelo';
    this.almacen.guardar(id, pasajero.estado);
    return [];
  }

  aterrizar(id: number): boolean {
    const pasajero = this.pasajeros.get(id);
    if (!pasajero || pasajero.estado !== 'en_vuelo') return false;
    pasajero.estado = 'cerrado';
    this.almacen.guardar(id, pasajero.estado);
    return true;
  }

  estadoPersistido(id: number): EstadoCheckin | null {
    return this.almacen.leer(id);
  }
}

// datos
const pasajeros: PasajeroSalto[] = [
  { id: 1, nombre: 'Velas', pesoKg: 78, licenciaVigente: true, estado: 'abierto' },
  { id: 2, nombre: 'Rios', pesoKg: 120, licenciaVigente: true, estado: 'abierto' },
  { id: 3, nombre: 'Mena', pesoKg: 65, licenciaVigente: false, estado: 'abierto' },
  { id: 4, nombre: 'Nux', pesoKg: 82, licenciaVigente: true, estado: 'cancelado' },
];

// salida
function mostrarResumen(): void {
  console.log('=== Check-in de salto ===');
  const checkin = new CheckinParacaidismo(new AlmacenCheckinMemoria());
  checkin.cargar(pasajeros);

  pasajeros.forEach((pasajero) => {
    const errores = checkin.hacerCheckin(pasajero.id);
    console.log(`Check-in ${pasajero.nombre}: ${errores.length === 0 ? 'aprobado' : errores.join('; ')}`);
  });

  console.log(`Aterrizaje de Velas: ${checkin.aterrizar(1) ? 'registrado' : 'rechazado'}`);
  console.log(`Estado persistido de Velas: ${checkin.estadoPersistido(1) ?? 'ninguno'}`);
  console.log(`Estado persistido de Nux: ${checkin.estadoPersistido(4) ?? 'ninguno'}`);
}

mostrarResumen();
