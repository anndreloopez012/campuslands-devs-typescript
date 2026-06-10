export {};

type Pelicula = {
    readonly id: number;
    titulo: string;
    director: {
        nombre: string;
        pais: string;
    };
    calificaciones: number[];
    anioEstreno?: number;
    calcularPromedio(calificaciones: number[]): number;
};

const calcularPromedioPelicula = (calificaciones: number[]): number => {
    const suma = calificaciones.reduce((total, nota) => total + nota, 0);
    return suma / calificaciones.length;
};

const peliculas = [
    {
        id: 1,
        titulo: "Sombras del Atitlan",
        director: {
            nombre: "Carlos Mendoza",
            pais: "Guatemala"
        },
        calificaciones: [5, 4.8, 4.9, 5],
        calcularPromedio: calcularPromedioPelicula
    },
    {
        id: 2,
        titulo: "Ruta al Pacifico",
        director: {
            nombre: "Andrea Lopez",
            pais: "Guatemala"
        },
        calificaciones: [4, 4.2, 4.5, 4.1],
        anioEstreno: 2023,
        calcularPromedio: calcularPromedioPelicula
    }
];

console.log("--- BIBLIOTECA DE PELÍCULAS ---");

for (const pelicula of peliculas) {
    const promedio: number = pelicula.calcularPromedio(pelicula.calificaciones);
    const recomendada: boolean = promedio > 4.5;

    console.log(`\nPelicula: ${pelicula.titulo}`);
    console.log(`Director: ${pelicula.director.nombre} (${pelicula.director.pais})`);
    if (pelicula.anioEstreno) {
        console.log(`Año de Estreno: ${pelicula.anioEstreno}`);
    }
    console.log(`Promedio: ${promedio.toFixed(2)}`);
    console.log(`Recomendada: ${recomendada ? "Si" : "No"}`);
}