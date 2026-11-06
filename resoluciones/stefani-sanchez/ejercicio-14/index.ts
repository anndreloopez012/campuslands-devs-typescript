import peliculasLocales from "./datos.json" with { type: "json" };

// Ejercicio 14: Async/Await y Manejo de Errores
// Contexto: Consulta de API Simulada de Películas

type PeliculaApi = {
  id: number;
  titulo: string;
  genero: string;
  rating: number;
};

function simularLatencia(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function consultarPeliculas(genero?: string): Promise<PeliculaApi[]> {
  console.log("Conectando con el servidor de películas...");
  await simularLatencia(200);

  const datos: PeliculaApi[] = peliculasLocales;
  if (!datos || datos.length === 0) {
    throw new Error("No se encontraron registros de películas en el catálogo.");
  }

  return genero ? datos.filter((p) => p.genero === genero) : datos;
}

async function ejecutarCatalogo(): Promise<void> {
  try {
    console.log("=== BÚSQUEDA DE PELÍCULAS: CIENCIA FICCIÓN ===");
    const sciFi = await consultarPeliculas("ciencia ficcion");
    console.table(sciFi);

    console.log("\n=== CATÁLOGO COMPLETO ===");
    const todas = await consultarPeliculas();
    todas.forEach((p) => {
      console.log(`[${p.id}] ${p.titulo} (${p.genero}) - Rating: ⭐ ${p.rating}`);
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido en el servidor";
    console.error("Error al consultar el catálogo:", msg);
  }
}

await ejecutarCatalogo();
