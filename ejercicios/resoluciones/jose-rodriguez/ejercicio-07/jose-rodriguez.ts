export {};



// 1. DEFINICIÓN DE INTERFACES (CONTRATOS)


// Interfaz anidada para la información del director
interface Director {
    nombre: string;
    nacionalidad: string;
    edad?: number; // Propiedad opcional
}

// Interfaz principal para la película
interface Pelicula {
    readonly id: string;           // PROTEGIDA: No se puede modificar una vez creada
    readonly titulo: string;       // PROTEGIDA
    director: Director;            // OBJETO ANIDADO
    calificaciones: number[];      // Array de números para las notas
    genero?: string;               // Propiedad opcional
    
    // Definición del método con su tipo de retorno explícito
    calcularPromedio(): number;
}


// 2. CREACIÓN DE OBJETOS (PELÍCULAS)


const pelicula1: Pelicula = {
    id: "MOV-001",
    titulo: "Inception",
    director: {
        nombre: "Christopher Nolan",
        nacionalidad: "Británica"
        // edad se omite de forma válida porque es opcional
    },
    calificaciones: [5, 4.8, 4.5, 4.9],
    genero: "Ciencia Ficción",
    
    calcularPromedio(): number {
        const total = this.calificaciones.reduce((suma, nota) => suma + nota, 0);
        return total / this.calificaciones.length;
    }
};

const pelicula2: Pelicula = {
    id: "MOV-002",
    titulo: "Pulp Fiction",
    director: {
        nombre: "Quentin Tarantino",
        nacionalidad: "Estadounidense",
        edad: 63 // Propiedad opcional incluida
    },
    calificaciones: [4.5, 4.2, 4.0, 4.6],
    
    calcularPromedio(): number {
        const total = this.calificaciones.reduce((suma, nota) => suma + nota, 0);
        return total / this.calificaciones.length;
    }
};


// 3. RETO EXTRA: FILTRADO Y RECOMENDACIÓN


// Creamos la biblioteca (Array de películas)
const bibliotecaPeliculas: Pelicula[] = [pelicula1, pelicula2];

/**
 * Evalúa si una película es recomendada (Promedio >= 4.5)
 */
function esRecomendada(pelicula: Pelicula): boolean {
    return pelicula.calcularPromedio() >= 4.5;
}

//4. RESULTADO ESPERADO (IMPRESION)

console.log("========================================");
console.log("       BIBLIOTECA DE PELÍCULAS       ");
console.log("========================================");

bibliotecaPeliculas.forEach((pelicula) => {
    const promedio = pelicula.calcularPromedio();
    const recomendada = esRecomendada(pelicula) ? " ¡ALTAMENTE RECOMENDADA!" : " Buena opción";
    
    console.log(`Película    : ${pelicula.titulo} (ID: ${pelicula.id})`);
    console.log(`Director    : ${pelicula.director.nombre} (${pelicula.director.nacionalidad})`);
    console.log(`Género      : ${pelicula.genero ?? "No especificado"}`);
    console.log(`Calificación: ${promedio.toFixed(1)} / 5.0`);
    console.log(`Estado      : ${recomendada}`);
    console.log("----------------------------------------");
});

// ==========================================
// DEMOSTRACIÓN DE RESTRICCIONES (Seguridad)
// ==========================================
// Si intentaras descomentar la siguiente línea, TypeScript bloquearía la compilación:
// pelicula1.titulo = "Interstellar"; //  Error: Cannot assign to 'titulo' because it is a read-only property.
