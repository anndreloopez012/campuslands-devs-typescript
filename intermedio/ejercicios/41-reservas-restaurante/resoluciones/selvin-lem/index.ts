export {};

type ReservationStatus = "confirmada" | "pendiente" | "cancelada";

interface Reservation {
    name: string;
    time: string;
    guests: number;
    status: ReservationStatus;
}

class ReservationBook<T extends Reservation> {
    constructor(private readonly reservations: T[]) {}

    getAvailableSeats(capacity: number): number {
        const bookedSeats = this.reservations
            .filter((reservation) => reservation.status === "confirmada")
            .reduce((total, reservation) => total + reservation.guests, 0);
        return Math.max(0, capacity - bookedSeats);
    }

    printSchedule(): void {
        this.reservations
            .filter((reservation) => reservation.status !== "cancelada")
            .sort((first, second) => first.time.localeCompare(second.time))
            .forEach((reservation) => {
                console.log(`${reservation.time} - ${reservation.name} (${reservation.guests})`);
            });
    }
}

const reservations: Reservation[] = [
    { name: "Mora", time: "19:30", guests: 4, status: "confirmada" },
    { name: "Vega", time: "18:00", guests: 2, status: "confirmada" },
    { name: "Rios", time: "20:00", guests: 3, status: "pendiente" },
];

const book = new ReservationBook(reservations);
book.printSchedule();
console.log(`Asientos disponibles: ${book.getAvailableSeats(30)}`);
