export {};

type Estado = 'confirmada' | 'pendiente';

interface Cita {
    readonly id: number;
    nombre: string;
    estilo: string;
    precio: number;
    estado: Estado;
}

type CitaDTO = Cita;

class RepositorioCitas {
    private items: Cita[] = [];

    guardar(item: Cita): void {
        this.items.push(item);
    }

    listar(): Cita[] {
        return [...this.items];
    }

    buscarPorId(id: number): Cita | null {
        return this.items.find((item) => item.id === id) ?? null;
    }
}

class ServicioCitas {
    constructor(private readonly repositorio: RepositorioCitas) {}

    agregar(dto: CitaDTO): void {
        this.repositorio.guardar({ ...dto });
    }

    listar(): Cita[] {
        return this.repositorio.listar();
    }

    filtrarPorCategoria(categoria: string): Cita[] {
        return this.listar().filter((item) => item.estilo === categoria);
    }

    calcularTotal(): number {
        return this.listar().reduce((total, item) => total + item.precio, 0);
    }

    generarReporte(): Record<string, number> {
        return this.listar().reduce((reporte, item) => {
            reporte[item.estilo] = (reporte[item.estilo] ?? 0) + item.precio;
            return reporte;
        }, {} as Record<string, number>);
    }
}

const datos: CitaDTO[] = [
    { id: 1, nombre: 'Realismo brazo', estilo: 'realismo', precio: 450000, estado: 'confirmada' },
    { id: 2, nombre: 'Lineal muñeca', estilo: 'lineal', precio: 150000, estado: 'confirmada' },
    { id: 3, nombre: 'Tradicional pierna', estilo: 'tradicional', precio: 300000, estado: 'pendiente' },
    { id: 4, nombre: 'Realismo espalda', estilo: 'realismo', precio: 800000, estado: 'confirmada' },
];

const servicio = new ServicioCitas(new RepositorioCitas());
datos.forEach((dto) => servicio.agregar(dto));
const guardado = JSON.stringify(servicio.listar());

console.log('===== Booking tattoo app =====');

console.log('Citas:', servicio.listar().length);
console.log('Precio total:', servicio.calcularTotal());
console.log('Estilo realismo:', servicio.filtrarPorCategoria('realismo').length);
console.log('Reporte:', servicio.generarReporte());
console.log('Persistencia:', guardado);

console.log('\n===== PRUEBAS =====');

const casoNormal = servicio.listar()[0];
const casoLimite = servicio.listar().find((item) => item.id === 999) ?? null;

console.log('Caso normal:', casoNormal.nombre);
console.log('Caso limite:', casoLimite);
