export {};

type OrderStatus = "recibida" | "en_proceso" | "lista";

interface RepairOrder {
    customer: string;
    motorcycle: string;
    status: OrderStatus;
    partsCost: number;
    laborCost: number;
}

const orders: RepairOrder[] = [
    { customer: "Nora", motorcycle: "Raptor 300", status: "en_proceso", partsCost: 85, laborCost: 60 },
    { customer: "Ivan", motorcycle: "Vento 250", status: "lista", partsCost: 32, laborCost: 45 },
    { customer: "Sara", motorcycle: "Falcon 500", status: "recibida", partsCost: 0, laborCost: 0 },
];

const activeOrders = orders.filter((order) => order.status !== "lista");
const workshopIncome = orders
    .filter((order) => order.status === "lista")
    .reduce((total, order) => total + order.partsCost + order.laborCost, 0);

orders.forEach((order) => {
    console.log(
        `${order.motorcycle} - ${order.customer} - ${order.status} - Total: $${order.partsCost + order.laborCost}`,
    );
});
console.log(`Ordenes pendientes: ${activeOrders.length}`);
console.log(`Ingresos de trabajos listos: $${workshopIncome}`);
