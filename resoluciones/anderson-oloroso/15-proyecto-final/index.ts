export {};
import datos from "./datos.json" with { type: "json" };
// Ejercicio 15: Proyecto Final Integrador
// Contexto: Gestor de personajes RPG con TypeScript

// TODO: integra interfaces, clases, generics y async/await.
console.log("=========== GESTOR DE VIDEOJUEGOS RPG ========== ");

type Clase = "Maga" | "Guerrero" | "Arquero" | "Asesino" | "Clérigo";

interface datosRPG {
  id: string;
  nombre: string;
  clase: Clase;
  nivel: number;
  puntosVida: number;
}

function buscarId<T extends { id: string }>(
  array: T[],
  id: string,
): T | undefined {
  return array.find((dato) => dato.id === id);
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

  async filtro(clase: Clase) {
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

  async subirNivel(id: string): Promise<string | undefined> {
    const videojuegos = await this.cargarRPG();
    const juego = buscarId(videojuegos, id);

    if (!juego) return undefined;
    console.log("Nivel anterior: " + juego.nivel);
    juego.nivel += 1;
    return `El nivel aumentó en ${juego.nombre}, nuevo nivel: ${juego.nivel}`;
  }

  async registrarPersonajes(arreglo: datosRPG[]): Promise<string | undefined> {
    try {
      const videojuegos = await this.cargarRPG();
      videojuegos.push(...arreglo);
      return `Datos agregados exitosamente`;
    } catch (error) {
      console.error(error);
    }
  }
}

let nuevoRPG: datosRPG[] = [];

nuevoRPG = [
  {
    id: "P-04",
    nombre: "Silente Lyra",
    clase: "Maga",
    nivel: 34,
    puntosVida: 287,
  },
];

async function main() {
  const gestor = new gestorRPG();
  await gestor.registrarPersonajes(nuevoRPG);
  await gestor.todosLosJuegos();

  await gestor.filtro("Maga");

  const resultado = await gestor.subirNivel("P-04");
  if (resultado) console.log(resultado);
}

main();
