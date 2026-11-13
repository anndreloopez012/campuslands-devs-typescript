export {};

type CategoriaGasto = 'Alojamiento' | 'Transporte' | 'Alimentacion' | 'Actividades' | 'Varios';
type MonedaLocal = 'USD' | 'EUR' | 'GTQ';

interface ItemGastoViaje {
  readonly idGasto: string;
  readonly descripcion: string;
  readonly categoria: CategoriaGasto;
  readonly monto: number;
  readonly moneda: MonedaLocal;
  readonly fecha: string; 
  readonly esEsencial: boolean;
}

interface FichaPresupuestoBackpacking {
  readonly viajeId: string;
  readonly destino: string;
  readonly presupuestoMaximoUSD: number;
  readonly gastos: readonly ItemGastoViaje[];
}

interface ResumenReportePresupuesto {
  readonly destinoViaje: string;
  readonly presupuestoTotalUSD: number;
  readonly gastoTotalUSD: number;
  readonly saldoRestanteUSD: number;
  readonly estadoFinanciero: 'Saludable' | 'Alerta' | 'Excedido';
  readonly porcentajeEjecucion: number;
}

const registroPresupuestosMochilero: readonly FichaPresupuestoBackpacking[] = [
  {
    viajeId: "BP-4301",
    destino: "Sudeste Asiatico (Tailandia - Vietnam)",
    presupuestoMaximoUSD: 1200.0,
    gastos: [
      { idGasto: "G-01", descripcion: "Hostel en Bangkok", categoria: "Alojamiento", monto: 150.0, moneda: "USD", fecha: "2026-06-01", esEsencial: true },
      { idGasto: "G-02", descripcion: "Vuelo interno Bangkok-Chiang Mai", categoria: "Transporte", monto: 65.0, moneda: "USD", fecha: "2026-06-05", esEsencial: true },
      { idGasto: "G-03", descripcion: "Street food y mercados", categoria: "Alimentacion", monto: 200.0, moneda: "USD", fecha: "2026-06-10", esEsencial: true },
      { idGasto: "G-04", descripcion: "Excursion de buceo en Koh Tao", categoria: "Actividades", monto: 120.0, moneda: "USD", fecha: "2026-06-15", esEsencial: false }
    ]
  },
  {
    viajeId: "BP-4302",
    destino: "Ruta Andina (Peru - Bolivia)",
    presupuestoMaximoUSD: 950.0,
    gastos: [
      { idGasto: "G-05", descripcion: "Hostels en Cusco y La Paz", categoria: "Alojamiento", monto: 180.0, moneda: "USD", fecha: "2026-07-01", esEsencial: true },
      { idGasto: "G-06", descripcion: "Tren a Machu Picchu", categoria: "Transporte", monto: 150.0, moneda: "USD", fecha: "2026-07-04", esEsencial: true },
      { idGasto: "G-07", descripcion: "Menus locales y viveres", categoria: "Alimentacion", monto: 220.0, moneda: "USD", fecha: "2026-07-08", esEsencial: true },
      { idGasto: "G-08", descripcion: "Tour Salar de Uyuni", categoria: "Actividades", monto: 130.0, moneda: "USD", fecha: "2026-07-12", esEsencial: true }
    ]
  },
  {
    viajeId: "BP-4303",
    destino: "Europa Low Cost (Balcanes)",
    presupuestoMaximoUSD: 1500.0,
    gastos: [
      { idGasto: "G-09", descripcion: "Hostels en Albania y Montenegro", categoria: "Alojamiento", monto: 450.0, moneda: "USD", fecha: "2026-08-01", esEsencial: true },
      { idGasto: "G-10", descripcion: "Buses regionales", categoria: "Transporte", monto: 200.0, moneda: "USD", fecha: "2026-08-05", esEsencial: true }
    ]
  },
  {
    viajeId: "BP-4304",
    destino: "Centroamerica mochilera (Guatemala - El Salvador)",
    presupuestoMaximoUSD: 600.0,
    gastos: [
      { idGasto: "G-11", descripcion: "Hostels en Antigua y El Tunco", categoria: "Alojamiento", monto: 140.0, moneda: "USD", fecha: "2026-09-01", esEsencial: true },
      { idGasto: "G-12", descripcion: "Shuttles turisticos", categoria: "Transporte", monto: 90.0, moneda: "USD", fecha: "2026-09-03", esEsencial: true }
    ]
  },
  {
    viajeId: "BP-4305",
    destino: "Patagonia Austral",
    presupuestoMaximoUSD: 1800.0,
    gastos: [
      { idGasto: "G-13", descripcion: "Refugios de montana", categoria: "Alojamiento", monto: 500.0, moneda: "USD", fecha: "2026-10-01", esEsencial: true },
      { idGasto: "G-14", descripcion: "Buses de larga distancia", categoria: "Transporte", monto: 350.0, moneda: "USD", fecha: "2026-10-04", esEsencial: true }
    ]
  }
];

class GestorPresupuestoBackpacking<T extends FichaPresupuestoBackpacking> {
  private readonly presupuestos: readonly T[];

  constructor(presupuestos: readonly T[]) {
    this.presupuestos = presupuestos;
  }

  public validarViaje(viaje: T): boolean {
    return viaje.presupuestoMaximoUSD > 0 && viaje.gastos.length > 0;
  }

  public calcularGastoTotal(gastos: readonly ItemGastoViaje[]): number {
    return gastos.reduce((acumulado, gasto) => acumulado + gasto.monto, 0);
  }

  public procesarReportes(): readonly ResumenReportePresupuesto[] {
    return this.presupuestos
      .filter(viaje => this.validarViaje(viaje))
      .map(viaje => {
        const totalGastado = this.calcularGastoTotal(viaje.gastos);
        const saldoRestante = viaje.presupuestoMaximoUSD - totalGastado;
        const porcentaje = Number(((totalGastado / viaje.presupuestoMaximoUSD) * 100).toFixed(1));

        let estado: 'Saludable' | 'Alerta' | 'Excedido' = 'Saludable';
        if (porcentaje > 100) {
          estado = 'Excedido';
        } else if (porcentaje > 80) {
          estado = 'Alerta';
        }

        return {
          destinoViaje: viaje.destino,
          presupuestoTotalUSD: viaje.presupuestoMaximoUSD,
          gastoTotalUSD: totalGastado,
          saldoRestanteUSD: Number(saldoRestante.toFixed(2)),
          estadoFinanciero: estado,
          porcentajeEjecucion: porcentaje,
        };
      })
      .sort((a, b) => b.porcentajeEjecucion - a.porcentajeEjecucion);
  }
}

function imprimirReportePresupuestos(titulo: string, reportes: readonly ResumenReportePresupuesto[]): void {
  console.log(`=== [PRESUPUESTO BACKPACKING - VIAJES] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Destino: ${item.destinoViaje} | Presupuesto: $${item.presupuestoTotalUSD} | Gastado: $${item.gastoTotalUSD} | Saldo: $${item.saldoRestanteUSD} | Ejecución: ${item.porcentajeEjecucion}% | Estado: ${item.estadoFinanciero}`
    );
  });
  console.log("===================================================================================================================\n");
}

const gestorOficial = new GestorPresupuestoBackpacking(registroPresupuestosMochilero);
const reporteOficial = gestorOficial.procesarReportes();
imprimirReportePresupuestos("Control General de Gastos de Viaje", reporteOficial);

// Caso límite: Viaje mochilero con presupuesto ajustado y gastos excesivos que superan el limite maximo
const viajeCasoLimite: readonly FichaPresupuestoBackpacking[] = [
  {
    viajeId: "BP-9999",
    destino: "Islas Exoticas Lujo Oculto",
    presupuestoMaximoUSD: 500.0,
    gastos: [
      { idGasto: "G-99", descripcion: "Hotel Boutique Privado", categoria: "Alojamiento", monto: 450.0, moneda: "USD", fecha: "2026-12-01", esEsencial: false },
      { idGasto: "G-100", descripcion: "Vuelos Privados y Tours VIP", categoria: "Actividades", monto: 200.0, moneda: "USD", fecha: "2026-12-02", esEsencial: false }
    ]
  }
];

const gestorLimite = new GestorPresupuestoBackpacking(viajeCasoLimite);
const reporteLimite = gestorLimite.procesarReportes();
imprimirReportePresupuestos("Caso: Gasto Excesivo que Supera el Presupuesto Maximo", reporteLimite);