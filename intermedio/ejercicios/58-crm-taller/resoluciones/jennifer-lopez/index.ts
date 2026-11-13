export {};

type TipoServicioTaller = 'MantenimientoPreventivo' | 'ReparacionMotor' | 'SustitucionKitArrastre' | 'FrenosSuspension' | 'DiagnosticoGeneral';
type EstadoOrdenServicio = 'Completado' | 'EnProceso' | 'EsperandoRepuestos' | 'Cancelado';
type NivelFidelidadCliente = 'VIP' | 'Frecuente' | 'Nuevo' | 'Ocasional';

interface ItemRepuesto {
  readonly repuestoId: string;
  readonly nombreRepuesto: string;
  readonly costoUnitarioUSD: number;
  readonly cantidad: number;
}

interface OrdenServicioMoto {
  readonly ordenId: string;
  readonly tipoServicio: TipoServicioTaller;
  readonly costoManoDeObraUSD: number;
  readonly horasEstimadas: number;
  readonly estado: EstadoOrdenServicio;
  readonly repuestosUtilizados: readonly ItemRepuesto[];
}

interface ClienteTallerMoto {
  readonly clienteId: string;
  readonly nombreCompleto: string;
  readonly modeloMotocicleta: string;
  readonly nivelFidelidad: NivelFidelidadCliente;
  readonly ordenesServicio: readonly OrdenServicioMoto[];
}

interface ReporteMiniCrmTaller {
  readonly cliente: string;
  readonly modeloMoto: string;
  readonly fidelidad: NivelFidelidadCliente;
  readonly totalOrdenesCompletadas: number;
  readonly facturacionTotalUSD: number;
  readonly promedioHorasTrabajo: number;
  readonly estatusCuenta: 'Preferencial' | 'Activa' | 'EnRiesgo';
}

const registroClientesTaller: readonly ClienteTallerMoto[] = [
  {
    clienteId: "CRM-5801",
    nombreCompleto: "Zephyrin Sotomayor",
    modeloMotocicleta: "Yamaha Tenere 700 World Raid",
    nivelFidelidad: "VIP",
    ordenesServicio: [
      {
        ordenId: "OS-01",
        tipoServicio: "MantenimientoPreventivo",
        costoManoDeObraUSD: 120,
        horasEstimadas: 3,
        estado: "Completado",
        repuestosUtilizados: [
          { repuestoId: "REP-01", nombreRepuesto: "Aceite Sintetico 10W-50", costoUnitarioUSD: 65, cantidad: 3 },
          { repuestoId: "REP-02", nombreRepuesto: "Filtro de Aceite OEM", costoUnitarioUSD: 18, cantidad: 1 }
        ]
      },
      {
        ordenId: "OS-02",
        tipoServicio: "FrenosSuspension",
        costoManoDeObraUSD: 200,
        horasEstimadas: 5,
        estado: "Completado",
        repuestosUtilizados: [
          { repuestoId: "REP-03", nombreRepuesto: "Pastillas de Freno Sinterizadas", costoUnitarioUSD: 45, cantidad: 2 }
        ]
      }
    ]
  },
  {
    clienteId: "CRM-5802",
    nombreCompleto: "Lysandra Kurosaki",
    modeloMotocicleta: "Honda CB650R Neo Sports Cafe",
    nivelFidelidad: "Frecuente",
    ordenesServicio: [
      {
        ordenId: "OS-03",
        tipoServicio: "SustitucionKitArrastre",
        costoManoDeObraUSD: 150,
        horasEstimadas: 4,
        estado: "Completado",
        repuestosUtilizados: [
          { repuestoId: "REP-04", nombreRepuesto: "Kit de Transmision Cadena O-Ring", costoUnitarioUSD: 180, cantidad: 1 }
        ]
      }
    ]
  },
  {
    clienteId: "CRM-5803",
    nombreCompleto: "Thalassa Vane",
    modeloMotocicleta: "Kawasaki Z900 Performance",
    nivelFidelidad: "Ocasional",
    ordenesServicio: [
      {
        ordenId: "OS-04",
        tipoServicio: "DiagnosticoGeneral",
        costoManoDeObraUSD: 90,
        horasEstimadas: 2,
        estado: "EnProceso",
        repuestosUtilizados: []
      }
    ]
  },
  {
    clienteId: "CRM-5804",
    nombreCompleto: "Cassian Moreau",
    modeloMotocicleta: "BMW R 1250 GS Adventure",
    nivelFidelidad: "VIP",
    ordenesServicio: [
      {
        ordenId: "OS-05",
        tipoServicio: "ReparacionMotor",
        costoManoDeObraUSD: 450,
        horasEstimadas: 12,
        estado: "Completado",
        repuestosUtilizados: [
          { repuestoId: "REP-05", nombreRepuesto: "Juego de Juntas de Culata", costoUnitarioUSD: 120, cantidad: 1 }
        ]
      }
    ]
  }
];

class GestorMiniCrmTaller<T extends ClienteTallerMoto> {
  private readonly clientes: readonly T[];

  constructor(clientes: readonly T[]) {
    this.clientes = clientes;
  }

  public async validarClienteCrmAsync(cliente: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!cliente.clienteId || !cliente.nombreCompleto) {
          reject(new Error(`Cliente de taller inválido o sin identificación: ${cliente.clienteId}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public calcularFacturacionOrden(orden: OrdenServicioMoto): number {
    const costoRepuestos = orden.repuestosUtilizados.reduce(
      (acc, rep) => acc + (rep.costoUnitarioUSD * rep.cantidad),
      0
    );
    return orden.costoManoDeObraUSD + costoRepuestos;
  }

  public calcularFacturacionTotalCliente(ordenes: readonly OrdenServicioMoto[]): number {
    return ordenes
      .filter(o => o.estado === "Completado")
      .reduce((acc, o) => acc + this.calcularFacturacionOrden(o), 0);
  }

  public calcularPromedioHoras(ordenes: readonly OrdenServicioMoto[]): number {
    const completadas = ordenes.filter(o => o.estado === "Completado");
    if (completadas.length === 0) return 0;
    const sumaHoras = completadas.reduce((acc, o) => acc + o.horasEstimadas, 0);
    return Number((sumaHoras / completadas.length).toFixed(1));
  }

  public async procesarReportesCrmAsync(): Promise<readonly ReporteMiniCrmTaller[]> {
    const reportes: ReporteMiniCrmTaller[] = [];

    for (const cliente of this.clientes) {
      try {
        await this.validarClienteCrmAsync(cliente);
        const ordenesCompletadas = cliente.ordenesServicio.filter(o => o.estado === "Completado").length;
        const facturacionTotal = this.calcularFacturacionTotalCliente(cliente.ordenesServicio);
        const promedioHoras = this.calcularPromedioHoras(cliente.ordenesServicio);

        const tieneCanceladas = cliente.ordenesServicio.some(o => o.estado === "Cancelado");

        let estatus: 'Preferencial' | 'Activa' | 'EnRiesgo' = 'Activa';
        if (tieneCanceladas) {
          estatus = 'EnRiesgo';
        } else if (cliente.nivelFidelidad === "VIP" && facturacionTotal >= 500) {
          estatus = 'Preferencial';
        }

        reportes.push({
          cliente: `${cliente.nombreCompleto} [${cliente.clienteId}]`,
          modeloMoto: cliente.modeloMotocicleta,
          fidelidad: cliente.nivelFidelidad,
          totalOrdenesCompletadas: ordenesCompletadas,
          facturacionTotalUSD: facturacionTotal,
          promedioHorasTrabajo: promedioHoras,
          estatusCuenta: estatus,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[CRM Taller Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => b.facturacionTotalUSD - a.facturacionTotalUSD);
  }
}

function imprimirReporteMiniCrm(titulo: string, reportes: readonly ReporteMiniCrmTaller[]): void {
  console.log(`=== [MINI CRM DE TALLER - MOTOS Y MECANICA] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Cliente: ${item.cliente} | Moto: ${item.modeloMoto} | Fidelidad: ${item.fidelidad} | Órdenes OK: ${item.totalOrdenesCompletadas} | Facturación: $${item.facturacionTotalUSD} | Horas Prom: ${item.promedioHorasTrabajo}h | Estatus: ${item.estatusCuenta}`
    );
  });
  console.log("====================================================================================================================\n");
}

async function ejecutarFlujoMiniCrmTaller(): Promise<void> {
  const crmOficial = new GestorMiniCrmTaller(registroClientesTaller);
  const reporteOficial = await crmOficial.procesarReportesCrmAsync();
  imprimirReporteMiniCrm("Reporte Oficial de Clientes y Facturación en Taller", reporteOficial);

  // caso: Cliente con ordenes canceladas y cuenta catalogada en riesgo por incidencias
  const clienteCasoLimite: readonly ClienteTallerMoto[] = [
    {
      clienteId: "CRM-9999",
      nombreCompleto: "Orion Sterling",
      modeloMotocicleta: "Custom Chopper Abandonada",
      nivelFidelidad: "Ocasional",
      ordenesServicio: [
        {
          ordenId: "OS-99",
          tipoServicio: "ReparacionMotor",
          costoManoDeObraUSD: 300,
          horasEstimadas: 10,
          estado: "Cancelado",
          repuestosUtilizados: []
        }
      ]
    }
  ];

  const crmLimite = new GestorMiniCrmTaller(clienteCasoLimite);
  const reporteLimite = await crmLimite.procesarReportesCrmAsync();
  imprimirReporteMiniCrm("caso: Cliente con ordenes canceladas y cuenta catalogada en riesgo por incidencias", reporteLimite);
}

ejecutarFlujoMiniCrmTaller();