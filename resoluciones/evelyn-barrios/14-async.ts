export {};

async function fetchPelicula(id: number): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) resolve("Pelicula: Inception");
      else reject("ID inválido");
    }, 1000);
  });
}

async function mostrarPelicula() {
  try {
    const nombre = await fetchPelicula(5);
    console.log("Cargado con éxito:", nombre);
  } catch (err) {
    console.error(err);
  }
}

mostrarPelicula();
