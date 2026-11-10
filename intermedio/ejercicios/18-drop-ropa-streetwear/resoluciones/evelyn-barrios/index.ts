export {};

type TallaStreetwear = "S" | "M" | "L" | "XL" | "Oversize";
type TipoPrenda = "Hoodie" | "T-Shirt" | "Cargo Pants" | "Sneakers" | "Gorra";

interface PrendaDrop {
  readonly id: string;
  readonly modelo: string;
  readonly tipo: TipoPrenda;
  readonly talla: TallaStreetwear;
  readonly precioRetailUsd: number;
  readonly stockInicial: number;
  readonly unidadesVendidas: number;
}

interface EstadisticasDrop {
  readonly prendaMasCodiciada: string;
  readonly recaudacionTotalUsd: number;
  readonly porcentajeVentaGlobal: number;
  readonly soldOut: boolean;
}

function evaluarDrop(prendas: readonly PrendaDrop[]): EstadisticasDrop {
  if (prendas.length === 0) {
    return { prendaMasCodiciada: "N/A", recaudacionTotalUsd: 0, porcentajeVentaGlobal: 0, soldOut: false };
  }

  let totalInicial = 0;
  let totalVendidas = 0;
  let recaudacionTotal = 0;

  for (const prenda of prendas) {
    totalInicial += prenda.stockInicial;
    totalVendidas += prenda.unidadesVendidas;
    recaudacionTotal += prenda.unidadesVendidas * prenda.precioRetailUsd;
  }

  const porcentajeGlobal = Number(((totalVendidas / totalInicial) * 100).toFixed(1));
  const masVendida = [...prendas].sort((a, b) => b.unidadesVendidas - a.unidadesVendidas)[0];

  return {
    prendaMasCodiciada: masVendida.modelo,
    recaudacionTotalUsd: Number(recaudacionTotal.toFixed(2)),
    porcentajeVentaGlobal: porcentajeGlobal,
    soldOut: totalVendidas >= totalInicial,
  };
}

const coleccionDrop: PrendaDrop[] = [
  { id: "st-01", modelo: "Shadow Black Heavy Hoodie", tipo: "Hoodie", talla: "Oversize", precioRetailUsd: 95, stockInicial: 100, unidadesVendidas: 98 },
  { id: "st-02", modelo: "Cyber Acid Graphic Tee", tipo: "T-Shirt", talla: "L", precioRetailUsd: 45, stockInicial: 150, unidadesVendidas: 142 },
  { id: "st-03", modelo: "Tactical Cargo Multi-Pocket", tipo: "Cargo Pants", talla: "M", precioRetailUsd: 110, stockInicial: 60, unidadesVendidas: 60 },
];

console.log("=== DROP DE ROPA STREETWEAR ===");
const metricasDrop = evaluarDrop(coleccionDrop);
console.log(`Pieza mas vendida: ${metricasDrop.prendaMasCodiciada}`);
console.log(`Recaudacion en lanzamiento: $${metricasDrop.recaudacionTotalUsd} USD (${metricasDrop.porcentajeVentaGlobal}% del stock liquidado)`);
console.log(`Estado global del Drop: ${metricasDrop.soldOut ? "SOLD OUT TOTAL" : "Stock remanente disponible"}`);