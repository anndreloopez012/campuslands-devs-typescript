export {};

type Estado = 'aprobado' | 'pendiente';

interface Proyecto {
    readonly id: number;
    nombre: string;
    tipo: string;
    area: number;
    estado: Estado;
}

type ProyectoDTO = Proyecto;

class RepositorioProyectos {
    private items: Proyecto[] = [];

    guardar(item: Proyecto): void {
        this.items.push(item);
    }

    listar(): Proyecto[] {
        return [...this.items];
    }

    buscarPorId(id: number): Proyecto | null {
        return this.items.find((item) => item.id === id) ?? null;
    }
}

class ServicioProyectos {
    constructor(private readonly repositorio: RepositorioProyectos) {}

    agregar(dto: ProyectoDTO): void {
        this.repositorio.guardar({ ...dto });
    }

    listar(): Proyecto[] {
        return this.repositorio.listar();
    }

    filtrarPorCategoria(categoria: string): Proyecto[] {
        return this.listar().filter((item) => item.tipo === categoria);
    }

    calcularTotal(): number {
        return this.listar().reduce((total, item) => total + item.area, 0);
    }

    generarReporte(): Record<string, number> {
        return this.listar().reduce((reporte, item) => {
            reporte[item.tipo] = (reporte[item.tipo] ?? 0) + item.area;
            return reporte;
        }, {} as Record<string, number>);
    }
}

const datos: ProyectoDTO[] = [
    { id: 1, nombre: 'Casa campestre', tipo: 'residencial', area: 180, estado: 'aprobado' },
    { id: 2, nombre: 'Local comercial', tipo: 'comercial', area: 95, estado: 'aprobado' },
    { id: 3, nombre: 'Oficina', tipo: 'corporativo', area: 240, estado: 'pendiente' },
    { id: 4, nombre: 'Apartamento', tipo: 'residencial', area: 120, estado: 'aprobado' },
];

const servicio = new ServicioProyectos(new RepositorioProyectos());
datos.forEach((dto) => servicio.agregar(dto));
const guardado = JSON.stringify(servicio.listar());

console.log('===== Cotizador arquitectura 3D =====');

console.log('Proyectos:', servicio.listar().length);
console.log('Area total:', servicio.calcularTotal());
console.log('Tipo residencial:', servicio.filtrarPorCategoria('residencial').length);
console.log('Reporte:', servicio.generarReporte());
console.log('Persistencia:', guardado);

console.log('\n===== PRUEBAS =====');

const casoNormal = servicio.listar()[0];
const casoLimite = servicio.listar().find((item) => item.id === 999) ?? null;

console.log('Caso normal:', casoNormal.nombre);
console.log('Caso limite:', casoLimite);
