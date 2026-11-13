export {};

type Estado = 'disponible' | 'prestado';

interface Libro {
    readonly id: number;
    titulo: string;
    genero: string;
    paginas: number;
    estado: Estado;
}

type LibroDTO = Libro;

class RepositorioLibros {
    private items: Libro[] = [];

    guardar(item: Libro): void {
        this.items.push(item);
    }

    listar(): Libro[] {
        return [...this.items];
    }

    buscarPorId(id: number): Libro | null {
        return this.items.find((item) => item.id === id) ?? null;
    }
}

class ServicioLibros {
    constructor(private readonly repositorio: RepositorioLibros) {}

    agregar(dto: LibroDTO): void {
        this.repositorio.guardar({ ...dto });
    }

    listar(): Libro[] {
        return this.repositorio.listar();
    }

    filtrarPorCategoria(categoria: string): Libro[] {
        return this.listar().filter((item) => item.genero === categoria);
    }

    calcularTotal(): number {
        return this.listar().reduce((total, item) => total + item.paginas, 0);
    }

    generarReporte(): Record<string, number> {
        return this.listar().reduce((reporte, item) => {
            reporte[item.genero] = (reporte[item.genero] ?? 0) + item.paginas;
            return reporte;
        }, {} as Record<string, number>);
    }
}

const datos: LibroDTO[] = [
    { id: 1, titulo: 'TypeScript practico', genero: 'tecnologia', paginas: 320, estado: 'disponible' },
    { id: 2, titulo: 'Algoritmos claros', genero: 'tecnologia', paginas: 480, estado: 'prestado' },
    { id: 3, titulo: 'Cien años de soledad', genero: 'novela', paginas: 420, estado: 'disponible' },
    { id: 4, titulo: 'El principito', genero: 'novela', paginas: 96, estado: 'prestado' },
];

const servicio = new ServicioLibros(new RepositorioLibros());
datos.forEach((dto) => servicio.agregar(dto));
const guardado = JSON.stringify(servicio.listar());

console.log('===== Biblioteca con localStorage =====');

console.log('Libros:', servicio.listar().length);
console.log('Paginas total:', servicio.calcularTotal());
console.log('Genero tecnologia:', servicio.filtrarPorCategoria('tecnologia').length);
console.log('Reporte:', servicio.generarReporte());
console.log('Persistencia:', guardado);

console.log('\n===== PRUEBAS =====');

const casoNormal = servicio.listar()[0];
const casoLimite = servicio.listar().find((item) => item.id === 999) ?? null;

console.log('Caso normal:', casoNormal.titulo);
console.log('Caso limite:', casoLimite);
