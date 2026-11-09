export {};

type DefectType = "porosidad" | "grieta" | "socavado";

interface WeldInspection {
    joint: string;
    inspector: string;
    defects: { type: DefectType; sizeMm: number }[];
}

class InspectionReport<T extends WeldInspection> {
    constructor(private readonly inspections: T[]) {}

    isAccepted(inspection: T, maxDefectSize: number): boolean {
        return inspection.defects.every(
            (defect) => defect.type !== "grieta" && defect.sizeMm <= maxDefectSize,
        );
    }

    printResults(maxDefectSize: number): void {
        this.inspections.forEach((inspection) => {
            const result = this.isAccepted(inspection, maxDefectSize)
                ? "aprobada"
                : "requiere reparacion";
            console.log(`${inspection.joint}: ${result} (${inspection.inspector})`);
        });
    }
}

const inspections: WeldInspection[] = [
    { joint: "J-101", inspector: "Rosa", defects: [{ type: "porosidad", sizeMm: 1 }] },
    { joint: "J-102", inspector: "Ivan", defects: [{ type: "grieta", sizeMm: 0.5 }] },
    { joint: "J-103", inspector: "Rosa", defects: [{ type: "socavado", sizeMm: 3 }] },
];

new InspectionReport(inspections).printResults(2);
