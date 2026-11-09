export {};

type Propulsion = "V8 Biturbo" | "V12 Atmosferico" | "W16 Cuadriturbo" | "100% Electrico";

interface Hiperdeportivo {
  readonly vin: string;
  readonly fabricante: string;
  readonly modelo: string;
  readonly anio: number;
  readonly caballosFuerza: number;
  readonly aceleracion0a100: number;
  readonly velocidadMaximaKmH: number;
  readonly tipoPropulsion: Propulsion;
  readonly precioUsd: number;
}

interface CriterioFiltro {
  readonly potenciaMinima?: number;
  readonly aceleracionMaxima?: number;
  readonly propulsion?: Propulsion;
}

function filtrarCatalogo(catalogo: readonly Hiperdeportivo[], filtro: CriterioFiltro): Hiperdeportivo[] {
  return catalogo.filter((auto) => {
    if (filtro.potenciaMinima !== undefined && auto.caballosFuerza < filtro.potenciaMinima) return false;
    if (filtro.aceleracionMaxima !== undefined && auto.aceleracion0a100 > filtro.aceleracionMaxima) return false;
    if (filtro.propulsion !== undefined && auto.tipoPropulsion !== filtro.propulsion) return false;
    return true;
  });
}

const flotaHipercars: Hiperdeportivo[] = [
  { vin: "HC-001", fabricante: "Bugatti", modelo: "Chiron Super Sport", anio: 2024, caballosFuerza: 1600, aceleracion0a100: 2.4, velocidadMaximaKmH: 440, tipoPropulsion: "W16 Cuadriturbo", precioUsd: 3800000 },
  { vin: "HC-002", fabricante: "Koenigsegg", modelo: "Jesko Absolut", anio: 2024, caballosFuerza: 1625, aceleracion0a100: 2.5, velocidadMaximaKmH: 500, tipoPropulsion: "V8 Biturbo", precioUsd: 3400000 },
  { vin: "HC-003", fabricante: "Rimac", modelo: "Nevera", anio: 2024, caballosFuerza: 1914, aceleracion0a100: 1.81, velocidadMaximaKmH: 412, tipoPropulsion: "100% Electrico", precioUsd: 2500000 },
];

console.log("=== CATALOGO DE HIPERDEPORTIVOS ===");
const filtroVeloces = filtrarCatalogo(flotaHipercars, { aceleracionMaxima: 2.4 });
filtroVeloces.forEach((car) => {
  console.log(`${car.fabricante} ${car.modelo} - 0-100: ${car.aceleracion0a100}s | ${car.caballosFuerza} HP | Motor: ${car.tipoPropulsion}`);
});