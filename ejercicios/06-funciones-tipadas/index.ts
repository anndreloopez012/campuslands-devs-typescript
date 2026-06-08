export {};

// Ejercicio 6: Funciones tipadas
// Contexto: Sistema de puntuacion deportiva

// TODO: crea funciones para calcular puntos.

type registroRendimiento = {
    escuadra: string;
    partidosGanados: number;
    encuentrosIgualados: number;
    golesFavor: number; 
};

function procesarTablaPuntos(ganados: number, empatados: number, anotaciones: number): number {
    const puntosPorVictoria = 4;
    const puntosPorEmpate = 2;
    const factorBonusAnotacion = 0.5; // Cada gol aporta medio punto extra

    return (ganados * puntosPorVictoria) + (empatados * puntosPorEmpate) + (anotaciones * factorBonusAnotacion);
}

function evaluarPuntajeTotal(club: registroRendimiento): number {
    return procesarTablaPuntos(club.partidosGanados, club.encuentrosIgualados, club.golesFavor);
}
function buscarMaximoPuntaje(listado: registroRendimiento[]): registroRendimiento {
    let punteroLider: registroRendimiento = listado[0];
    let maximoPuntajeActual: number = evaluarPuntajeTotal(punteroLider);

    for (let i = 1; i < listado.length; i++) {
        const puntajeCandidato = evaluarPuntajeTotal(listado[i]);
        
        if (puntajeCandidato > maximoPuntajeActual) {
            maximoPuntajeActual = puntajeCandidato;
            punteroLider = listado[i];
        }
    }

    return punteroLider;
}

const campeonatoLocal: registroRendimiento[] = [
    { escuadra: "Alcones Dorados", partidosGanados: 6, encuentrosIgualados: 3, golesFavor: 12 },
    { escuadra: "Fuerza Industrial", partidosGanados: 7, encuentrosIgualados: 1, golesFavor: 8 },
    { escuadra: "Leones del Valle", partidosGanados: 5, encuentrosIgualados: 5, golesFavor: 20 }
];

const equipoCampeon: registroRendimiento = buscarMaximoPuntaje(campeonatoLocal);
const rendimientoGanador: number = evaluarPuntajeTotal(equipoCampeon);

console.log("====estadísticas del campeonato local====");
campeonatoLocal.forEach((equipo) => {
    console.log(`Club: ${equipo.escuadra.padEnd(20)} | Puntos: ${evaluarPuntajeTotal(equipo)}`);
});
console.log("--------------------------------------------------");
console.log("******resultados finales******");
console.log(`Escuadra Líder: ${equipoCampeon.escuadra}`);
console.log(`Puntaje Neto:   ${rendimientoGanador} unidades`);
console.log("==================================================");