export {};

// Ejercicio 2: Tipos primitivos
// Contexto: Motos

// TODO: declara datos primitivos para una moto.

// TODO: calcula si necesita mantenimiento.

console.log("------- Ejercicio 2: Tipos primitivos - Motos -------");
const marca: string = "Yamaha";
const cilindrada: number = 600;
let estaEncendida: boolean = false;
let kilometraje: number = 1500;
let proximoMantenimiento: number = 3000;
let placa: string | null = null;
let ultimaRevision: undefined = undefined;
let necesitaMantenimiento: boolean = kilometraje >= proximoMantenimiento;

console.log(`Marca: ${marca}`);
console.log(`Cilindrada: ${cilindrada}`);
console.log(`¿Está encendida? ${estaEncendida}`);
console.log(`Kilometraje: ${kilometraje}`);
console.log(`Próximo mantenimiento: ${proximoMantenimiento}`);
console.log(`Placa: ${placa}`);
console.log(`Última revisión: ${ultimaRevision}`);
console.log(`¿La moto necesita mantenimiento? ${necesitaMantenimiento}`);