export {};

type Estado = 'disponible' | 'vista' | 'descartada';

interface Pelicula {
    readonly id: number;
    nombre: string;
    estado: Estado;
    calificacion: number;
    vistas: number;
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

class SimuladorStreaming {
    private participantes = new Coleccion<Pelicula>();

    registrar(participante: Pelicula): void {
        if (participante.nombre.trim() !== '') {
            this.participantes.agregar(participante);
        }
    }

    calcularPuntaje(participante: Pelicula): number {
        return participante.calificacion * 20 + participante.vistas / 1000;
    }

    simular() {
        return this.participantes.listar()
            .filter((participante) => participante.estado !== 'descartada')
            .map((participante) => ({
                ...participante,
                puntaje: this.calcularPuntaje(participante)
            }))
            .sort((a, b) => b.puntaje - a.puntaje);
    }
}

const peliculas: Pelicula[] = [
    { id: 1, nombre: 'Orbita Perdida', estado: 'disponible', calificacion: 9, vistas: 120000 },
    { id: 2, nombre: 'Sotano 13', estado: 'vista', calificacion: 6, vistas: 45000 },
    { id: 3, nombre: 'El faro negro', estado: 'descartada', calificacion: 8, vistas: 80000 },
];

const simulador = new SimuladorStreaming();
peliculas.forEach((participante) => simulador.registrar(participante));

const resultados = simulador.simular();

console.log('===== Recomendador de streaming =====');

console.log('Peliculas:', resultados.length);
console.log('Puntaje total:', resultados.reduce((total, resultado) => total + resultado.puntaje, 0));

console.log('\n===== TABLA =====');

resultados.forEach((resultado, index) => {
    console.log((index + 1) + '. ' + resultado.nombre + ' - Puntaje: ' + resultado.puntaje.toFixed(2));
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', simulador.calcularPuntaje({
    id: 99,
    nombre: 'Prueba',
    estado: 'disponible',
    calificacion: 9,
    vistas: 100000
}));

console.log('Caso limite:', simulador.calcularPuntaje({
    id: 100,
    nombre: 'Prueba',
    estado: 'disponible',
    calificacion: 0,
    vistas: 0
}));
