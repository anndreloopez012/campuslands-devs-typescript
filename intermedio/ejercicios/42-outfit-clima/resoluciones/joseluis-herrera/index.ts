export {};

type Estado = 'planificado' | 'usado' | 'descartado';

interface Outfit {
    readonly id: number;
    nombre: string;
    fecha: string;
    estado: Estado;
    prendas: number;
}

const outfits: Outfit[] = [
    { id: 1, nombre: 'Dia soleado', fecha: '2026-01-08', estado: 'usado', prendas: 4 },
    { id: 2, nombre: 'Noche fria', fecha: '2026-01-15', estado: 'usado', prendas: 5 },
    { id: 3, nombre: 'Lluvia ligera', fecha: '2026-02-02', estado: 'planificado', prendas: 5 },
    { id: 4, nombre: 'Calor extremo', fecha: '2026-02-20', estado: 'descartado', prendas: 3 },
];

function validarOutfit(item: Outfit): boolean {
    return item.nombre.trim() !== '' && !Number.isNaN(Date.parse(item.fecha)) && item.prendas > 0;
}

function filtrarPorMes(lista: Outfit[], mes: string): Outfit[] {
    return lista.filter((item) => item.fecha.startsWith(mes));
}

function contarPorEstado(lista: Outfit[]): Record<Estado, number> {
    return lista.reduce((conteo, item) => {
        conteo[item.estado] += 1;
        return conteo;
    }, { 'planificado': 0, 'usado': 0, 'descartado': 0 });
}

function calcularTotal(lista: Outfit[]): number {
    return lista.reduce((total, item) => total + item.prendas, 0);
}

const validos = outfits.filter(validarOutfit);
const enero = filtrarPorMes(validos, '2026-01');
const confirmados = validos.filter((item) => item.estado === 'usado');

console.log('===== Outfit segun clima =====');

console.log('Outfits validos:', validos.length);
console.log('Outfits confirmados:', confirmados.length);
console.log('Prendas total:', calcularTotal(validos));
console.log('Prendas en enero:', calcularTotal(enero));
console.log('Conteo por estado:', contarPorEstado(validos));

console.log('\n===== PRUEBAS =====');

const casoNormal = calcularTotal([
    { id: 99, nombre: 'Prueba', fecha: '2026-01-15', estado: 'usado', prendas: 10 }
]);

const casoLimite = calcularTotal([]);

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
