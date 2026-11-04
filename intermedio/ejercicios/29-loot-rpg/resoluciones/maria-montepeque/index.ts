export {};

type Rareza = "comun" | "raro" | "epico" | "mitico";

interface Objeto {
  readonly nombre: string;
  readonly rareza: Rareza;
  readonly valor: number;
}

const probabilidadPorRareza: Record<Rareza, number> = {
  comun: 0.6,
  raro: 0.25,
  epico: 0.12,
  mitico: 0.03,
};

const botin: readonly Objeto[] = [
  { nombre: "Pocion menor", rareza: "comun", valor: 5 },
  { nombre: "Daga de hierro", rareza: "comun", valor: 12 },
  { nombre: "Arco elfico", rareza: "raro", valor: 60 },
  { nombre: "Anillo de fuego", rareza: "raro", valor: 85 },
  { nombre: "Capa sombria", rareza: "epico", valor: 300 },
  { nombre: "Corona del Rey Lich", rareza: "mitico", valor: 2000 },
];

const ORDEN_RAREZAS: readonly Rareza[] = ["comun", "raro", "epico", "mitico"];

const tablaEsValida = (tabla: Record<Rareza, number>): boolean => {
  const suma = ORDEN_RAREZAS.reduce((acc, r) => acc + tabla[r], 0);
  return Math.abs(suma - 1) < 1e-9 && ORDEN_RAREZAS.every((r) => tabla[r] >= 0);
};

// Generador pseudoaleatorio con semilla para que la simulacion sea repetible.
const crearGenerador = (semilla: number): (() => number) => {
  let estado = semilla;
  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296;
    return estado / 4294967296;
  };
};

const elegirRareza = (aleatorio: number): Rareza => {
  let acumulado = 0;
  for (const rareza of ORDEN_RAREZAS) {
    acumulado += probabilidadPorRareza[rareza];
    if (aleatorio < acumulado) return rareza;
  }
  return "comun";
};

const abrirCofre = (siguiente: () => number): Objeto => {
  const rareza = elegirRareza(siguiente());
  const candidatos = botin.filter((objeto) => objeto.rareza === rareza);
  return candidatos[Math.floor(siguiente() * candidatos.length)];
};

console.log("Ejercicio 29: Sistema de loot RPG");
if (!tablaEsValida(probabilidadPorRareza)) {
  console.log("La tabla de probabilidades no suma 1. Simulacion cancelada.");
} else {
  const siguiente = crearGenerador(2026);
  const cofres = 200;
  const obtenidos = Array.from({ length: cofres }, () => abrirCofre(siguiente));
  const conteo = obtenidos.reduce(
    (mapa, o) => mapa.set(o.rareza, (mapa.get(o.rareza) ?? 0) + 1),
    new Map<Rareza, number>(),
  );
  const valorTotal = obtenidos.reduce((acc, o) => acc + o.valor, 0);
  const unicos = new Set(obtenidos.map((o) => o.nombre));

  console.log(`Cofres abiertos: ${cofres}`);
  ORDEN_RAREZAS.forEach((r) =>
    console.log(`  ${r}: ${conteo.get(r) ?? 0} (esperado ~${Math.round(probabilidadPorRareza[r] * cofres)})`),
  );
  console.log(`Objetos distintos obtenidos: ${unicos.size}/${botin.length}`);
  console.log(`Valor total del botin: ${valorTotal}`);
}
