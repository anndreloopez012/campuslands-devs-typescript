export {};

const marcaMoto: string = "Kawasaki";
let kilometraje: number = 2500;
const esNueva: boolean = false;
let informeAccidentes: null = null;
let proximaCita: undefined = undefined;

// Lógica de mantenimiento
const necesitaRevision: boolean = kilometraje >= 3000;

console.log(`Ficha: ${marcaMoto} (${kilometraje}km)`);
console.log(`¿Mantenimiento pendiente?: ${necesitaRevision ? "SÍ" : "NO"}`);
console.log(
  `Estado legal: ${informeAccidentes === null ? "Sin antecedentes" : "Revisar"}`,
);
