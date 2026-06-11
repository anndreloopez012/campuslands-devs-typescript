export {};

interface Destino {
  nombre: string;
  pais: string;
  precio: number;
}

const destinos: Destino[] = [
  {
    nombre: "Antigua Guatemala",
    pais: "Guatemala",
    precio: 300,
  },
  {
    nombre: "Cancún",
    pais: "México",
    precio: 700,
  },
  {
    nombre: "Cartagena",
    pais: "Colombia",
    precio: 550,
  },
];

function filtrarPorPresupuesto(
  destinos: Destino[],
  presupuestoMaximo: number
): Destino[] {
  return destinos.filter(
    (destino) => destino.precio <= presupuestoMaximo
  );
}

function formatearDestino(destino: Destino): string {
  return `${destino.nombre} - ${destino.pais} (USD ${destino.precio})`;
}

const presupuestoDisponible = 600;

const destinosDisponibles = filtrarPorPresupuesto(
  destinos,
  presupuestoDisponible
);

console.log(`Destinos disponibles con USD ${presupuestoDisponible}:`);

destinosDisponibles.forEach((destino) =>
  console.log(formatearDestino(destino))
);
