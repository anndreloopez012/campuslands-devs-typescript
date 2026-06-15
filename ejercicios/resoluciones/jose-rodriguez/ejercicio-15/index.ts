export {};
import { PersonajeRPG, Equipo, RarezaEquipo } from "./utilidades.js";

// CLASE GESTORA (CON ENCAPSULAMIENTO)

class GestorRPG {
  // Array privado protegido contra accesos arbitrarios externos
  private personajes: PersonajeRPG[] = [];

  /**
   * Simula la carga asíncrona de datos desde el archivo local JSON (simulando una API)
   */
  public async cargarDatosIniciales(): Promise<void> {
    try {
      // Usamos import dinámico con la sintaxis oficial moderna 'with'
      const modulo = await import("./datos.json", { with: { type: "json" } });
      const datosJSON = modulo.default as PersonajeRPG[];

      // Asignamos e inicializamos un inventario vacío por defecto para cada uno
      this.personajes = datosJSON.map((p) => ({
        ...p,
        inventario: p.inventario ?? [],
      }));

      console.log(
        ` [Sistema] Carga asíncrona completada. ${this.personajes.length} héroes añadidos.`,
      );
    } catch (error) {
      console.error(
        "Error crítico al leer el archivo de base de datos json:",
        error,
      );
    }
  }

  /**
   * Registra manualmente un nuevo héroe en la colección
   */
  public registrarPersonaje(nuevoPersonaje: PersonajeRPG): void {
    if (nuevoPersonaje.nivel < 0) {
      throw new Error(
        `Validación fallida: El nivel de ${nuevoPersonaje.nombre} no puede ser negativo.`,
      );
    }
    this.personajes.push(nuevoPersonaje);
    console.log(
      `¡Héroe registrado exitosamente!: ${nuevoPersonaje.nombre} (${nuevoPersonaje.clase})`,
    );
  }

  /**
   * BÚSQUEDA REUTILIZABLE CON GENÉRICOS
   * Permite buscar un personaje por cualquier campo clave (id, nombre, etc.)
   */
  public buscarPorPropiedad<K extends keyof PersonajeRPG>(
    propiedad: K,
    valor: PersonajeRPG[K],
  ): PersonajeRPG | undefined {
    return this.personajes.find((p) => p[propiedad] === valor);
  }

  /**
   * Sube el nivel de un personaje validando las restricciones del negocio
   */
  public subirNivel(id: string, nivelesASumar: number): void {
    if (nivelesASumar <= 0) {
      console.log("La cantidad de niveles a subir debe ser mayor a cero.");
      return;
    }

    const heroe = this.buscarPorPropiedad("id", id);
    if (heroe) {
      heroe.nivel += nivelesASumar;
      // Escalabilidad de vida por nivel extra
      heroe.puntosVida += nivelesASumar * 15;
      console.log(
        `¡SUBIDA DE NIVEL! ${heroe.nombre} ahora es nivel ${heroe.nivel} (HP: ${heroe.puntosVida}).`,
      );
    } else {
      console.log(`No se encontró ningún héroe con ID: ${id}`);
    }
  }

  /**
   * Retorna una lista filtrada según la arquetipo/clase seleccionada
   */
  public listarPorClase(claseBuscar: string): PersonajeRPG[] {
    return this.personajes.filter(
      (p) => p.clase.toLowerCase() === claseBuscar.toLowerCase(),
    );
  }

  /**
   * RETO EXTRA: Calcula el poder numérico de combate sumando Nivel + Bonos de equipo
   */
  public calcularPoderTotal(heroe: PersonajeRPG): number {
    const PODER_BASE_POR_NIVEL = 50;
    const poderNivel = heroe.nivel * PODER_BASE_POR_NIVEL;

    // Sumamos el bono de daño de los objetos en el inventario usando .reduce()
    const poderEquipo = (heroe.inventario ?? []).reduce(
      (suma, item) => suma + item.bonoPoder,
      0,
    );

    return poderNivel + poderEquipo;
  }

  /**
   * Imprime el informe general de la plantilla en el servidor de juego
   */
  public imprimirResumen(): void {
    console.log("\n========================================================");
    console.log("          INFORME FINAL DE LA GUILDA RPG              ");
    console.log("========================================================");

    this.personajes.forEach((p) => {
      const poderTotal = this.calcularPoderTotal(p);
      console.log(`Héroe: ${p.nombre} [ID: ${p.id}]`);
      console.log(
        `Rol: ${p.clase} | Nivel: ${p.nivel} | Vitalidad: ${p.puntosVida} HP`,
      );

      if (p.inventario && p.inventario.length > 0) {
        const itemsStr = p.inventario
          .map((i) => `${i.nombre} (${i.rareza} +${i.bonoPoder})`)
          .join(", ");
        console.log(`Equipo: ${itemsStr}`);
      } else {
        console.log(`Equipo: Ninguno`);
      }
      console.log(`PODER TOTAL DE COMBATE: ${poderTotal} pts`);
      console.log("--------------------------------------------------------");
    });
  }
}

// EJECUCIÓN SECUENCIAL ASÍNCRONA

async function iniciarJuego() {
  const gestor = new GestorRPG();

  // 1. Cargamos de manera asíncrona los personajes iniciales del JSON (Lyra, Roth y Sena)
  await gestor.cargarDatosIniciales();

  console.log("\n--- Realizando Modificaciones en Tiempo de Ejecución ---");

  // 2. Subimos el nivel de Roth (ID: P-02) utilizando el motor de búsqueda genérico interno
  gestor.subirNivel("P-02", 3);

  // 3. Registramos un personaje nuevo manualmente para probar la validación
  const nuevoHeroe: PersonajeRPG = {
    id: "P-04",
    nombre: "NEO",
    clase: "Maga",
    nivel: 1,
    puntosVida: 80,
    inventario: [],
  };
  gestor.registrarPersonaje(nuevoHeroe);

  // 4. RETO EXTRA: Equipar un arma legendaria al personaje encontrado
  const magoEncontrado = gestor.buscarPorPropiedad("nombre", "Lyra");
  if (magoEncontrado && magoEncontrado.inventario) {
    const baculoSagrado: Equipo = {
      nombre: "Báculo del Cosmos",
      rareza: "Legendario",
      bonoPoder: 250,
    };
    magoEncontrado.inventario.push(baculoSagrado);
    console.log(`Item equipado con éxito a ${magoEncontrado.nombre}.`);
  }

  // 5. Probamos el filtro de clases
  const todosLosMagos = gestor.listarPorClase("Maga");
  console.log(
    `\n Filtrando gremio: Se encontraron ${todosLosMagos.length} personajes en la clase Maga.`,
  );

  // 6. Imprimimos el resultado de la simulación
  gestor.imprimirResumen();
}

iniciarJuego();
