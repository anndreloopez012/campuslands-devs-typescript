import personajesIniciales from "./datos.json" with { type: "json" };

// Ejercicio 15: Proyecto Final Integrador
// Contexto: Gestor Completo de Personajes RPG para Stefani Sánchez

type ClaseRPG = "Maga" | "Guerrero" | "Arquera" | "Asesino" | "Paladin";

interface Entidad {
  readonly id: string;
}

interface PersonajeRPG extends Entidad {
  nombre: string;
  clase: ClaseRPG;
  nivel: number;
  puntosVida: number;
  inventario: string[];
}

function buscarEntidadPorId<T extends Entidad>(coleccion: readonly T[], id: string): T | undefined {
  return coleccion.find((item) => item.id === id);
}

class GestorGremioRPG {
  private miembros: PersonajeRPG[] = [];

  registrarMiembro(personaje: PersonajeRPG): void {
    if (personaje.nivel < 1) {
      throw new Error("El nivel del personaje debe ser mínimo 1.");
    }
    if (this.miembros.some((m) => m.id === personaje.id)) {
      throw new Error(`El personaje con ID ${personaje.id} ya se encuentra en el gremio.`);
    }
    this.miembros.push(personaje);
    console.log(`🗡️ Miembro registrado: ${personaje.nombre} (${personaje.clase})`);
  }

  obtenerPorClase(clase: ClaseRPG): PersonajeRPG[] {
    return this.miembros.filter((m) => m.clase === clase);
  }

  entrenarYSubirNivel(id: string): PersonajeRPG {
    const personaje = buscarEntidadPorId(this.miembros, id);
    if (!personaje) {
      throw new Error(`No se localizó personaje con ID ${id}.`);
    }
    personaje.nivel += 1;
    personaje.puntosVida += 15;
    console.log(`⭐ ${personaje.nombre} subió a nivel ${personaje.nivel} (Salud: ${personaje.puntosVida})`);
    return personaje;
  }

  generarReporteGremio(): string[] {
    return this.miembros.map(
      (p) => `[${p.id}] ${p.nombre.padEnd(10)} | ${p.clase.padEnd(9)} | Nvl: ${p.nivel.toString().padStart(2)} | HP: ${p.puntosVida} | Items: ${p.inventario.join(", ")}`
    );
  }
}

async function inicializarGremio(): Promise<void> {
  const gremio = new GestorGremioRPG();
  console.log("=== INICIALIZANDO GREMIO DE HÉROES RPG ===");

  const iniciales = personajesIniciales as PersonajeRPG[];
  iniciales.forEach((p) => gremio.registrarMiembro(p));

  // Agregar nuevo héroe
  gremio.registrarMiembro({
    id: "RPG-04",
    nombre: "Valkyria",
    clase: "Paladin",
    nivel: 15,
    puntosVida: 260,
    inventario: ["Lanza Solar", "Escudo Radiante"]
  });

  // Entrenar personaje
  gremio.entrenarYSubirNivel("RPG-01");

  console.log("\n=== REPORTE GENERAL DEL GREMIO ===");
  gremio.generarReporteGremio().forEach((linea) => console.log(linea));
}

await inicializarGremio();
