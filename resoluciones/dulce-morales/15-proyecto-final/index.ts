export {};

// Ejercicio 15: Proyecto Final Integrador
// Contexto: Gestor de personajes RPG con TypeScript

// 1. Interfaces y Tipos (Reto Extra incluido: Rareza, Equipo, Inventario)
type Rareza = "Común" | "Raro" | "Épico" | "Legendario";

interface ItemEquipo {
  nombre: string;
  rareza: Rareza;
  puntosPoder: number;
}

interface Personaje {
  id: string;
  nombre: string;
  clase: string;
  nivel: number;
  puntosVida: number;
  inventario?: ItemEquipo[]; // Opcional para cumplir requerimientos previos
}

interface Identificable {
  id: string;
}

// 2. Clase Gestor del RPG con Generics y Encapsulamiento
class GestorRPG<T extends Identificable> {
  private coleccion: T[] = [];

  public agregar(elemento: T): void {
    this.coleccion.push(elemento);
  }

  public obtenerTodos(): T[] {
    return [...this.coleccion];
  }

  // Método Genérico para buscar cualquier elemento por ID
  public buscarPorId(id: string): T | undefined {
    return this.coleccion.find((item) => item.id === id);
  }
}

// 3. Funciones de Utilidad y Asincronía
function calcularPoderTotal(personaje: Personaje): number {
  const poderBase = personaje.nivel * 10 + personaje.puntosVida;
  const poderEquipo =
    personaje.inventario?.reduce((acc, item) => acc + item.puntosPoder, 0) || 0;
  return poderBase + poderEquipo;
}

async function cargarPersonajesIniciales(): Promise<Personaje[]> {
  try {
    const respuesta = await fetch("datos.json");
    if (!respuesta.ok) throw new Error();
    return await respuesta.json();
  } catch (error) {
    console.log(
      "[ERROR]: No se pudo cargar datos.json automáticamente. Usando datos de respaldo.",
    );
    return [
      { id: "P-01", nombre: "Lyra", clase: "Maga", nivel: 8, puntosVida: 90 },
      {
        id: "P-02",
        nombre: "Roth",
        clase: "Guerrero",
        nivel: 11,
        puntosVida: 145,
      },
      {
        id: "P-03",
        nombre: "Sena",
        clase: "Arquera",
        nivel: 7,
        puntosVida: 95,
      },
    ];
  }
}

// 4. Ejecución del Flujo Principal
async function iniciarJuego(): Promise<void> {
  const gestor = new GestorRPG<Personaje>();

  console.log("Cargando personajes desde datos.json...");
  const datosIniciales = await cargarPersonajesIniciales();
  datosIniciales.forEach((p) => gestor.agregar(p));

  // Modificar niveles (Validando que no sean negativos)
  const personajeAEvaluar = gestor.buscarPorId("P-01");
  if (personajeAEvaluar && personajeAEvaluar.nivel >= 0) {
    personajeAEvaluar.nivel += 1; // Sube de nivel
    // Asignar inventario (Reto Extra)
    personajeAEvaluar.inventario = [
      { nombre: "Báculo de Fuego", rareza: "Épico", puntosPoder: 150 },
      { nombre: "Anillo de Maná", rareza: "Raro", puntosPoder: 50 },
    ];
  }

  // Mostrar Resumen Final
  console.log("\n--- LISTADO FINAL DE PERSONAJES RPG ---");
  gestor.obtenerTodos().forEach((p) => {
    const poder = calcularPoderTotal(p);
    console.log(
      `[${p.id}] ${p.nombre} - Clase: ${p.clase} | Nivel: ${p.nivel} | HP: ${p.puntosVida} | Poder Total: ${poder}`,
    );
    if (p.inventario && p.inventario.length > 0) {
      console.log(
        ` -> Equipo: ${p.inventario.map((i) => `${i.nombre} (${i.rareza})`).join(", ")}`,
      );
    }
  });
}

iniciarJuego();
