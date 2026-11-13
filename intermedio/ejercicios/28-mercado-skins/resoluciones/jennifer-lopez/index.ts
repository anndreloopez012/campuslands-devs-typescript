export {};

type RarezaSkin = 'Covert' | 'Classified' | 'Restricted' | 'Mil-Spec' | 'Contraband';
type EstadoMercado = 'EnVenta' | 'Reservada' | 'Vendida' | 'Retirada';

interface FichaSkinShooter {
  readonly skinId: string;
  readonly arma: string;
  readonly nombreSkin: string;
  readonly rareza: RarezaSkin;
  readonly flotanteDesgaste: number; // Ej: 0.04 (Factory New)
  readonly precioUSD: number;
  readonly vendedor: string;
  estado: EstadoMercado;
}

interface ResumenAgrupadoRarezaSkins {
  readonly rareza: RarezaSkin;
  readonly totalSkins: number;
  readonly precioPromedioUSD: number;
  readonly valorTotalMercadoUSD: number;
  readonly vendedoresUnicos: readonly string[];
}

const inventarioMercadoGlobal: readonly FichaSkinShooter[] = [
  {
    skinId: "SKN-801",
    arma: "AWP",
    nombreSkin: "Dragon Lore",
    rareza: "Contraband",
    flotanteDesgaste: 0.03,
    precioUSD: 4500.00,
    vendedor: "Aether Vance",
    estado: "EnVenta",
  },
  {
    skinId: "SKN-802",
    arma: "AK-47",
    nombreSkin: "Fire Serpent",
    rareza: "Covert",
    flotanteDesgaste: 0.08,
    precioUSD: 850.00,
    vendedor: "Soren Vestergaard",
    estado: "EnVenta",
  },
  {
    skinId: "SKN-803",
    arma: "M4A4",
    nombreSkin: "Howl",
    rareza: "Contraband",
    flotanteDesgaste: 0.05,
    precioUSD: 3800.00,
    vendedor: "Kenshin Takahashi",
    estado: "Reservada",
  },
  {
    skinId: "SKN-804",
    arma: "USP-S",
    nombreSkin: "Neo-Noir",
    rareza: "Classified",
    flotanteDesgaste: 0.12,
    precioUSD: 45.00,
    vendedor: "Aether Vance",
    estado: "EnVenta",
  },
  {
    skinId: "SKN-805",
    arma: "Glock-18",
    nombreSkin: "Water Elemental",
    rareza: "Restricted",
    flotanteDesgaste: 0.15,
    precioUSD: 18.50,
    vendedor: "Soren Vestergaard",
    estado: "EnVenta",
  },
  {
    skinId: "SKN-806",
    arma: "MP9",
    nombreSkin: "Bulldozer",
    rareza: "Mil-Spec",
    flotanteDesgaste: 0.22,
    precioUSD: 8.00,
    vendedor: "Kenshin Takahashi",
    estado: "Retirada",
  }
];

function validarSkinActiva(skin: FichaSkinShooter): boolean {
  return skin.estado !== "Retirada" && skin.precioUSD > 0;
}

function agruparPorRarezaSkin(skins: readonly FichaSkinShooter[]): Record<RarezaSkin, readonly FichaSkinShooter[]> {
  const estadoInicial: Record<RarezaSkin, readonly FichaSkinShooter[]> = {
    'Covert': [],
    'Classified': [],
    'Restricted': [],
    'Mil-Spec': [],
    'Contraband': [],
  };

  return skins.reduce(
    (acumulado, skin) => ({
      ...acumulado,
      [skin.rareza]: [...acumulado[skin.rareza], skin],
    }),
    estadoInicial
  );
}

function calcularEstadisticasRareza(
  rareza: RarezaSkin,
  skins: readonly FichaSkinShooter[]
): ResumenAgrupadoRarezaSkins {
  const sumaPrecios = skins.reduce((acc, s) => acc + s.precioUSD, 0);
  const vendedoresUnicos = Array.from(new Set(skins.map(s => s.vendedor)));

  return {
    rareza,
    totalSkins: skins.length,
    precioPromedioUSD: Number((sumaPrecios / skins.length).toFixed(2)),
    valorTotalMercadoUSD: Number(sumaPrecios.toFixed(2)),
    vendedoresUnicos,
  };
}

function procesarMercadoSkins(skins: readonly FichaSkinShooter[]): readonly ResumenAgrupadoRarezaSkins[] {
  const skinsActivas = skins.filter(validarSkinActiva);
  const agrupadas = agruparPorRarezaSkin(skinsActivas);
  const rarezas = Object.keys(agrupadas) as RarezaSkin[];

  return rarezas
    .filter(rareza => agrupadas[rareza].length > 0)
    .map(rareza => calcularEstadisticasRareza(rareza, agrupadas[rareza]))
    .sort((a, b) => b.valorTotalMercadoUSD - a.valorTotalMercadoUSD);
}

function imprimirReporteMercado(titulo: string, resumen: readonly ResumenAgrupadoRarezaSkins[]): void {
  console.log(`=== [MERCADO DE SKINS SHOOTER] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Rareza: ${item.rareza} | Skins: ${item.totalSkins} | Promedio: $${item.precioPromedioUSD.toFixed(2)} | Total Mercado: $${item.valorTotalMercadoUSD.toFixed(2)} | Vendedores: ${item.vendedoresUnicos.join(', ')}`
    );
  });
  console.log("=================================================================================\n");
}

const reporteMercadoOficial = procesarMercadoSkins(inventarioMercadoGlobal);
imprimirReporteMercado("Resumen Agrupado por Rareza de Skin", reporteMercadoOficial);

// Caso: Skin legendaria con flotante casi perfecto (Factory New StatTrak) y valor de mercado masivo
const skinCasoLegendario: readonly FichaSkinShooter[] = [
  {
    skinId: "SKN-999",
    arma: "Butterfly Knife",
    nombreSkin: "Gamma Doppler Emerald",
    rareza: "Contraband",
    flotanteDesgaste: 0.002,
    precioUSD: 12500.00,
    vendedor: "Aether Vance",
    estado: "EnVenta",
  }
];

const resultadoLegendario = procesarMercadoSkins(skinCasoLegendario);
imprimirReporteMercado("Caso: Skin Legendaria de Colección Exclusiva con Valor Extremo", resultadoLegendario);