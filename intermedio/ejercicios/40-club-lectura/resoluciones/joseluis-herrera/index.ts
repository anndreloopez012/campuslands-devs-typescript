export {};

type Estado = 'activo' | 'terminado' | 'abandonado';

interface Libro {
    readonly id: number;
    nombre: string;
    estado: Estado;
    paginas: number;
    reuniones: number;
}

class Coleccion<T> {
    private items: T[] = [];

    agregar(item: T): void {
        this.items.push(item);
    }

    listar(): T[] {
        return [...this.items];
    }
}

class SimuladorClub {
    private participantes = new Coleccion<Libro>();

    registrar(participante: Libro): void {
        if (participante.nombre.trim() !== '') {
            this.participantes.agregar(participante);
        }
    }

    calcularPuntaje(participante: Libro): number {
        return participante.paginas / 10 + participante.reuniones * 3;
    }

    simular() {
        return this.participantes.listar()
            .filter((participante) => participante.estado !== 'abandonado')
            .map((participante) => ({
                ...participante,
                puntaje: this.calcularPuntaje(participante)
            }))
            .sort((a, b) => b.puntaje - a.puntaje);
    }
}

const libros: Libro[] = [
    { id: 1, nombre: 'TypeScript practico', estado: 'terminado', paginas: 320, reuniones: 6 },
    { id: 2, nombre: 'Algoritmos claros', estado: 'activo', paginas: 480, reuniones: 4 },
    { id: 3, nombre: 'Novela olvidada', estado: 'abandonado', paginas: 200, reuniones: 1 },
];

const simulador = new SimuladorClub();
libros.forEach((participante) => simulador.registrar(participante));

const resultados = simulador.simular();

console.log('===== Club de lectura =====');

console.log('Libros:', resultados.length);
console.log('Puntaje total:', resultados.reduce((total, resultado) => total + resultado.puntaje, 0));

console.log('\n===== TABLA =====');

resultados.forEach((resultado, index) => {
    console.log((index + 1) + '. ' + resultado.nombre + ' - Puntaje: ' + resultado.puntaje.toFixed(2));
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', simulador.calcularPuntaje({
    id: 99,
    nombre: 'Prueba',
    estado: 'activo',
    paginas: 300,
    reuniones: 4
}));

console.log('Caso limite:', simulador.calcularPuntaje({
    id: 100,
    nombre: 'Prueba',
    estado: 'activo',
    paginas: 0,
    reuniones: 0
}));
