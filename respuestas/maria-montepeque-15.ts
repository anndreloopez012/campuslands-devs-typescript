// Punto de entrada: orquesta la carga, el registro y el resumen final.

import { GestorPersonajes } from "./maria-montepeque-15-GestorPersonajes.js";
import { cargarPersonajesIniciales } from "./maria-montepeque-15-data.js";

async function main(): Promise<void> {
  const gestor = new GestorPersonajes();

  // 1) Carga inicial asíncrona.
  const iniciales = await cargarPersonajesIniciales();
  iniciales.forEach((personaje) => gestor.registrar(personaje));

  // 2) Registro manual de un personaje nuevo (sin inventario al principio).
  gestor.registrar({
    id: "P-04",
    nombre: "Nyra",
    clase: "Asesino",
    nivel: 6,
    puntosVida: 82,
  });
  gestor.equipar("P-04", {
    nombre: "Dagas gemelas",
    rareza: "Legendario",
    poderBase: 50,
  });

  // 3) Subida de nivel.
  gestor.subirNivel("P-01");

  // 4) Listado por clase + resumen final.
  console.log("Total de personajes:", gestor.total);
  console.log(
    "Magas registradas:",
    gestor.listarPorClase("Maga").map((p) => p.nombre),
  );

  console.log("\nResumen del equipo RPG:");
  gestor.obtenerResumen().forEach((linea) => console.log(" -", linea));
}

main().catch((error: unknown) => {
    console.error("Error al ejecutar el gestor:", error);
    
  try {
    (globalThis as any).process.exitCode = 1;
  } catch {

  }
});
