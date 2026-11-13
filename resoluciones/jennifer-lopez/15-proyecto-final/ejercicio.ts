export {};

import datosIniciales from "./datos.json" with { type: "json" };

type RarezaEquipo = "Común" | "Raro" | "Épico" | "Legendario";

interface Item {
  nombre: string;
  rareza: RarezaEquipo;
  bonoPoder: number;
}

interface PersonajeRPG {
  id: string;
  nombre: string;
  clase: string;
  nivel: number;
  puntosVida: number;
  inventario?: Item[];
}

class GestorPersonajes<T extends PersonajeRPG> {
  private personajes: T[] = [];

  registrar(personaje: T): void {
    if (personaje.nivel < 0) {
      throw new Error(`El nivel de ${personaje.nombre} no puede ser negativo.`);
    }
    if (!personaje.inventario) {
      personaje.inventario = [];
    }
    this.personajes.push(personaje);
    console.log(`Personaje ${personaje.nombre} (${personaje.clase}) registrado.`);
  }

  listarPorClase(clase: string): T[] {
    return this.personajes.filter(p => p.clase.toLowerCase() === clase.toLowerCase());
  }

  subirNivel(id: string, niveles: number): void {
    if (niveles < 0) {
      console.log("No puedes subir un número negativo de niveles.");
      return;
    }
    const personaje = this.buscarPorPropiedad("id", id);
    if (personaje) {
      personaje.nivel += niveles;
      personaje.puntosVida += niveles * 10;
      console.log(`¡${personaje.nombre} subió a nivel ${personaje.nivel}!`);
    }
  }

  buscarPorPropiedad<K extends keyof T>(propiedad: K, valor: T[K]): T | undefined {
    return this.personajes.find(p => p[propiedad] === valor);
  }

  calcularPoderTotal(id: string): number {
    const personaje = this.buscarPorPropiedad("id", id);
    if (!personaje) return 0;
    
    const poderBase = personaje.nivel * 15;
    const poderItems = personaje.inventario?.reduce((sum, item) => sum + item.bonoPoder, 0) || 0;
    return poderBase + poderItems;
  }

  obtenerTodos(): T[] {
    return this.personajes;
  }
}

function esperarCarga(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function iniciarJuego() {
  console.log("--- INICIANDO GESTOR RPG ---");
  const gestor = new GestorPersonajes<PersonajeRPG>();

  try {
    console.log("Cargando personajes iniciales desde datos.json...");
    await esperarCarga(1500); 

    const personajesCargados = datosIniciales as PersonajeRPG[];
    personajesCargados.forEach(p => gestor.registrar(p));
    console.log("Carga inicial completada con éxito.\n");

  } catch (error) {
    console.error("Error en la carga asíncrona:", error);
    return;
  }

  console.log("--- MODIFICANDO ESTADOS ---");
  gestor.subirNivel("P-01", 3); 

  const espada: Item = { nombre: "Espada Cósmica", rareza: "Legendario", bonoPoder: 120 };
  const roth = gestor.buscarPorPropiedad("id", "P-02");
  if (roth) roth.inventario?.push(espada);

  console.log("\n--- FILTRANDO CLASE: MAGA ---");
  gestor.listarPorClase("Maga").forEach(m => console.log(`- ${m.nombre} (Nivel ${m.nivel})`));

  console.log("\n=== RESUMEN FINAL ===");
  gestor.obtenerTodos().forEach(p => {
    const poder = gestor.calcularPoderTotal(p.id);
    console.log(`\nHÉROE: ${p.nombre} [${p.clase}]`);
    console.log(`   • Nivel: ${p.nivel} | Vida: ${p.puntosVida}`);
    console.log(`   • Poder Total: ${poder}`);
    console.log(`   • Inventario: ${p.inventario?.length ? p.inventario.map(i => `${i.nombre} (${i.rareza})`).join(", ") : "Vacío"}`);
  });
}

iniciarJuego();