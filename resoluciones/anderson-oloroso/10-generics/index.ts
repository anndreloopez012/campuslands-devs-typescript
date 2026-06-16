export {};

// Ejercicio 10: Generics
// Contexto: Inventario de videojuegos

// TODO: crea una funcion generica para buscar por id.

console.log("========== Generics ========")

function buscarId<T extends videojuegos>(inventario: T[], id: number): T | undefined {
    return inventario.find(dato => dato.id === id)
}

interface videojuegos {
    id: number;
    titulo: string;
    creador: string;
}

const juegos: videojuegos[] = [
    {
        id: 1,
        titulo: "Call of Duty",
        creador: "Activision"
    },
    {
        id: 2,
        titulo: "Nova Legacy",
        creador: "Unity"
    }
]

let encontrado = buscarId(juegos, 1)

console.log(encontrado?encontrado.titulo:undefined)

