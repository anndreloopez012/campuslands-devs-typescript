export {};

type Calidad = "comun" | "raro" | "epico";

interface ZonaLoot {
  readonly nombre: string;
  readonly cofres: number;
  readonly calidadPromedio: Calidad;
}

const puntosPorCalidad: Record<Calidad, number> = { comun: 1, raro: 3, epico: 8 };

const esperar = (ms: number): Promise<void> => new Promise((resolver) => setTimeout(resolver, ms));

const mapa: Record<string, ZonaLoot> = {
  Puerto: { nombre: "Puerto", cofres: 12, calidadPromedio: "raro" },
  Base: { nombre: "Base militar", cofres: 8, calidadPromedio: "epico" },
  Granja: { nombre: "Granja", cofres: 5, calidadPromedio: "comun" },
  Pueblo: { nombre: "Pueblo", cofres: 15, calidadPromedio: "comun" },
};

const cargarZona = async (clave: string): Promise<ZonaLoot> => {
  await esperar(clave === "Base" ? 30 : 10);
  if (clave === "Volcan") throw new Error("La zona Volcan esta cerrada por el evento");
  const zona = mapa[clave];
  if (!zona) throw new Error(`Zona desconocida: ${clave}`);
  return zona;
};

const valor = (zona: ZonaLoot): number => zona.cofres * puntosPorCalidad[zona.calidadPromedio];

const conTiempoLimite = async <T>(promesa: Promise<T>, ms: number, etiqueta: string): Promise<T> => {
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<never>((_, rechazar) => {
    temporizador = setTimeout(() => rechazar(new Error(`${etiqueta}: tiempo agotado (${ms} ms)`)), ms);
  });
  try {
    return await Promise.race([promesa, limite]);
  } finally {
    clearTimeout(temporizador);
  }
};

const main = async (): Promise<void> => {
  console.log("Ejercicio 55: Mapa de loot battle royale");
  const claves = ["Puerto", "Base", "Granja", "Volcan", "Pueblo", "Isla"];

  // allSettled: una zona que falla no debe tumbar el resto del mapa.
  const resultados = await Promise.allSettled(claves.map((c) => conTiempoLimite(cargarZona(c), 25, c)));

  const zonas: ZonaLoot[] = [];
  resultados.forEach((r, i) => {
    if (r.status === "fulfilled") zonas.push(r.value);
    else console.log(`  ! ${r.reason instanceof Error ? r.reason.message : "error"}`);
  });

  console.log(`Zonas cargadas: ${zonas.length}/${claves.length}`);
  zonas
    .sort((a, b) => valor(b) - valor(a))
    .forEach((z, i) => console.log(`${i + 1}. ${z.nombre} - ${z.cofres} cofres (${z.calidadPromedio}) = ${valor(z)} pts`));
  console.log(`Mejor zona para caer: ${zonas[0].nombre}`);
};

void main();
