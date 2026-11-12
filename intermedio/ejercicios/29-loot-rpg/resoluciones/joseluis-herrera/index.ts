export {};

type Estado = 'disponible' | 'equipado' | 'descartado';
type Categoria = 'arma' | 'armadura' | 'consumible';

interface Objeto {
    readonly id: number;
    nombre: string;
    estado: Estado;
    categoria: Categoria;
    valor: number;
}

const objetos: Objeto[] = [
    { id: 1, nombre: 'Espada corta', estado: 'equipado', categoria: 'arma', valor: 3 },
    { id: 2, nombre: 'Pocion menor', estado: 'disponible', categoria: 'consumible', valor: 1 },
    { id: 3, nombre: 'Armadura de cuero', estado: 'equipado', categoria: 'armadura', valor: 4 },
    { id: 4, nombre: 'Arco viejo', estado: 'descartado', categoria: 'arma', valor: 2 },
];

function validarObjeto(registro: Objeto): boolean {
    return registro.nombre.trim() !== '' && registro.valor >= 0;
}

function contarPorEstado(lista: Objeto[]): Record<Estado, number> {
    return lista.reduce((conteo, registro) => {
        conteo[registro.estado] += 1;
        return conteo;
    }, { disponible: 0, equipado: 0, descartado: 0 });
}

function agruparPorCategoria(lista: Objeto[]): Map<Categoria, number> {
    const grupos = new Map<Categoria, number>();

    lista.forEach((registro) => {
        grupos.set(registro.categoria, (grupos.get(registro.categoria) ?? 0) + registro.valor);
    });

    return grupos;
}

function cumpleRegla(registro: Objeto): boolean {
    return registro.estado === 'equipado' && registro.valor >= 3;
}

const validos = objetos.filter(validarObjeto);
const aprobados = validos.filter(cumpleRegla);
const conteo = contarPorEstado(validos);
const grupos = agruparPorCategoria(validos);
const categoriasUsadas = new Set(validos.map((registro) => registro.categoria));

console.log('===== Sistema de loot RPG =====');

console.log('Objetos validos:', validos.length);
console.log('Nivel total:', validos.reduce((total, registro) => total + registro.valor, 0));
console.log('objetos equipados de nivel 3 o mas:', aprobados.length);
console.log('Conteo por estado:', conteo);
console.log('Categorias usadas:', [...categoriasUsadas]);

grupos.forEach((total, categoria) => {
    console.log(categoria + ':', total);
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', cumpleRegla({
    id: 99,
    nombre: 'Prueba',
    estado: 'equipado',
    categoria: 'arma',
    valor: 5
}));

console.log('Caso limite:', cumpleRegla({
    id: 100,
    nombre: 'Prueba',
    estado: 'equipado',
    categoria: 'arma',
    valor: 0
}));
