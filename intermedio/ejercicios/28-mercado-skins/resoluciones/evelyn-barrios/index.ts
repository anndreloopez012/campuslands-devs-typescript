export {};

type RarezaSkin = "Grado Militar" | "Restringido" | "Clasificado" | "Encubierto" | "Extraordinario";
type EstadoDesgaste = "Factory New" | "Minimal Wear" | "Field-Tested" | "Well-Worn" | "Battle-Scarred";

interface SkinItem {
  readonly idSkin: string;
  readonly arma: string;
  readonly nombreSkin: string;
  readonly rareza: RarezaSkin;
  readonly desgaste: EstadoDesgaste;
  readonly floatValue: number;
  readonly precioListadoUsd: number;
}

interface ResumenMercado {
  readonly totalSkins: number;
  readonly valorInventarioUsd: number;
  readonly comisionPlataformaUsd: number;
  readonly valorNetoVendedoresUsd: number;
  readonly skinsPorRareza: Record<RarezaSkin, number>;
}

function auditarMercadoSkins(catalogo: readonly SkinItem[], comisionPorcentaje: number = 5): ResumenMercado {
  const skinsPorRareza: Record<RarezaSkin, number> = {
    "Grado Militar": 0,
    Restringido: 0,
    Clasificado: 0,
    Encubierto: 0,
    Extraordinario: 0,
  };

  const valorTotal = catalogo.reduce((acc, s) => acc + s.precioListadoUsd, 0);

  for (const skin of catalogo) {
    skinsPorRareza[skin.rareza] += 1;
  }

  const comision = Number((valorTotal * (comisionPorcentaje / 100)).toFixed(2));
  const valorNeto = Number((valorTotal - comision).toFixed(2));

  return {
    totalSkins: catalogo.length,
    valorInventarioUsd: Number(valorTotal.toFixed(2)),
    comisionPlataformaUsd: comision,
    valorNetoVendedoresUsd: valorNeto,
    skinsPorRareza,
  };
}

const listadoMarket: SkinItem[] = [
  { idSkin: "sk-01", arma: "AK-47", nombreSkin: "Asiimov", rareza: "Encubierto", desgaste: "Field-Tested", floatValue: 0.22, precioListadoUsd: 140 },
  { idSkin: "sk-02", arma: "AWP", nombreSkin: "Dragon Lore", rareza: "Extraordinario", desgaste: "Factory New", floatValue: 0.03, precioListadoUsd: 4800 },
  { idSkin: "sk-03", arma: "M4A4", nombreSkin: "Howl", rareza: "Encubierto", desgaste: "Minimal Wear", floatValue: 0.09, precioListadoUsd: 3200 },
];

console.log("=== MERCADO DE SKINS DE SHOOTERS ===");
const metricasMarket = auditarMercadoSkins(listadoMarket, 5);
console.log(`Articulos en venta: ${metricasMarket.totalSkins} | Valor total en vitrina: $${metricasMarket.valorInventarioUsd} USD`);
console.log(`Comision retenida (5%): $${metricasMarket.comisionPlataformaUsd} USD | Liquidacion a vendedores: $${metricasMarket.valorNetoVendedoresUsd} USD`);
console.log(`Items Encubiertos: ${metricasMarket.skinsPorRareza.Encubierto}, Extraordinarios: ${metricasMarket.skinsPorRareza.Extraordinario}`);