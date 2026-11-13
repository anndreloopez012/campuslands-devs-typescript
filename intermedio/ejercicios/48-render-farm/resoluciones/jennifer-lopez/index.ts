export {};

type MotorRender = 'Cycles' | 'Eevee' | 'Arnold' | 'V-Ray' | 'Redshift';
type CalificativoResolucion = 'HD_1080p' | 'UHD_4K' | 'IMAX_8K';
type EstadoRender = 'Completado' | 'EnCola' | 'FallidoPorMemoria' | 'Cancelado';

interface TareaFrame {
  readonly frameId: string;
  readonly numeroFrame: number;
  readonly motor: MotorRender;
  readonly resolucion: CalificativoResolucion;
  readonly tiempoRenderSegundos: number;
  readonly consumoVramGb: number;
  readonly estado: EstadoRender;
}

interface ProyectoAnimacion3D {
  readonly proyectoId: string;
  readonly nombreProyecto: string;
  readonly artistaSupervisor: string;
  readonly framesRegistrados: readonly TareaFrame[];
}

interface ReporteRenderFarm {
  readonly proyecto: string;
  readonly supervisor: string;
  readonly totalFramesExitosos: number;
  readonly tiempoTotalRenderMin: number;
  readonly vramPromedioGb: number;
  readonly estadoGranja: 'Optimizado' | 'Pesado' | 'Critico';
}

const registroProyectosRender: readonly ProyectoAnimacion3D[] = [
  {
    proyectoId: "RF-4801",
    nombreProyecto: "Secuencia Abisal Submarina",
    artistaSupervisor: "Aethelgard Vance",
    framesRegistrados: [
      { frameId: "FR-01", numeroFrame: 101, motor: "Cycles", resolucion: "UHD_4K", tiempoRenderSegundos: 145, consumoVramGb: 14.2, estado: "Completado" },
      { frameId: "FR-02", numeroFrame: 102, motor: "Cycles", resolucion: "UHD_4K", tiempoRenderSegundos: 160, consumoVramGb: 15.0, estado: "Completado" },
      { frameId: "FR-03", numeroFrame: 103, motor: "Arnold", resolucion: "IMAX_8K", tiempoRenderSegundos: 310, consumoVramGb: 22.5, estado: "Completado" }
    ]
  },
  {
    proyectoId: "RF-4802",
    nombreProyecto: "Vuelo de Drones Cyberpunk",
    artistaSupervisor: "Lysandra Kurosaki",
    framesRegistrados: [
      { frameId: "FR-04", numeroFrame: 201, motor: "Redshift", resolucion: "HD_1080p", tiempoRenderSegundos: 45, consumoVramGb: 8.5, estado: "Completado" },
      { frameId: "FR-05", numeroFrame: 202, motor: "Redshift", resolucion: "HD_1080p", tiempoRenderSegundos: 48, consumoVramGb: 8.8, estado: "Completado" }
    ]
  },
  {
    proyectoId: "RF-4803",
    nombreProyecto: "Metamorfosis Organica Biomecanica",
    artistaSupervisor: "Thalassa Althaus",
    framesRegistrados: [
      { frameId: "FR-06", numeroFrame: 301, motor: "V-Ray", resolucion: "UHD_4K", tiempoRenderSegundos: 210, consumoVramGb: 18.0, estado: "Completado" },
      { frameId: "FR-07", numeroFrame: 302, motor: "V-Ray", resolucion: "UHD_4K", tiempoRenderSegundos: 230, consumoVramGb: 19.2, estado: "Completado" }
    ]
  },
  {
    proyectoId: "RF-4804",
    nombreProyecto: "Colapso Estelar Cosmico",
    artistaSupervisor: "Zephyrin Moreau",
    framesRegistrados: [
      { frameId: "FR-08", numeroFrame: 401, motor: "Cycles", resolucion: "IMAX_8K", tiempoRenderSegundos: 400, consumoVramGb: 23.0, estado: "Completado" }
    ]
  }
];

class AdministradorRenderFarm<T extends ProyectoAnimacion3D> {
  private readonly proyectos: readonly T[];

  constructor(proy: readonly T[]) {
    this.proyectos = proy;
  }

  public validarFrameExitoso(frame: TareaFrame): boolean {
    return frame.estado === "Completado" && frame.tiempoRenderSegundos > 0;
  }

  public calcularTiempoTotalMinutos(frames: readonly TareaFrame[]): number {
    const totalSeg = frames
      .filter(f => this.validarFrameExitoso(f))
      .reduce((acc, f) => acc + f.tiempoRenderSegundos, 0);
    return Number((totalSeg / 60).toFixed(2));
  }

  public calcularVramPromedio(frames: readonly TareaFrame[]): number {
    const exitosos = frames.filter(f => this.validarFrameExitoso(f));
    if (exitosos.length === 0) return 0;
    const suma = exitosos.reduce((acc, f) => acc + f.consumoVramGb, 0);
    return Number((suma / exitosos.length).toFixed(1));
  }

  public procesarReportesGranja(): readonly ReporteRenderFarm[] {
    return this.proyectos
      .map(proj => {
        const framesValidos = proj.framesRegistrados.filter(f => this.validarFrameExitoso(f));
        const tiempoMin = this.calcularTiempoTotalMinutos(proj.framesRegistrados);
        const vramProm = this.calcularVramPromedio(proj.framesRegistrados);

        let estatusGranja: 'Optimizado' | 'Pesado' | 'Critico' = 'Optimizado';
        if (vramProm >= 20.0) {
          estatusGranja = 'Critico';
        } else if (vramProm >= 14.0) {
          estatusGranja = 'Pesado';
        }

        return {
          proyecto: `${proj.nombreProyecto} [${proj.proyectoId}]`,
          supervisor: proj.artistaSupervisor,
          totalFramesExitosos: framesValidos.length,
          tiempoTotalRenderMin: tiempoMin,
          vramPromedioGb: vramProm,
          estadoGranja: estatusGranja,
        };
      })
      .filter(r => r.totalFramesExitosos > 0)
      .sort((a, b) => b.vramPromedioGb - a.vramPromedioGb);
  }
}

function imprimirReporteGranja(titulo: string, reportes: readonly ReporteRenderFarm[]): void {
  console.log(`=== [RENDER FARM 3D - ANIMACION 3D] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Proyecto: ${item.proyecto} | Supervisor: ${item.supervisor} | Frames OK: ${item.totalFramesExitosos} | Render: ${item.tiempoTotalRenderMin} min | VRAM Prom: ${item.vramPromedioGb} GB | Estado: ${item.estadoGranja}`
    );
  });
  console.log("========================================================================================================================\n");
}

const adminGranjaOficial = new AdministradorRenderFarm(registroProyectosRender);
const reporteGranjaOficial = adminGranjaOficial.procesarReportesGranja();
imprimirReporteGranja("Control Oficial de Rendimiento de Render Farm", reporteGranjaOficial);

// caso: Proyecto de animacion con desbordamiento de VRAM y frames fallidos por memoria unicamente
const proyectoCasoLimite: readonly ProyectoAnimacion3D[] = [
  {
    proyectoId: "RF-9999",
    nombreProyecto: "Singularidad Cuantica Hiperdetallada",
    artistaSupervisor: "Cassian Vane",
    framesRegistrados: [
      { frameId: "FR-999", numeroFrame: 999, motor: "Cycles", resolucion: "IMAX_8K", tiempoRenderSegundos: 600, consumoVramGb: 31.5, estado: "FallidoPorMemoria" }
    ]
  }
];

const adminGranjaLimite = new AdministradorRenderFarm(proyectoCasoLimite);
const reporteGranjaLimite = adminGranjaLimite.procesarReportesGranja();
imprimirReporteGranja("caso: Proyecto de animacion con desbordamiento de VRAM y frames fallidos por memoria unicamente", reporteGranjaLimite);