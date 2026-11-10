export {};

type TipoEspacio = "Residencial" | "Comercial" | "Paisajismo" | "Interiorismo";
type MotorRender = "V-Ray" | "Corona Renderer" | "Unreal Engine 5" | "Blender Cycles";

interface RenderArquitectura {
  readonly id: string;
  readonly proyecto: string;
  readonly espacio: TipoEspacio;
  readonly motor: MotorRender;
  readonly resolucion: "Full HD" | "4K" | "8K";
  readonly tiempoRenderMinutos: number;
  readonly ruidoMuestreoValido: boolean;
  readonly aprobadoCliente: boolean;
}

interface AuditoriaRenders {
  readonly totalRenders: number;
  readonly horasTotalesComputo: number;
  readonly tasaAprobacion: number;
  readonly rendersListosParaEntrega: readonly RenderArquitectura[];
}

function auditarRenders(renders: readonly RenderArquitectura[]): AuditoriaRenders {
  const tiempoMinutosTotal = renders.reduce((acc, r) => acc + r.tiempoRenderMinutos, 0);
  const aprobados = renders.filter((r) => r.ruidoMuestreoValido && r.aprobadoCliente);
  const total = renders.length === 0 ? 1 : renders.length;

  return {
    totalRenders: renders.length,
    horasTotalesComputo: Number((tiempoMinutosTotal / 60).toFixed(1)),
    tasaAprobacion: Number(((aprobados.length / total) * 100).toFixed(1)),
    rendersListosParaEntrega: aprobados,
  };
}

const rendersEdificio: RenderArquitectura[] = [
  { id: "rnd-101", proyecto: "Torre Lumina", espacio: "Comercial", motor: "Corona Renderer", resolucion: "4K", tiempoRenderMinutos: 45, ruidoMuestreoValido: true, aprobadoCliente: true },
  { id: "rnd-102", proyecto: "Penthouse Horizon", espacio: "Interiorismo", motor: "V-Ray", resolucion: "4K", tiempoRenderMinutos: 75, ruidoMuestreoValido: true, aprobadoCliente: false },
  { id: "rnd-103", proyecto: "Parque Metropolitano", espacio: "Paisajismo", motor: "Unreal Engine 5", resolucion: "Full HD", tiempoRenderMinutos: 20, ruidoMuestreoValido: true, aprobadoCliente: true },
];

console.log("=== CONTROL DE CALIDAD RENDERS DE ARQUITECTURA ===");
const reporteRenders = auditarRenders(rendersEdificio);
console.log(`Lote revisado: ${reporteRenders.totalRenders} renders | Tiempo de granja de render: ${reporteRenders.horasTotalesComputo} horas`);
console.log(`Aprobacion final cliente: ${reporteRenders.tasaAprobacion}%`);
console.log("Archivos aprobados para entrega final:", reporteRenders.rendersListosParaEntrega.map((r) => `${r.id} (${r.proyecto})`).join(", "));