export {};

type CondicionClimatica = 'SoleadoCaluroso' | 'TempladoBrisa' | 'LluviosoFresco' | 'FrioIntenso' | 'NieveExtrema';
type CategoriaPrenda = 'CapaBase' | 'CapaIntermedia' | 'AbrigoExterior' | 'Calzado' | 'AccesorioClima';
type EstadoPrendaArmario = 'LimpiaDisponible' | 'EnLavanderia' | 'EnUso' | 'FueraDeTemporada';

interface FichaPrendaArmario {
  readonly prendaId: string;
  readonly nombrePrenda: string;
  readonly categoria: CategoriaPrenda;
  readonly climaIdeal: CondicionClimatica;
  readonly indiceAislamientoTermico: number;
  readonly impermeabilidadPct: number;
  readonly fechaUltimoUsoIso: string;
  estado: EstadoPrendaArmario;
}

interface ResumenOutfitRecomendado {
  readonly identificador: string;
  readonly prenda: string;
  readonly categoria: CategoriaPrenda;
  readonly puntuacionIdoneidad: number;
  readonly nivelProteccion: string;
}

class GestorGuardarropaGenerico<T extends { readonly prendaId: string }> {
  private readonly prendas: readonly T[];

  constructor(inventarioInicial: readonly T[]) {
    this.prendas = [...inventarioInicial];
  }

  public filtrarPrendas(criterio: (item: T) => boolean): readonly T[] {
    return this.prendas.filter(criterio);
  }

  public obtenerInventario(): readonly T[] {
    return [...this.prendas];
  }
}

const armarioInteligenteGlobal: readonly FichaPrendaArmario[] = [
  {
    prendaId: "OUT-4201",
    nombrePrenda: "Gabardina Impermeable Gore-Tex",
    categoria: "AbrigoExterior",
    climaIdeal: "LluviosoFresco",
    indiceAislamientoTermico: 7,
    impermeabilidadPct: 98,
    fechaUltimoUsoIso: "2026-11-08",
    estado: "LimpiaDisponible",
  },
  {
    prendaId: "OUT-4202",
    nombrePrenda: "Suéter de Lana Merino Tejido",
    categoria: "CapaIntermedia",
    climaIdeal: "FrioIntenso",
    indiceAislamientoTermico: 8,
    impermeabilidadPct: 25,
    fechaUltimoUsoIso: "2026-11-10",
    estado: "LimpiaDisponible",
  },
  {
    prendaId: "OUT-4203",
    nombrePrenda: "Camiseta Transpirable de Lino",
    categoria: "CapaBase",
    climaIdeal: "SoleadoCaluroso",
    indiceAislamientoTermico: 1,
    impermeabilidadPct: 10,
    fechaUltimoUsoIso: "2026-10-25",
    estado: "LimpiaDisponible",
  },
  {
    prendaId: "OUT-4204",
    nombrePrenda: "Botas Urbanas Suela Antideslizante",
    categoria: "Calzado",
    climaIdeal: "LluviosoFresco",
    indiceAislamientoTermico: 6,
    impermeabilidadPct: 92,
    fechaUltimoUsoIso: "2026-11-09",
    estado: "LimpiaDisponible",
  },
  {
    prendaId: "OUT-4205",
    nombrePrenda: "Chaqueta Ligera Cortavientos",
    categoria: "AbrigoExterior",
    climaIdeal: "TempladoBrisa",
    indiceAislamientoTermico: 4,
    impermeabilidadPct: 65,
    fechaUltimoUsoIso: "2026-11-11",
    estado: "EnLavanderia",
  },
  {
    prendaId: "OUT-4206",
    nombrePrenda: "Bufanda Térmica de Cachemira",
    categoria: "AccesorioClima",
    climaIdeal: "FrioIntenso",
    indiceAislamientoTermico: 7,
    impermeabilidadPct: 20,
    fechaUltimoUsoIso: "2026-11-05",
    estado: "LimpiaDisponible",
  }
];

function validarPrendaDisponibleParaUso(prenda: FichaPrendaArmario): boolean {
  return (
    prenda.estado === "LimpiaDisponible" &&
    prenda.indiceAislamientoTermico >= 1 &&
    prenda.impermeabilidadPct >= 0
  );
}

function calcularIdoneidadClimatica(
  prenda: FichaPrendaArmario,
  climaPronosticado: CondicionClimatica,
  temperaturaCelsius: number
): number {
  const coincidenciaDirecta = prenda.climaIdeal === climaPronosticado ? 50 : 15;
  const ajusteTermico =
    temperaturaCelsius <= 12
      ? prenda.indiceAislamientoTermico * 4
      : (10 - prenda.indiceAislamientoTermico) * 3;
  const bonoLluvia =
    climaPronosticado === "LluviosoFresco" || climaPronosticado === "NieveExtrema"
      ? prenda.impermeabilidadPct * 0.25
      : 10;

  return Number(Math.min(100, coincidenciaDirecta + ajusteTermico + bonoLluvia).toFixed(1));
}

function clasificarNivelProteccion(aislamiento: number, impermeabilidad: number): string {
  if (aislamiento >= 8 && impermeabilidad >= 85) return "Blindaje Térmico e Impermeable Total";
  if (impermeabilidad >= 80) return "Alta Resistencia a Lluvia y Humedad";
  if (aislamiento >= 7) return "Aislamiento Térmico Elevado";
  return "Confort Ligero y Transpirable";
}

function recomendarOutfitPorClima(
  armario: readonly FichaPrendaArmario[],
  climaActual: CondicionClimatica,
  temperaturaCelsius: number
): readonly ResumenOutfitRecomendado[] {
  const gestor = new GestorGuardarropaGenerico<FichaPrendaArmario>(armario);
  const prendasLimpias = gestor.filtrarPrendas(validarPrendaDisponibleParaUso);

  return prendasLimpias
    .map(prenda => ({
      identificador: prenda.prendaId,
      prenda: `${prenda.nombrePrenda} (Último uso: ${prenda.fechaUltimoUsoIso})`,
      categoria: prenda.categoria,
      puntuacionIdoneidad: calcularIdoneidadClimatica(prenda, climaActual, temperaturaCelsius),
      nivelProteccion: clasificarNivelProteccion(prenda.indiceAislamientoTermico, prenda.impermeabilidadPct),
    }))
    .sort((a, b) => b.puntuacionIdoneidad - a.puntuacionIdoneidad);
}

function imprimirReporteOutfit(titulo: string, resumen: readonly ResumenOutfitRecomendado[]): void {
  console.log(`=== [OUTFIT SEGÚN CLIMA] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. [${item.identificador}] ${item.prenda} | Categoría: ${item.categoria} | Idoneidad: ${item.puntuacionIdoneidad}% | Protección: ${item.nivelProteccion}`
    );
  });
  console.log("=================================================================================\n");
}

const outfitDiaLluvioso = recomendarOutfitPorClima(armarioInteligenteGlobal, "LluviosoFresco", 14);
imprimirReporteOutfit("Sugerencia de Vestimenta para Día Lluvioso y Fresco (14°C)", outfitDiaLluvioso);

// Caso: Expedición invernal bajo tormenta de nieve extrema a -12°C con equipo técnico polar
const prendaCasoLimite: readonly FichaPrendaArmario[] = [
  {
    prendaId: "OUT-9999",
    nombrePrenda: "Parka Expedición Ártica Plumas 900-Fill",
    categoria: "AbrigoExterior",
    climaIdeal: "NieveExtrema",
    indiceAislamientoTermico: 10,
    impermeabilidadPct: 100,
    fechaUltimoUsoIso: "2026-01-15",
    estado: "LimpiaDisponible",
  }
];

const resultadoLimite = recomendarOutfitPorClima(prendaCasoLimite, "NieveExtrema", -12);
imprimirReporteOutfit("Caso: Equipamiento Extremo para Tormenta de Nieve (-12°C)", resultadoLimite);