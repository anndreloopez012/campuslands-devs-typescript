export {};

// Ejercicio 9: Enums
// Contexto: Generos musicales

// TODO: crea un enum para generos musicales.

// creación de un objeto solo lectura para simular un enum, ya que no se pueden usar enums en TypeScript 6.0.3
const CorrienteMusical = {
    Clasica: "Etilo_Clasica",
    Jazz: "Estilo_Jazz",
    Blues: "Etilo_Blues",
    Metal: "Estilo_Metal",
    Pop: "Etilo_Pop"
} as const; // 'as const' hacer que los valores no cambien

type CorrienteMusical = typeof CorrienteMusical[keyof typeof CorrienteMusical];
interface registroPista {
    nombreTema: string;
    autor: string;
    corriente: CorrienteMusical;
    tiempoMinutos: number;       
}

const catalogoMusical: registroPista[] = [
    {
        nombreTema: "Sinfonía del Nuevo Mundo",
        autor: "Antonin Dvorak",
        corriente: CorrienteMusical.Clasica,
        tiempoMinutos: 45.2
    },
    {
        nombreTema: "Blue Train",
        autor: "John Coltrane",
        corriente: CorrienteMusical.Jazz,
        tiempoMinutos: 10.4
    },
    {
        nombreTema: "Master of Puppets",
        autor: "Metallica",
        corriente: CorrienteMusical.Metal,
        tiempoMinutos: 8.3
    },
    {
        nombreTema: "Texas Flood",
        autor: "Stevie Ray Vaughan",
        corriente: CorrienteMusical.Blues,
        tiempoMinutos: 5.3
    },
    {
        nombreTema: "Take Five",
        autor: "The Dave Brubeck Quartet",
        corriente: CorrienteMusical.Jazz,
        tiempoMinutos: 5.2
    }
];

function extraerPistasPorEstilo(coleccion: registroPista[], estiloObjetivo: CorrienteMusical): registroPista[] {
    const pistasCoincidentes: registroPista[] = [];
    
    for (let i = 0; i < coleccion.length; i++) {
        if (coleccion[i].corriente === estiloObjetivo) {
            pistasCoincidentes.push(coleccion[i]);
        }
    }
    
    return pistasCoincidentes;
}

const estiloSeleccionado: CorrienteMusical = CorrienteMusical.Jazz;
const resultadosBusqueda: registroPista[] = extraerPistasPorEstilo(catalogoMusical, estiloSeleccionado);

console.log(`==============FILTRO DE REPRODUCCIÓN: ${estiloSeleccionado}==============`);

if (resultadosBusqueda.length > 0) {
    console.table(resultadosBusqueda);
} else {
    console.log("No se encontraron pistas registradas bajo este género musical.");
}

console.log("=====================================================================");