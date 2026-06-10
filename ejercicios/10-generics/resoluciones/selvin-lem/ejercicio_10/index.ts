export {};

// Ejercicio 10: Generics
// Contexto: Inventario de videojuegos

// TODO: crea una funcion generica para buscar por id.

interface Identificable {
    idUnico: string;
}
interface Videojuego {
    idUnico: string; 
    tituloJuego: string;
    desarrollador: string;
    copiasDisponibles: number;
}

interface Periferico {
    idUnico: string;
    componente: string;
    marcaFabricante: string;
    inalambrico: boolean;
}

function localizarElementoPorId<T extends Identificable>(
    inventario: T[],
    idObjetivo: string
): T | undefined {
    for (let i = 0; i < inventario.length; i++) {
        if (inventario[i].idUnico === idObjetivo) {
            return inventario[i]; 
        }
    }
    return undefined; 
}

const almacenVideojuegos: Videojuego[] = [
    { 
        idUnico: "GAME-001", 
        tituloJuego: "Metroid Prime", 
        desarrollador: "Retro Studios", 
        copiasDisponibles: 14 
    },
    { 
        idUnico: "GAME-002", 
        tituloJuego: "Elden Ring", 
        desarrollador: "FromSoftware", 
        copiasDisponibles: 5 
    }
];

const almacenPerifericos: Periferico[] = [
    { 
        idUnico: "PERI-101", 
        componente: "Teclado Mecánico", 
        marcaFabricante: "Keychron", 
        inalambrico: true 
    },
    { 
        idUnico: "PERI-102", 
        componente: "Mouse Ergonómico", 
        marcaFabricante: "Logitech", 
        inalambrico: false 
    }
];

console.log("==================SISTEMA DE BÚSQUEDA GENÉRICA==================");
const juegoEncontrado = localizarElementoPorId(almacenVideojuegos, "GAME-002");

if (juegoEncontrado) {
    console.log(`Juego Localizado: "${juegoEncontrado.tituloJuego}" por ${juegoEncontrado.desarrollador}`);
} 
else {
    console.log("Videojuego no registrado en el inventario.");
}

console.log("---------------------------------------------------------------------");
const accesorioEncontrado = localizarElementoPorId(almacenPerifericos, "PERI-101");

if (accesorioEncontrado) {
    const conectividad = accesorioEncontrado.inalambrico ? "Inalámbrico" : "Cable USB";
    console.log(`Periférico Localizado: ${accesorioEncontrado.componente} [${conectividad}]`);
} 
else {
    console.log("Componente no registrado en el inventario.");
}

console.log("=====================================================================");