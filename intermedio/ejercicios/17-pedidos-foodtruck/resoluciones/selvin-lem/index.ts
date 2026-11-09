export {};

type OrderState = "recibido" | "preparando" | "entregado";

interface Order {
    number: number;
    customer: string;
    items: { name: string; price: number; quantity: number }[];
    state: OrderState;
}

const orders: Order[] = [
    { number: 101, customer: "Eva", state: "preparando", items: [{ name: "Taco", price: 4, quantity: 3 }, { name: "Agua", price: 1, quantity: 2 }] },
    { number: 102, customer: "Pablo", state: "entregado", items: [{ name: "Hamburguesa", price: 9, quantity: 1 }] },
];

for (const order of orders) {
    const total = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    console.log(`Pedido ${order.number} para ${order.customer}: $${total} (${order.state})`);
}

const openOrders = orders.filter((order) => order.state !== "entregado");
console.log(`Pedidos por entregar: ${openOrders.length}`);
