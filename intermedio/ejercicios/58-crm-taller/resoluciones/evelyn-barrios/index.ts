export {};

type EstadoOrdenServicio = "Recibida" | "En Reparacion" | "Esperando Repuestos" | "Completada";

interface MotocicletaCliente {
  readonly placa: string;
  readonly marca: string;
  readonly modelo: string;
  readonly anio: number;
}

interface ClienteTaller {
  readonly idCliente: string;
  readonly nombre: string;
  readonly telefono: string;
  readonly moto: MotocicletaCliente;
}

interface OrdenTaller {
  readonly idOrden: string;
  readonly cliente: ClienteTaller;
  readonly motivoIngreso: string;
  readonly costoEstimado: number;
  readonly estado: EstadoOrdenServicio;
}

class CrmTallerMotos {
  private ordenes: OrdenTaller[] = [];

  async registrarOrden(cliente: ClienteTaller, motivo: string, costo: number): Promise<OrdenTaller> {
    await new Promise((resolve) => setTimeout(resolve, 15));

    const nueva: OrdenTaller = {
      idOrden: `ORD-${Date.now().toString().slice(-4)}`,
      cliente,
      motivoIngreso: motivo,
      costoEstimado: costo,
      estado: "Recibida",
    };

    this.ordenes.push(nueva);
    return nueva;
  }

  async actualizarEstado(idOrden: string, nuevoEstado: EstadoOrdenServicio): Promise<OrdenTaller | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    const idx = this.ordenes.findIndex((o) => o.idOrden === idOrden);
    if (idx === -1) return undefined;

    const ordenActualizada: OrdenTaller = {
      ...this.ordenes[idx],
      estado: nuevoEstado,
    };
    this.ordenes[idx] = ordenActualizada;
    return ordenActualizada;
  }

  listarOrdenes(): readonly OrdenTaller[] {
    return [...this.ordenes];
  }
}

async function main() {
  console.log("=== MINI CRM DE TALLER DE MOTOS ASINCRONO ===");
  const crm = new CrmTallerMotos();

  const cliente1: ClienteTaller = {
    idCliente: "cli-01",
    nombre: "Carlos Restrepo",
    telefono: "+57 300 123 4567",
    moto: { placa: "XYZ-89E", marca: "Yamaha", modelo: "MT-09", anio: 2023 },
  };

  const orden = await crm.registrarOrden(cliente1, "Cambio de kit de arrastre y sincronizacion", 380000);
  console.log(`Orden ${orden.idOrden} registrada para ${orden.cliente.nombre} (${orden.cliente.moto.modelo}) - Estado: ${orden.estado}`);

  const ordActualizada = await crm.actualizarEstado(orden.idOrden, "En Reparacion");
  if (ordActualizada) {
    console.log(`Orden ${ordActualizada.idOrden} actualizada a: ${ordActualizada.estado}`);
  }
}

main();
