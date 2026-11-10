export {};

type CategoriaAutoLujo = "Superdeportivo" | "Hiperdeportivo" | "Gran Turismo" | "Clasico Exclusivo";

interface VehiculoGaraje {
  readonly vin: string;
  readonly fabricante: string;
  readonly modelo: string;
  readonly anioFabricacion: number;
  readonly categoria: CategoriaAutoLujo;
  readonly valorAseguradoUsd: number;
}

interface ReporteGarajeLujo {
  readonly totalVehiculos: number;
  readonly valorTotalPatrimonioUsd: number;
  readonly promedioValorPorAutoUsd: number;
  readonly vehiculoInsignia: VehiculoGaraje;
}

async function auditarGarajePrivado(coleccion: VehiculoGaraje[]): Promise<ReporteGarajeLujo> {
  await new Promise((resolve) => setTimeout(resolve, 20));

  if (coleccion.length === 0) {
    throw new Error("El garaje no cuenta con vehiculos para auditar.");
  }

  const valorTotal = coleccion.reduce((acc, v) => acc + v.valorAseguradoUsd, 0);
  const promedio = valorTotal / coleccion.length;

  const insignia = coleccion.reduce((max, v) => (v.valorAseguradoUsd > max.valorAseguradoUsd ? v : max), coleccion[0]);

  return {
    totalVehiculos: coleccion.length,
    valorTotalPatrimonioUsd: valorTotal,
    promedioValorPorAutoUsd: Math.round(promedio),
    vehiculoInsignia: insignia,
  };
}

async function main() {
  console.log("=== GESTOR DE GARAJE DE LUJO ASINCRONO ===");

  const autos: VehiculoGaraje[] = [
    { vin: "WBA-9001", fabricante: "Bugatti", modelo: "Chiron Super Sport", anioFabricacion: 2022, categoria: "Hiperdeportivo", valorAseguradoUsd: 3800000 },
    { vin: "WBA-9002", fabricante: "Pagani", modelo: "Huayra Roadster BC", anioFabricacion: 2021, categoria: "Hiperdeportivo", valorAseguradoUsd: 4500000 },
    { vin: "WBA-9003", fabricante: "Rolls-Royce", modelo: "Phantom VIII", anioFabricacion: 2023, categoria: "Gran Turismo", valorAseguradoUsd: 550000 },
  ];

  const auditoria = await auditarGarajePrivado(autos);
  console.log(`Vehiculos en coleccion: ${auditoria.totalVehiculos}`);
  console.log(`Valoracion total: $${auditoria.valorTotalPatrimonioUsd.toLocaleString()} USD`);
  console.log(`Vehiculo insignia: ${auditoria.vehiculoInsignia.fabricante} ${auditoria.vehiculoInsignia.modelo} ($${auditoria.vehiculoInsignia.valorAseguradoUsd.toLocaleString()} USD)`);
}

main();
