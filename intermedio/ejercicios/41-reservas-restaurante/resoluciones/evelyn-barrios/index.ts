export {};

type ZonaRestaurante = "Terraza" | "Salon Principal" | "Barra VIP";

interface ReservaCliente {
  readonly idReserva: string;
  readonly nombreCliente: string;
  readonly numeroPersonas: number;
  readonly zona: ZonaRestaurante;
  readonly hora: string;
}

class GestorReservas<T extends ReservaCliente> {
  private reservas: T[] = [];
  private readonly capacidadMaxima: number;

  constructor(capacidadMaxima: number) {
    this.capacidadMaxima = capacidadMaxima;
  }

  agregarReserva(reserva: T): boolean {
    const personasActuales = this.reservas.reduce((acc, r) => acc + r.numeroPersonas, 0);
    if (personasActuales + reserva.numeroPersonas <= this.capacidadMaxima) {
      this.reservas.push(reserva);
      return true;
    }
    return false;
  }

  obtenerReservasPorZona(zona: ZonaRestaurante): T[] {
    return this.reservas.filter((r) => r.zona === zona);
  }

  obtenerTotalComensales(): number {
    return this.reservas.reduce((acc, r) => acc + r.numeroPersonas, 0);
  }
}

const gestor = new GestorReservas<ReservaCliente>(30);
gestor.agregarReserva({ idReserva: "RES-01", nombreCliente: "Elena Gomez", numeroPersonas: 4, zona: "Terraza", hora: "20:00" });
gestor.agregarReserva({ idReserva: "RES-02", nombreCliente: "Carlos Ruiz", numeroPersonas: 6, zona: "Salon Principal", hora: "20:30" });

console.log("=== RESERVAS DE RESTAURANTE ===");
console.log(`Comensales confirmados: ${gestor.obtenerTotalComensales()}`);
console.log(`Reservas en Terraza: ${gestor.obtenerReservasPorZona("Terraza").length}`);