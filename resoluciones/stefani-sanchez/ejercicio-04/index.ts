export {};

// Ejercicio 04: Interfaces
// Contexto: Personajes de Videojuegos RPG

interface Habilidad {
  readonly nombre: string;
  costoMana: number;
  danioBase: number;
  tipoElemento?: "fuego" | "hielo" | "rayo" | "arcano";
}

interface PersonajeRPG {
  readonly id: string;
  nombre: string;
  clase: "Maga" | "Paladín" | "Pícaro" | "Nigromante";
  nivel: number;
  puntosVidaMax: number;
  puntosVidaActual: number;
  manaMax: number;
  manaActual: number;
  habilidades: Habilidad[];
  estaVivo: boolean;
}

const hechicera: PersonajeRPG = {
  id: "RPG-STEF-01",
  nombre: "Aria Sombraluna",
  clase: "Maga",
  nivel: 12,
  puntosVidaMax: 240,
  puntosVidaActual: 210,
  manaMax: 350,
  manaActual: 180,
  habilidades: [
    { nombre: "Ráfaga de Escarcha", costoMana: 45, danioBase: 80, tipoElemento: "hielo" },
    { nombre: "Centella Arcana", costoMana: 60, danioBase: 120, tipoElemento: "arcano" }
  ],
  estaVivo: true
};

function ejecutarHabilidad(personaje: PersonajeRPG, habilidad: Habilidad): void {
  if (personaje.manaActual < habilidad.costoMana) {
    console.log(`${personaje.nombre} no tiene suficiente maná para lanzar ${habilidad.nombre}.`);
    return;
  }

  personaje.manaActual -= habilidad.costoMana;
  console.log(
    `✨ ${personaje.nombre} ejecutó "${habilidad.nombre}" causando ${habilidad.danioBase} de daño (${habilidad.tipoElemento ?? "físico"}).`
  );
  console.log(`Maná restante: ${personaje.manaActual}/${personaje.manaMax}`);
}

console.log(`Personaje: ${hechicera.nombre} [${hechicera.clase} Nivel ${hechicera.nivel}]`);
console.log(`Salud: ${hechicera.puntosVidaActual}/${hechicera.puntosVidaMax} | Maná: ${hechicera.manaActual}/${hechicera.manaMax}`);
ejecutarHabilidad(hechicera, hechicera.habilidades[0]);
ejecutarHabilidad(hechicera, hechicera.habilidades[1]);
