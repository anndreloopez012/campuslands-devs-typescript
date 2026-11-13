export {};

type OrderStatus = "pendiente" | "en_proceso" | "terminada";

interface WeldingOrder {
    id: number;
    client: string;
    material: string;
    status: OrderStatus;
    hours: number;
}

const orders: WeldingOrder[] = [
    { id: 101, client: "Taller Norte", material: "Acero", status: "en_proceso", hours: 4 },
    { id: 102, client: "MetalSur", material: "Aluminio", status: "pendiente", hours: 2 },
    { id: 103, client: "Taller Norte", material: "Acero", status: "terminada", hours: 3 },
];

const ordersByStatus = orders.reduce<Record<OrderStatus, number>>(
    (counts, order) => {
        counts[order.status]++;
        return counts;
    },
    { pendiente: 0, en_proceso: 0, terminada: 0 },
);

const hoursInProgress = orders
    .filter((order) => order.status === "en_proceso")
    .reduce((total, order) => total + order.hours, 0);

orders.forEach((order) => {
    console.log(`#${order.id} ${order.client} - ${order.material} - ${order.status}`);
});
console.log(`Ordenes por estado: ${JSON.stringify(ordersByStatus)}`);
console.log(`Horas en proceso: ${hoursInProgress}`);
