// Ejercicio 15: Proyecto Final Integrador
// Contexto: Gestor de personajes RPG con TypeScript
// Resolucion: Dulce Morales
// Punto de entrada: usa el gestor y muestra el resultado. La logica vive en los otros modulos.

import datos from "./datos.json" with { type: "json" };
import { GestorPersonajes } from "./gestor";
import { CLASES, Rareza } from "./tipos";
import type { ClasePersonaje, Personaje, PersonajeCrudo, Resultado } from "./tipos";
import { calcularPoderTotal, poderDeItem } from "./utilidades";

function mostrarResultado(accion: string, resultado: Resultado<Personaje>): void {
  if (resultado.ok) {
    console.log(`  OK    ${accion}: ${resultado.valor.nombre} (nivel ${resultado.valor.nivel})`);
  } else {
    console.log(`  ERROR ${accion}: ${resultado.error}`);
  }
}

function describir(personaje: Personaje): string {
  const items: string =
    personaje.inventario.length === 0
      ? "sin equipo"
      : personaje.inventario
          .map((item): string => `${item.nombre} [${item.rareza}, +${poderDeItem(item)}]`)
          .join(", ");
  return `${personaje.nombre.padEnd(6)} Nv ${String(personaje.nivel).padStart(2)} | HP ${String(personaje.puntosVida).padStart(3)} | ${items}`;
}

async function main(): Promise<void> {
  const gestor: GestorPersonajes = new GestorPersonajes();
  const datosIniciales: PersonajeCrudo[] = datos;

  // 1. Carga inicial asincrona
  console.log("Cargando datos iniciales...");
  try {
    const errores: string[] = await gestor.cargarDatosIniciales(datosIniciales);
    console.log(`Cargados ${gestor.total} de ${datosIniciales.length} personajes.`);
    errores.forEach((error: string): void => console.log(`  Rechazado: ${error}`));
  } catch (error: unknown) {
    console.log(`No se pudo cargar: ${error instanceof Error ? error.message : "error desconocido"}`);
    return;
  }

  // 2. Registrar personajes nuevos
  console.log("\n=== REGISTRO ===");
  mostrarResultado(
    "registrar",
    gestor.registrar({ id: "P-06", nombre: "Thea", clase: "Clerigo", nivel: 6, puntosVida: 85, inventario: [] }),
  );
  mostrarResultado(
    "registrar",
    gestor.registrar({ id: "P-01", nombre: "Lyra clon", clase: "Maga", nivel: 1, puntosVida: 50, inventario: [] }),
  );

  // 3. Subir nivel (con validacion)
  console.log("\n=== SUBIR NIVEL ===");
  mostrarResultado("subir 3 niveles", gestor.subirNivel("P-03", 3));
  mostrarResultado("subir -5 niveles", gestor.subirNivel("P-02", -5));
  mostrarResultado("subir 1 nivel", gestor.subirNivel("P-99", 1));

  // 4. Equipar (reto extra: inventario y rareza)
  console.log("\n=== EQUIPAR ===");
  mostrarResultado(
    "equipar",
    gestor.equipar("P-06", { id: "I-05", nombre: "Amuleto solar", rareza: Rareza.Legendario, poderBase: 20 }),
  );

  // 5. Listar por clase
  console.log("\n=== PERSONAJES POR CLASE ===");
  CLASES.forEach((clase: ClasePersonaje): void => {
    const lista: Personaje[] = gestor.listarPorClase(clase);
    console.log(`${clase} (${lista.length})`);
    lista.forEach((personaje: Personaje): void => console.log(`  ${describir(personaje)}`));
  });

  // 6. Resumen final con poder total
  console.log("\n=== RESUMEN FINAL: RANKING DE PODER ===");
  gestor.ranking().forEach((personaje: Personaje, indice: number): void => {
    console.log(`${indice + 1}. ${personaje.nombre.padEnd(6)} (${personaje.clase.padEnd(8)}) poder ${calcularPoderTotal(personaje)}`);
  });
  const grupos: Map<ClasePersonaje, Personaje[]> = gestor.agruparPorClase();
  console.log(`Total: ${gestor.total} personajes en ${grupos.size} clases.`);
}

main();
