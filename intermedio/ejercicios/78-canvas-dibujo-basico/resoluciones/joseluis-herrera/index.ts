export {};

type Estado = 'guardado' | 'borrador';

interface Trazo {
    readonly id: number;
    nombre: string;
    tecnica: string;
    puntos: number;
    estado: Estado;
}

type TrazoDTO = Trazo;

class RepositorioTrazos {
    private items: Trazo[] = [];

    guardar(item: Trazo): void {
        this.items.push(item);
    }

    listar(): Trazo[] {
        return [...this.items];
    }

    buscarPorId(id: number): Trazo | null {
        return this.items.find((item) => item.id === id) ?? null;
    }
}

class ServicioTrazos {
    constructor(private readonly repositorio: RepositorioTrazos) {}

    agregar(dto: TrazoDTO): void {
        this.repositorio.guardar({ ...dto });
    }

    listar(): Trazo[] {
        return this.repositorio.listar();
    }

    filtrarPorCategoria(categoria: string): Trazo[] {
        return this.listar().filter((item) => item.tecnica === categoria);
    }

    calcularTotal(): number {
        return this.listar().reduce((total, item) => total + item.puntos, 0);
    }

    generarReporte(): Record<string, number> {
        return this.listar().reduce((reporte, item) => {
            reporte[item.tecnica] = (reporte[item.tecnica] ?? 0) + item.puntos;
            return reporte;
        }, {} as Record<string, number>);
    }
}

const datos: TrazoDTO[] = [
    { id: 1, nombre: 'Retrato digital', tecnica: 'digital', puntos: 1200, estado: 'guardado' },
    { id: 2, nombre: 'Estudio de manos', tecnica: 'lapiz', puntos: 800, estado: 'guardado' },
    { id: 3, nombre: 'Paisaje', tecnica: 'acuarela', puntos: 1500, estado: 'borrador' },
    { id: 4, nombre: 'Personaje', tecnica: 'digital', puntos: 2000, estado: 'guardado' },
];

const servicio = new ServicioTrazos(new RepositorioTrazos());
datos.forEach((dto) => servicio.agregar(dto));
const guardado = JSON.stringify(servicio.listar());

console.log('===== Canvas de dibujo basico =====');

console.log('Trazos:', servicio.listar().length);
console.log('Puntos total:', servicio.calcularTotal());
console.log('Tecnica digital:', servicio.filtrarPorCategoria('digital').length);
console.log('Reporte:', servicio.generarReporte());
console.log('Persistencia:', guardado);

console.log('\n===== PRUEBAS =====');

const casoNormal = servicio.listar()[0];
const casoLimite = servicio.listar().find((item) => item.id === 999) ?? null;

console.log('Caso normal:', casoNormal.nombre);
console.log('Caso limite:', casoLimite);
