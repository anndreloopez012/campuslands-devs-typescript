export {};

type Estado = 'en-carrera' | 'abandonado' | 'finalizado';

interface Equipo {
    readonly id: number;
    nombre: string;
    estado: Estado;
    desgaste: number;
    tiempo: number;
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

class SimuladorPitStop {
    private participantes = new Coleccion<Equipo>();

    registrar(participante: Equipo): void {
        if (participante.nombre.trim() !== '') {
            this.participantes.agregar(participante);
        }
    }

    calcularPuntaje(participante: Equipo): number {
        return Math.max(0, 100 - participante.desgaste - participante.tiempo);
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

const equipos: Equipo[] = [
    { id: 1, nombre: 'Escuderia Norte', estado: 'finalizado', desgaste: 25, tiempo: 2.4 },
    { id: 2, nombre: 'Escuderia Sur', estado: 'en-carrera', desgaste: 40, tiempo: 3.1 },
    { id: 3, nombre: 'Escuderia Este', estado: 'abandonado', desgaste: 80, tiempo: 5.5 },
];

const simulador = new SimuladorPitStop();
equipos.forEach((participante) => simulador.registrar(participante));

const resultados = simulador.simular();

console.log('===== Estrategia de pit stop =====');

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
    estado: 'en-carrera',
    desgaste: 10,
    tiempo: 2
}));

console.log('Caso limite:', simulador.calcularPuntaje({
    id: 100,
    nombre: 'Prueba',
    estado: 'en-carrera',
    desgaste: 0,
    tiempo: 0
}));
