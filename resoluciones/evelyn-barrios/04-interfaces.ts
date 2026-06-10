export {};

interface PersonajeRPG {
  nombre: string;
  clase: "Mago" | "Guerrero" | "Arquero";
  nivel: number;
  vida: number;
  habilidadEspecial?: string; // Propiedad opcional
}

const misPersonajes: PersonajeRPG[] = [
  {
    nombre: "Evelyn",
    clase: "Mago",
    nivel: 12,
    vida: 100,
    habilidadEspecial: "Llamarada",
  },
  { nombre: "Arthur", clase: "Guerrero", nivel: 8, vida: 150 },
  {
    nombre: "Robin",
    clase: "Arquero",
    nivel: 15,
    vida: 90,
    habilidadEspecial: "Flecha Veloz",
  },
];

const nivelAlto = misPersonajes.filter((p) => p.nivel >= 10);

console.log("--- Mis Aventureros ---");
console.table(misPersonajes);
console.log(
  "Personajes de nivel alto:",
  nivelAlto.map((p) => p.nombre),
);
