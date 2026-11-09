export {};

interface Stop {
    name: string;
    minutes: number;
    attraction: number;
}

interface Route {
    title: string;
    stops: Stop[];
}

class RoutePlanner<T extends Stop> {
    constructor(private readonly route: Route) {}

    bestStop(): T | undefined {
        return [...this.route.stops].sort(
            (first, second) => second.attraction - first.attraction,
        )[0] as T | undefined;
    }

    totalTime(): number {
        return this.route.stops.reduce((total, stop) => total + stop.minutes, 0);
    }
}

const route: Route = {
    title: "Centro historico",
    stops: [
        { name: "Plaza Mayor", minutes: 35, attraction: 9 },
        { name: "Museo de la ciudad", minutes: 70, attraction: 8 },
        { name: "Mirador", minutes: 45, attraction: 10 },
    ],
};

const planner = new RoutePlanner<Stop>(route);
console.log(`Ruta: ${route.title} (${planner.totalTime()} min)`);
console.log(`Parada recomendada: ${planner.bestStop()?.name ?? "ninguna"}`);
