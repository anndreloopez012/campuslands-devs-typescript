export {};

interface Activity {
    day: number;
    time: string;
    place: string;
    cost: number;
}

const itinerary: Activity[] = [
    { day: 2, time: "09:00", place: "Museo", cost: 15 },
    { day: 1, time: "14:00", place: "Centro historico", cost: 0 },
    { day: 1, time: "10:00", place: "Mercado local", cost: 8 },
    { day: 2, time: "18:00", place: "Cena", cost: 28 },
];

itinerary.sort(
    (first, second) =>
        first.day - second.day || first.time.localeCompare(second.time),
);

itinerary.forEach((activity) => {
    console.log(`Dia ${activity.day} - ${activity.time}: ${activity.place} ($${activity.cost})`);
});
const totalCost = itinerary.reduce((sum, activity) => sum + activity.cost, 0);
console.log(`Presupuesto de actividades: $${totalCost}`);
