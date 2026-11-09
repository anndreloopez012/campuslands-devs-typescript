export {};

type EstadoOrden = "Ingresada" | "En DiagnÃ³stico" | "ReparaciÃ³n" | "Finalizada" | "Entregada";
type TipoServicio = "Mantenimiento Preventivo" | "Frenos" | "Ajuste de VÃ¡lvulas" | "Kit de Arrastre";

interface ItemServicio {
  readonly descripcion: string;
  readonly tipo: TipoServicio;
  readonly costoManoObra: number;
  readonly costoRepuestos: number;
}

interface OrdenTaller {
  readonly numeroOrden: string;
  readonly placaMoto: string;
  readonly propietario: string;
  readonly estado: EstadoOrden;
  readonly servicios: readonly ItemServicio[];
}

interface FacturaOrden {
  readonly numeroOrden: string;
  readonly totalManoObra: number;
  readonly totalRepuestos: number;
  readonly subtotal: number;
  readonly iva: number;
  readonly totalFinal: number;
}

function calcularFactura(orden: OrdenTaller): FacturaOrden {
  const totalManoObra = orden.servicios.reduce((acc, s) => acc + s.costoManoObra, 0);
  const totalRepuestos = orden.servicios.reduce((acc, s) => acc + s.costoRepuestos, 0);
  const subtotal = totalManoObra + totalRepuestos;
  const iva = Number((subtotal * 0.19).toFixed(2));
  const totalFinal = Number((subtotal + iva).toFixed(2));

  return {
    numeroOrden: orden.numeroOrden,
    totalManoObra,
    totalRepuestos,
    subtotal,
    iva,
    totalFinal,
  };
}

const ordenesEjemplo: OrdenTaller[] = [
  {
    numeroOrden: "OT-2026-001",
    placaMoto: "XYZ-789",
    propietario: "Carlos Mendoza",
    estado: "Finalizada",
    servicios: [
      { descripcion: "Cambio de aceite y filtro", tipo: "Mantenimiento Preventivo", costoManoObra: 35, costoRepuestos: 55 },
      { descripcion: "Pastillas de freno delanteras", tipo: "Frenos", costoManoObra: 25, costoRepuestos: 40 },
    ],
  },
];

console.log("=== Ã“RDENES DE TALLER DE MOTOS ===");
ordenesEjemplo.forEach((orden) => {
  const fac = calcularFactura(orden);
  console.log(`Orden ${fac.numeroOrden} (${orden.placaMoto}) - Subtotal: $${fac.subtotal} | IVA: $${fac.iva} | Total: $${fac.totalFinal}`);
});
