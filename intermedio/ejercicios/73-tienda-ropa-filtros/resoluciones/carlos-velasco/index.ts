export {};

// tipos
type FiltroPrecio = 'todos' | 'menos_de_30' | 'entre_30_60' | 'mas_de_60';

interface PrendaTienda {
  readonly id: number;
  readonly nombre: string;
  readonly marca: string;
  precioUsd: number;
  stock: number;
  tallas: string[];
}

// persistencia simulada
interface AlmacenCarrito {
  guardar(ids: number[]): void;
  leer(): number[] | null;
}

class AlmacenCarritoMemoria implements AlmacenCarrito {
  private ids: number[] | null = null;

  guardar(ids: number[]): void {
    this.ids = [...ids];
  }

  leer(): number[] | null {
    return this.ids ? [...this.ids] : null;
  }
}

// clases
class TiendaRopa {
  private readonly prendas = new Map<number, PrendaTienda>();
  private carrito: number[] = [];

  constructor(private readonly almacen: AlmacenCarrito) {}

  cargar(prendas: PrendaTienda[]): void {
    prendas.forEach((prenda) => this.prendas.set(prenda.id, prenda));
  }

  filtrar(marca: string | null, talla: string | null, precio: FiltroPrecio): PrendaTienda[] {
    return [...this.prendas.values()].filter((prenda) => {
      if (marca && prenda.marca !== marca) return false;
      if (talla && !prenda.tallas.includes(talla)) return false;
      if (precio === 'menos_de_30' && prenda.precioUsd >= 30) return false;
      if (precio === 'entre_30_60' && (prenda.precioUsd < 30 || prenda.precioUsd > 60)) return false;
      if (precio === 'mas_de_60' && prenda.precioUsd <= 60) return false;
      return true;
    });
  }

  agregarAlCarrito(id: number): boolean {
    const prenda = this.prendas.get(id);
    if (!prenda || prenda.stock <= 0) return false;
    this.carrito.push(id);
    this.almacen.guardar(this.carrito);
    return true;
  }

  restaurarCarrito(): void {
    const ids = this.almacen.leer();
    if (ids) this.carrito = ids;
  }

  totalCarrito(): number {
    return Number(this.carrito.reduce((total, id) => total + (this.prendas.get(id)?.precioUsd ?? 0), 0).toFixed(2));
  }
}

// datos
const prendas: PrendaTienda[] = [
  { id: 1, nombre: 'Hoodie Asfalto', marca: 'Kuro', precioUsd: 45, stock: 5, tallas: ['m', 'l'] },
  { id: 2, nombre: 'Camiseta Neon', marca: 'Kuro', precioUsd: 22, stock: 0, tallas: ['s', 'm'] },
  { id: 3, nombre: 'Cargo Gris', marca: 'Nube', precioUsd: 55, stock: 3, tallas: ['l', 'xl'] },
  { id: 4, nombre: 'Chaqueta Reflejante', marca: 'Vantablack', precioUsd: 80, stock: 2, tallas: ['xl'] },
];

// salida
function mostrarResumen(): void {
  console.log('=== Tienda de ropa con filtros ===');
  const tienda = new TiendaRopa(new AlmacenCarritoMemoria());
  tienda.cargar(prendas);

  const filtradas = tienda.filtrar('Kuro', null, 'todos');
  console.log('Marca Kuro:', filtradas.map((prenda) => prenda.nombre).join(', '));

  const economicas = tienda.filtrar(null, null, 'menos_de_30');
  console.log('Menos de $30:', economicas.map((prenda) => prenda.nombre).join(', '));

  console.log(`Agregar hoodie: ${tienda.agregarAlCarrito(1) ? 'aceptado' : 'rechazado'}`);
  console.log(`Agregar camiseta agotada: ${tienda.agregarAlCarrito(2) ? 'aceptado' : 'rechazado'}`);

  tienda.restaurarCarrito();
  console.log(`Carrito restaurado | Total: $${tienda.totalCarrito()}`);
}

mostrarResumen();
