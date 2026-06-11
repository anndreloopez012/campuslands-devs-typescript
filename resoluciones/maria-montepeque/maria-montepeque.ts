export {};

// Ejercicio 2: Tipos primitivos

const marca: string = "Honda"; 
const cilindradaCc: number = 500; 
const kilometraje: number = 3420; 
const estaEncendida: boolean = false;

const proximoMantenimiento: string | null = null;

let ultimaRevision: string | undefined;

const LIMITE_MANTENIMIENTO = 3000;
const necesitaMantenimiento: boolean = kilometraje > LIMITE_MANTENIMIENTO;

console.log("=== Ficha técnica ===");
console.log(`Marca: ${marca}`);
console.log(`Cilindrada: ${cilindradaCc} cc`);
console.log(`Kilometraje: ${kilometraje} km`);
console.log(`Encendida: ${estaEncendida ? "sí" : "no"}`);
console.log(
  `Próximo mantenimiento: ${proximoMantenimiento ?? "sin programar"}`,
);
console.log(`Última revisión: ${ultimaRevision ?? "no registrada"}`);

console.log(
  necesitaMantenimiento
    ? "La moto supera los 3000 km: programa mantenimiento preventivo."
    : "La moto puede seguir en ruta.",
);
