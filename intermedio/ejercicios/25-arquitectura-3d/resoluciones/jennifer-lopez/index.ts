export {};

type TipoEspacioArquitectura = 'Fachada Exterior' | 'Interior Minimalista' | 'Paisajismo Urbanistico' | 'Espacio Comercial' | 'Seccion Estructural';
type EstadoRender = 'AprobadoCliente' | 'AjusteIluminacion' | 'RevisionGeometrica' | 'Rechazado';

interface FichaRenderArquitectura {
  readonly renderId: string;
  readonly nombreProyecto: string;
  readonly arquitectoResponsable: string;
  readonly tipoEspacio: TipoEspacioArquitectura;
  readonly resolucionMegapixeles: number; // Ej: 33.2 (equivalente a 8K)
  readonly tiempoRenderHoras: number;
  readonly estado: EstadoRender;
}

interface ResumenAgrupadoEspacioArq {
  readonly tipoEspacio: TipoEspacioArquitectura;
  readonly totalRenders: number;
  readonly horasTotalesRender: number;
  readonly promedioMegapixeles: number;
  readonly arquitectosColaboradores: readonly string[];
}

const estudioArquitecturaVoxel: readonly FichaRenderArquitectura[] = [
  {
    renderId: "ARC-301",
    nombreProyecto: "Torre Residencial Brisa Marina",
    arquitectoResponsable: "Aether Vance",
    tipoEspacio: "Fachada Exterior",
    resolucionMegapixeles: 33.2,
    tiempoRenderHoras: 14.5,
    estado: "AprobadoCliente",
  },
  {
    renderId: "ARC-302",
    nombreProyecto: "Penthouse Loft Coyoacán",
    arquitectoResponsable: "Soren Vestergaard",
    tipoEspacio: "Interior Minimalista",
    resolucionMegapixeles: 16.6,
    tiempoRenderHoras: 8.0,
    estado: "AjusteIluminacion",
  },
  {
    renderId: "ARC-303",
    nombreProyecto: "Parque Lineal Metropolitano",
    arquitectoResponsable: "Kenshin Takahashi",
    tipoEspacio: "Paisajismo Urbanistico",
    resolucionMegapixeles: 33.2,
    tiempoRenderHoras: 18.2,
    estado: "AprobadoCliente",
  },
  {
    renderId: "ARC-304",
    nombreProyecto: "Centro Comercial Aura Plaza",
    arquitectoResponsable: "Aether Vance",
    tipoEspacio: "Espacio Comercial",
    resolucionMegapixeles: 24.0,
    tiempoRenderHoras: 11.5,
    estado: "RevisionGeometrica",
  },
  {
    renderId: "ARC-305",
    nombreProyecto: "Museo Subterráneo de Arte",
    arquitectoResponsable: "Soren Vestergaard",
    tipoEspacio: "Seccion Estructural",
    resolucionMegapixeles: 16.6,
    tiempoRenderHoras: 9.0,
    estado: "AprobadoCliente",
  },
  {
    renderId: "ARC-306",
    nombreProyecto: "Pabellón Botánico Experimental",
    arquitectoResponsable: "Kenshin Takahashi",
    tipoEspacio: "Paisajismo Urbanistico",
    resolucionMegapixeles: 8.3,
    tiempoRenderHoras: 4.5,
    estado: "Rechazado",
  }
];

function validarRenderActivo(render: FichaRenderArquitectura): boolean {
  return render.estado !== "Rechazado" && render.tiempoRenderHoras > 0 && render.resolucionMegapixeles > 0;
}

function agruparPorTipoEspacio(renders: readonly FichaRenderArquitectura[]): Record<TipoEspacioArquitectura, readonly FichaRenderArquitectura[]> {
  const estadoInicial: Record<TipoEspacioArquitectura, readonly FichaRenderArquitectura[]> = {
    'Fachada Exterior': [],
    'Interior Minimalista': [],
    'Paisajismo Urbanistico': [],
    'Espacio Comercial': [],
    'Seccion Estructural': [],
  };

  return renders.reduce(
    (acumulado, render) => ({
      ...acumulado,
      [render.tipoEspacio]: [...acumulado[render.tipoEspacio], render],
    }),
    estadoInicial
  );
}

function calcularEstadisticasEspacio(
  tipoEspacio: TipoEspacioArquitectura,
  renders: readonly FichaRenderArquitectura[]
): ResumenAgrupadoEspacioArq {
  const horasTotales = renders.reduce((acc, r) => acc + r.tiempoRenderHoras, 0);
  const megapixelesTotales = renders.reduce((acc, r) => acc + r.resolucionMegapixeles, 0);
  const arquitectosUnicos = Array.from(new Set(renders.map(r => r.arquitectoResponsable)));

  return {
    tipoEspacio,
    totalRenders: renders.length,
    horasTotalesRender: Number(horasTotales.toFixed(1)),
    promedioMegapixeles: Number((megapixelesTotales / renders.length).toFixed(1)),
    arquitectosColaboradores: arquitectosUnicos,
  };
}

function procesarRevisionRenders(renders: readonly FichaRenderArquitectura[]): readonly ResumenAgrupadoEspacioArq[] {
  const rendersValidos = renders.filter(validarRenderActivo);
  const agrupados = agruparPorTipoEspacio(rendersValidos);
  const tiposEspacio = Object.keys(agrupados) as TipoEspacioArquitectura[];

  return tiposEspacio
    .filter(tipo => agrupados[tipo].length > 0)
    .map(tipo => calcularEstadisticasEspacio(tipo, agrupados[tipo]))
    .sort((a, b) => b.horasTotalesRender - a.horasTotalesRender);
}

function imprimirReporteArquitectura(titulo: string, resumen: readonly ResumenAgrupadoEspacioArq[]): void {
  console.log(`=== [REVISIÓN DE RENDERS ARQUITECTURA] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Espacio: ${item.tipoEspacio} | Renders: ${item.totalRenders} | Horas Render: ${item.horasTotalesRender}h | Resolución Promedio: ${item.promedioMegapixeles} MP | Arquitectos: ${item.arquitectosColaboradores.join(', ')}`
    );
  });
  console.log("=================================================================================\n");
}

const reporteArquitecturaOficial = procesarRevisionRenders(estudioArquitecturaVoxel);
imprimirReporteArquitectura("Resumen de Carga de Cómputo por Tipo de Espacio", reporteArquitecturaOficial);

// Caso: Render panorámico fotorrealista de ultra alta definición con coste computacional masivo
const renderCasoUltraHD: readonly FichaRenderArquitectura[] = [
  {
    renderId: "ARC-999",
    nombreProyecto: "Masterplan Metrópolis del Futuro 16K",
    arquitectoResponsable: "Aether Vance",
    tipoEspacio: "Fachada Exterior",
    resolucionMegapixeles: 132.7,
    tiempoRenderHoras: 72.0,
    estado: "AprobadoCliente",
  }
];

const resultadoUltraHD = procesarRevisionRenders(renderCasoUltraHD);
imprimirReporteArquitectura("Caso: Render Panorámico Masivo de Ultra Alta Definición", resultadoUltraHD);