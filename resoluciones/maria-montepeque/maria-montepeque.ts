export {};

// Ejercicio 4: Interfaces
    
export {};

interface PersonajeRPG {
  nombre: string;
  clase: string;
  nivel: number;
  puntosVida: number;
  habilidadPrincipal: string;
  gremio?: string;
}

const personajes: PersonajeRPG[] = [
  {
    nombre: "Aria",
    clase: "Maga",
    nivel: 12,
    puntosVida: 84,
    habilidadPrincipal: "Tormenta arcana",
    gremio: "Luz del Norte",
  },
  {
    nombre: "Dante",
    clase: "Guerrero",
    nivel: 8,
    puntosVida: 130,
    habilidadPrincipal: "Corte titán",
  },
  {
    nombre: "Kira",
    clase: "Exploradora",
    nivel: 15,
    puntosVida: 96,
    habilidadPrincipal: "Flecha espectral",
    gremio: "Sombras Verdes",
  },
  {
    nombre: "Bran",
    clase: "Clérigo",
    nivel: 5,
    puntosVida: 70,
    habilidadPrincipal: "Luz sanadora",
  },
];

const listosParaMision = personajes.filter((p) => p.nivel >= 10);

console.table(personajes);
console.log(
  "Listos para misión difícil:",
  listosParaMision.map((p) => p.nombre).join(", "),
);