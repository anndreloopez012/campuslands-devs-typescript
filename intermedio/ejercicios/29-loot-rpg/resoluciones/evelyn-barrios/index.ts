export {};

type RangoLoot = "Tier 1 Gris" | "Tier 2 Verde" | "Tier 3 Azul" | "Tier 4 Morado" | "Tier 5 Dorado";
type CategoriaDrop = "Arma Principal" | "Escudo Corporal" | "Accesorio Optico" | "Consumible";

interface DropLoot {
  readonly idDrop: string;
  readonly nombre: string;
  readonly tier: RangoLoot;
  readonly categoria: CategoriaDrop;
  readonly probabilidadPorcentaje: number;
  readonly poderBase: number;
}

interface EstadisticasCofre {
  readonly totalDropsPosibles: number;
  readonly desglosePorCategoria: Record<CategoriaDrop, number>;
  readonly dropMasPoderoso: string;
  readonly probabilidadTierAlto: number;
}

function analizarTablaLoot(drops: readonly DropLoot[]): EstadisticasCofre {
  const desglosePorCategoria: Record<CategoriaDrop, number> = {
    "Arma Principal": 0,
    "Escudo Corporal": 0,
    "Accesorio Optico": 0,
    Consumible: 0,
  };

  let probTierAlto = 0;

  for (const item of drops) {
    desglosePorCategoria[item.categoria] += 1;
    if (item.tier === "Tier 4 Morado" || item.tier === "Tier 5 Dorado") {
      probTierAlto += item.probabilidadPorcentaje;
    }
  }

  const masFuerte = [...drops].sort((a, b) => b.poderBase - a.poderBase)[0];

  return {
    totalDropsPosibles: drops.length,
    desglosePorCategoria,
    dropMasPoderoso: masFuerte ? `${masFuerte.nombre} (Poder: ${masFuerte.poderBase})` : "N/A",
    probabilidadTierAlto: Number(probTierAlto.toFixed(2)),
  };
}

const cofreMitico: DropLoot[] = [
  { idDrop: "lp-01", nombre: "Rifle de Pulso Estelar", tier: "Tier 5 Dorado", categoria: "Arma Principal", probabilidadPorcentaje: 5.5, poderBase: 120 },
  { idDrop: "lp-02", nombre: "Chaleco de Nanofibras", tier: "Tier 4 Morado", categoria: "Escudo Corporal", probabilidadPorcentaje: 14.0, poderBase: 85 },
  { idDrop: "lp-03", nombre: "Mira Holografica 4x", tier: "Tier 3 Azul", categoria: "Accesorio Optico", probabilidadPorcentaje: 35.0, poderBase: 40 },
  { idDrop: "lp-04", nombre: "Inyector de Adrenalina", tier: "Tier 2 Verde", categoria: "Consumible", probabilidadPorcentaje: 45.5, poderBase: 25 },
];

console.log("=== SISTEMA DE LOOT RPG BATTLE ROYALE ===");
const metricasCofre = analizarTablaLoot(cofreMitico);
console.log(`Opciones en tabla de drop: ${metricasCofre.totalDropsPosibles}`);
console.log(`Recompensa suprema: ${metricasCofre.dropMasPoderoso}`);
console.log(`Probabilidad de obtener equipo Morado/Dorado: ${metricasCofre.probabilidadTierAlto}%`);