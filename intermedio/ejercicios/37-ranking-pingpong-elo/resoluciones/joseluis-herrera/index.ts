export {};

type Estado = 'activo' | 'inactivo' | 'clasificado';

interface Jugador {
    readonly id: number;
    nombre: string;
    estado: Estado;
    rating: number;
    partidos: number;
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

class SimuladorElo {
    private participantes = new Coleccion<Jugador>();

    registrar(participante: Jugador): void {
        if (participante.nombre.trim() !== '') {
            this.participantes.agregar(participante);
        }
    }

    calcularPuntaje(participante: Jugador): number {
        return participante.rating + participante.partidos * 2;
    }

    simular() {
        return this.participantes.listar()
            .filter((participante) => participante.estado !== 'inactivo')
            .map((participante) => ({
                ...participante,
                puntaje: this.calcularPuntaje(participante)
            }))
            .sort((a, b) => b.puntaje - a.puntaje);
    }
}

const jugadores: Jugador[] = [
    { id: 1, nombre: 'Ana', estado: 'clasificado', rating: 1600, partidos: 30 },
    { id: 2, nombre: 'Luis', estado: 'activo', rating: 1450, partidos: 22 },
    { id: 3, nombre: 'Marta', estado: 'inactivo', rating: 1700, partidos: 5 },
];

const simulador = new SimuladorElo();
jugadores.forEach((participante) => simulador.registrar(participante));

const resultados = simulador.simular();

console.log('===== Ranking ELO pingpong =====');

console.log('Jugadores:', resultados.length);
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
    rating: 1500,
    partidos: 10
}));

console.log('Caso limite:', simulador.calcularPuntaje({
    id: 100,
    nombre: 'Prueba',
    estado: 'activo',
    rating: 0,
    partidos: 0
}));
