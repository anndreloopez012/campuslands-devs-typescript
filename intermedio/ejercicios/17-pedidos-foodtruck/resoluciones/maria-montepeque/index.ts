export {};

type EstadoPedido = "pendiente" | "preparando" | "entregado" | "cancelado";

interface ItemPedido {
  readonly producto: string;
  readonly cantidad: number;
  readonly precioUnitario: number;
}

interface Pedido {
  readonly id: number;
  readonly cliente: string;
  readonly estado: EstadoPedido;
  readonly items: readonly ItemPedido[];
}

interface PedidoCalculado {
  readonly id: number;
  readonly cliente: string;
  readonly estado: EstadoPedido;
  readonly subtotal: number;
  readonly propina: number;
  readonly total: number;
}

const PORCENTAJE_PROPINA = 0.1;

const pedidos: readonly Pedido[] = [
  { id: 1, cliente: "Sofia", estado: "entregado", items: [{ producto: "Taco al pastor", cantidad: 3, precioUnitario: 2.5 }, { producto: "Horchata", cantidad: 1, precioUnitario: 2 }] },
  { id: 2, cliente: "Mateo", estado: "preparando", items: [{ producto: "Burrito", cantidad: 2, precioUnitario: 6 }] },
  { id: 3, cliente: "Valeria", estado: "pendiente", items: [{ producto: "Nachos", cantidad: 1, precioUnitario: 5.5 }, { producto: "Limonada", cantidad: 2, precioUnitario: 2.25 }] },
  { id: 4, cliente: "Diego", estado: "cancelado", items: [{ producto: "Quesadilla", cantidad: 1, precioUnitario: 4 }] },
  { id: 5, cliente: "", estado: "pendiente", items: [{ producto: "Taco", cantidad: 1, precioUnitario: 2.5 }] },
  { id: 6, cliente: "Camila", estado: "pendiente", items: [{ producto: "Combo", cantidad: 0, precioUnitario: 8 }] },
];

const esPedidoValido = (pedido: Pedido): boolean =>
  pedido.cliente.trim().length > 0 &&
  pedido.items.length > 0 &&
  pedido.items.every((item) => item.cantidad > 0 && item.precioUnitario > 0);

const redondear = (valor: number): number => Math.round(valor * 100) / 100;

const calcularPedido = (pedido: Pedido): PedidoCalculado => {
  const subtotal = pedido.items.reduce(
    (acc, item) => acc + item.cantidad * item.precioUnitario,
    0,
  );
  const propina = subtotal * PORCENTAJE_PROPINA;

  return {
    id: pedido.id,
    cliente: pedido.cliente,
    estado: pedido.estado,
    subtotal: redondear(subtotal),
    propina: redondear(propina),
    total: redondear(subtotal + propina),
  };
};

const validos = pedidos.filter(esPedidoValido);
const invalidos = pedidos.filter((pedido) => !esPedidoValido(pedido));
const calculados = validos.map(calcularPedido);
const ventas = calculados
  .filter((pedido) => pedido.estado !== "cancelado")
  .reduce((acc, pedido) => acc + pedido.total, 0);

console.log("Ejercicio 17: Pedidos de food truck");
console.log(`Pedidos validos: ${validos.length} | invalidos: ${invalidos.length}`);
invalidos.forEach((pedido) =>
  console.log(`  - #${pedido.id} tiene datos invalidos`),
);
calculados.forEach((pedido) =>
  console.log(
    `  #${pedido.id} ${pedido.cliente} [${pedido.estado}] subtotal ${pedido.subtotal} + propina ${pedido.propina} = ${pedido.total}`,
  ),
);
console.log(`Ventas (sin cancelados): ${redondear(ventas)}`);
