export {};

type AppointmentStatus = "confirmada" | "pendiente" | "cancelada";

interface Appointment {
    client: string;
    artist: string;
    date: string;
    price: number;
    status: AppointmentStatus;
}

const agenda: Appointment[] = [
    { client: "Alma", artist: "Rene", date: "2026-06-05 10:00", price: 180, status: "confirmada" },
    { client: "Joel", artist: "Rene", date: "2026-06-05 14:00", price: 250, status: "pendiente" },
    { client: "Nico", artist: "Mara", date: "2026-06-06 11:00", price: 120, status: "confirmada" },
    { client: "Luz", artist: "Mara", date: "2026-06-06 15:00", price: 90, status: "cancelada" },
];

const confirmed = agenda.filter((appointment) => appointment.status === "confirmada");
const expectedIncome = confirmed.reduce((sum, appointment) => sum + appointment.price, 0);

confirmed.forEach((appointment) => {
    console.log(`${appointment.date} - ${appointment.client} con ${appointment.artist}`);
});
console.log(`Citas confirmadas: ${confirmed.length}`);
console.log(`Ingreso esperado: $${expectedIncome}`);
