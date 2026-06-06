// Clase que encapsula toda la lógica del roster de personajes.

import type {
  ClaseRPG,
  Equipo,
  PersonajeRPG,
  NuevoPersonaje,
  Rareza,
} from "./maria-montepeque-15-types.js";
import { buscarPorId } from "./maria-montepeque-15-utils.js";

const MULTIPLICADOR_RAREZA: Record<Rareza, number> = {
  Comun: 1,
  Raro: 1.5,
  Epico: 2.5,
  Legendario: 4,
};

export class GestorPersonajes {
  private readonly personajes: PersonajeRPG[] = [];

  registrar(nuevo: NuevoPersonaje): PersonajeRPG {
    if (nuevo.nivel < 1) {
      throw new Error(
        `El nivel debe ser mayor o igual a 1 (recibido: ${nuevo.nivel}).`,
      );
    }

    if (buscarPorId(this.personajes, nuevo.id)) {
      throw new Error(`Ya existe un personaje con id ${nuevo.id}.`);
    }

    const personaje: PersonajeRPG = {
      ...nuevo,
      inventario: nuevo.inventario ?? [],
    };
    this.personajes.push(personaje);
    return personaje;
  }

  listarPorClase(clase: ClaseRPG): PersonajeRPG[] {
    return this.personajes.filter((personaje) => personaje.clase === clase);
  }

  subirNivel(id: string): PersonajeRPG {
    const personaje = this.obtener(id);
    personaje.nivel += 1;
    personaje.puntosVida += 10;
    return personaje;
  }

  equipar(id: string, equipo: Equipo): PersonajeRPG {
    const personaje = this.obtener(id);

    if (equipo.poderBase < 0) {
      throw new Error("El poder base del equipo no puede ser negativo.");
    }

    personaje.inventario.push(equipo);
    return personaje;
  }

  calcularPoderTotal(id: string): number {
    const personaje = this.obtener(id);

    const poderEquipo = personaje.inventario.reduce(
      (total, equipo) =>
        total + equipo.poderBase * MULTIPLICADOR_RAREZA[equipo.rareza],
      0,
    );

    const poderBase = personaje.nivel * 10 + personaje.puntosVida * 0.5;
    return Math.round(poderBase + poderEquipo);
  }

  obtenerResumen(): string[] {
    return this.personajes.map((personaje) => {
      const items =
        personaje.inventario
          .map((e) => `${e.nombre} (${e.rareza})`)
          .join(", ") || "sin equipo";
      const poder = this.calcularPoderTotal(personaje.id);
      return `${personaje.nombre} [${personaje.clase}] nivel ${personaje.nivel}, vida ${personaje.puntosVida}, poder ${poder} — ${items}`;
    });
  }
    
  get total(): number {
    return this.personajes.length;
  }

  private obtener(id: string): PersonajeRPG {
    const personaje = buscarPorId(this.personajes, id);

    if (!personaje) {
      throw new Error(`No existe un personaje con id ${id}.`);
    }

    return personaje;
  }
}
