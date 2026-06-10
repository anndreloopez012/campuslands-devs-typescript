export {};

// Ejercicio 4: Interfaces
// Contexto: Personajes RPG

// TODO: define la interfaz PersonajeRPG.

interface PersonajeRPG {
  nombre: string;
  clase: string;
  nivel: number;
  puntosDeVida: number;
  clan?: string;
}
// TODO: crea un array de personajes.
const personajes: PersonajeRPG[] = [
  { nombre: "Aragorn", clase: "Guerrero", nivel: 10, puntosDeVida: 150 },
  { nombre: "Gandalf", clase: "Mago", nivel: 8, puntosDeVida: 100 },
  {
    nombre: "Legolas",
    clase: "Arquero",
    nivel: 20,
    puntosDeVida: 120,
    clan: "Elfos",
  },
  {
    nombre: "Gimli",
    clase: "Guerrero",
    nivel: 5,
    puntosDeVida: 130,
    clan: "Enanos",
  },
];
//Filtro de personajes con nivel mayor a 10
const personajesAltonivel = personajes.filter(
  (personaje) => personaje.nivel >= 10,
);
//  Imprime el listado de personajes.
console.log("El listado de los personajes: ");
console.table(personajes);
// Imprime el listado de personajes con nivel mayor o igual a 10.
console.log("Personajes de nivel mayor a 10: ");
const listadoMision = personajesAltonivel.map(
  (personaje) =>
    `${personaje.nombre} con cargo de ${personaje.clase} con un nivel de ${personaje.nivel} y puntos de vida de ${personaje.puntosDeVida} se une a la misión.`,
);
console.log(listadoMision.join("\n"));
