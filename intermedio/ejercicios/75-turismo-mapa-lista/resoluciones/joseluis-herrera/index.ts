export {};

type Estado = 'abierto' | 'cerrado';

interface Lugar {
    readonly id: number;
    nombre: string;
    ciudad: string;
    visitantes: number;
    estado: Estado;
}

type LugarDTO = Lugar;

class RepositorioLugars {
    private items: Lugar[] = [];

    guardar(item: Lugar): void {
        this.items.push(item);
    }

    listar(): Lugar[] {
        return [...this.items];
    }

    buscarPorId(id: number): Lugar | null {
        return this.items.find((item) => item.id === id) ?? null;
    }
}

class ServicioLugars {
    constructor(private readonly repositorio: RepositorioLugars) {}

    agregar(dto: LugarDTO): void {
        this.repositorio.guardar({ ...dto });
    }

    listar(): Lugar[] {
        return this.repositorio.listar();
    }

    filtrarPorCategoria(categoria: string): Lugar[] {
        return this.listar().filter((item) => item.ciudad === categoria);
    }

    calcularTotal(): number {
        return this.listar().reduce((total, item) => total + item.visitantes, 0);
    }

    generarReporte(): Record<string, number> {
        return this.listar().reduce((reporte, item) => {
            reporte[item.ciudad] = (reporte[item.ciudad] ?? 0) + item.visitantes;
            return reporte;
        }, {} as Record<string, number>);
    }
}

const datos: LugarDTO[] = [
    { id: 1, nombre: 'Museo del oro', ciudad: 'bogota', visitantes: 12000, estado: 'abierto' },
    { id: 2, nombre: 'Plaza de bolivar', ciudad: 'bogota', visitantes: 9000, estado: 'abierto' },
    { id: 3, nombre: 'Castillo san felipe', ciudad: 'cartagena', visitantes: 15000, estado: 'abierto' },
    { id: 4, nombre: 'Catedral', ciudad: 'popayan', visitantes: 4000, estado: 'cerrado' },
];

const servicio = new ServicioLugars(new RepositorioLugars());
datos.forEach((dto) => servicio.agregar(dto));
const guardado = JSON.stringify(servicio.listar());

console.log('===== Lista turistica interactiva =====');

console.log('Lugares:', servicio.listar().length);
console.log('Visitantes total:', servicio.calcularTotal());
console.log('Ciudad bogota:', servicio.filtrarPorCategoria('bogota').length);
console.log('Reporte:', servicio.generarReporte());
console.log('Persistencia:', guardado);

console.log('\n===== PRUEBAS =====');

const casoNormal = servicio.listar()[0];
const casoLimite = servicio.listar().find((item) => item.id === 999) ?? null;

console.log('Caso normal:', casoNormal.nombre);
console.log('Caso limite:', casoLimite);
