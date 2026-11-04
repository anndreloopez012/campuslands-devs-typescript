export {};

interface Lote {
  readonly id: number;
  readonly descripcion: string;
  readonly precioReserva: number;
}

interface Puja {
  readonly postor: string;
  readonly monto: number;
}

class Subasta<T extends Lote> {
  private readonly pujas: Puja[] = [];
  private abierta = true;

  constructor(
    readonly lote: T,
    private readonly incrementoMinimo: number,
  ) {}

  get mejorPuja(): Puja | undefined {
    return this.pujas[this.pujas.length - 1];
  }

  pujar(postor: string, monto: number): string {
    if (!this.abierta) return `${postor}: subasta cerrada`;
    if (postor.trim().length === 0) return "Puja rechazada: postor sin nombre";

    const minimo = this.mejorPuja ? this.mejorPuja.monto + this.incrementoMinimo : this.lote.precioReserva;
    if (monto < minimo) return `${postor}: $${monto} rechazada, minimo $${minimo}`;

    this.pujas.push({ postor, monto });
    return `${postor}: $${monto} aceptada`;
  }

  cerrar(): string {
    this.abierta = false;
    const mejor = this.mejorPuja;
    if (!mejor) return `Lote #${this.lote.id} desierto`;
    return `Lote #${this.lote.id} (${this.lote.descripcion}) vendido a ${mejor.postor} por $${mejor.monto}`;
  }

  totalPujas(): number {
    return this.pujas.length;
  }
}

const ferrari = new Subasta({ id: 1, descripcion: "Ferrari 250 GTO replica", precioReserva: 250000 }, 5000);
const bugatti = new Subasta({ id: 2, descripcion: "Bugatti Veyron 2011", precioReserva: 900000 }, 10000);

console.log("Ejercicio 34: Subasta de autos de lujo");
[
  ferrari.pujar("Helena", 240000),
  ferrari.pujar("Helena", 250000),
  ferrari.pujar("Ivan", 253000),
  ferrari.pujar("Ivan", 255000),
  ferrari.pujar("", 300000),
  ferrari.pujar("Julia", 310000),
  bugatti.pujar("Ivan", 850000),
].forEach((linea) => console.log(`  ${linea}`));

console.log(ferrari.cerrar());
console.log(bugatti.cerrar());
console.log(`  ${ferrari.pujar("Tarde", 999999)}`);
console.log(`Pujas aceptadas en el Ferrari: ${ferrari.totalPujas()}`);
