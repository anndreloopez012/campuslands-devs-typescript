export {};

type NivelRenderizado = "Planimetria 2D" | "Render Fotorrealista" | "Animacion Recorrido Virtual 4K";

interface EspecificacionEspacioDTO {
  readonly ambiente: string;
  readonly areaMetrosCuadrados: number;
  readonly nivelAcabado: "Estandar" | "Premium" | "Lujo";
}

interface ProyectoArquitecturaDTO {
  readonly idProyecto: string;
  readonly cliente: string;
  readonly tipoRender: NivelRenderizado;
  readonly espacios: readonly EspecificacionEspacioDTO[];
  readonly costoMetroCuadradoDisenoUsd: number;
}

interface CotizacionFinalReporte {
  readonly idProyecto: string;
  readonly areaTotalM2: number;
  readonly costoDisenoArquitectonicoUsd: number;
  readonly recargoRenderizadoUsd: number;
  readonly valorTotalProyectoUsd: number;
}

class CotizadorArquitectura3D {
  generarCotizacion(proyecto: ProyectoArquitecturaDTO): CotizacionFinalReporte {
    const areaTotal = proyecto.espacios.reduce((acc, e) => acc + e.areaMetrosCuadrados, 0);
    const costoBase = areaTotal * proyecto.costoMetroCuadradoDisenoUsd;

    const recargoRender =
      proyecto.tipoRender === "Animacion Recorrido Virtual 4K"
        ? 2500
        : proyecto.tipoRender === "Render Fotorrealista"
        ? 1200
        : 400;

    return {
      idProyecto: proyecto.idProyecto,
      areaTotalM2: areaTotal,
      costoDisenoArquitectonicoUsd: costoBase,
      recargoRenderizadoUsd: recargoRender,
      valorTotalProyectoUsd: costoBase + recargoRender,
    };
  }
}

function main() {
  console.log("=== COTIZADOR ARQUITECTURA 3D (DTO & REPORTES) ===");
  const cotizador = new CotizadorArquitectura3D();

  const proyectoResidencial: ProyectoArquitecturaDTO = {
    idProyecto: "ARQ-2026-90",
    cliente: "Constructora Vanguardia",
    tipoRender: "Animacion Recorrido Virtual 4K",
    costoMetroCuadradoDisenoUsd: 45,
    espacios: [
      { ambiente: "Master Suite", areaMetrosCuadrados: 40, nivelAcabado: "Lujo" },
      { ambiente: "Living & Sala de Estar", areaMetrosCuadrados: 65, nivelAcabado: "Premium" },
      { ambiente: "Cocina Abierta e Isla", areaMetrosCuadrados: 30, nivelAcabado: "Lujo" },
      { ambiente: "Terraza Panoramica", areaMetrosCuadrados: 35, nivelAcabado: "Premium" },
    ],
  };

  const cotizacion = cotizador.generarCotizacion(proyectoResidencial);
  console.log(`Proyecto ${cotizacion.idProyecto} para ${proyectoResidencial.cliente}:`);
  console.log(`- Area cubierta total: ${cotizacion.areaTotalM2} m²`);
  console.log(`- Diseno arquitectonico: $${cotizacion.costoDisenoArquitectonicoUsd.toLocaleString()} USD`);
  console.log(`- Paquete visual: ${proyectoResidencial.tipoRender} ($${cotizacion.recargoRenderizadoUsd.toLocaleString()} USD)`);
  console.log(`- Presupuesto total: $${cotizacion.valorTotalProyectoUsd.toLocaleString()} USD`);
}

main();
