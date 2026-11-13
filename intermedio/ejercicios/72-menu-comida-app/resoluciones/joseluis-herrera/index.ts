export {};

type Estado = 'disponible' | 'agotado';

interface Plato {
    readonly id: number;
    nombre: string;
    tipo: string;
    precio: number;
    estado: Estado;
}

type PlatoDTO = Plato;

class RepositorioPlatos {
    private items: Plato[] = [];

    guardar(item: Plato): void {
        this.items.push(item);
    }

    listar(): Plato[] {
        return [...this.items];
    }

    buscarPorId(id: number): Plato | null {
        return this.items.find((item) => item.id === id) ?? null;
    }
}

class ServicioPlatos {
    constructor(private readonly repositorio: RepositorioPlatos) {}

    agregar(dto: PlatoDTO): void {
        this.repositorio.guardar({ ...dto });
    }

    listar(): Plato[] {
        return this.repositorio.listar();
    }

    filtrarPorCategoria(categoria: string): Plato[] {
        return this.listar().filter((item) => item.tipo === categoria);
    }

    calcularTotal(): number {
        return this.listar().reduce((total, item) => total + item.precio, 0);
    }

    generarReporte(): Record<string, number> {
        return this.listar().reduce((reporte, item) => {
            reporte[item.tipo] = (reporte[item.tipo] ?? 0) + item.precio;
            return reporte;
        }, {} as Record<string, number>);
    }
}

const datos: PlatoDTO[] = [
    { id: 1, nombre: 'Hamburguesa clasica', tipo: 'principal', precio: 18000, estado: 'disponible' },
    { id: 2, nombre: 'Pizza personal', tipo: 'principal', precio: 22000, estado: 'disponible' },
    { id: 3, nombre: 'Papas fritas', tipo: 'entrada', precio: 8000, estado: 'disponible' },
    { id: 4, nombre: 'Ensalada cesar', tipo: 'entrada', precio: 12000, estado: 'agotado' },
];

const servicio = new ServicioPlatos(new RepositorioPlatos());
datos.forEach((dto) => servicio.agregar(dto));
const guardado = JSON.stringify(servicio.listar());

console.log('===== Menu interactivo comida =====');

console.log('Platos:', servicio.listar().length);
console.log('Precio total:', servicio.calcularTotal());
console.log('Tipo principal:', servicio.filtrarPorCategoria('principal').length);
console.log('Reporte:', servicio.generarReporte());
console.log('Persistencia:', guardado);

console.log('\n===== PRUEBAS =====');

const casoNormal = servicio.listar()[0];
const casoLimite = servicio.listar().find((item) => item.id === 999) ?? null;

console.log('Caso normal:', casoNormal.nombre);
console.log('Caso limite:', casoLimite);
