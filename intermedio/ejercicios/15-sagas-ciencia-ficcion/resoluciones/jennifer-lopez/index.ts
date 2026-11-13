export {};

type SubgeneroSciFi = 'Cyberpunk' | 'Space Opera' | 'Viajes en el Tiempo' | 'Distopia' | 'Hard Sci-Fi';
type EstadoCanonico = 'Canon Oficial' | 'Universo Expandido' | 'Spin-off' | 'No Canonico';

interface FichaObraSciFi {
  readonly obraId: string;
  readonly titulo: string;
  readonly autor: string;
  readonly subgenero: SubgeneroSciFi;
  readonly anioLanzamiento: number;
  readonly calificacionImdb: number; // Escala de 1 a 10 (ej: 8.7)
  readonly ventasMillonesCopias: number;
  estado: EstadoCanonico;
}

interface ResumenAnalisisSciFi {
  readonly obra: string;
  readonly subgenero: SubgeneroSciFi;
  readonly periodoLanzamiento: string;
  readonly indiceImpactoUniversal: number;
  readonly clasificacionSaga: string;
}

const archivosUniversoNexus: readonly FichaObraSciFi[] = [
  {
    obraId: "SCI-101",
    titulo: "Neuromancer",
    autor: "William Gibson",
    subgenero: "Cyberpunk",
    anioLanzamiento: 1984,
    calificacionImdb: 8.8,
    ventasMillonesCopias: 12.5,
    estado: "Canon Oficial",
  },
  {
    obraId: "SCI-102",
    titulo: "Hyperion",
    autor: "Dan Simmons",
    subgenero: "Space Opera",
    anioLanzamiento: 1989,
    calificacionImdb: 9.1,
    ventasMillonesCopias: 8.2,
    estado: "Canon Oficial",
  },
  {
    obraId: "SCI-103",
    titulo: "Snow Crash",
    autor: "Neal Stephenson",
    subgenero: "Cyberpunk",
    anioLanzamiento: 1992,
    calificacionImdb: 8.5,
    ventasMillonesCopias: 9.0,
    estado: "Universo Expandido",
  },
  {
    obraId: "SCI-104",
    titulo: "The Forever War",
    autor: "Joe Haldeman",
    subgenero: "Hard Sci-Fi",
    anioLanzamiento: 1974,
    calificacionImdb: 8.9,
    ventasMillonesCopias: 6.8,
    estado: "Canon Oficial",
  },
  {
    obraId: "SCI-105",
    titulo: "Timeline Paradox",
    autor: "Aether Vance",
    subgenero: "Viajes en el Tiempo",
    anioLanzamiento: 2005,
    calificacionImdb: 5.4,
    ventasMillonesCopias: 1.1,
    estado: "No Canonico",
  }
];

function validarObraCanon(obra: FichaObraSciFi): boolean {
  return obra.estado !== "No Canonico" && obra.calificacionImdb >= 7.0;
}

function calcularIndiceImpactoUniversal(obra: FichaObraSciFi): number {
  const factorCalificacion = obra.calificacionImdb * 10;
  const factorVentas = obra.ventasMillonesCopias * 3.5;
  const antiguedadAnios = 2026 - obra.anioLanzamiento;
  const bonoLegado = antiguedadAnios > 30 ? 15 : 5;
  const indiceBruto = factorCalificacion + factorVentas + bonoLegado;
  return Number(indiceBruto.toFixed(2));
}

function categorizarEpocaLanzamiento(anio: number): string {
  if (anio < 1980) return "Era Fundacional Clásica";
  if (anio < 2000) return "Era Dorada del Ciberespacio";
  return "Era Moderna Hiperconectada";
}

function clasificarImpactoSaga(indice: number): string {
  if (indice >= 130) return "Obra Maestra Fundacional Sci-Fi";
  if (indice >= 100) return "Pilar Esencial del Subgénero";
  if (indice >= 80) return "Lectura Recomendada de Culto";
  return "Estándar de Biblioteca";
}

function procesarAnalizadorSciFi(obras: readonly FichaObraSciFi[]): readonly ResumenAnalisisSciFi[] {
  return obras
    .filter(validarObraCanon)
    .map(obra => {
      const indice = calcularIndiceImpactoUniversal(obra);
      return {
        obra: `${obra.titulo} - ${obra.autor} [${obra.obraId}]`,
        subgenero: obra.subgenero,
        periodoLanzamiento: categorizarEpocaLanzamiento(obra.anioLanzamiento),
        indiceImpactoUniversal: indice,
        clasificacionSaga: clasificarImpactoSaga(indice),
      };
    })
    .sort((a, b) => b.indiceImpactoUniversal - a.indiceImpactoUniversal);
}

function imprimirReporteSciFi(titulo: string, analisis: readonly ResumenAnalisisSciFi[]): void {
  console.log(`=== [ANALIZADOR DE SAGAS SCI-FI] ${titulo} ===`);
  analisis.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Obra: ${item.obra} (${item.subgenero}) | Época: ${item.periodoLanzamiento} | Índice: ${item.indiceImpactoUniversal} | Jerarquía: ${item.clasificacionSaga}`
    );
  });
  console.log("=================================================================================\n");
}

const resultadoAnalisisOficial = procesarAnalizadorSciFi(archivosUniversoNexus);
imprimirReporteSciFi("Ranking Oficial de Obras en el Canon", resultadoAnalisisOficial);

// Caso: Obra legendaria ultra antigua con impacto histórico masivo en el género
const obraCasoLegendario: readonly FichaObraSciFi[] = [
  {
    obraId: "SCI-999",
    titulo: "Dune Messiah",
    autor: "Frank Herbert",
    subgenero: "Space Opera",
    anioLanzamiento: 1969,
    calificacionImdb: 9.4,
    ventasMillonesCopias: 25.0,
    estado: "Canon Oficial",
  }
];

const resultadoLegendario = procesarAnalizadorSciFi(obraCasoLegendario);
imprimirReporteSciFi("Caso: Obra Fundacional Histórica de Alta Influencia", resultadoLegendario);