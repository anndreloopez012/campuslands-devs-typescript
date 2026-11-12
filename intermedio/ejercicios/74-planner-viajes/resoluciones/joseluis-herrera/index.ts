export {};

type Estado = 'planificado' | 'realizado';

interface Viaje {
    readonly id: number;
    nombre: string;
    destino: string;
    dias: number;
    estado: Estado;
}

type ViajeDTO = Viaje;

class RepositorioViajes {
    private items: Viaje[] = [];

    guardar(item: Viaje): void {
        this.items.push(item);
    }

    listar(): Viaje[] {
        return [...this.items];
    }

    buscarPorId(id: number): Viaje | null {
        return this.items.find((item) => item.id === id) ?? null;
    }
}

class ServicioViajes {
    constructor(private readonly repositorio: RepositorioViajes) {}

    agregar(dto: ViajeDTO): void {
        this.repositorio.guardar({ ...dto });
    }

    listar(): Viaje[] {
        return this.repositorio.listar();
    }

    filtrarPorCategoria(categoria: string): Viaje[] {
        return this.listar().filter((item) => item.destino === categoria);
    }

    calcularTotal(): number {
        return this.listar().reduce((total, item) => total + item.dias, 0);
    }

    generarReporte(): Record<string, number> {
        return this.listar().reduce((reporte, item) => {
            reporte[item.destino] = (reporte[item.destino] ?? 0) + item.dias;
            return reporte;
        }, {} as Record<string, number>);
    }
}

const datos: ViajeDTO[] = [
    { id: 1, nombre: 'Ruta cafetera', destino: 'salento', dias: 4, estado: 'planificado' },
    { id: 2, nombre: 'Costa caribe', destino: 'cartagena', dias: 5, estado: 'realizado' },
    { id: 3, nombre: 'Montaña fria', destino: 'villa-de-leyva', dias: 3, estado: 'planificado' },
    { id: 4, nombre: 'Ciudad colonial', destino: 'popayan', dias: 2, estado: 'realizado' },
];

const servicio = new ServicioViajes(new RepositorioViajes());
datos.forEach((dto) => servicio.agregar(dto));
const guardado = JSON.stringify(servicio.listar());

console.log('===== Planner de viajes DOM =====');

console.log('Viajes:', servicio.listar().length);
console.log('Dias total:', servicio.calcularTotal());
console.log('Destino salento:', servicio.filtrarPorCategoria('salento').length);
console.log('Reporte:', servicio.generarReporte());
console.log('Persistencia:', guardado);

console.log('\n===== PRUEBAS =====');

const casoNormal = servicio.listar()[0];
const casoLimite = servicio.listar().find((item) => item.id === 999) ?? null;

console.log('Caso normal:', casoNormal.nombre);
console.log('Caso limite:', casoLimite);
