type idiomas = {
    idioma : string
    subtitulos: string
}

type peliculas = {
    Titulo: string;  
    idioma: idiomas; 
    descripcion: string;
    director: string; 
    pais: string;
    calificacion : number[]
}

const Pelicula :  peliculas = {
    Titulo: "Spider-verse",
    idioma: { idioma: "español", subtitulos: "ingles"},
    descripcion: "En esta pelicula viajaremos atraves del multiverso de spiderman",
    director: "Bob Persichetti",
    pais: "Estados Unidos",
    calificacion : [4.5, 4.5, 5.0, 3.0]
}

// Calcular promedio
function calcularPromedioCalificaciones(calificaciones: number[]): number {
    let sumaTotal = 0;

    calificaciones.forEach((nota) => {
        sumaTotal = sumaTotal + nota;
    });

    const promedio = sumaTotal / calificaciones.length;
    
    return promedio;
}

const promedioFinal = calcularPromedioCalificaciones(Pelicula.calificacion);

console.log(`Película: ${Pelicula.Titulo}`);

if(promedioFinal >= 4.5){
    console.log(`El promedio de calificación es: ${promedioFinal}`)
}else{
    console.log("No se recomienda esta pelicula")
} 
