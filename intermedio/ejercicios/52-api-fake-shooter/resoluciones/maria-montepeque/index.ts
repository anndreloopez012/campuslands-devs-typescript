export {};

class ApiError extends Error {
  constructor(
    readonly codigo: 404 | 429 | 500,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = "ApiError";
  }
}

interface Jugador {
  readonly id: number;
  readonly alias: string;
  readonly kills: number;
  readonly muertes: number;
}

type Resultado<T> = { readonly ok: true; readonly datos: T } | { readonly ok: false; readonly error: ApiError };

const esperar = (ms: number): Promise<void> => new Promise((resolver) => setTimeout(resolver, ms));

const baseDeDatos: readonly Jugador[] = [
  { id: 1, alias: "Vex", kills: 24, muertes: 8 },
  { id: 2, alias: "Nyx", kills: 31, muertes: 6 },
  { id: 3, alias: "Riko", kills: 10, muertes: 12 },
];

// API falsa: falla 2 veces con 500 antes de responder, para practicar reintentos.
let llamadasA: number = 0;

const fetchJugador = async (id: number): Promise<Jugador> => {
  await esperar(10);
  if (id === 3) {
    llamadasA++;
    if (llamadasA <= 2) throw new ApiError(500, `Servidor caido (intento ${llamadasA})`);
  }
  if (id === 99) throw new ApiError(429, "Demasiadas solicitudes");
  const jugador = baseDeDatos.find((j) => j.id === id);
  if (!jugador) throw new ApiError(404, `Jugador ${id} no existe`);
  return jugador;
};

const conReintentos = async <T>(accion: () => Promise<T>, intentos: number): Promise<T> => {
  let ultimo: unknown;
  for (let i = 1; i <= intentos; i++) {
    try {
      return await accion();
    } catch (error) {
      ultimo = error;
      // Solo se reintentan los errores del servidor; un 404 no cambiara con otro intento.
      if (!(error instanceof ApiError) || error.codigo === 404) break;
      await esperar(10 * i);
    }
  }
  throw ultimo;
};

const consultar = async (id: number): Promise<Resultado<Jugador>> => {
  try {
    return { ok: true, datos: await conReintentos(() => fetchJugador(id), 3) };
  } catch (error) {
    return { ok: false, error: error instanceof ApiError ? error : new ApiError(500, "Error inesperado") };
  }
};

const main = async (): Promise<void> => {
  console.log("Ejercicio 52: Cliente API fake shooter");
  const resultados = await Promise.all([1, 2, 3, 7, 99].map(consultar));

  resultados.forEach((r, i) => {
    const id = [1, 2, 3, 7, 99][i];
    if (r.ok) {
      const kd = r.datos.muertes === 0 ? r.datos.kills : Math.round((r.datos.kills / r.datos.muertes) * 100) / 100;
      console.log(`  #${id} ${r.datos.alias}: K/D ${kd}`);
    } else {
      console.log(`  #${id} ERROR ${r.error.codigo}: ${r.error.message}`);
    }
  });
  const exitosos = resultados.filter((r) => r.ok).length;
  console.log(`Consultas exitosas: ${exitosos}/${resultados.length} | llamadas al jugador 3: ${llamadasA}`);
};

void main();
