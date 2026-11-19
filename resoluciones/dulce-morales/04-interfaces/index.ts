export {};

// Ejercicio 4: Interfaces
// Contexto: Personajes RPG
// Resolucion: Dulce Morales

// Contrato que debe cumplir todo personaje del juego
interface PersonajeRPG {
  nombre: string;
  clase: string;
  nivel: number;
  vida: number;
  mana: number;
  armaEquipada?: string; // opcional: algunos personajes pelean sin arma
}

// Array tipado con la interfaz: cada objeto debe cumplir el contrato
const personajes: PersonajeRPG[] = [
  { nombre: "Lyra", clase: "Maga", nivel: 12, vida: 80, mana: 150, armaEquipada: "Baston arcano" },
  { nombre: "Thorne", clase: "Guerrero", nivel: 9, vida: 200, mana: 20, armaEquipada: "Hacha doble" },
  { nombre: "Kael", clase: "Monje", nivel: 10, vida: 140, mana: 60 },
  { nombre: "Nyx", clase: "Picara", nivel: 7, vida: 95, mana: 40, armaEquipada: "Dagas gemelas" },
];

// Convierte un personaje en una linea legible
function describirPersonaje(personaje: PersonajeRPG): string {
  const arma: string = personaje.armaEquipada ?? "Sin arma (combate a mano)";
  return `${personaje.nombre} | ${personaje.clase} | Nv ${personaje.nivel} | HP ${personaje.vida} | MP ${personaje.mana} | ${arma}`;
}

// Reto extra: personajes con nivel 10 o mas
const NIVEL_MISION_DIFICIL: number = 10;
const listosParaMision: PersonajeRPG[] = personajes.filter(
  (personaje: PersonajeRPG): boolean => personaje.nivel >= NIVEL_MISION_DIFICIL,
);

console.log("=============== PERSONAJES RPG ===============");
personajes.forEach((personaje: PersonajeRPG): void => {
  console.log(describirPersonaje(personaje));
});

console.log(`\n=== Listos para mision dificil (nivel >= ${NIVEL_MISION_DIFICIL}) ===`);
listosParaMision.forEach((personaje: PersonajeRPG): void => {
  console.log(describirPersonaje(personaje));
});
console.log(`Total: ${listosParaMision.length} de ${personajes.length} personajes`);
