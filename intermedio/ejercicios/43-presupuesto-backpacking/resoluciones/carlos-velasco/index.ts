export {};

// tipos
type CategoriaGasto = 'alojamiento' | 'transporte' | 'comida' | 'ocio';

interface Gasto {
  readonly id: number;
  readonly fecha: Date;
  categoria: CategoriaGasto;
  montoUsd: number;
  descripcion: string;
}

interface ReportePresupuesto {
  totalUsd: number;
  porCategoria: Record<CategoriaGasto, number>;
  diasConGasto: number;
  promedioDiarioUsd: number;
}

// clases
class Presupuesto {
  private readonly gastos: Gasto[] = [];
  constructor(private readonly limiteDiarioUsd: number) {}

  agregar(gasto: Gasto): boolean {
    if (gasto.montoUsd <= 0) return false;
    this.gastos.push(gasto);
    return true;
  }

  reportar(desde: Date, hasta: Date): ReportePresupuesto {
    const periodo = this.gastos.filter((gasto) => gasto.fecha >= desde && gasto.fecha <= hasta);
    const dias = new Set(periodo.map((gasto) => gasto.fecha.toDateString()));

    return {
      totalUsd: Number(periodo.reduce((total, gasto) => total + gasto.montoUsd, 0).toFixed(2)),
      porCategoria: agruparPorCategoria(periodo),
      diasConGasto: dias.size,
      promedioDiarioUsd: dias.size === 0 ? 0 : Number((this.totalPeriodo(periodo) / dias.size).toFixed(2)),
    };
  }

  private totalPeriodo(periodo: Gasto[]): number {
    return periodo.reduce((total, gasto) => total + gasto.montoUsd, 0);
  }

  excedeLimite(reporte: ReportePresupuesto): boolean {
    return reporte.promedioDiarioUsd > this.limiteDiarioUsd;
  }
}

// validacion
function agruparPorCategoria(gastos: Gasto[]): Record<CategoriaGasto, number> {
  return gastos.reduce<Record<CategoriaGasto, number>>((totales, gasto) => {
    totales[gasto.categoria] += gasto.montoUsd;
    return totales;
  }, { alojamiento: 0, transporte: 0, comida: 0, ocio: 0 });
}

// datos
const gastos: Gasto[] = [
  { id: 1, fecha: new Date('2026-11-01'), categoria: 'alojamiento', montoUsd: 22, descripcion: 'Hostal noche 1' },
  { id: 2, fecha: new Date('2026-11-01'), categoria: 'comida', montoUsd: 9.5, descripcion: 'Mercado local' },
  { id: 3, fecha: new Date('2026-11-02'), categoria: 'transporte', montoUsd: 14, descripcion: 'Bus a la sierra' },
  { id: 4, fecha: new Date('2026-11-03'), categoria: 'ocio', montoUsd: -5, descripcion: 'Entrada museo' },
  { id: 5, fecha: new Date('2026-11-03'), categoria: 'comida', montoUsd: 11, descripcion: 'Cena callejera' },
];

// salida
function mostrarResumen(presupuesto: Presupuesto): void {
  console.log('=== Presupuesto backpacking ===');

  gastos.forEach((gasto) => {
    const agregado = presupuesto.agregar(gasto);
    console.log(`Gasto ${gasto.id} ($${gasto.montoUsd}): ${agregado ? 'registrado' : 'rechazado'}`);
  });

  const reporte = presupuesto.reportar(new Date('2026-11-01'), new Date('2026-11-30'));
  console.log(`Total: $${reporte.totalUsd} | Dias con gasto: ${reporte.diasConGasto} | Promedio diario: $${reporte.promedioDiarioUsd}`);
  console.log('Por categoria:', JSON.stringify(reporte.porCategoria));
  console.log(`Excede limite diario: ${presupuesto.excedeLimite(reporte) ? 'si' : 'no'}`);
}

mostrarResumen(new Presupuesto(30));
