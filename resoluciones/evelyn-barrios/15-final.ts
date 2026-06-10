export {};

/**
 * Proyecto Final: Gestor de Héroes RPG
 * Solución original y simplificada para Evelyn Barrios
 */

interface Identificable {
  uuid: string;
}

interface HeroeRPG extends Identificable {
  nombre: string;
  rol: "Guerrero" | "Mago" | "Explorador";
  nivel: number;
}

class Clan<T extends Identificable> {
  private miembros: T[] = [];

  // Uso de Async/Await para simular una carga de datos
  async cargarGremio(): Promise<void> {
    console.log("Conectando con el servidor del juego...");
    return new Promise((resolve) => setTimeout(resolve, 1200));
  }

  agregarMiembro(nuevo: T): void {
    this.miembros.push(nuevo);
    console.log(`[EXITO] Entidad con ID ${nuevo.uuid} registrada.`);
  }

  obtenerListado(): T[] {
    return this.miembros;
  }
}

async function bootstrap() {
  const miClan = new Clan<HeroeRPG>();

  // Esperamos la simulación de red
  await miClan.cargarGremio();

  miClan.agregarMiembro({
    uuid: "EV-99",
    nombre: "Evelyn_Pro",
    rol: "Mago",
    nivel: 25,
  });

  console.log("--- Miembros del Clan Activos ---");
  console.table(miClan.obtenerListado());
}

bootstrap();
