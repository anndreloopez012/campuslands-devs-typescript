export {};

type ServiceType = "aceite" | "frenos" | "cadena";

interface Motorcycle {
    model: string;
    kilometers: number;
    services: Record<ServiceType, number>;
}

const bikes: Motorcycle[] = [
    { model: "Raptor 300", kilometers: 12800, services: { aceite: 10000, frenos: 9000, cadena: 11000 } },
    { model: "Vento 250", kilometers: 6400, services: { aceite: 4000, frenos: 3000, cadena: 5000 } },
];

const serviceIntervals: Record<ServiceType, number> = {
    aceite: 5000,
    frenos: 8000,
    cadena: 6000,
};

for (const bike of bikes) {
    const dueServices = (Object.keys(serviceIntervals) as ServiceType[]).filter(
        (service) => bike.kilometers - bike.services[service] >= serviceIntervals[service],
    );
    console.log(`${bike.model} (${bike.kilometers} km): ${dueServices.join(", ") || "sin servicios pendientes"}`);
}
