export {};

type NivelPeligroPOI = "Zona Caliente" | "Tension Media" | "Periferia Segura";

interface PuntoInteresLoot {
  readonly nombreLugar: string;
  readonly nivelPeligro: NivelPeligroPOI;
  readonly cofresDisponibles: number;
  readonly vehiculosCercanos: number;
}

interface MapaLootReporte {
  readonly nombreIsla: string;
  readonly ubicaciones: readonly PuntoInteresLoot[];
  readonly totalCofresEnMapa: number;
}

async function cargarDatosMapaLoot(nombreMapa: string): Promise<MapaLootReporte> {
  await new Promise((resolve) => setTimeout(resolve, 15));

  const pois: PuntoInteresLoot[] = [
    { nombreLugar: "Torres Costeras", nivelPeligro: "Zona Caliente", cofresDisponibles: 32, vehiculosCercanos: 3 },
    { nombreLugar: "Base Militar Nevada", nivelPeligro: "Zona Caliente", cofresDisponibles: 45, vehiculosCercanos: 4 },
    { nombreLugar: "Granja Oasis", nivelPeligro: "Periferia Segura", cofresDisponibles: 12, vehiculosCercanos: 1 },
  ];

  const totalCofres = pois.reduce((acc, p) => acc + p.cofresDisponibles, 0);

  return {
    nombreIsla: nombreMapa,
    ubicaciones: pois,
    totalCofresEnMapa: totalCofres,
  };
}

async function main() {
  console.log("=== MAPA DE LOOT BATTLE ROYALE ASINCRONO ===");
  const mapa = await cargarDatosMapaLoot("Isla Aurora");
  console.log(`Mapa cargado: ${mapa.nombreIsla} | Cofres totales distribuidos: ${mapa.totalCofresEnMapa}`);
  mapa.ubicaciones.forEach((poi) => {
    console.log(`- ${poi.nombreLugar} [${poi.nivelPeligro}] | Cofres: ${poi.cofresDisponibles} | Vehiculos: ${poi.vehiculosCercanos}`);
  });
}

main();
