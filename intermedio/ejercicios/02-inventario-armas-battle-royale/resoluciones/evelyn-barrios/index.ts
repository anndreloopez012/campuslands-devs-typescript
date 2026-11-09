export {};

type Rareza = "Común" | "Rara" | "Épica" | "Legendaria";
type TipoItem = "Arma" | "Curación" | "Escudo" | "Munición";

interface ItemInventario {
  readonly id: string;
  readonly nombre: string;
  readonly tipo: TipoItem;
  readonly rareza: Rareza;
  readonly peso: number;
  readonly cantidad: number;
}

interface EstadoMochila {
  readonly capacidadMaxima: number;
  readonly pesoActual: number;
  readonly slotsOcupados: number;
  readonly slotsMaximos: number;
  readonly items: readonly ItemInventario[];
}

function calcularPesoTotal(items: readonly ItemInventario[]): number {
  return items.reduce((acc, item) => acc + item.peso * item.cantidad, 0);
}

function puedeEquiparItem(mochila: EstadoMochila, nuevoItem: ItemInventario): boolean {
  if (mochila.slotsOcupados >= mochila.slotsMaximos) {
    return false;
  }
  const pesoFinal = mochila.pesoActual + nuevoItem.peso * nuevoItem.cantidad;
  return pesoFinal <= mochila.capacidadMaxima;
}

function agregarItem(mochila: EstadoMochila, item: ItemInventario): EstadoMochila {
  if (!puedeEquiparItem(mochila, item)) {
    throw new Error(`Capacidad excedida: No se puede agregar ${item.nombre}.`);
  }

  const itemsActualizados = [...mochila.items, item];
  return {
    ...mochila,
    pesoActual: calcularPesoTotal(itemsActualizados),
    slotsOcupados: itemsActualizados.length,
    items: itemsActualizados,
  };
}

function filtrarPorRareza(mochila: EstadoMochila, rareza: Rareza): ItemInventario[] {
  return mochila.items.filter((item) => item.rareza === rareza);
}

let mochilaJugador: EstadoMochila = {
  capacidadMaxima: 50,
  pesoActual: 0,
  slotsOcupados: 0,
  slotsMaximos: 5,
  items: [],
};

const itemsDisponibles: ItemInventario[] = [
  { id: "itm-01", nombre: "Fusil de Asalto SCAR", tipo: "Arma", rareza: "Legendaria", peso: 8, cantidad: 1 },
  { id: "itm-02", nombre: "Escopeta de Bomba", tipo: "Arma", rareza: "Épica", peso: 6, cantidad: 1 },
  { id: "itm-03", nombre: "Botiquín Médico", tipo: "Curación", rareza: "Rara", peso: 4, cantidad: 2 },
  { id: "itm-04", nombre: "Mini Poción de Escudo", tipo: "Escudo", rareza: "Común", peso: 2, cantidad: 3 },
];

for (const item of itemsDisponibles) {
  if (puedeEquiparItem(mochilaJugador, item)) {
    mochilaJugador = agregarItem(mochilaJugador, item);
  }
}

console.log("=== INVENTARIO TÁCTICO BATTLE ROYALE ===");
console.log(`Slots: ${mochilaJugador.slotsOcupados}/${mochilaJugador.slotsMaximos}`);
console.log(`Peso: ${mochilaJugador.pesoActual}/${mochilaJugador.capacidadMaxima} kg`);
console.log("Items Legendarios:", filtrarPorRareza(mochilaJugador, "Legendaria").map((i) => i.nombre));
