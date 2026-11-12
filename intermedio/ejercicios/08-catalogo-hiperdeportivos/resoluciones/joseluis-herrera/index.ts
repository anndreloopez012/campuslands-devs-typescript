export {};

type Tipo = 'hipercar' | 'supercar' | 'track';

interface Hiperdeportivo {
    readonly id: number;
    nombre: string;
    tipo: Tipo;
    potencia: number;
    peso: number;
}

const hiperdeportivos: Hiperdeportivo[] = [
    { id: 1, nombre: 'Vortex GT', tipo: 'hipercar', potencia: 1500, peso: 1450 },
    { id: 2, nombre: 'Falcon S', tipo: 'supercar', potencia: 720, peso: 1380 },
    { id: 3, nombre: 'Track One', tipo: 'track', potencia: 900, peso: 1100 },
    { id: 4, nombre: 'Apex R', tipo: 'hipercar', potencia: 1600, peso: 1500 },
];

function validarHiperdeportivo(item: Hiperdeportivo): boolean {
    return item.nombre.trim() !== '' && item.potencia >= 0 && item.peso >= 0;
}

function calcularPotenciaPeso(potencia: number, peso: number): number {
    return peso === 0 ? 0 : potencia / peso;
}

function calcularResumen(item: Hiperdeportivo) {
    return {
        ...item,
        potenciaPeso: calcularPotenciaPeso(item.potencia, item.peso)
    };
}

const resumenes = hiperdeportivos.filter(validarHiperdeportivo).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.potenciaPeso - a.potenciaPeso);

const totalPotencia = resumenes.reduce((total, item) => total + item.potencia, 0);
const totalPeso = resumenes.reduce((total, item) => total + item.peso, 0);

console.log('===== Catalogo de hiperdeportivos =====');

console.log('Hiperdeportivos:', resumenes.length);
console.log('Potencia totales:', totalPotencia);
console.log('Peso totales:', totalPeso);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Potencia por peso: ' + item.potenciaPeso.toFixed(2));
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', calcularPotenciaPeso(20, 10));
console.log('Caso limite:', calcularPotenciaPeso(15, 0));
