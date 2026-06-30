export {};

// Ejercicio 4: Interfaces
// Contexto: Personajes RPG

// TODO: define la interfaz PersonajeRPG.
// TODO: crea un array de personajes.

console.log("------ Ejercicio 4: Interfaces - Personajes RPG ------");

interface PersonajeRPG {
  nombre: string;
  clase?: string;
  nivel: number;
  nivelVida: number;
  habilidad: string;
}

const personajes: PersonajeRPG[] = [
  { nombre: "Jorge", clase: "Herrero", nivel: 12, nivelVida: 84, habilidad: "Golpe de martillo" },
  { nombre: "Ken", clase: "Carpintero", nivel: 8, nivelVida: 130, habilidad: "Corte de madera" },
  { nombre: "Daniel", clase: "Minero", nivel: 15, nivelVida: 96, habilidad: "Excavación",},
  { nombre: "Jakelin", clase: "Alquimista", nivel: 20, nivelVida: 120, habilidad: "Poción de vida" },
];

console.log("Personajes RPG:", personajes);
const personajerHightLevel: PersonajeRPG[] = personajes.filter((personaje) => personaje.nivel >= 10);
console.log("Jugadores de alto nivel:", personajerHightLevel.map((personaje) => personaje.nombre).join(", "));
