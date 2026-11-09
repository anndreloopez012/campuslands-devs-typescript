export {};

type ClasePersonaje = "Guerrero" | "Mago" | "Pícaro" | "Clérigo";
type ElementoAfin = "Fuego" | "Hielo" | "Rayo" | "Sagrado" | "Físico";

interface AtributosBase {
  readonly fuerza: number;
  readonly destreza: number;
  readonly inteligencia: number;
  readonly vitalidad: number;
}

interface Equipamiento {
  readonly armaPrincipal: string;
  readonly armadura: string;
  readonly accesorio?: string;
  readonly bonificadorDaño: number;
}

interface PersonajeRPG {
  readonly id: string;
  readonly nombre: string;
  readonly nivel: number;
  readonly clase: ClasePersonaje;
  readonly elemento: ElementoAfin;
  readonly atributos: AtributosBase;
  readonly equipamiento: Equipamiento;
}

interface EstadisticasCombate {
  readonly puntosVida: number;
  readonly puntosMana: number;
  readonly poderOfensivo: number;
  readonly defensaTotal: number;
}

function calcularEstadisticasCombate(personaje: PersonajeRPG): EstadisticasCombate {
  const puntosVida = personaje.atributos.vitalidad * 15 + personaje.nivel * 10;
  const puntosMana = personaje.atributos.inteligencia * 12 + personaje.nivel * 5;

  let poderOfensivo = 0;
  switch (personaje.clase) {
    case "Guerrero":
      poderOfensivo = personaje.atributos.fuerza * 2.5 + personaje.equipamiento.bonificadorDaño;
      break;
    case "Mago":
      poderOfensivo = personaje.atributos.inteligencia * 2.8 + personaje.equipamiento.bonificadorDaño;
      break;
    case "Pícaro":
      poderOfensivo = personaje.atributos.destreza * 2.6 + personaje.equipamiento.bonificadorDaño;
      break;
    case "Clérigo":
      poderOfensivo = (personaje.atributos.fuerza + personaje.atributos.inteligencia) * 1.5 + personaje.equipamiento.bonificadorDaño;
      break;
  }

  const defensaTotal = (personaje.atributos.vitalidad + personaje.atributos.destreza * 0.5) * 1.2;

  return {
    puntosVida: Math.round(puntosVida),
    puntosMana: Math.round(puntosMana),
    poderOfensivo: Math.round(poderOfensivo),
    defensaTotal: Math.round(defensaTotal),
  };
}

function validarBuildValida(personaje: PersonajeRPG): boolean {
  const sumaAtributos =
    personaje.atributos.fuerza +
    personaje.atributos.destreza +
    personaje.atributos.inteligencia +
    personaje.atributos.vitalidad;

  const puntosMaximosPermitidos = personaje.nivel * 10 + 20;
  return sumaAtributos <= puntosMaximosPermitidos && personaje.nivel >= 1;
}

const heroePrueba: PersonajeRPG = {
  id: "rpg-hero-01",
  nombre: "Aethelgard",
  nivel: 12,
  clase: "Mago",
  elemento: "Hielo",
  atributos: {
    fuerza: 10,
    destreza: 18,
    inteligencia: 65,
    vitalidad: 35,
  },
  equipamiento: {
    armaPrincipal: "Báculo de Cristal Polar",
    armadura: "Túnica del Archivero",
    accesorio: "Anillo de Enfoque Místico",
    bonificadorDaño: 45,
  },
};

const stats = calcularEstadisticasCombate(heroePrueba);
const buildCorrecta = validarBuildValida(heroePrueba);

console.log("=== BUILD DE PERSONAJE RPG ===");
console.log(`Personaje: ${heroePrueba.nombre} | Nivel: ${heroePrueba.nivel} | Clase: ${heroePrueba.clase} (${heroePrueba.elemento})`);
console.log(`Vida: ${stats.puntosVida} HP | Maná: ${stats.puntosMana} MP`);
console.log(`Poder Ofensivo: ${stats.poderOfensivo} | Defensa Total: ${stats.defensaTotal}`);
console.log(`Estado de Build: ${buildCorrecta ? "Válida y balanceada" : "Puntos excedidos"}`);
