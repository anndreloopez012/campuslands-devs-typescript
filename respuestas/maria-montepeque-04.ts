export {};

// Ejercicio 4: Interfaces
// Contexto: Personajes RPG

// 1) La interfaz define el contrato que todo personaje debe cumplir.
interface PersonajeRPG {
  nombre: string;
  clase: string;
  nivel: number;
  puntosVida: number;
  habilidadPrincipal: string;
  mascota?: string; 
}

// 2) Array tipado con la interfaz. Cada objeto debe respetar el contrato.
const personajes: PersonajeRPG[] = [
  {
    nombre: "Selene",
    clase: "Hechicera",
    nivel: 14,
    puntosVida: 78,
    habilidadPrincipal: "Lluvia de meteoros",
    mascota: "Cuervo Nocturno",
  },
  {
    nombre: "Bruno",
    clase: "Paladín",
    nivel: 9,
    puntosVida: 142,
      habilidadPrincipal: "Escudo sagrado",
  },
  {
    nombre: "Talia",
    clase: "Asesina",
    nivel: 18,
    puntosVida: 88,
    habilidadPrincipal: "Golpe silencioso",
    mascota: "Pantera",
  },
  {
    nombre: "Orin",
    clase: "Druida",
    nivel: 6,
    puntosVida: 105,
    habilidadPrincipal: "Enredadera curativa",
  },
];

// 3) Reto extra: filtramos a quienes tienen nivel >= 10.
const listosParaMisionDificil: PersonajeRPG[] = personajes.filter(
  (personaje) => personaje.nivel >= 10,
);

// 4) Mostramos los resultados.
console.log("=== Personajes RPG válidos ===");
console.table(personajes);

console.log("\n=== Listos para misión difícil (nivel >= 10) ===");
console.log(
  listosParaMisionDificil
    .map((personaje) => `${personaje.nombre} (Nv. ${personaje.nivel})`)
    .join(", "),
);
