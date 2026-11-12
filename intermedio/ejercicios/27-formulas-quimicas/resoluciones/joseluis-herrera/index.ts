export {};

type Estado = 'pendiente' | 'validada' | 'rechazada';
type Categoria = 'organica' | 'inorganica' | 'acido';

interface Formula {
    readonly id: number;
    nombre: string;
    estado: Estado;
    categoria: Categoria;
    valor: number;
}

const formulas: Formula[] = [
    { id: 1, nombre: 'Metano', estado: 'validada', categoria: 'organica', valor: 5 },
    { id: 2, nombre: 'Agua', estado: 'validada', categoria: 'inorganica', valor: 3 },
    { id: 3, nombre: 'Acido clorhidrico', estado: 'pendiente', categoria: 'acido', valor: 2 },
    { id: 4, nombre: 'Formula vacia', estado: 'rechazada', categoria: 'inorganica', valor: 0 },
];

function validarFormula(registro: Formula): boolean {
    return registro.nombre.trim() !== '' && registro.valor >= 0;
}

function contarPorEstado(lista: Formula[]): Record<Estado, number> {
    return lista.reduce((conteo, registro) => {
        conteo[registro.estado] += 1;
        return conteo;
    }, { pendiente: 0, validada: 0, rechazada: 0 });
}

function agruparPorCategoria(lista: Formula[]): Map<Categoria, number> {
    const grupos = new Map<Categoria, number>();

    lista.forEach((registro) => {
        grupos.set(registro.categoria, (grupos.get(registro.categoria) ?? 0) + registro.valor);
    });

    return grupos;
}

function cumpleRegla(registro: Formula): boolean {
    return registro.estado === 'validada' && registro.valor > 0;
}

const validos = formulas.filter(validarFormula);
const aprobados = validos.filter(cumpleRegla);
const conteo = contarPorEstado(validos);
const grupos = agruparPorCategoria(validos);
const categoriasUsadas = new Set(validos.map((registro) => registro.categoria));

console.log('===== Validador de formulas quimicas =====');

console.log('Formulas validos:', validos.length);
console.log('Atomos total:', validos.reduce((total, registro) => total + registro.valor, 0));
console.log('formulas validadas con atomos positivos:', aprobados.length);
console.log('Conteo por estado:', conteo);
console.log('Categorias usadas:', [...categoriasUsadas]);

grupos.forEach((total, categoria) => {
    console.log(categoria + ':', total);
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', cumpleRegla({
    id: 99,
    nombre: 'Prueba',
    estado: 'validada',
    categoria: 'organica',
    valor: 5
}));

console.log('Caso limite:', cumpleRegla({
    id: 100,
    nombre: 'Prueba',
    estado: 'validada',
    categoria: 'organica',
    valor: 0
}));
