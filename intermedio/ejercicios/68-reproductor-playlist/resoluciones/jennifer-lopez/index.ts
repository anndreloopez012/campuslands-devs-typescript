export {};

type GeneroMusical = 'Synthwave' | 'Cyberpunk' | 'LoFi' | 'ProgressiveHouse' | 'DarkAmbient';
type EstadoReproductor = 'Reproduciendo' | 'Pausado' | 'Detenido' | 'AleatorioActivo';

type EventoReproductorPlaylist =
  | { readonly tipo: 'REPRODUCIR_PISTA'; readonly pistaId: string }
  | { readonly tipo: 'PAUSAR_REPRODUCTOR' }
  | { readonly tipo: 'CAMBIAR_MODO_ALEATORIO'; readonly activo: boolean }
  | { readonly tipo: 'SALTAR_SIGUIENTE' };

interface CancionPlaylist {
  readonly cancionId: string;
  readonly titulo: string;
  readonly artista: string;
  readonly genero: GeneroMusical;
  readonly duracionSegundos: number;
  readonly reproduccionesTotales: number;
  readonly esFavorita: boolean;
}

interface PlaylistMusical {
  readonly playlistId: string;
  readonly nombrePlaylist: string;
  readonly creador: string;
  readonly estadoActual: EstadoReproductor;
  readonly canciones: readonly CancionPlaylist[];
}

interface ReportePlaylistInteractiva {
  readonly playlist: string;
  readonly creador: string;
  readonly totalCanciones: number;
  readonly duracionTotalMinutos: number;
  readonly promedioReproducciones: number;
  readonly clasificacionPopularidad: 'Viral' | 'Popular' | 'Emergente';
}

const registroPlaylistsMusicales: readonly PlaylistMusical[] = [
  {
    playlistId: "PLY-6801",
    nombrePlaylist: "Neon Cyberpunk Night Drive",
    creador: "Zephyrin Kaelen",
    estadoActual: "Reproduciendo",
    canciones: [
      { cancionId: "SONG-01", titulo: "Grid Runner", artista: "Kavinsky Protocol", genero: "Cyberpunk", duracionSegundos: 245, reproduccionesTotales: 154000, esFavorita: true },
      { cancionId: "SONG-02", titulo: "Neon Highway", artista: "Vanguard Sound", genero: "Synthwave", duracionSegundos: 210, reproduccionesTotales: 98000, esFavorita: true },
      { cancionId: "SONG-03", titulo: "Sublevel 9", artista: "Glitch Matrix", genero: "DarkAmbient", duracionSegundos: 310, reproduccionesTotales: 45000, esFavorita: false }
    ]
  },
  {
    playlistId: "PLY-6802",
    nombrePlaylist: "Late Night Coding & LoFi Beats",
    creador: "Lysandra Vane",
    estadoActual: "AleatorioActivo",
    canciones: [
      { cancionId: "SONG-04", titulo: "Midnight Coffee", artista: "Coffee Bean", genero: "LoFi", duracionSegundos: 165, reproduccionesTotales: 210000, esFavorita: true },
      { cancionId: "SONG-05", titulo: "Compile Error", artista: "Async Sleepless", genero: "LoFi", duracionSegundos: 180, reproduccionesTotales: 185000, esFavorita: true }
    ]
  },
  {
    playlistId: "PLY-6803",
    nombrePlaylist: "Progressive Trance Odyssey",
    creador: "Thalassa Althaus",
    estadoActual: "Pausado",
    canciones: [
      { cancionId: "SONG-06", titulo: "Stellar Horizon", artista: "Celestial Sound", genero: "ProgressiveHouse", duracionSegundos: 420, reproduccionesTotales: 320000, esFavorita: true },
      { cancionId: "SONG-07", titulo: "Ether State", artista: "Orbital Drift", genero: "ProgressiveHouse", duracionSegundos: 390, reproduccionesTotales: 290000, esFavorita: false }
    ]
  }
];

class GestorPlaylistInteractiva<T extends PlaylistMusical> {
  private readonly playlists: readonly T[];

  constructor(playlists: readonly T[]) {
    this.playlists = playlists;
  }

  public async validarPlaylistAsync(playlist: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!playlist.playlistId || !playlist.nombrePlaylist) {
          reject(new Error(`Playlist interactiva inválida o sin identificador: ${playlist.playlistId}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public aplicarReductorReproductor(estadoActual: EstadoReproductor, evento: EventoReproductorPlaylist): EstadoReproductor {
    switch (evento.tipo) {
      case 'REPRODUCIR_PISTA':
        return 'Reproduciendo';
      case 'PAUSAR_REPRODUCTOR':
        return 'Pausado';
      case 'CAMBIAR_MODO_ALEATORIO':
        return evento.activo ? 'AleatorioActivo' : 'Reproduciendo';
      case 'SALTAR_SIGUIENTE':
        return 'Reproduciendo';
      default:
        return estadoActual;
    }
  }

  public calcularDuracionTotalMinutos(canciones: readonly CancionPlaylist[]): number {
    const totalSegundos = canciones.reduce((acc, c) => acc + c.duracionSegundos, 0);
    return Number((totalSegundos / 60).toFixed(1));
  }

  public calcularPromedioReproducciones(canciones: readonly CancionPlaylist[]): number {
    if (canciones.length === 0) return 0;
    const suma = canciones.reduce((acc, c) => acc + c.reproduccionesTotales, 0);
    return Math.round(suma / canciones.length);
  }

  public async procesarReportesPlaylistAsync(): Promise<readonly ReportePlaylistInteractiva[]> {
    const reportes: ReportePlaylistInteractiva[] = [];

    for (const pl of this.playlists) {
      try {
        await this.validarPlaylistAsync(pl);
        const duracionMin = this.calcularDuracionTotalMinutos(pl.canciones);
        const promedioReps = this.calcularPromedioReproducciones(pl.canciones);

        let clasificacion: 'Viral' | 'Popular' | 'Emergente' = 'Popular';
        if (promedioReps >= 200000) {
          clasificacion = 'Viral';
        } else if (promedioReps < 60000) {
          clasificacion = 'Emergente';
        }

        reportes.push({
          playlist: `${pl.nombrePlaylist} [${pl.playlistId}]`,
          creador: pl.creador,
          totalCanciones: pl.canciones.length,
          duracionTotalMinutos: duracionMin,
          promedioReproducciones: promedioReps,
          clasificacionPopularidad: clasificacion,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[Playlist Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => b.promedioReproducciones - a.promedioReproducciones);
  }
}

function imprimirReportePlaylist(titulo: string, reportes: readonly ReportePlaylistInteractiva[]): void {
  console.log(`=== [PLAYLIST INTERACTIVA - MUSICA] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Playlist: ${item.playlist} | Creador: ${item.creador} | Canciones: ${item.totalCanciones} | Duración: ${item.duracionTotalMinutos} min | Prom. Reps: ${item.promedioReproducciones} | Popularidad: ${item.clasificacionPopularidad}`
    );
  });
  console.log("====================================================================================================================\n");
}

async function ejecutarFlujoPlaylistInteractiva(): Promise<void> {
  const gestorOficial = new GestorPlaylistInteractiva(registroPlaylistsMusicales);
  const reporteOficial = await gestorOficial.procesarReportesPlaylistAsync();
  imprimirReportePlaylist("Reporte Oficial de Playlists y Estadísticas de Reproducción", reporteOficial);

  // caso: Playlist vacia sin canciones y estado detenido por inactividad
  const playlistCasoLimite: readonly PlaylistMusical[] = [
    {
      playlistId: "PLY-9999",
      nombrePlaylist: "Playlist Vacia de Pruebas",
      creador: "Orion Lancer",
      estadoActual: "Detenido",
      canciones: []
    }
  ];

  const gestorLimite = new GestorPlaylistInteractiva(playlistCasoLimite);
  const reporteLimite = await gestorLimite.procesarReportesPlaylistAsync();
  imprimirReportePlaylist("caso: Playlist vacia sin canciones y estado detenido por inactividad", reporteLimite);
}

ejecutarFlujoPlaylistInteractiva();