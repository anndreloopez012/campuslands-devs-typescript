export {};

// 1. DEFINICION DE INTERFACES Y ALIAS

interface EstadisticasEquipo {
    nombre: string;
    victorias: number;
    empates: number;
    golesAnotados: number;
}

//FUNCIONES AUXILIARES Y PRINCIPALES 

// Evalua si el equipo merece un punto de bonus ofensivo (ej: anotar mas de 15 goles)
function calcularBonusOfensivo(goles: number): number {
    const GOLES_PARA_BONUS = 15;
    return goles > GOLES_PARA_BONUS ? 1: 0;
}

// Calcula el puntaje total de un equipo con retornos explicitos obligatorios (: number)
function calcularPuntajeTotal(equipos: EstadisticasEquipo): number{
    const PUNTOS_POR_VICTORIA = 3;
    const PUNTOS_POR_EMPATE = 1;

    const puntosVictorias = equipos.victorias * PUNTOS_POR_VICTORIA;
    const puntosEmpates = equipos.empates * PUNTOS_POR_EMPATE;
    const puntosBonus = calcularBonusOfensivo(equipos.golesAnotados);

    return puntosVictorias + puntosEmpates + puntosBonus;
}

// 3. Encontrar al lider 

// Recibe un array de equipos y retorna el equipo con el puntaje mas alto 
function obtenerEquipoLider(equipos: EstadisticasEquipo[]): EstadisticasEquipo {
    if (equipos.length === 0) {
        throw new Error("La lista de equipos no puede estar vacía.");
    }

    return equipos.reduce((liderActual, equipoCandidato) => {
        const puntosLider = calcularPuntajeTotal(liderActual);
        const puntosCandidato = calcularPuntajeTotal(equipoCandidato);

        return puntosCandidato > puntosLider ? equipoCandidato : liderActual;
    });
}

// DATOS DE PRUEBA Y EJECUCION

const torneoFutsal: EstadisticasEquipo[] = [
    { nombre: "Titanes FC", victorias: 5, empates: 3, golesAnotados: 18 }, // 15 pts + 1 bonus = 16
    { nombre: "Real Academia", victorias: 6, empates: 0, golesAnotados: 12 }, // 18 pts + 0 bonus = 18
    { nombre: "Esparta Club", victorias: 4, empates: 3, golesAnotados: 16 } // 15 pts + 1 bonus = 16
];


// 5. RESULTADO ESPERADO EN CONSOLA


console.log("========================================");
console.log("      📊 TABLA DE PUNTUACIONES          ");
console.log("========================================");

torneoFutsal.forEach((equipo) => {
    const puntos = calcularPuntajeTotal(equipo);
    console.log(`- ${equipo.nombre}: ${puntos} Puntos (Goles: ${equipo.golesAnotados})`);
});

const equipoLider = obtenerEquipoLider(torneoFutsal);
const puntosLider = calcularPuntajeTotal(equipoLider);

console.log("----------------------------------------");
console.log(`🏆 LÍDER DEL TORNEO: ${equipoLider.nombre} con ${puntosLider} puntos.`);
console.log("========================================");