export {};

type TipoPropulsion = 'Gasolina V12' | 'Híbrido Enchufable' | 'Eléctrico Puro' | 'Bi-Turbo V8';
type CategoriaHomologacion = 'Calle' | 'Pista Exclusiva' | 'Prototipo Limitado';

interface FichaHiperdeportivo {
  readonly codigoChasis: string;
  readonly fabricante: string;
  readonly modelo: string;
  readonly propulsion: TipoPropulsion;
  readonly potenciaCaballos: number;
  readonly velocidadMaximaKmh: number;
  readonly aceleracionCeroAcien: number;
  readonly precioMillonesUSD: number;
  homologacion: CategoriaHomologacion;
}

interface EvaluacionCatalogo {
  readonly vehiculo: string;
  readonly categoriaHomologacion: CategoriaHomologacion;
  readonly indiceAerodinamico: number;
  readonly clasificacionExclusividad: string;
}

const coleccionApexMotorsport: readonly FichaHiperdeportivo[] = [
  {
    codigoChasis: "HYP-001",
    fabricante: "Koenigsegg",
    modelo: "Jesko Absolut",
    propulsion: "Bi-Turbo V8",
    potenciaCaballos: 1600,
    velocidadMaximaKmh: 485,
    aceleracionCeroAcien: 2.5,
    precioMillonesUSD: 3.4,
    homologacion: "Calle",
  },
  {
    codigoChasis: "HYP-002",
    fabricante: "Pagani",
    modelo: "Utopia R",
    propulsion: "Gasolina V12",
    potenciaCaballos: 850,
    velocidadMaximaKmh: 370,
    aceleracionCeroAcien: 2.7,
    precioMillonesUSD: 2.8,
    homologacion: "Calle",
  },
  {
    codigoChasis: "HYP-003",
    fabricante: "Rimac",
    modelo: "Nevera R",
    propulsion: "Eléctrico Puro",
    potenciaCaballos: 2107,
    velocidadMaximaKmh: 412,
    aceleracionCeroAcien: 1.74,
    precioMillonesUSD: 2.5,
    homologacion: "Calle",
  },
  {
    codigoChasis: "HYP-004",
    fabricante: "Bugatti",
    modelo: "Bolide",
    propulsion: "Gasolina V12",
    potenciaCaballos: 1825,
    velocidadMaximaKmh: 500,
    aceleracionCeroAcien: 2.17,
    precioMillonesUSD: 4.3,
    homologacion: "Pista Exclusiva",
  },
  {
    codigoChasis: "HYP-005",
    fabricante: "Ferrari",
    modelo: "F80 Concept",
    propulsion: "Híbrido Enchufable",
    potenciaCaballos: 1200,
    velocidadMaximaKmh: 350,
    aceleracionCeroAcien: 2.15,
    precioMillonesUSD: 3.9,
    homologacion: "Prototipo Limitado",
  }
];

function validarElegibilidadCatalogo(auto: FichaHiperdeportivo): boolean {
  return auto.potenciaCaballos >= 800 && auto.precioMillonesUSD > 0;
}

function calcularIndiceAerodinamico(auto: FichaHiperdeportivo): number {
  const factorVelocidad = auto.velocidadMaximaKmh * 0.35;
  const factorPotencia = (auto.potenciaCaballos / 100) * 1.8;
  const penalizacionAceleracion = auto.aceleracionCeroAcien * 12;
  const indiceBruto = factorVelocidad + factorPotencia - penalizacionAceleracion;
  return Number(indiceBruto.toFixed(2));
}

function clasificarExclusividadVehiculo(indice: number, precio: number): string {
  if (indice >= 450 && precio >= 3.5) return "Hypercar S-Tier Ultra Exclusivo";
  if (indice >= 380) return "Superdeportivo de Élite Global";
  if (indice >= 300) return "Deportivo de Alto Rendimiento";
  return "Serie Limitada Estándar";
}

function procesarCatalogoHiperdeportivos(autos: readonly FichaHiperdeportivo[]): readonly EvaluacionCatalogo[] {
  return autos
    .filter(validarElegibilidadCatalogo)
    .map(auto => {
      const indice = calcularIndiceAerodinamico(auto);
      return {
        vehiculo: `${auto.fabricante} ${auto.modelo} [${auto.codigoChasis}]`,
        categoriaHomologacion: auto.homologacion,
        indiceAerodinamico: indice,
        clasificacionExclusividad: clasificarExclusividadVehiculo(indice, auto.precioMillonesUSD),
      };
    })
    .sort((a, b) => b.indiceAerodinamico - a.indiceAerodinamico);
}

function imprimirReporteCatalogo(titulo: string, catalogo: readonly EvaluacionCatalogo[]): void {
  console.log(`=== [CATÁLOGO DE HIPERDEPORTIVOS] ${titulo} ===`);
  catalogo.forEach((item, indice) => {
    console.log(
      `${indice + 1}. ${item.vehiculo} - Homologación: ${item.categoriaHomologacion} | Índice: ${item.indiceAerodinamico} | Rango: ${item.clasificacionExclusividad}`
    );
  });
  console.log("===================================================================\n");
}

const resultadoCatalogoPrincipal = procesarCatalogoHiperdeportivos(coleccionApexMotorsport);
imprimirReporteCatalogo("Ranking de Vehículos en Exhibición", resultadoCatalogoPrincipal);

// Caso: Vehículo experimental con especificaciones extremas fuera de norma comercial
const catalogoCasoLimite: readonly FichaHiperdeportivo[] = [
  {
    codigoChasis: "HYP-999",
    fabricante: "Aether Dynamics",
    modelo: "Vortex Hyperion X",
    propulsion: "Eléctrico Puro",
    potenciaCaballos: 3000,
    velocidadMaximaKmh: 550,
    aceleracionCeroAcien: 1.4,
    precioMillonesUSD: 6.5,
    homologacion: "Prototipo Limitado",
  }
];

const resultadoLimite = procesarCatalogoHiperdeportivos(catalogoCasoLimite);
imprimirReporteCatalogo("Prototipo Experimental Extremo", resultadoLimite);