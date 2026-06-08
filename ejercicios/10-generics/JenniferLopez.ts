export {};
type Videojuego = {
    id: number;
    nombre: string;
    plataforma: string;
};
type Periferico = {
    id: number;
    nombre: string;
    tipo: string;
};
function buscarPorId<T extends { id: number }>(
    inventario: T[],
    id: number
): T | undefined {
    return inventario.find(elemento => elemento.id === id);
}
const videojuegos: Videojuego[] = [
    {
        id: 1,
        nombre: "Clash Royale",
        plataforma: "Móvil"
    },
    {
        id: 2,
        nombre: "God of War",
        plataforma: "PlayStation"
    }
];
const perifericos: Periferico[] = [
    {
        id: 1,
        nombre: "Redragon Kumara",
        tipo: "Teclado"
    },
    {
        id: 2,
        nombre: "Logitech G203",
        tipo: "Mouse"
    }
];
const videojuegoEncontrado = buscarPorId(videojuegos, 1);
const perifericoEncontrado = buscarPorId(perifericos, 2);

console.log("Videojuego encontrado:");
console.log(videojuegoEncontrado);
console.log("Periferico encontrado:");
console.log(perifericoEncontrado);
