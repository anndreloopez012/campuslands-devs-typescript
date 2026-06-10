export {};

type Equipo = {
    nombre: string;
    victorias: number;
    empates: number;
    bonusOfensivo: number;
};

function calcularPuntaje(
    victorias: number,
    empates: number,
    bonusOfensivo: number
): number {
    return (victorias * 3) + empates + bonusOfensivo;
}

function obtenerMejorEquipo(equipos: Equipo[]): Equipo {
    let lider: Equipo = equipos[0];
    let mejorPuntaje: number = calcularPuntaje(lider.victorias, lider.empates, lider.bonusOfensivo);

    for (const escuadra of equipos) {
        const puntajeActual: number = calcularPuntaje(
            escuadra.victorias,
            escuadra.empates,
            escuadra.bonusOfensivo
        );

        console.log(`Equipo: ${escuadra.nombre} | Puntaje: ${puntajeActual}`);

        if (puntajeActual > mejorPuntaje) {
            mejorPuntaje = puntajeActual;
            lider = escuadra;
        }
    }
    return lider;
}

const equipos: Equipo[] = [
    {
        nombre: "Tormenta Azul",
        victorias: 8,
        empates: 2,
        bonusOfensivo: 3
    },
    {
        nombre: "Halcones Rojos",
        victorias: 7,
        empates: 4,
        bonusOfensivo: 2
    },
    {
        nombre: "Titanes Verdes",
        victorias: 9,
        empates: 1,
        bonusOfensivo: 1
    }
];

console.log("--- CALCULANDO PUNTAJES ---");
const lider: Equipo = obtenerMejorEquipo(equipos);

const puntajeLider: number = calcularPuntaje(
    lider.victorias,
    lider.empates,
    lider.bonusOfensivo
);

console.log("\n--- RESULTADO FINAL ---");
console.log("Equipo lider:", lider.nombre);
console.log("Puntaje total del lider:", puntajeLider);