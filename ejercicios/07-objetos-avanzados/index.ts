export {};

// Ejercicio 7: Objetos avanzados
// Contexto: Biblioteca de peliculas

// TODO: modela peliculas con objetos avanzados.


export {};

interface informacionCineasta {
    nombreCompleto: string;
    origen: string;
}

interface registroCinematografico {
    readonly codigoArchivo: string; 
    nombreObra: string;
    categoria: string;
    cineasta: informacionCineasta;
    puntuaciones: number[];       
    obtenerMediaPuntaje(): number; 
}

const largometraje: registroCinematografico = {
    codigoArchivo: "FILM-9941-A",
    nombreObra: "Ecos del Mañana",
    categoria: "Drama Psicológico",
    cineasta: {
        nombreCompleto: "Alejandro Ruiz",
        origen: "México"
    },
    puntuaciones: [9.2, 8.5, 9.8, 9.0, 9.4],
    obtenerMediaPuntaje(): number {
        let sumaPuntajes = 0;
        for (let i = 0; i < this.puntuaciones.length; i++) {
            sumaPuntajes += this.puntuaciones[i];
        }
        return sumaPuntajes / this.puntuaciones.length;
    }
};

const puntuacionMedia: number = largometraje.obtenerMediaPuntaje();
const umbralRecomendacion: number= 9.0;
const esSugerenciaDestacada: boolean = puntuacionMedia >= umbralRecomendacion;

console.log("=====sistema de catalogación cinematográfica=====");
console.log(`ID Unico: ${largometraje.codigoArchivo}`);
console.log(`Título de la Obra:    "${largometraje.nombreObra}"`);
console.log(`Dirección General:    ${largometraje.cineasta.nombreCompleto} (${largometraje.cineasta.origen})`);
console.log(`Género / Categoría:   ${largometraje.categoria}`);
console.log("--------------------------------------------------");
console.log(`Evaluación Crítica:   ${puntuacionMedia.toFixed(2)} de 10 puntos posibles`);
console.log("--------------------------------------------------");
console.log("Estado de recomendación:");

if (esSugerenciaDestacada) {
    console.log(" CALIFICACIÓN EXCEPCIONAL: Obra altamente recomendada para exhibición.");
} else {
    console.log("EVALUACIÓN REGULAR: Mantener en catálogo estándar.");
}
console.log("==================================================");