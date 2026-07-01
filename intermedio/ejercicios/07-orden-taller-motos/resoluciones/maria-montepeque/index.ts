export {};

type EstadoOrden = "pendiente" | "en-proceso" | "completada" | "cancelada";

interface Servicio {
  readonly nombre: string;
  readonly costo: number;
}
interface OrdenTaller {
  readonly id: number;
  readonly moto: string;
  readonly cliente: string;
  readonly mecanico: string;
  readonly estado: EstadoOrden;
  readonly servicios: readonly Servicio[];
}
interface RankingMecanico {
  readonly mecanico: string;
  readonly totalFacturado: number;
  readonly ordenesCompletadas: number;
}

const ordenes: readonly OrdenTaller[] = [
  {
    id: 1,
    moto: "Yamaha FZ 150",
    cliente: "Carlos Ruiz",
    mecanico: "Luis Gómez",
    estado: "completada",
    servicios: [
      { nombre: "Cambio de aceite", costo: 80 },
      { nombre: "Ajuste de cadena", costo: 40 },
    ],
  },
  {
    id: 2,
    moto: "Honda CBR 250",
    cliente: "Ana Pérez",
    mecanico: "Luis Gómez",
    estado: "completada",
    servicios: [{ nombre: "Pastillas de freno", costo: 120 }],
  },
  {
    id: 3,
    moto: "Suzuki GN 125",
    cliente: "Marco Tulio",
    mecanico: "Wendy Sic",
    estado: "en-proceso",
    servicios: [{ nombre: "Revisión de motor", costo: 200 }],
  },
  {
    id: 4,
    moto: "Bajaj Pulsar",
    cliente: "Diego Castro",
    mecanico: "Wendy Sic",
    estado: "completada",
    servicios: [
      { nombre: "Cambio de llantas", costo: 350 },
      { nombre: "Balanceo", costo: 60 },
    ],
  },
  {
    id: 5,
    moto: "Italika FT 150",
    cliente: "Rosa Ixchop",
    mecanico: "Luis Gómez",
    estado: "cancelada",
    servicios: [],
  },
  {
    id: 6,
    moto: "KTM Duke 200",
    cliente: "Erick Alonzo",
    mecanico: "Wendy Sic",
    estado: "pendiente",
    servicios: [{ nombre: "Diagnóstico general", costo: 50 }],
  },
];

const procesarTaller = (lista: readonly OrdenTaller[]) => {
  const invalidas: OrdenTaller[] = [];
  const mapaMecanicos = new Map<
    string,
    { totalFacturado: number; ordenesCompletadas: number }
  >();
  let ordenesValidasCount = 0;

  lista.forEach((o) => {
   
    const esValida =
      o.servicios.length > 0 && o.servicios.every((s) => s.costo >= 0);

    if (!esValida) {
      invalidas.push(o);
      return;
    }

    ordenesValidasCount++;

    if (o.estado === "completada") {
      const costoOrden = o.servicios.reduce((sum, s) => sum + s.costo, 0);
      const acum = mapaMecanicos.get(o.mecanico) ?? {
        totalFacturado: 0,
        ordenesCompletadas: 0,
      };

      mapaMecanicos.set(o.mecanico, {
        totalFacturado: acum.totalFacturado + costoOrden,
        ordenesCompletadas: acum.ordenesCompletadas + 1,
      });
    }
  });

  const ranking: RankingMecanico[] = Array.from(
    mapaMecanicos,
    ([mecanico, datos]) => ({ mecanico, ...datos }),
  ).sort((a, b) => b.totalFacturado - a.totalFacturado);

  return { invalidas, ranking, ordenesValidasCount };
};

// --- Render del Sistema ---
const { invalidas, ranking, ordenesValidasCount } = procesarTaller(ordenes);

console.log(
  `Ejercicio 7: Ordenes de taller de motos\nOrdenes totales: ${ordenes.length}\nOrdenes validas: ${ordenesValidasCount}\nOrdenes invalidas: ${invalidas.length}`,
);
invalidas.forEach((o) =>
  console.log(`  - Orden #${o.id} (${o.moto}) sin servicios validos`),
);

console.log("Ranking de mecanicos por facturacion (ordenes completadas):");
ranking.forEach((m, i) =>
  console.log(
    `${i + 1}. ${m.mecanico} - Q${m.totalFacturado} en ${m.ordenesCompletadas} orden(es)`,
  ),
);
