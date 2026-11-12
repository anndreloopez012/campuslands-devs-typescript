export {};

type Nivel = 'profesional' | 'amateur';

interface Peleador {
    readonly id: number;
    nombre: string;
    nivel: Nivel;
    golpes: number;
    rounds: number;
}

const peleadores: Peleador[] = [
    { id: 1, nombre: 'Diego', nivel: 'profesional', golpes: 120, rounds: 5 },
    { id: 2, nombre: 'Sara', nivel: 'amateur', golpes: 45, rounds: 3 },
    { id: 3, nombre: 'Bruno', nivel: 'profesional', golpes: 98, rounds: 4 },
    { id: 4, nombre: 'Nora', nivel: 'amateur', golpes: 30, rounds: 2 },
];

function validarPeleador(item: Peleador): boolean {
    return item.nombre.trim() !== '' && item.golpes >= 0 && item.rounds >= 0;
}

function calcularGolpesPorRound(golpes: number, rounds: number): number {
    return rounds === 0 ? 0 : golpes / rounds;
}

function calcularResumen(item: Peleador) {
    return {
        ...item,
        golpesPorRound: calcularGolpesPorRound(item.golpes, item.rounds)
    };
}

const resumenes = peleadores.filter(validarPeleador).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.golpesPorRound - a.golpesPorRound);

const totalGolpes = resumenes.reduce((total, item) => total + item.golpes, 0);
const totalRounds = resumenes.reduce((total, item) => total + item.rounds, 0);

console.log('===== Marcador de kickboxing =====');

console.log('Peleadores:', resumenes.length);
console.log('Golpes totales:', totalGolpes);
console.log('Rounds totales:', totalRounds);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Golpes por round: ' + item.golpesPorRound.toFixed(2));
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', calcularGolpesPorRound(20, 10));
console.log('Caso limite:', calcularGolpesPorRound(15, 0));
