export {};

type RolJugador = 'Asalto' | 'Francotirador' | 'Medico' | 'Ingeniero' | 'Reconocimiento';
type PlataformaServidor = 'PC_Steam' | 'PlayStation_5' | 'Xbox_Series_X' | 'Cloud_Gaming';
type EstadoConexion = 'EnLinea' | 'BuscandoPartida' | 'EnCombate' | 'Desconectado';

interface TelemetriaPartida {
  readonly partidaId: string;
  readonly mapaNombre: string;
  readonly bajas: number;
  readonly muertes: number;
  readonly precisionDisparosPct: number;
  readonly pingMs: number;
}

interface PerfilJugadorShooter {
  readonly usuarioId: string;
  readonly gamertag: string;
  readonly rolPrincipal: RolJugador;
  readonly plataforma: PlataformaServidor;
  readonly nivelExperiencia: number;
  readonly estado: EstadoConexion;
  readonly historicoPartidas: readonly TelemetriaPartida[];
}

interface ReporteClienteApiShooter {
  readonly jugador: string;
  readonly plataforma: PlataformaServidor;
  readonly partidasProcesadas: number;
  readonly kdrPromedio: number;
  readonly precisionPromedioPct: number;
  readonly estatusServidor: 'Estable' | 'LatenciaAlta' | 'Desincronizado';
}

const registroJugadoresApi: readonly PerfilJugadorShooter[] = [
  {
    usuarioId: "USR-5201",
    gamertag: "Viper_Kaelen",
    rolPrincipal: "Francotirador",
    plataforma: "PC_Steam",
    nivelExperiencia: 78,
    estado: "EnCombate",
    historicoPartidas: [
      { partidaId: "PT-01", mapaNombre: "Canyon Strike", bajas: 24, muertes: 6, precisionDisparosPct: 78.5, pingMs: 25 },
      { partidaId: "PT-02", mapaNombre: "Terminal Orbital", bajas: 19, muertes: 8, precisionDisparosPct: 74.0, pingMs: 28 }
    ]
  },
  {
    usuarioId: "USR-5202",
    gamertag: "Thalassa_Vane",
    rolPrincipal: "Medico",
    plataforma: "PlayStation_5",
    nivelExperiencia: 65,
    estado: "EnLinea",
    historicoPartidas: [
      { partidaId: "PT-03", mapaNombre: "Bunker Subterraneo", bajas: 15, muertes: 10, precisionDisparosPct: 62.0, pingMs: 45 },
      { partidaId: "PT-04", mapaNombre: "Canyon Strike", bajas: 18, muertes: 9, precisionDisparosPct: 65.5, pingMs: 42 }
    ]
  },
  {
    usuarioId: "USR-5203",
    gamertag: "Zephyrin_Kurosaki",
    rolPrincipal: "Ingeniero",
    plataforma: "Xbox_Series_X",
    nivelExperiencia: 90,
    estado: "EnCombate",
    historicoPartidas: [
      { partidaId: "PT-05", mapaNombre: "Sector Industrial Delta", bajas: 22, muertes: 7, precisionDisparosPct: 81.0, pingMs: 30 }
    ]
  },
  {
    usuarioId: "USR-5204",
    gamertag: "Lysandra_Moreau",
    rolPrincipal: "Asalto",
    plataforma: "PC_Steam",
    nivelExperiencia: 82,
    estado: "BuscandoPartida",
    historicoPartidas: [
      { partidaId: "PT-06", mapaNombre: "Terminal Orbital", bajas: 28, muertes: 11, precisionDisparosPct: 70.2, pingMs: 22 }
    ]
  }
];

class ClienteApiFakeShooter<T extends PerfilJugadorShooter> {
  private readonly perfiles: readonly T[];

  constructor(perfiles: readonly T[]) {
    this.perfiles = perfiles;
  }

  public async consultarPerfilApiAsync(usuarioId: string): Promise<T> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const encontrado = this.perfiles.find(p => p.usuarioId === usuarioId);
        if (!encontrado) {
          reject(new Error(`Error 404: Usuario con ID ${usuarioId} no encontrado en servidores del shooter.`));
        } else {
          resolve(encontrado);
        }
      }, 20);
    });
  }

  public calcularKdr(partidas: readonly TelemetriaPartida[]): number {
    if (partidas.length === 0) return 0;
    const totalBajas = partidas.reduce((acc, p) => acc + p.bajas, 0);
    const totalMuertes = partidas.reduce((acc, p) => acc + p.muertes, 0);
    if (totalMuertes === 0) return Number(totalBajas.toFixed(2));
    return Number((totalBajas / totalMuertes).toFixed(2));
  }

  public calcularPrecisionPromedio(partidas: readonly TelemetriaPartida[]): number {
    if (partidas.length === 0) return 0;
    const sumaPrecision = partidas.reduce((acc, p) => acc + p.precisionDisparosPct, 0);
    return Number((sumaPrecision / partidas.length).toFixed(1));
  }

  public async procesarTelemetriaApiAsync(): Promise<readonly ReporteClienteApiShooter[]> {
    const reportes: ReporteClienteApiShooter[] = [];

    for (const perfil of this.perfiles) {
      try {
        await this.consultarPerfilApiAsync(perfil.usuarioId);
        const kdr = this.calcularKdr(perfil.historicoPartidas);
        const precision = this.calcularPrecisionPromedio(perfil.historicoPartidas);
        const pingMaximo = Math.max(...perfil.historicoPartidas.map(p => p.pingMs), 0);

        let estatus: 'Estable' | 'LatenciaAlta' | 'Desincronizado' = 'Estable';
        if (pingMaximo > 150 || perfil.estado === "Desconectado") {
          estatus = 'Desincronizado';
        } else if (pingMaximo > 60) {
          estatus = 'LatenciaAlta';
        }

        reportes.push({
          jugador: `${perfil.gamertag} [${perfil.usuarioId}]`,
          plataforma: perfil.plataforma,
          partidasProcesadas: perfil.historicoPartidas.length,
          kdrPromedio: kdr,
          precisionPromedioPct: precision,
          estatusServidor: estatus,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[API Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => b.kdrPromedio - a.kdrPromedio);
  }
}

function imprimirReporteApiShooter(titulo: string, reportes: readonly ReporteClienteApiShooter[]): void {
  console.log(`=== [CLIENTE API FAKE SHOOTER - VIDEOJUEGOS SHOOTERS] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Jugador: ${item.jugador} | Plataforma: ${item.plataforma} | Partidas: ${item.partidasProcesadas} | KDR: ${item.kdrPromedio} | Precisión: ${item.precisionPromedioPct}% | Servidor: ${item.estatusServidor}`
    );
  });
  console.log("====================================================================================================================\n");
}

async function ejecutarFlujoClienteApi(): Promise<void> {
  const clienteOficial = new ClienteApiFakeShooter(registroJugadoresApi);
  const reporteOficial = await clienteOficial.procesarTelemetriaApiAsync();
  imprimirReporteApiShooter("Telemetría Oficial de Jugadores en Línea", reporteOficial);

  // caso: Jugador con desconexion de servidor y latencia critica superior al limite permitido
  const jugadorCasoLimite: readonly PerfilJugadorShooter[] = [
    {
      usuarioId: "USR-9999",
      gamertag: "Orion_Desinc",
      rolPrincipal: "Reconocimiento",
      plataforma: "Cloud_Gaming",
      nivelExperiencia: 12,
      estado: "Desconectado",
      historicoPartidas: [
        { partidaId: "PT-99", mapaNombre: "Zona Muerta Ciber", bajas: 1, muertes: 18, precisionDisparosPct: 12.0, pingMs: 280 }
      ]
    }
  ];

  const clienteLimite = new ClienteApiFakeShooter(jugadorCasoLimite);
  const reporteLimite = await clienteLimite.procesarTelemetriaApiAsync();
  imprimirReporteApiShooter("caso: Jugador con desconexion de servidor y latencia critica superior al limite permitido", reporteLimite);
}

ejecutarFlujoClienteApi();