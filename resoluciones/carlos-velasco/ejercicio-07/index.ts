export {};

// Ejercicio 7: Objetos avanzados
// Contexto: Biblioteca de peliculas

// TODO: modela peliculas con objetos avanzados.
type Director = {
    nombre: string;
};

type Calificacion = {
    valores: number[]; 
};

type pelicula = {
    readonly id: number; 
    nombre: string;
    clasificacion: string;
    director: Director;
    calificacion: Calificacion;
    calcularPromedio: () => number; 
};

const peli: pelicula = {
    id: 1, // Cambiado a number
    nombre: "Toy Story",
    clasificacion: "+5",
    director: { nombre: "John Lasseter" },
    calificacion: { valores: [5, 4, 5, 4] },
    calcularPromedio() {
        const suma = this.calificacion.valores.reduce((acc, val) => acc + val, 0);
        return suma / this.calificacion.valores.length;
    }
};

console.log(`${peli.nombre} tiene un promedio de: ${peli.calcularPromedio()}`);