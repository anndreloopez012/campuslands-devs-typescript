export {};

type Estado = 'listada' | 'vendida' | 'retirada';
type Categoria = 'rifle' | 'pistola' | 'cuchillo';

interface Skin {
    readonly id: number;
    nombre: string;
    estado: Estado;
    categoria: Categoria;
    valor: number;
}

const skins: Skin[] = [
    { id: 1, nombre: 'Rifle neon', estado: 'vendida', categoria: 'rifle', valor: 25 },
    { id: 2, nombre: 'Pistola dorada', estado: 'listada', categoria: 'pistola', valor: 15 },
    { id: 3, nombre: 'Cuchillo carbono', estado: 'vendida', categoria: 'cuchillo', valor: 80 },
    { id: 4, nombre: 'Rifle bosque', estado: 'retirada', categoria: 'rifle', valor: 8 },
];

function validarSkin(registro: Skin): boolean {
    return registro.nombre.trim() !== '' && registro.valor >= 0;
}

function contarPorEstado(lista: Skin[]): Record<Estado, number> {
    return lista.reduce((conteo, registro) => {
        conteo[registro.estado] += 1;
        return conteo;
    }, { listada: 0, vendida: 0, retirada: 0 });
}

function agruparPorCategoria(lista: Skin[]): Map<Categoria, number> {
    const grupos = new Map<Categoria, number>();

    lista.forEach((registro) => {
        grupos.set(registro.categoria, (grupos.get(registro.categoria) ?? 0) + registro.valor);
    });

    return grupos;
}

function cumpleRegla(registro: Skin): boolean {
    return registro.estado === 'vendida' && registro.valor >= 10;
}

const validos = skins.filter(validarSkin);
const aprobados = validos.filter(cumpleRegla);
const conteo = contarPorEstado(validos);
const grupos = agruparPorCategoria(validos);
const categoriasUsadas = new Set(validos.map((registro) => registro.categoria));

console.log('===== Mercado de skins =====');

console.log('Skins validos:', validos.length);
console.log('Precio total:', validos.reduce((total, registro) => total + registro.valor, 0));
console.log('skins vendidas desde 10 creditos:', aprobados.length);
console.log('Conteo por estado:', conteo);
console.log('Categorias usadas:', [...categoriasUsadas]);

grupos.forEach((total, categoria) => {
    console.log(categoria + ':', total);
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', cumpleRegla({
    id: 99,
    nombre: 'Prueba',
    estado: 'vendida',
    categoria: 'rifle',
    valor: 50
}));

console.log('Caso limite:', cumpleRegla({
    id: 100,
    nombre: 'Prueba',
    estado: 'vendida',
    categoria: 'rifle',
    valor: 0
}));
