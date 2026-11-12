export {};

type Estado = 'pendiente' | 'completado' | 'cancelado';
type Categoria = 'tandem' | 'solo' | 'curso';

interface Salto {
    readonly id: number;
    nombre: string;
    estado: Estado;
    categoria: Categoria;
    valor: number;
}

const saltos: Salto[] = [
    { id: 1, nombre: 'Salto tandem uno', estado: 'completado', categoria: 'tandem', valor: 3500 },
    { id: 2, nombre: 'Salto solo uno', estado: 'completado', categoria: 'solo', valor: 2800 },
    { id: 3, nombre: 'Salto curso uno', estado: 'pendiente', categoria: 'curso', valor: 4000 },
    { id: 4, nombre: 'Salto tandem dos', estado: 'cancelado', categoria: 'tandem', valor: 3200 },
];

function validarSalto(registro: Salto): boolean {
    return registro.nombre.trim() !== '' && registro.valor >= 0;
}

function contarPorEstado(lista: Salto[]): Record<Estado, number> {
    return lista.reduce((conteo, registro) => {
        conteo[registro.estado] += 1;
        return conteo;
    }, { pendiente: 0, completado: 0, cancelado: 0 });
}

function agruparPorCategoria(lista: Salto[]): Map<Categoria, number> {
    const grupos = new Map<Categoria, number>();

    lista.forEach((registro) => {
        grupos.set(registro.categoria, (grupos.get(registro.categoria) ?? 0) + registro.valor);
    });

    return grupos;
}

function cumpleRegla(registro: Salto): boolean {
    return registro.estado === 'completado' && registro.valor >= 3000;
}

const validos = saltos.filter(validarSalto);
const aprobados = validos.filter(cumpleRegla);
const conteo = contarPorEstado(validos);
const grupos = agruparPorCategoria(validos);
const categoriasUsadas = new Set(validos.map((registro) => registro.categoria));

console.log('===== Bitacora de paracaidismo =====');

console.log('Saltos validos:', validos.length);
console.log('Altitud total:', validos.reduce((total, registro) => total + registro.valor, 0));
console.log('saltos completados sobre 3000 metros:', aprobados.length);
console.log('Conteo por estado:', conteo);
console.log('Categorias usadas:', [...categoriasUsadas]);

grupos.forEach((total, categoria) => {
    console.log(categoria + ':', total);
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', cumpleRegla({
    id: 99,
    nombre: 'Prueba',
    estado: 'completado',
    categoria: 'tandem',
    valor: 3500
}));

console.log('Caso limite:', cumpleRegla({
    id: 100,
    nombre: 'Prueba',
    estado: 'completado',
    categoria: 'tandem',
    valor: 0
}));
