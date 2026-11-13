export {};

type Estado = 'activa' | 'concluida';

interface Temporada {
    nombre: string;
    episodios: number;
}

interface Saga {
    readonly id: number;
    nombre: string;
    estado: Estado;
    temporadas: Temporada[];
}

const sagas: Saga[] = [
    { id: 1, nombre: 'Orbita Perdida', estado: 'activa', temporadas: [
        { nombre: 'Temporada uno', episodios: 10 },
        { nombre: 'Temporada dos', episodios: 12 }
    ] },
    { id: 2, nombre: 'Señal Marte', estado: 'concluida', temporadas: [
        { nombre: 'Temporada uno', episodios: 8 },
        { nombre: 'Temporada dos', episodios: 10 }
    ] },
    { id: 3, nombre: 'Estacion Delta', estado: 'activa', temporadas: [
        { nombre: 'Temporada uno', episodios: 12 },
        { nombre: 'Temporada dos', episodios: 12 }
    ] },
];

function validarSaga(item: Saga): boolean {
    return item.nombre.trim() !== '' && item.temporadas.length > 0;
}

function undefined(item: Saga): number {
    return item.temporadas.reduce((total, actual) => total + actual.episodios, 0);
}

function calcularResumen(item: Saga) {
    return {
        ...item,
        totalEpisodios: undefined(item)
    };
}

const resumenes = sagas.filter(validarSaga).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.totalEpisodios - a.totalEpisodios);
const totalGeneral = resumenes.reduce((total, item) => total + item.totalEpisodios, 0);

console.log('===== Analizador de sagas sci-fi =====');

console.log('Sagas:', resumenes.length);
console.log('Episodios totales:', totalGeneral);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Episodios totales: ' + item.totalEpisodios);
});

console.log('\n===== PRUEBAS =====');

const casoNormal = undefined({
    id: 99,
    nombre: 'Prueba',
    estado: 'activa',
    temporadas: [
        { nombre: 'Uno', episodios: 10 },
        { nombre: 'Dos', episodios: 15 }
    ]
});

const casoLimite = undefined({
    id: 100,
    nombre: 'Prueba',
    estado: 'activa',
    temporadas: []
});

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
