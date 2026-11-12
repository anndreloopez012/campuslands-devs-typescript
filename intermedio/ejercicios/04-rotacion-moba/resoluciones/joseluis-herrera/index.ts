export {};

type Rol = 'tanque' | 'asesino' | 'soporte';

interface Heroe {
    readonly id: number;
    nombre: string;
    rol: Rol;
    victorias: number;
    derrotas: number;
}

const heroes: Heroe[] = [
    { id: 1, nombre: 'Atlas', rol: 'tanque', victorias: 18, derrotas: 7 },
    { id: 2, nombre: 'Nyx', rol: 'asesino', victorias: 22, derrotas: 10 },
    { id: 3, nombre: 'Seren', rol: 'soporte', victorias: 15, derrotas: 12 },
    { id: 4, nombre: 'Kuro', rol: 'asesino', victorias: 9, derrotas: 1 },
];

function validarHeroe(item: Heroe): boolean {
    return item.nombre.trim() !== '' && item.victorias >= 0 && item.derrotas >= 0;
}

function calcularWinrate(victorias: number, derrotas: number): number {
    const total = victorias + derrotas; return total === 0 ? 0 : victorias / total;
}

function calcularResumen(item: Heroe) {
    return {
        ...item,
        winrate: calcularWinrate(item.victorias, item.derrotas)
    };
}

const resumenes = heroes.filter(validarHeroe).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.winrate - a.winrate);

const totalVictorias = resumenes.reduce((total, item) => total + item.victorias, 0);
const totalDerrotas = resumenes.reduce((total, item) => total + item.derrotas, 0);

console.log('===== Rotacion de heroes MOBA =====');

console.log('Heroes:', resumenes.length);
console.log('Victorias totales:', totalVictorias);
console.log('Derrotas totales:', totalDerrotas);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Winrate: ' + item.winrate.toFixed(2));
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', calcularWinrate(20, 10));
console.log('Caso limite:', calcularWinrate(15, 0));
