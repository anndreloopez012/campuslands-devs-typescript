export {};

type RolMoba = 'Tanque' | 'Asesino' | 'Mago' | 'Tirador' | 'Soporte';
type TipoMensaje = 'Estrategia' | 'AlertaPeligro' | 'CooldownHabilidad' | 'SolicitudAyuda' | 'ToxicidadDetectada';
type EstadoCanal = 'Activo' | 'Silenciado' | 'Reportado';

interface MensajeChatMoba {
  readonly mensajeId: string;
  readonly tiempoTranscurridoseg: number;
  readonly tipo: TipoMensaje;
  readonly contenido: string;
  readonly flagToxico: boolean;
}

interface JugadorCanalMoba {
  readonly jugadorId: string;
  readonly summonerName: string;
  readonly rol: RolMoba;
  readonly estadoCanal: EstadoCanal;
  readonly mensajesEnviados: readonly MensajeChatMoba[];
}

interface ReporteChatMoba {
  readonly invocador: string;
  readonly rolJugador: RolMoba;
  readonly totalMensajesValidos: number;
  readonly totalInfraccionesToxicas: number;
  readonly indiceToxicidadPct: number;
  readonly estadoModeracion: 'Limpio' | 'Advertencia' | 'Suspendido';
}

const registroPartidaMoba: readonly JugadorCanalMoba[] = [
  {
    jugadorId: "MOBA-5401",
    summonerName: "Kaelen_VoidWalker",
    rol: "Asesino",
    estadoCanal: "Activo",
    mensajesEnviados: [
      { mensajeId: "MSG-01", tiempoTranscurridoseg: 120, tipo: "Estrategia", contenido: "Vamos por Baron Nashor ahora mismo.", flagToxico: false },
      { mensajeId: "MSG-02", tiempoTranscurridoseg: 240, tipo: "AlertaPeligro", contenido: "Cuidado enemigo desaparecido en jungla.", flagToxico: false },
      { mensajeId: "MSG-03", tiempoTranscurridoseg: 310, tipo: "CooldownHabilidad", contenido: "Definitiva lista en 15 segundos.", flagToxico: false }
    ] as const
  },
  {
    jugadorId: "MOBA-5402",
    summonerName: "Thalassa_Seraph",
    rol: "Soporte",
    estadoCanal: "Activo",
    mensajesEnviados: [
      { mensajeId: "MSG-04", tiempoTranscurridoseg: 95, tipo: "SolicitudAyuda", contenido: "Necesito vision en rio inferior.", flagToxico: false },
      { mensajeId: "MSG-05", tiempoTranscurridoseg: 180, tipo: "CooldownHabilidad", contenido: "Curacion disponible.", flagToxico: false }
    ] as const
  },
  {
    jugadorId: "MOBA-5403",
    summonerName: "Zephyrin_Ironclad",
    rol: "Tanque",
    estadoCanal: "Silenciado",
    mensajesEnviados: [
      { mensajeId: "MSG-06", tiempoTranscurridoseg: 150, tipo: "ToxicidadDetectada", contenido: "Juego inutil, ustedes no hacen nada.", flagToxico: true },
      { mensajeId: "MSG-07", tiempoTranscurridoseg: 210, tipo: "ToxicidadDetectada", contenido: "Me voy AFK.", flagToxico: true }
    ] as const
  },
  {
    jugadorId: "MOBA-5404",
    summonerName: "Lysandra_Starlight",
    rol: "Mago",
    estadoCanal: "Activo",
    mensajesEnviados: [
      { mensajeId: "MSG-08", tiempoTranscurridoseg: 80, tipo: "Estrategia", contenido: "Empujen carril central.", flagToxico: false }
    ] as const
  }
];

class ModeradorChatMoba<T extends JugadorCanalMoba> {
  private readonly jugadores: readonly T[];

  constructor(jugadores: readonly T[]) {
    this.jugadores = jugadores;
  }

  public async validarJugadorChatAsync(jugador: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!jugador.jugadorId || !jugador.summonerName) {
          reject(new Error(`Jugador de MOBA inválido o sin credenciales: ${jugador.jugadorId}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public contarInfracciones(mensajes: readonly MensajeChatMoba[]): number {
    return mensajes.filter(m => m.flagToxico).length;
  }

  public async procesarAuditoriaChatAsync(): Promise<readonly ReporteChatMoba[]> {
    const reportes: ReporteChatMoba[] = [];

    for (const jugador of this.jugadores) {
      try {
        await this.validarJugadorChatAsync(jugador);
        const totalMensajes = jugador.mensajesEnviados.length;
        const infracciones = this.contarInfracciones(jugador.mensajesEnviados);
        const porcentaje = totalMensajes > 0 ? Number(((infracciones / totalMensajes) * 100).toFixed(1)) : 0;

        let estatusModeracion: 'Limpio' | 'Advertencia' | 'Suspendido' = 'Limpio';
        if (porcentaje >= 50 || jugador.estadoCanal === "Reportado") {
          estatusModeracion = 'Suspendido';
        } else if (porcentaje > 0) {
          estatusModeracion = 'Advertencia';
        }

        reportes.push({
          invocador: `${jugador.summonerName} [${jugador.jugadorId}]`,
          rolJugador: jugador.rol,
          totalMensajesValidos: totalMensajes,
          totalInfraccionesToxicas: infracciones,
          indiceToxicidadPct: porcentaje,
          estadoModeracion: estatusModeracion,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[MOBA Chat Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => b.indiceToxicidadPct - a.indiceToxicidadPct);
  }
}

function imprimirReporteChatMoba(titulo: string, reportes: readonly ReporteChatMoba[]): void {
  console.log(`=== [CHAT DE EQUIPO MOBA - VIDEOJUEGOS MOBA] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Invocador: ${item.invocador} | Rol: ${item.rolJugador} | Mensajes: ${item.totalMensajesValidos} | Tóxicos: ${item.totalInfraccionesToxicas} | Toxicidad: ${item.indiceToxicidadPct}% | Estado: ${item.estadoModeracion}`
    );
  });
  console.log("====================================================================================================================\n");
}

async function ejecutarFlujoChatMoba(): Promise<void> {
  const moderadorOficial = new ModeradorChatMoba(registroPartidaMoba);
  const reporteOficial = await moderadorOficial.procesarAuditoriaChatAsync();
  imprimirReporteChatMoba("Auditoría Oficial de Canales de Comunicación", reporteOficial);

  // caso: Jugador extremadamente toxico con comportamiento abusivo reiterado y suspension permanente
  const jugadorCasoLimite: readonly JugadorCanalMoba[] = [
    {
      jugadorId: "MOBA-9999",
      summonerName: "Orion_FlameMaster",
      rol: "Tirador",
      estadoCanal: "Reportado",
      mensajesEnviados: [
        { mensajeId: "MSG-99", tiempoTranscurridoseg: 50, tipo: "ToxicidadDetectada", contenido: "Insultos graves hacia todo el equipo.", flagToxico: true },
        { mensajeId: "MSG-100", tiempoTranscurridoseg: 60, tipo: "ToxicidadDetectada", contenido: "Deseando malos augurios.", flagToxico: true }
      ]
    }
  ];

  const moderadorLimite = new ModeradorChatMoba(jugadorCasoLimite);
  const reporteLimite = await moderadorLimite.procesarAuditoriaChatAsync();
  imprimirReporteChatMoba("caso: Jugador extremadamente toxico con comportamiento abusivo reiterado y suspension permanente", reporteLimite);
}

ejecutarFlujoChatMoba();