export {};

type DetailLevel = "simple" | "detallado" | "completo";

interface Commission {
    client: string;
    subject: string;
    detail: DetailLevel;
    copies: number;
    delivered: boolean;
}

const commissions: Commission[] = [
    { client: "Dani", subject: "Mago", detail: "completo", copies: 1, delivered: false },
    { client: "Iris", subject: "Mascota", detail: "simple", copies: 2, delivered: true },
    { client: "Noah", subject: "Equipo RPG", detail: "detallado", copies: 1, delivered: false },
];

const prices: Record<DetailLevel, number> = {
    simple: 25,
    detallado: 50,
    completo: 85,
};

const pending = commissions.filter((commission) => !commission.delivered);
const pendingValue = pending.reduce(
    (total, commission) => total + prices[commission.detail] * commission.copies,
    0,
);

pending.forEach((commission) => {
    console.log(`${commission.client}: ${commission.subject} (${commission.detail})`);
});
console.log(`Comisiones pendientes: ${pending.length}`);
console.log(`Valor pendiente: $${pendingValue}`);
