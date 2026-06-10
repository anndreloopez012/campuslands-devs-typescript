export {};
import datos from "./datos.json" with { type: "json" };
// Ejercicio 15: Proyecto Final Integrador
// Contexto: Gestor de personajes RPG con TypeScript

// TODO: integra interfaces, clases, generics y async/await.
console.log("=========== GESTOR DE VIDEOJUEGOS RPG ========== ");

type Clase = "Mago" | "Guerrero" | "Arquero" | "Asesino" | "Clérigo";

interface datosRPG {
  id: string;
  nombre: string;
  clase: Clase;
  nivel: number;
  puntosVida: number;
}

class gestorRPG {
  cargarRPG(): Promise<datosRPG[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const allRPG = datos as datosRPG[];

        if (allRPG && allRPG.length > 0) {
          resolve(allRPG);
        } else {
          reject(new Error("Error al cargar el los videojuegos"));
        }
      }, 1000);
    });
  }

  async todosLosJuegos(): Promise<void> {
    try {
      console.log("Obteniendo videojuegos ...");

      const videojuegos = await this.cargarRPG();

      console.log("¡Todos los datos han sido cargados con éxito!\n");
      console.log("=== VIDEOJUEGOS ===");

      videojuegos.forEach((videojuego) => {
        console.log(videojuego);
      });
    } catch (error) {
      console.error("=== ERROR EN LA CARGA DE DATOS ===");
      if (error instanceof Error) {
        console.error(`Detalle: ${error.message}`);
      }
    }
  }

  async filtro(clase: string) {
    const xGeneros: datosRPG[] = [];
    try {
      console.log("Filtrando peliculas por genero...");

      const todoElCatalogo = await this.cargarRPG();
      todoElCatalogo.forEach((videojuego) => {
        if (videojuego.clase === clase) {
          xGeneros.push(videojuego);
        }
      });
      xGeneros.forEach((videojuego) => {
        console.log(videojuego);
      });
    } catch (error) {
      console.error("=== ERROR AL FILTRAR POR GENERO ===");
      if (error instanceof Error) {
        console.error(`Detalle: ${error.message}`);
      }
    }
  }

  async subirNivel(nivel: number) {
    const videojuegos = await this.cargarRPG();
  }
}
