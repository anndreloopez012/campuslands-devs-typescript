export {};

type PlanStatus = "borrador" | "revision" | "aprobado";

interface Plan {
    name: string;
    version: number;
    status: PlanStatus;
    squareMeters: number;
}

class PlanRegistry<T extends Plan> {
    constructor(private readonly plans: T[]) {}

    needsReview(): T[] {
        return this.plans.filter((plan) => plan.status === "revision");
    }

    totalArea(): number {
        return this.plans.reduce((total, plan) => total + plan.squareMeters, 0);
    }
}

const plans: Plan[] = [
    { name: "Planta baja", version: 3, status: "aprobado", squareMeters: 84 },
    { name: "Segundo nivel", version: 2, status: "revision", squareMeters: 76 },
    { name: "Terraza", version: 1, status: "borrador", squareMeters: 28 },
];

const registry = new PlanRegistry(plans);
registry.needsReview().forEach((plan) => {
    console.log(`${plan.name} v${plan.version}: pendiente de revision`);
});
console.log(`Area total del proyecto: ${registry.totalArea()} m2`);
