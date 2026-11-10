export {};

type CategoriaComida = "Hamburguesas" | "Tacos" | "Bebidas" | "AcompaÃ±amientos";
type EstadoComanda = "En Cola" | "En Cocina" | "Listo para Entrega" | "Entregado";

interface ItemMenu {
  readonly id: string;
  readonly nombre: string;
  readonly categoria: CategoriaComida;
  readonly precioUsd: number;
  readonly tiempoPreparacionMinutos: number;
}

interface ItemPedido {
  readonly item: ItemMenu;
  readonly cantidad: number;
  readonly notasEspeciales?: string;
}

interface PedidoFoodTruck {
  readonly idComanda: string;
  readonly cliente: string;
  readonly estado: EstadoComanda;
  readonly items: readonly ItemPedido[];
}

interface ResumenComanda {
  readonly idComanda: string;
  readonly cliente: string;
  readonly totalPagar: number;
  readonly tiempoEstimadoEsperaMinutos: number;
}

function procesarComanda(pedido: PedidoFoodTruck): ResumenComanda {
  const totalPagar = pedido.items.reduce((acc, p) => acc + p.item.precioUsd * p.cantidad, 0);
  const tiempoEstimado = pedido.items.reduce((acc, p) => acc + p.item.tiempoPreparacionMinutos * Math.ceil(p.cantidad / 2), 0);

  return {
    idComanda: pedido.idComanda,
    cliente: pedido.cliente,
    totalPagar: Number(totalPagar.toFixed(2)),
    tiempoEstimadoEsperaMinutos: tiempoEstimado,
  };
}

const comandaEjemplo: PedidoFoodTruck = {
  idComanda: "CMD-108",
  cliente: "Valeria Gomez",
  estado: "En Cola",
  items: [
    { item: { id: "mn-01", nombre: "Burger Doble Bacon", categoria: "Hamburguesas", precioUsd: 11.5, tiempoPreparacionMinutos: 8 }, cantidad: 2 },
    { item: { id: "mn-02", nombre: "Papas Rusticas Trufadas", categoria: "AcompaÃ±amientos", precioUsd: 4.5, tiempoPreparacionMinutos: 4 }, cantidad: 1 },
    { item: { id: "mn-03", nombre: "Limonada de Menta", categoria: "Bebidas", precioUsd: 3.0, tiempoPreparacionMinutos: 2 }, cantidad: 2 },
  ],
};

console.log("=== PEDIDOS DE FOOD TRUCK ===");
const facturaComanda = procesarComanda(comandaEjemplo);
console.log(`Comanda: ${facturaComanda.idComanda} para ${facturaComanda.cliente}`);
console.log(`Total a cobrar: $${facturaComanda.totalPagar} USD | Tiempo estimado de preparacion: ${facturaComanda.tiempoEstimadoEsperaMinutos} minutos`);