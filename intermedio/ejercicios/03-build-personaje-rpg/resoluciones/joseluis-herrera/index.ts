export {};

type Clase = 'guerrero' | 'mago' | 'arquero';

interface Personaje {
    readonly id: number;
    nombre: string;
    clase: Clase;
    ataque: number;
    defensa: number;
}

const personajes: Personaje[] = [
    { id: 1, nombre: 'Kael', clase: 'guerrero', ataque: 80, defensa: 70 },
    { id: 2, nombre: 'Lyra', clase: 'mago', ataque: 95, defensa: 35 },
    { id: 3, nombre: 'Finn', clase: 'arquero', ataque: 65, defensa: 45 },
    { id: 4, nombre: 'Mira', clase: 'mago', ataque: 88, defensa: 50 },
];

function validarPersonaje(item: Personaje): boolean {
    return item.nombre.trim() !== '' && item.ataque >= 0 && item.defensa >= 0;
}

function calcularPoder(ataque: number, defensa: number): number {
    return ataque + defensa;
}

function calcularResumen(item: Personaje) {
    return {
        ...item,
        poder: calcularPoder(item.ataque, item.defensa)
    };
}

const resumenes = personajes.filter(validarPersonaje).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.poder - a.poder);

const totalAtaque = resumenes.reduce((total, item) => total + item.ataque, 0);
const totalDefensa = resumenes.reduce((total, item) => total + item.defensa, 0);

console.log('===== Builder de personaje RPG =====');

console.log('Personajes:', resumenes.length);
console.log('Ataque totales:', totalAtaque);
console.log('Defensa totales:', totalDefensa);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Poder: ' + item.poder.toFixed(0));
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', calcularPoder(20, 10));
console.log('Caso limite:', calcularPoder(15, 0));
