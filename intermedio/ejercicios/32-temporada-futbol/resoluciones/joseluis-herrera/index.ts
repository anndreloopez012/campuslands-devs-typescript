export {};

type Estado = 'activo' | 'descendido' | 'clasificado';

interface Equipo {
    readonly id: number;
    nombre: string;
    estado: Estado;
    victorias: number;
    empates: number;
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

class SimuladorTemporada {
    private participantes = new Coleccion<Equipo>();

    registrar(participante: Equipo): void {
        if (participante.nombre.trim() !== '') {
            this.participantes.agregar(participante);
        }
    }

    calcularPuntaje(participante: Equipo): number {
        return participante.victorias * 3 + participante.empates;
    }

    simular() {
        return this.participantes.listar()
            .filter((participante) => participante.estado !== 'descendido')
            .map((participante) => ({
                ...participante,
                puntaje: this.calcularPuntaje(participante)
            }))
            .sort((a, b) => b.puntaje - a.puntaje);
    }
}

const equipos: Equipo[] = [
    { id: 1, nombre: 'Tigres', estado: 'clasificado', victorias: 18, empates: 5 },
    { id: 2, nombre: 'Halcones', estado: 'activo', victorias: 12, empates: 6 },
    { id: 3, nombre: 'Lobos', estado: 'descendido', victorias: 4, empates: 3 },
];

const simulador = new SimuladorTemporada();
equipos.forEach((participante) => simulador.registrar(participante));

const resultados = simulador.simular();

console.log('===== Temporada modo carrera =====');

console.log('Equipos:', resultados.length);
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
    victorias: 10,
    empates: 5
}));

console.log('Caso limite:', simulador.calcularPuntaje({
    id: 100,
    nombre: 'Prueba',
    estado: 'activo',
    victorias: 0,
    empates: 0
}));
