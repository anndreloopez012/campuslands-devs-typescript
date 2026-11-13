export {};

// tipos
type EstadoCitaBooking = 'solicitada' | 'aceptada' | 'rechazada' | 'cancelada';

interface CitaBooking {
  readonly id: number;
  readonly cliente: string;
  readonly artista: string;
  readonly fecha: Date;
  estado: EstadoCitaBooking;
}

// persistencia simulada
interface AlmacenCitas {
  guardar(citas: CitaBooking[]): void;
  leer(): CitaBooking[] | null;
}

class AlmacenCitasMemoria implements AlmacenCitas {
  private citas: CitaBooking[] | null = null;

  guardar(citas: CitaBooking[]): void {
    this.citas = citas.map((cita) => ({ ...cita }));
  }

  leer(): CitaBooking[] | null {
    return this.citas ? this.citas.map((cita) => ({ ...cita })) : null;
  }
}

// reglas
const diasMinimosAnticipacion = 3;

// clases
class BookingTattoo {
  private citas: CitaBooking[] = [];

  constructor(private readonly almacen: AlmacenCitas) {}

  cargar(citas: CitaBooking[]): void {
    this.citas = [...citas];
  }

  solicitar(cita: CitaBooking): string[] {
    const errores: string[] = [];

    if (this.citas.some((otra) => otra.artista === cita.artista && otra.fecha.getTime() === cita.fecha.getTime() && otra.estado === 'aceptada')) {
      errores.push(`cita ${cita.id}: horario ocupado para ${cita.artista}`);
    }
    if (cita.fecha.getTime() < Date.now() + diasMinimosAnticipacion * 86_400_000) {
      errores.push(`cita ${cita.id}: se solicita con menos de ${diasMinimosAnticipacion} dias`);
    }

    if (errores.length === 0) {
      this.citas.push(cita);
      this.almacen.guardar(this.citas);
    }
    return errores;
  }

  aceptar(id: number): boolean {
    const cita = this.citas.find((item) => item.id === id && item.estado === 'solicitada');
    if (!cita) return false;
    cita.estado = 'aceptada';
    this.almacen.guardar(this.citas);
    return true;
  }

  reporte(): Record<EstadoCitaBooking, number> {
    return this.citas.reduce<Record<EstadoCitaBooking, number>>((conteo, cita) => {
      conteo[cita.estado] += 1;
      return conteo;
    }, { solicitada: 0, aceptada: 0, rechazada: 0, cancelada: 0 });
  }
}

// datos
const dentroDe5Dias = new Date(Date.now() + 5 * 86_400_000);
const dentroDe1Dia = new Date(Date.now() + 1 * 86_400_000);

const nuevasCitas: CitaBooking[] = [
  { id: 1, cliente: 'Ana', artista: 'Tinta Roja', fecha: dentroDe5Dias, estado: 'solicitada' },
  { id: 2, cliente: 'Bruno', artista: 'Tinta Roja', fecha: dentroDe5Dias, estado: 'solicitada' },
  { id: 3, cliente: 'Carla', artista: 'Nigra', fecha: dentroDe1Dia, estado: 'solicitada' },
];

// salida
function mostrarResumen(): void {
  console.log('=== Booking tattoo app ===');
  const almacen = new AlmacenCitasMemoria();
  const app = new BookingTattoo(almacen);

  nuevasCitas.forEach((cita) => {
    const errores = app.solicitar(cita);
    console.log(`Solicitud de ${cita.cliente}: ${errores.length === 0 ? 'aceptada' : errores.join('; ')}`);
  });

  app.aceptar(1);
  console.log('Reporte:', JSON.stringify(app.reporte()));

  const guardadas = almacen.leer();
  console.log(`Citas persistidas: ${guardadas ? guardadas.length : 0}`);
}

mostrarResumen();
