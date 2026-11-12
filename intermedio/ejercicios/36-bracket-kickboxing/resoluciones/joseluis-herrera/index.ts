export {};

type Estado = 'activo' | 'eliminado' | 'clasificado';

interface Peleador {
    readonly id: number;
    nombre: string;
    estado: Estado;
    golpes: number;
    caidas: number;
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

class SimuladorBracket {
    private participantes = new Coleccion<Peleador>();

    registrar(participante: Peleador): void {
        if (participante.nombre.trim() !== '') {
            this.participantes.agregar(participante);
        }
    }

    calcularPuntaje(participante: Peleador): number {
        return participante.golpes - participante.caidas * 5;
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

const peleadores: Peleador[] = [
    { id: 1, nombre: 'Diego', estado: 'clasificado', golpes: 120, caidas: 0 },
    { id: 2, nombre: 'Sara', estado: 'activo', golpes: 95, caidas: 1 },
    { id: 3, nombre: 'Bruno', estado: 'eliminado', golpes: 70, caidas: 2 },
];

const simulador = new SimuladorBracket();
peleadores.forEach((participante) => simulador.registrar(participante));

const resultados = simulador.simular();

console.log('===== Bracket de kickboxing =====');

console.log('Peleadores:', resultados.length);
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
    golpes: 50,
    caidas: 0
}));

console.log('Caso limite:', simulador.calcularPuntaje({
    id: 100,
    nombre: 'Prueba',
    estado: 'activo',
    golpes: 0,
    caidas: 0
}));
