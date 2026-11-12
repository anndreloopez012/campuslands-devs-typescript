export {};

type Estado = 'habilitado' | 'pendiente';

interface Saltador {
    readonly id: number;
    nombre: string;
    nivel: string;
    saltos: number;
    estado: Estado;
}

type SaltadorDTO = Saltador;

class RepositorioSaltadors {
    private items: Saltador[] = [];

    guardar(item: Saltador): void {
        this.items.push(item);
    }

    listar(): Saltador[] {
        return [...this.items];
    }

    buscarPorId(id: number): Saltador | null {
        return this.items.find((item) => item.id === id) ?? null;
    }
}

class ServicioSaltadors {
    constructor(private readonly repositorio: RepositorioSaltadors) {}

    agregar(dto: SaltadorDTO): void {
        this.repositorio.guardar({ ...dto });
    }

    listar(): Saltador[] {
        return this.repositorio.listar();
    }

    filtrarPorCategoria(categoria: string): Saltador[] {
        return this.listar().filter((item) => item.nivel === categoria);
    }

    calcularTotal(): number {
        return this.listar().reduce((total, item) => total + item.saltos, 0);
    }

    generarReporte(): Record<string, number> {
        return this.listar().reduce((reporte, item) => {
            reporte[item.nivel] = (reporte[item.nivel] ?? 0) + item.saltos;
            return reporte;
        }, {} as Record<string, number>);
    }
}

const datos: SaltadorDTO[] = [
    { id: 1, nombre: 'Ana', nivel: 'avanzado', saltos: 120, estado: 'habilitado' },
    { id: 2, nombre: 'Luis', nivel: 'principiante', saltos: 5, estado: 'pendiente' },
    { id: 3, nombre: 'Marta', nivel: 'intermedio', saltos: 45, estado: 'habilitado' },
    { id: 4, nombre: 'Pablo', nivel: 'avanzado', saltos: 200, estado: 'habilitado' },
];

const servicio = new ServicioSaltadors(new RepositorioSaltadors());
datos.forEach((dto) => servicio.agregar(dto));
const guardado = JSON.stringify(servicio.listar());

console.log('===== Check-in de salto =====');

console.log('Saltadores:', servicio.listar().length);
console.log('Saltos total:', servicio.calcularTotal());
console.log('Nivel avanzado:', servicio.filtrarPorCategoria('avanzado').length);
console.log('Reporte:', servicio.generarReporte());
console.log('Persistencia:', guardado);

console.log('\n===== PRUEBAS =====');

const casoNormal = servicio.listar()[0];
const casoLimite = servicio.listar().find((item) => item.id === 999) ?? null;

console.log('Caso normal:', casoNormal.nombre);
console.log('Caso limite:', casoLimite);
