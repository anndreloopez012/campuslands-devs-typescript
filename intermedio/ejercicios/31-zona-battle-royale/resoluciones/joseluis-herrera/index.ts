export {};

type Estado = 'activo' | 'eliminado' | 'clasificado';

interface Jugador {
    readonly id: number;
    nombre: string;
    estado: Estado;
    dano: number;
    supervivencia: number;
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

class SimuladorZona {
    private participantes = new Coleccion<Jugador>();

    registrar(participante: Jugador): void {
        if (participante.nombre.trim() !== '') {
            this.participantes.agregar(participante);
        }
    }

    calcularPuntaje(participante: Jugador): number {
        return participante.dano * 0.6 + participante.supervivencia * 0.4;
    }

    simular() {
        return this.participantes.listar()
            .filter((participante) => participante.estado !== 'eliminado')
            .map((participante) => ({
                ...participante,
                puntaje: this.calcularPuntaje(participante)
            }))
            .sort((a, b) => b.puntaje - a.puntaje);
    }
}

const jugadores: Jugador[] = [
    { id: 1, nombre: 'Shadow', estado: 'activo', dano: 850, supervivencia: 70 },
    { id: 2, nombre: 'Ghost', estado: 'clasificado', dano: 1200, supervivencia: 90 },
    { id: 3, nombre: 'Raven', estado: 'eliminado', dano: 400, supervivencia: 30 },
];

const simulador = new SimuladorZona();
jugadores.forEach((participante) => simulador.registrar(participante));

const resultados = simulador.simular();

console.log('===== Simulador de zona battle royale =====');

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
    dano: 100,
    supervivencia: 50
}));

console.log('Caso limite:', simulador.calcularPuntaje({
    id: 100,
    nombre: 'Prueba',
    estado: 'activo',
    dano: 0,
    supervivencia: 0
}));
