export {};

// tipos
interface PlatoMenu {
  readonly id: number;
  readonly nombre: string;
  precioUsd: number;
  disponible: boolean;
  categoria: 'entrada' | 'principal' | 'postre' | 'bebida';
}

interface OrdenMenu {
  readonly plato: PlatoMenu;
  cantidad: number;
}

// persistencia simulada
interface AlmacenOrdenes {
  guardar(orden: OrdenMenu[]): void;
  leer(): OrdenMenu[] | null;
}

class AlmacenOrdenesMemoria implements AlmacenOrdenes {
  private orden: OrdenMenu[] | null = null;

  guardar(orden: OrdenMenu[]): void {
    this.orden = orden.map((linea) => ({ ...linea }));
  }

  leer(): OrdenMenu[] | null {
    return this.orden ? this.orden.map((linea) => ({ ...linea })) : null;
  }
}

// clases
class MenuComida {
  private readonly platos = new Map<number, PlatoMenu>();
  private orden: OrdenMenu[] = [];

  constructor(private readonly almacen: AlmacenOrdenes) {}

  cargar(platos: PlatoMenu[]): void {
    platos.forEach((plato) => this.platos.set(plato.id, plato));
  }

  agregarAlOrden(platoId: number, cantidad: number): boolean {
    const plato = this.platos.get(platoId);
    if (!plato || !plato.disponible || cantidad <= 0) return false;

    const linea = this.orden.find((item) => item.plato.id === platoId);
    if (linea) linea.cantidad += cantidad;
    else this.orden.push({ plato, cantidad });

    return true;
  }

  guardarOrden(): void {
    this.almacen.guardar(this.orden);
  }

  restaurarOrden(): boolean {
    const recuperada = this.almacen.leer();
    if (!recuperada) return false;
    this.orden = recuperada;
    return true;
  }

  total(): number {
    return Number(this.orden.reduce((total, linea) => total + linea.plato.precioUsd * linea.cantidad, 0).toFixed(2));
  }
}

// datos
const platos: PlatoMenu[] = [
  { id: 1, nombre: 'Sopa de mariscos', precioUsd: 6.5, disponible: true, categoria: 'entrada' },
  { id: 2, nombre: 'Pollo al carbon', precioUsd: 10, disponible: true, categoria: 'principal' },
  { id: 3, nombre: 'Pescado del dia', precioUsd: 0, disponible: true, categoria: 'principal' },
  { id: 4, nombre: 'Limonada', precioUsd: 2, disponible: false, categoria: 'bebida' },
];

// salida
function mostrarResumen(): void {
  console.log('=== Menu interactivo comida ===');
  const menu = new MenuComida(new AlmacenOrdenesMemoria());
  menu.cargar(platos);

  console.log(`Agregar pollo x2: ${menu.agregarAlOrden(2, 2) ? 'aceptado' : 'rechazado'}`);
  console.log(`Agregar limonada: ${menu.agregarAlOrden(4, 1) ? 'aceptado' : 'rechazado'}`);
  console.log(`Agregar pescado: ${menu.agregarAlOrden(3, 1) ? 'aceptado' : 'rechazado'}`);

  menu.guardarOrden();
  menu.restaurarOrden();
  console.log(`Orden restaurada | Total: $${menu.total()}`);
}

mostrarResumen();
