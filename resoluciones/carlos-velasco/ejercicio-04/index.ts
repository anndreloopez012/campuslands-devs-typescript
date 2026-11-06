
// Ejercicio 4: Interfaces
// Contexto: Personajes RPG

// TODO: define la interfaz PersonajeRPG.
// TODO: crea un array de personajes.


interface PersonajesRPG {
  nombre: string;
  nivel: number;
  puntos: number;
  vida: number;
  atributos: string[];
  habilidad: "activa" | "pasiva";
  tipo: string;
}

const personajes: PersonajesRPG[] = [
  {
    nombre: 'Carlos',
    nivel: 13,
    puntos: 1500,
    vida: 500,
    atributos: ["velocidad", "resistencia", "poder"],
    habilidad: "activa",
    tipo: "Mago"
  },
  {
    nombre: 'Eldrin',
    nivel: 22,
    puntos: 3200,
    vida: 800,
    atributos: ["sigilo", "agilidad"],
    habilidad: "pasiva",
    tipo: "Asesino"
  },
  {
    nombre: 'Thorgar',
    nivel: 25,
    puntos: 4500,
    vida: 1200,
    atributos: ["fuerza", "resistencia", "intimidación"],
    habilidad: "activa",
    tipo: "Guerrero"
  },
  {
    nombre: 'Lyra',
    nivel: 20,
    puntos: 2100,
    vida: 400,
    atributos: ["sanación", "sabiduría"],
    habilidad: "pasiva",
    tipo: "Clérigo"
  },
  {
    nombre: 'Vex',
    nivel: 10,
    puntos: 900,
    vida: 350,
    atributos: ["puntería", "reflejos"],
    habilidad: "activa",
    tipo: "Arquero"
  },
  {
    nombre: 'Ignis',
    nivel: 30,
    puntos: 6000,
    vida: 950,
    atributos: ["fuego", "vuelo", "resistencia"],
    habilidad: "activa",
    tipo: "Dragón"
  }
];

const mayor_nivel = personajes.filter(p => p.nivel >= 15)
console.log(`quienes pueden entrar ${mayor_nivel.map(m => m.nombre).join(" - ")}`)