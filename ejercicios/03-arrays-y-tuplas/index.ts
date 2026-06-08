export {};

// Ejercicio 3: Arrays y Tuplas
// Contexto: Equipos de futbol

// TODO: crea un array de jugadores.
// TODO: crea una tupla [golesLocal, golesVisitante].

const alineacionInicial: string[] = ["Andrés", "Sebastián", "Matías", "Diego", "Lucas"];
const numerosCamisolas: number[] = [9, 10, 8, 4, 12];
const resultadoPartido: [number, number] = [5, 3];
const plantillaDetallada: string[] = alineacionInicial.map((nombre, posicion) => {
    return `Dorsal ${numerosCamisolas[posicion]}: ${nombre}`;
});
const sumaGoles: number = resultadoPartido.reduce((acumulado, golesActuales) => acumulado + golesActuales, 0);

console.log("====Reporte del Partido====");
console.log("CONVOCATORIA:");
console.log(plantillaDetallada.join(" | ")); 
console.log("-----------------------------------------");
console.log("TABLERO:");
console.log(`Titanes Sala [ ${resultadoPartido[0]} ] vs [ ${resultadoPartido[1]} ] Deportivo Rival`);
console.log("-----------------------------------------");
console.log(`Estadísticas: ${sumaGoles} goles anotados en total.`);
console.log("=========================================");