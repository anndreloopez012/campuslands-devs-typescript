// Union literal para controlar las rarezas permitidas 
export type RarezaEquipo = "Comun" | "Raro" | "Epico" | "Legendario";

export interface Equipo {
    nombre: string;
    rareza: RarezaEquipo;
    bonoPoder: number;
}

// Interfaz que mapea exactamente la estructura de nuestros datos.json
export interface PersonajeRPG {
    readonly id: string; // Protegido para que no mute accidentalmente 
    nombre: string;
    clase: string;
    nivel: number;
    puntosVida: number;
    inventario?: Equipo[] // Propiedad opcional para el reto Extra
}