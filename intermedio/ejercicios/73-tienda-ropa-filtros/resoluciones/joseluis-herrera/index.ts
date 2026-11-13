export {};

type Estado = 'disponible' | 'agotada';

interface Prenda {
    readonly id: number;
    nombre: string;
    categoria: string;
    precio: number;
    estado: Estado;
}

type PrendaDTO = Prenda;

class RepositorioPrendas {
    private items: Prenda[] = [];

    guardar(item: Prenda): void {
        this.items.push(item);
    }

    listar(): Prenda[] {
        return [...this.items];
    }

    buscarPorId(id: number): Prenda | null {
        return this.items.find((item) => item.id === id) ?? null;
    }
}

class ServicioPrendas {
    constructor(private readonly repositorio: RepositorioPrendas) {}

    agregar(dto: PrendaDTO): void {
        this.repositorio.guardar({ ...dto });
    }

    listar(): Prenda[] {
        return this.repositorio.listar();
    }

    filtrarPorCategoria(categoria: string): Prenda[] {
        return this.listar().filter((item) => item.categoria === categoria);
    }

    calcularTotal(): number {
        return this.listar().reduce((total, item) => total + item.precio, 0);
    }

    generarReporte(): Record<string, number> {
        return this.listar().reduce((reporte, item) => {
            reporte[item.categoria] = (reporte[item.categoria] ?? 0) + item.precio;
            return reporte;
        }, {} as Record<string, number>);
    }
}

const datos: PrendaDTO[] = [
    { id: 1, nombre: 'Hoodie oversize', categoria: 'streetwear', precio: 180000, estado: 'disponible' },
    { id: 2, nombre: 'Camiseta boxy', categoria: 'streetwear', precio: 90000, estado: 'disponible' },
    { id: 3, nombre: 'Chaqueta puffer', categoria: 'invierno', precio: 320000, estado: 'agotada' },
    { id: 4, nombre: 'Short deportivo', categoria: 'verano', precio: 85000, estado: 'disponible' },
];

const servicio = new ServicioPrendas(new RepositorioPrendas());
datos.forEach((dto) => servicio.agregar(dto));
const guardado = JSON.stringify(servicio.listar());

console.log('===== Tienda de ropa con filtros =====');

console.log('Prendas:', servicio.listar().length);
console.log('Precio total:', servicio.calcularTotal());
console.log('Categoria streetwear:', servicio.filtrarPorCategoria('streetwear').length);
console.log('Reporte:', servicio.generarReporte());
console.log('Persistencia:', guardado);

console.log('\n===== PRUEBAS =====');

const casoNormal = servicio.listar()[0];
const casoLimite = servicio.listar().find((item) => item.id === 999) ?? null;

console.log('Caso normal:', casoNormal.nombre);
console.log('Caso limite:', casoLimite);
