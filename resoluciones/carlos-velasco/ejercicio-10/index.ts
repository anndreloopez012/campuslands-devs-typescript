export {};

// Ejercicio 10: Generics
// Contexto: Inventario de videojuegos

// TODO: crea una funcion generica para buscar por id.

// Ejercicio 10: Generics - Inventario

interface identificacion {
    id: number;
}
interface Videojuego extends identificacion {
    titulo: string;
    genero: string;
}

type tipoPerifico = "mouse"|"teclado"|"control"

interface Periferico extends identificacion {
    nombre: string;
    tipo: tipoPerifico;
}
function busquedaPorId<T extends identificacion>(inventario: T[], id: number): T | undefined {
    return inventario.find(item => item.id === id);
}
const inventarioJuegos: Videojuego[] = [
    { id: 1, titulo: "The Legend of Zelda", genero: "Aventura" },
    { id: 2, titulo: "Elden Ring", genero: "RPG" }
];
const inventarioPerifericos: Periferico[] = [
    { id: 101, nombre: "Teclado Mecánico", tipo: "teclado" },
    { id: 102, nombre: "Mouse Gamer", tipo: "mouse" }
];
console.log(busquedaPorId(inventarioJuegos, 1));
console.log(busquedaPorId(inventarioPerifericos, 102));
