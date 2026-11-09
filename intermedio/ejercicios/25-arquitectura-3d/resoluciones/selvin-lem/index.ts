export {};

type ReviewStatus = "aprobado" | "ajustes";

interface RenderReview {
    view: string;
    reviewer: string;
    score: number;
    status: ReviewStatus;
}

const reviews: RenderReview[] = [
    { view: "Fachada principal", reviewer: "Elena", score: 9, status: "aprobado" },
    { view: "Sala de estar", reviewer: "Tomas", score: 7, status: "ajustes" },
    { view: "Vista nocturna", reviewer: "Elena", score: 8, status: "aprobado" },
];

const approved = reviews.filter((review) => review.status === "aprobado");
const averageScore =
    reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length;

reviews.forEach((review) => {
    console.log(`${review.view}: ${review.score}/10 - ${review.status} (${review.reviewer})`);
});
console.log(`Vistas aprobadas: ${approved.length} de ${reviews.length}`);
console.log(`Calificacion promedio: ${averageScore.toFixed(1)}/10`);
