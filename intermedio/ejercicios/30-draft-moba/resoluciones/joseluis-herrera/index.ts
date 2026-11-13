export {};

type Estado = 'disponible' | 'seleccionado' | 'baneado';
type Categoria = 'tanque' | 'asesino' | 'soporte';

interface Heroe {
    readonly id: number;
    nombre: string;
    estado: Estado;
    categoria: Categoria;
    valor: number;
}

const heroes: Heroe[] = [
    { id: 1, nombre: 'Atlas', estado: 'seleccionado', categoria: 'tanque', valor: 5 },
    { id: 2, nombre: 'Nyx', estado: 'baneado', categoria: 'asesino', valor: 4 },
    { id: 3, nombre: 'Seren', estado: 'seleccionado', categoria: 'soporte', valor: 3 },
    { id: 4, nombre: 'Kuro', estado: 'disponible', categoria: 'asesino', valor: 5 },
];

function validarHeroe(registro: Heroe): boolean {
    return registro.nombre.trim() !== '' && registro.valor >= 0;
}

function contarPorEstado(lista: Heroe[]): Record<Estado, number> {
    return lista.reduce((conteo, registro) => {
        conteo[registro.estado] += 1;
        return conteo;
    }, { disponible: 0, seleccionado: 0, baneado: 0 });
}

function agruparPorCategoria(lista: Heroe[]): Map<Categoria, number> {
    const grupos = new Map<Categoria, number>();

    lista.forEach((registro) => {
        grupos.set(registro.categoria, (grupos.get(registro.categoria) ?? 0) + registro.valor);
    });

    return grupos;
}

function cumpleRegla(registro: Heroe): boolean {
    return registro.estado === 'seleccionado' && registro.valor >= 3;
}

const validos = heroes.filter(validarHeroe);
const aprobados = validos.filter(cumpleRegla);
const conteo = contarPorEstado(validos);
const grupos = agruparPorCategoria(validos);
const categoriasUsadas = new Set(validos.map((registro) => registro.categoria));

console.log('===== Draft inteligente MOBA =====');

console.log('Heroes validos:', validos.length);
console.log('Prioridad total:', validos.reduce((total, registro) => total + registro.valor, 0));
console.log('heroes seleccionados con prioridad alta:', aprobados.length);
console.log('Conteo por estado:', conteo);
console.log('Categorias usadas:', [...categoriasUsadas]);

grupos.forEach((total, categoria) => {
    console.log(categoria + ':', total);
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', cumpleRegla({
    id: 99,
    nombre: 'Prueba',
    estado: 'seleccionado',
    categoria: 'tanque',
    valor: 5
}));

console.log('Caso limite:', cumpleRegla({
    id: 100,
    nombre: 'Prueba',
    estado: 'seleccionado',
    categoria: 'tanque',
    valor: 0
}));
