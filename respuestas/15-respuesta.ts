export {};

type ClaseRPG = "Maga" | "Guerrero" | "Arquera" | "Asesino";

interface EntidadConId {
  id: string;
}

interface PersonajeRPG extends EntidadConId {
  nombre: string;
  clase: ClaseRPG;
  nivel: number;
  puntosVida: number;
  inventario: string[];
}

function buscarPorId<T extends EntidadConId>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

class GestorPersonajes {
  private personajes: PersonajeRPG[] = [];

  registrar(personaje: PersonajeRPG): void {
    if (personaje.nivel < 1) {
      throw new Error("El nivel inicial debe ser mayor o igual a 1.");
    }

    this.personajes.push(personaje);
  }

  listarPorClase(clase: ClaseRPG): PersonajeRPG[] {
    return this.personajes.filter((personaje) => personaje.clase === clase);
  }

  subirNivel(id: string): PersonajeRPG {
    const personaje = buscarPorId(this.personajes, id);

    if (!personaje) {
      throw new Error(`No existe un personaje con id ${id}.`);
    }

    personaje.nivel += 1;
    personaje.puntosVida += 10;
    return personaje;
  }

  obtenerResumen(): string[] {
    return this.personajes.map(
      (personaje) =>
        `${personaje.nombre} [${personaje.clase}] nivel ${personaje.nivel}, vida ${personaje.puntosVida}, items: ${personaje.inventario.join(", ")}`,
    );
  }
}

async function cargarPersonajesIniciales(): Promise<PersonajeRPG[]> {
  return [
    { id: "P-01", nombre: "Lyra", clase: "Maga", nivel: 8, puntosVida: 90, inventario: ["Baston arcano"] },
    { id: "P-02", nombre: "Roth", clase: "Guerrero", nivel: 11, puntosVida: 145, inventario: ["Espada pesada", "Escudo"] },
    { id: "P-03", nombre: "Sena", clase: "Arquera", nivel: 7, puntosVida: 95, inventario: ["Arco compuesto"] },
  ];
}

const gestor = new GestorPersonajes();
const personajesIniciales = await cargarPersonajesIniciales();

personajesIniciales.forEach((personaje) => gestor.registrar(personaje));
gestor.registrar({ id: "P-04", nombre: "Nyra", clase: "Asesino", nivel: 6, puntosVida: 82, inventario: ["Dagas gemelas"] });
gestor.subirNivel("P-01");

console.log("Magas registradas:", gestor.listarPorClase("Maga"));
console.log("Resumen del equipo RPG:");
gestor.obtenerResumen().forEach((linea) => console.log(linea));
