export {};

type Rareza = 'comun' | 'rara' | 'epica' | 'legendaria';

interface Arma {
    readonly id: number;
    nombre: string;
    rareza: Rareza;
    dano: number;
    cadencia: number;
}

const armas: Arma[] = [
    { id: 1, nombre: 'Rifle comun', rareza: 'comun', dano: 30, cadencia: 4.5 },
    { id: 2, nombre: 'Subfusil rara', rareza: 'rara', dano: 22, cadencia: 8 },
    { id: 3, nombre: 'Fusil epico', rareza: 'epica', dano: 45, cadencia: 5 },
    { id: 4, nombre: 'Lanzacohetes legendario', rareza: 'legendaria', dano: 90, cadencia: 0.5 },
];

function validarArma(item: Arma): boolean {
    return item.nombre.trim() !== '' && item.dano >= 0 && item.cadencia >= 0;
}

function calcularDps(dano: number, cadencia: number): number {
    return dano * cadencia;
}

function calcularResumen(item: Arma) {
    return {
        ...item,
        dps: calcularDps(item.dano, item.cadencia)
    };
}

const resumenes = armas.filter(validarArma).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.dps - a.dps);

const totalDano = resumenes.reduce((total, item) => total + item.dano, 0);
const totalCadencia = resumenes.reduce((total, item) => total + item.cadencia, 0);

console.log('===== Inventario tactico battle royale =====');

console.log('Armas:', resumenes.length);
console.log('Dano totales:', totalDano);
console.log('Cadencia totales:', totalCadencia);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - DPS: ' + item.dps.toFixed(2));
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', calcularDps(20, 10));
console.log('Caso limite:', calcularDps(15, 0));
