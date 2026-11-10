export {};

type EstadoNodoRender = "Libre" | "Renderizando" | "En Pausa" | "Error";

interface TareaRender3D {
  readonly idTarea: string;
  readonly proyecto: string;
  readonly cantidadFrames: number;
  readonly gpuRequeridaVramGb: number;
  readonly tiempoEstimadoPorFrameMinutos: number;
}

class RenderFarmCluster<T extends TareaRender3D> {
  private colaTareas: T[] = [];
  private readonly totalNodosGpu: number;

  constructor(nodosGpu: number) {
    this.totalNodosGpu = nodosGpu;
  }

  encolarTarea(tarea: T): void {
    this.colaTareas.push(tarea);
  }

  calcularTiempoTotalEstimadoMinutos(): number {
    const minutosTotalesBrutos = this.colaTareas.reduce(
      (acc, t) => acc + t.cantidadFrames * t.tiempoEstimadoPorFrameMinutos,
      0
    );
    const nodos = this.totalNodosGpu === 0 ? 1 : this.totalNodosGpu;
    return Number((minutosTotalesBrutos / nodos).toFixed(1));
  }

  obtenerFramesTotales(): number {
    return this.colaTareas.reduce((acc, t) => acc + t.cantidadFrames, 0);
  }
}

const farm = new RenderFarmCluster<TareaRender3D>(4);
farm.encolarTarea({ idTarea: "rnd-01", proyecto: "Cinematica SciFi", cantidadFrames: 300, gpuRequeridaVramGb: 12, tiempoEstimadoPorFrameMinutos: 1.5 });
farm.encolarTarea({ idTarea: "rnd-02", proyecto: "Comercial Calzado 3D", cantidadFrames: 120, gpuRequeridaVramGb: 8, tiempoEstimadoPorFrameMinutos: 2.0 });

console.log("=== GESTOR DE RENDER FARM 3D ===");
console.log(`Frames totales en procesamiento: ${farm.obtenerFramesTotales()}`);
console.log(`Tiempo estimado de render distribuido (4 nodos): ${farm.calcularTiempoTotalEstimadoMinutos()} minutos`);