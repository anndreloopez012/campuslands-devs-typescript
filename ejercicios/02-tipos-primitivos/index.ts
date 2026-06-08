export {};

// Ejercicio 2: Tipos primitivos
// Contexto: Motos

// TODO: declara datos primitivos para una moto.

// TODO: calcula si necesita mantenimiento.

let marca: string= "pulsar";
let cilindrada: number = 150;
let estaEncendida: boolean = false;
let kilometraje: number = 3500;
let proximoMantenimientoKm: number | null = null;  
let necesitaMantenimiento: boolean = kilometraje > 3000;

console.log("========= Ficha tecnica de moto =========");
console.log("Marca:", marca);
console.log("Cilindrada:", cilindrada, "cc");
console.log("Esta encendida:", estaEncendida);
console.log("Kilometraje:", kilometraje, "km");
console.log("Proximo mantenimiento:"+ (proximoMantenimientoKm ? proximoMantenimientoKm : "No especificado"));
console.log("Necesita mantenimiento:", necesitaMantenimiento);
console.log("=========================================");