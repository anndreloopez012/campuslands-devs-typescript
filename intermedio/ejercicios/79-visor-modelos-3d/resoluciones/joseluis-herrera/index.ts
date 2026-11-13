export {};

type Estado = 'optimizado' | 'pendiente';

interface Modelo {
    readonly id: number;
    nombre: string;
    tipo: string;
    poligonos: number;
    estado: Estado;
}

type ModeloDTO = Modelo;

class RepositorioModelos {
    private items: Modelo[] = [];

    guardar(item: Modelo): void {
        this.items.push(item);
    }

    listar(): Modelo[] {
        return [...this.items];
    }

    buscarPorId(id: number): Modelo | null {
        return this.items.find((item) => item.id === id) ?? null;
    }
}

class ServicioModelos {
    constructor(private readonly repositorio: RepositorioModelos) {}

    agregar(dto: ModeloDTO): void {
        this.repositorio.guardar({ ...dto });
    }

    listar(): Modelo[] {
        return this.repositorio.listar();
    }

    filtrarPorCategoria(categoria: string): Modelo[] {
        return this.listar().filter((item) => item.tipo === categoria);
    }

    calcularTotal(): number {
        return this.listar().reduce((total, item) => total + item.poligonos, 0);
    }

    generarReporte(): Record<string, number> {
        return this.listar().reduce((reporte, item) => {
            reporte[item.tipo] = (reporte[item.tipo] ?? 0) + item.poligonos;
            return reporte;
        }, {} as Record<string, number>);
    }
}

const datos: ModeloDTO[] = [
    { id: 1, nombre: 'Personaje heroe', tipo: 'personaje', poligonos: 15000, estado: 'optimizado' },
    { id: 2, nombre: 'Auto deportivo', tipo: 'vehiculo', poligonos: 28000, estado: 'pendiente' },
    { id: 3, nombre: 'Arbol', tipo: 'escenario', poligonos: 3000, estado: 'optimizado' },
    { id: 4, nombre: 'Edificio', tipo: 'escenario', poligonos: 42000, estado: 'pendiente' },
];

const servicio = new ServicioModelos(new RepositorioModelos());
datos.forEach((dto) => servicio.agregar(dto));
const guardado = JSON.stringify(servicio.listar());

console.log('===== Visor de assets 3D =====');

console.log('Modelos:', servicio.listar().length);
console.log('Poligonos total:', servicio.calcularTotal());
console.log('Tipo personaje:', servicio.filtrarPorCategoria('personaje').length);
console.log('Reporte:', servicio.generarReporte());
console.log('Persistencia:', guardado);

console.log('\n===== PRUEBAS =====');

const casoNormal = servicio.listar()[0];
const casoLimite = servicio.listar().find((item) => item.id === 999) ?? null;

console.log('Caso normal:', casoNormal.nombre);
console.log('Caso limite:', casoLimite);
