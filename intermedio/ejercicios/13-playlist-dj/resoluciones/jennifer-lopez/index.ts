export {};

type GeneroMusical = 'Reggaeton' | 'Trap' | 'Pop Urbano' | 'Regional Mexicano' | 'Hip-Hop';
type EstadoPista = 'Activa' | 'Explicit' | 'Restringida' | 'EnRevision';

interface PistaMusical {
  readonly pistaId: string;
  readonly titulo: string;
  readonly artista: string;
  readonly genero: GeneroMusical;
  readonly duracionSegundos: number;
  readonly reproduccionesMillones: number;
  readonly calificacionBpm: number;
  estado: EstadoPista;
}

interface ResumenPlaylist {
  readonly cancion: string;
  readonly generoMusical: GeneroMusical;
  readonly duracionFormato: string;
  readonly impactoPopularidad: string;
  readonly puntajeCuraduria: number;
}

const bibliotecaDjSession: readonly PistaMusical[] = [
  {
    pistaId: "MUS-801",
    titulo: "Lala",
    artista: "Myke Towers",
    genero: "Reggaeton",
    duracionSegundos: 198,
    reproduccionesMillones: 1250,
    calificacionBpm: 92,
    estado: "Activa",
  },
  {
    pistaId: "MUS-802",
        titulo: "Columbia",
    artista: "Quevedo",
    genero: "Pop Urbano",
    duracionSegundos: 180,
    reproduccionesMillones: 980,
    calificacionBpm: 126,
    estado: "Activa",
  },
  {
    pistaId: "MUS-803",
    titulo: "QLona",
    artista: "Karol G ft. Peso Pluma",
    genero: "Reggaeton",
    duracionSegundos: 172,
    reproduccionesMillones: 1450,
    calificacionBpm: 98,
    estado: "Activa",
  },
  {
    pistaId: "MUS-804",
    titulo: "Ella Baila Sola",
    artista: "Eslabon Armado ft. Peso Pluma",
    genero: "Regional Mexicano",
    duracionSegundos: 165,
    reproduccionesMillones: 1600,
    calificacionBpm: 148,
    estado: "Explicit",
  },
  {
    pistaId: "MUS-805",
    titulo: "Monaco",
    artista: "Bad Bunny",
    genero: "Trap",
    duracionSegundos: 267,
    reproduccionesMillones: 1100,
    calificacionBpm: 140,
    estado: "Activa",
  }
];

function validarPistaCuraduria(pista: PistaMusical): boolean {
  return pista.estado !== "Restringida" && pista.estado !== "EnRevision" && pista.reproduccionesMillones >= 500;
}

function calcularPuntajeCuraduria(pista: PistaMusical): number {
  const factorPopularidad = pista.reproduccionesMillones * 0.05;
  const factorRitmo = pista.calificacionBpm * 0.8;
  const penalizacionDuracion = pista.duracionSegundos > 240 ? 15 : 0;
  const puntajeBruto = factorPopularidad + factorRitmo - penalizacionDuracion;
  return Number(puntajeBruto.toFixed(2));
}

function formatearDuracionMinutos(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = segundos % 60;
  return `${minutos}:${segundosRestantes < 10 ? '0' : ''}${segundosRestantes} min`;
}

function clasificarImpactoMusical(puntaje: number): string {
  if (puntaje >= 150) return "Hit Mundial Chart Global";
  if (puntaje >= 100) return "Rotación Alta en Clubes";
  if (puntaje >= 70) return "Selección Estándar Playlist";
  return "Profundidad de Catálogo";
}

function procesarCuraduriaPlaylist(pistas: readonly PistaMusical[]): readonly ResumenPlaylist[] {
  return pistas
    .filter(validarPistaCuraduria)
    .map(pista => {
      const puntaje = calcularPuntajeCuraduria(pista);
      return {
        cancion: `${pista.artista} - ${pista.titulo} [${pista.pistaId}]`,
        generoMusical: pista.genero,
        duracionFormato: formatearDuracionMinutos(pista.duracionSegundos),
        impactoPopularidad: clasificarImpactoMusical(puntaje),
        puntajeCuraduria: puntaje,
      };
    })
    .sort((a, b) => b.puntajeCuraduria - a.puntajeCuraduria);
}

function imprimirReportePlaylist(titulo: string, resumen: readonly ResumenPlaylist[]): void {
  console.log(`=== [CURADOR DE PLAYLIST] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Track: ${item.cancion} (${item.generoMusical}) | Duración: ${item.duracionFormato} | Score: ${item.puntajeCuraduria} | Nivel: ${item.impactoPopularidad}`
    );
  });
  console.log("===================================================================\n");
}

const playlistOficialSesion = procesarCuraduriaPlaylist(bibliotecaDjSession);
imprimirReportePlaylist("Selección Oficial para Set List", playlistOficialSesion);

// Caso: Pista underground con reproducciones masivas pero duración extendida superior al promedio comercial
const playlistCasoUnderground: readonly PistaMusical[] = [
  {
    pistaId: "MUS-999",
    titulo: "Sinfonía Urbana Suite",
    artista: "Aether Project",
    genero: "Hip-Hop",
    duracionSegundos: 340,
    reproduccionesMillones: 850,
    calificacionBpm: 88,
    estado: "Activa",
  }
];

const resultadoUnderground = procesarCuraduriaPlaylist(playlistCasoUnderground);
imprimirReportePlaylist("Caso: Track Underground de Larga Duración", resultadoUnderground);