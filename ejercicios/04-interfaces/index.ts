export {};

// Ejercicio 4: Interfaces
// Contexto: Personajes RPG

// TODO: define la interfaz PersonajeRPG.
// TODO: crea un array de personajes.

console.log("=========== Interfaces ===========");

interface personajeRPG {
  nombre: string;
  clase: "campesino" | "mago" | "guerrero";
  nivel: number;
  puntosDeVida: number;
}

const personajes: personajeRPG[] = [
  {
    nombre: "Aragorn",
    clase: "guerrero",
    nivel: 20,
    puntosDeVida: 150,
  },
  {
    nombre: "Gandalf",
    clase: "mago",
    nivel: 30,
    puntosDeVida: 100,
  },
  {
    nombre: "Frodo",
    clase: "campesino",
    nivel: 5,
    puntosDeVida: 50,
  },
];
