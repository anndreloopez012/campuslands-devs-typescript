export {};

type CategoriaAutoLujo = 'Hiperdeportivo' | 'Gran Turismo' | 'Clasico Coleccion' | 'Superdeportivo' | 'Prototipo Exclusivo';
type EstadoSubastaAuto = 'Disponible' | 'Pujando' | 'Adjudicado' | 'Retirado';

interface FichaAutoSubasta {
  readonly autoId: string;
  readonly marcaYModelo: string;
  readonly anioFabricacion: number;
  readonly categoria: CategoriaAutoLujo;
  readonly precioBaseUSD: number;
  readonly pujaActualUSD: number;
  readonly kilometrajeKm: number;
  estado: EstadoSubastaAuto;
}

interface ResumenSubastaAutos {
  readonly identificador: string;
  readonly vehiculo: string;
  readonly categoria: CategoriaAutoLujo;
  readonly pujaFinalUSD: number;
  readonly comisionCasaSubastasUSD: number;
  readonly estatusLote: string;
}

const inventarioCasaSubastasGlobal: readonly FichaAutoSubasta[] = [
  {
    autoId: "CAR-901",
    marcaYModelo: "Bugatti Chiron Super Sport 300+",
    anioFabricacion: 2022,
    categoria: "Hiperdeportivo",
    precioBaseUSD: 3800000,
    pujaActualUSD: 4250000,
    kilometrajeKm: 350,
    estado: "Pujando",
  },
  {
    autoId: "CAR-902",
    marcaYModelo: "Ferrari 250 GTO Scaglietti",
    anioFabricacion: 1962,
    categoria: "Clasico Coleccion",
    precioBaseUSD: 45000000,
    pujaActualUSD: 51200000,
    kilometrajeKm: 12400,
    estado: "Adjudicado",
  },
  {
    autoId: "CAR-903",
    marcaYModelo: "Lamborghini Sián FKP 37",
    anioFabricacion: 2021,
    categoria: "Hiperdeportivo",
    precioBaseUSD: 2700000,
    pujaActualUSD: 3100000,
    kilometrajeKm: 120,
    estado: "Disponible",
  },
  {
    autoId: "CAR-904",
    marcaYModelo: "Aston Martin DB5 Vantage",
    anioFabricacion: 1965,
    categoria: "Gran Turismo",
    precioBaseUSD: 950000,
    pujaActualUSD: 1150000,
    kilometrajeKm: 45000,
    estado: "Adjudicado",
  },
  {
    autoId: "CAR-905",
    marcaYModelo: "McLaren Senna LM Edition",
    anioFabricacion: 2020,
    categoria: "Superdeportivo",
    precioBaseUSD: 1800000,
    pujaActualUSD: 2150000,
    kilometrajeKm: 890,
    estado: "Pujando",
  }
];

function validarAutoSubastaActivo(auto: FichaAutoSubasta): boolean {
  return auto.estado !== "Retirado" && auto.precioBaseUSD > 0 && auto.anioFabricacion > 1886;
}

function calcularComisionCasaSubastas(pujaActual: number): number {
  const porcentajeComision = 0.08; // 8% de comisión para la casa de subastas
  return Number((pujaActual * porcentajeComision).toFixed(2));
}

function determinarEstatusLoteSubasta(puja: number, base: number, estado: EstadoSubastaAuto): string {
  if (estado === "Adjudicado") return "Lote Adjudicado con Éxito";
  if (puja >= base * 1.5) return "Alta Demanda (Puja Exclusiva)";
  return "Subasta Activa en Proceso";
}

function procesarSubastaAutosLujo(autos: readonly FichaAutoSubasta[]): readonly ResumenSubastaAutos[] {
  return autos
    .filter(validarAutoSubastaActivo)
    .map(auto => {
      const comision = calcularComisionCasaSubastas(auto.pujaActualUSD);
      return {
        identificador: auto.autoId,
        vehiculo: `${auto.marcaYModelo} (${auto.anioFabricacion})`,
        categoria: auto.categoria,
        pujaFinalUSD: auto.pujaActualUSD,
        comisionCasaSubastasUSD: comision,
        estatusLote: determinarEstatusLoteSubasta(auto.pujaActualUSD, auto.precioBaseUSD, auto.estado),
      };
    })
    .sort((a, b) => b.pujaFinalUSD - a.pujaFinalUSD);
}

function imprimirReporteSubasta(titulo: string, resumen: readonly ResumenSubastaAutos[]): void {
  console.log(`=== [SUBASTA DE AUTOS DE LUJO] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. [${item.identificador}] ${item.vehiculo} | Categoría: ${item.categoria} | Puja Final: $${item.pujaFinalUSD.toLocaleString()} | Comisión Casa: $${item.comisionCasaSubastasUSD.toLocaleString()} | Estatus: ${item.estatusLote}`
    );
  });
  console.log("=================================================================================\n");
}

const resultadoSubastaOficial = procesarSubastaAutosLujo(inventarioCasaSubastasGlobal);
imprimirReporteSubasta("Reporte General de Lotes de Lujo en Subasta", resultadoSubastaOficial);

// Caso: Hiperauto prototipo único en el mundo con valoración récord extrema
const autoCasoLimite: readonly FichaAutoSubasta[] = [
  {
    autoId: "CAR-9999",
    marcaYModelo: "Rolls-Royce Boat Tail Prototipo",
    anioFabricacion: 2023,
    categoria: "Prototipo Exclusivo",
    precioBaseUSD: 28000000,
    pujaActualUSD: 35000000,
    kilometrajeKm: 15,
    estado: "Adjudicado",
  }
];

const resultadoLimite = procesarSubastaAutosLujo(autoCasoLimite);
imprimirReporteSubasta("Caso: Prototipo Único de Lujo Extremo Adjudicado", resultadoLimite);