export {};

// Ejercicio 2: Tipos primitivos

// --- string: texto ---
const marca: string = "Honda";
const modelo: string = "CB500F";

// --- number: valores numericos ---
const cilindradaCc: number = 471;
const kilometraje: number = 4250;

// --- boolean: verdadero / falso ---
const estaEncendida: boolean = true;

const proximoMantenimientoKm: number | null = null;

const ultimaRevision: string | undefined = undefined;

// --- Reto extra ---
const necesitaMantenimiento: boolean = kilometraje > 3000;

// Salida: ficha tecnica + aviso de mantenimiento

console.log("=========== FICHA TECNICA ===========");
console.log(`Marca:                 ${marca}`);
console.log(`Modelo:                ${modelo}`);
console.log(`Cilindrada:            ${cilindradaCc} cc`);
console.log(`Kilometraje:           ${kilometraje} km`);
console.log(`Encendida:             ${estaEncendida ? "Si" : "No"}`);
console.log(
  `Proximo mantenimiento: ${proximoMantenimientoKm ?? "sin agendar"}`,
);
console.log(`Ultima revision:       ${ultimaRevision ?? "sin registrar"}`);
console.log("=====================================");

console.log(
  necesitaMantenimiento
    ? "AVISO: supera los 3000 km, programar mantenimiento preventivo."
    : "La moto puede seguir en ruta.",
);
