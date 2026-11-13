export {};

type TipoMision = 'Principal' | 'Secundaria' | 'Incursion' | 'Gremio' | 'CazaMonstruos';
type RarezaMision = 'Comun' | 'Rara' | 'Epica' | 'Legendaria';
type EstadoMision = 'Completada' | 'EnCurso' | 'Bloqueada' | 'Fallida';

interface RecompensaObjeto {
  readonly itemId: string;
  readonly nombreItem: string;
  readonly valorOro: number;
  readonly esMagico: boolean;
}

interface RegistroMisionRpg {
  readonly misionId: string;
  readonly tituloMision: string;
  readonly tipo: TipoMision;
  readonly rareza: RarezaMision;
  readonly nivelRequerido: number;
  readonly experienciaRecompensa: number;
  readonly estado: EstadoMision;
  readonly recompensas: readonly RecompensaObjeto[];
}

interface ReporteGestorMisiones {
  readonly mision: string;
  readonly tipoMision: TipoMision;
  readonly rareza: RarezaMision;
  readonly oroTotalRecompensa: number;
  readonly expTotalRecompensa: number;
  readonly estatusLogro: 'Exitoso' | 'Pendiente' | 'BloqueadoCritico';
}

const registroMisionesTablon: readonly RegistroMisionRpg[] = [
  {
    misionId: "RPG-5301",
    tituloMision: "El despertar del Dragon de Obsidiana",
    tipo: "Principal",
    rareza: "Legendaria",
    nivelRequerido: 45,
    experienciaRecompensa: 12500,
    estado: "Completada",
    recompensas: [
      { itemId: "IT-01", nombreItem: "Espada Bastarda de Fuego Estelar", valorOro: 3500, esMagico: true },
      { itemId: "IT-02", nombreItem: "Pocion de Mana Mayor", valorOro: 150, esMagico: true }
    ]
  },
  {
    misionId: "RPG-5302",
    tituloMision: "Cosecha de Hierbas Lunares",
    tipo: "Secundaria",
    rareza: "Comun",
    nivelRequerido: 10,
    experienciaRecompensa: 1200,
    estado: "Completada",
    recompensas: [
      { itemId: "IT-03", nombreItem: "Hierba Lunar Brillante", valorOro: 75, esMagico: false }
    ]
  },
  {
    misionId: "RPG-5303",
    tituloMision: "Incursion en la Crypta de los Susurros",
    tipo: "Incursion",
    rareza: "Epica",
    nivelRequerido: 35,
    experienciaRecompensa: 8400,
    estado: "EnCurso",
    recompensas: [
      { itemId: "IT-04", nombreItem: "Amuleto de Resistencia Oscura", valorOro: 1800, esMagico: true }
    ]
  },
  {
    misionId: "RPG-5304",
    tituloMision: "Caza de Bestias en el Pantano Putrefacto",
    tipo: "CazaMonstruos",
    rareza: "Rara",
    nivelRequerido: 25,
    experienciaRecompensa: 4500,
    estado: "Completada",
    recompensas: [
      { itemId: "IT-05", nombreItem: "Piel Escamosa Reforzada", valorOro: 500, esMagico: false },
      { itemId: "IT-06", nombreItem: "Colmillo Venenoso Pulido", valorOro: 300, esMagico: true }
    ]
  }
];

class GestorMisionesRpg<T extends RegistroMisionRpg> {
  private readonly misiones: readonly T[];

  constructor(misiones: readonly T[]) {
    this.misiones = misiones;
  }

  public async validarMisionAsync(mision: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!mision.misionId || mision.nivelRequerido <= 0) {
          reject(new Error(`Misión RPG inválida: ${mision.tituloMision}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public calcularOroTotal(recompensas: readonly RecompensaObjeto[]): number {
    return recompensas.reduce((acc, item) => acc + item.valorOro, 0);
  }

  public async procesarReportesMisionesAsync(): Promise<readonly ReporteGestorMisiones[]> {
    const reportes: ReporteGestorMisiones[] = [];

    for (const mision of this.misiones) {
      try {
        await this.validarMisionAsync(mision);
        const oroTotal = this.calcularOroTotal(mision.recompensas);

        let estatus: 'Exitoso' | 'Pendiente' | 'BloqueadoCritico' = 'Exitoso';
        if (mision.estado === "Bloqueada" || mision.estado === "Fallida") {
          estatus = 'BloqueadoCritico';
        } else if (mision.estado === "EnCurso") {
          estatus = 'Pendiente';
        }

        reportes.push({
          mision: `${mision.tituloMision} [${mision.misionId}]`,
          tipoMision: mision.tipo,
          rareza: mision.rareza,
          oroTotalRecompensa: oroTotal,
          expTotalRecompensa: mision.experienciaRecompensa,
          estatusLogro: estatus,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[RPG Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => b.expTotalRecompensa - a.expTotalRecompensa);
  }
}

function imprimirReporteMisiones(titulo: string, reportes: readonly ReporteGestorMisiones[]): void {
  console.log(`=== [GESTOR DE MISIONES RPG - VIDEOJUEGOS RPG] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Misión: ${item.mision} | Tipo: ${item.tipoMision} | Rareza: ${item.rareza} | Oro: ${item.oroTotalRecompensa} G | EXP: ${item.expTotalRecompensa} XP | Estatus: ${item.estatusLogro}`
    );
  });
  console.log("======================================================================================================================\n");
}

async function ejecutarFlujoMisionesRpg(): Promise<void> {
  const gestorOficial = new GestorMisionesRpg(registroMisionesTablon);
  const reporteOficial = await gestorOficial.procesarReportesMisionesAsync();
  imprimirReporteMisiones("Tablón Oficial de Misiones del Reino", reporteOficial);

  // caso: Mision bloqueada por requisitos de nivel critico y estado fallido en aventura epica
  const misionCasoLimite: readonly RegistroMisionRpg[] = [
    {
      misionId: "RPG-9999",
      tituloMision: "Desafio Absoluto al Dios del Caos",
      tipo: "Principal",
      rareza: "Legendaria",
      nivelRequerido: 100,
      experienciaRecompensa: 0,
      estado: "Bloqueada",
      recompensas: []
    }
  ];

  const gestorLimite = new GestorMisionesRpg(misionCasoLimite);
  const reporteLimite = await gestorLimite.procesarReportesMisionesAsync();
  imprimirReporteMisiones("caso: Mision bloqueada por requisitos de nivel critico y estado fallido en aventura epica", reporteLimite);
}

ejecutarFlujoMisionesRpg();