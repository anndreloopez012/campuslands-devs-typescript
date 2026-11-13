export {};

type Estado = 'confirmada' | 'pendiente' | 'descartada';

interface Cancion {
    readonly id: number;
    nombre: string;
    estado: Estado;
    energia: number;
    duracion: number;
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

class SimuladorSetlist {
    private participantes = new Coleccion<Cancion>();

    registrar(participante: Cancion): void {
        if (participante.nombre.trim() !== '') {
            this.participantes.agregar(participante);
        }
    }

    calcularPuntaje(participante: Cancion): number {
        return participante.energia * 100 - participante.duracion;
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

const canciones: Cancion[] = [
    { id: 1, nombre: 'Apertura', estado: 'confirmada', energia: 9, duracion: 200 },
    { id: 2, nombre: 'Balada', estado: 'pendiente', energia: 4, duracion: 240 },
    { id: 3, nombre: 'Descarte', estado: 'descartada', energia: 2, duracion: 180 },
];

const simulador = new SimuladorSetlist();
canciones.forEach((participante) => simulador.registrar(participante));

const resultados = simulador.simular();

console.log('===== Setlist de concierto =====');

console.log('Canciones:', resultados.length);
console.log('Puntaje total:', resultados.reduce((total, resultado) => total + resultado.puntaje, 0));

console.log('\n===== TABLA =====');

resultados.forEach((resultado, index) => {
    console.log((index + 1) + '. ' + resultado.nombre + ' - Puntaje: ' + resultado.puntaje.toFixed(2));
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', simulador.calcularPuntaje({
    id: 99,
    nombre: 'Prueba',
    estado: 'confirmada',
    energia: 8,
    duracion: 200
}));

console.log('Caso limite:', simulador.calcularPuntaje({
    id: 100,
    nombre: 'Prueba',
    estado: 'confirmada',
    energia: 0,
    duracion: 0
}));
