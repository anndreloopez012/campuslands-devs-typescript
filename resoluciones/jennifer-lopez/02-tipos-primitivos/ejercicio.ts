export {};

// Ejercicio 2: Tipos primitivos

const marca: string = "Yamaha";
const cilindrada: number = 300;
const estaEncendida: boolean = true;
const kilometraje: number = 3500;

let proximoMantenimiento: null | undefined = undefined;
console.log("Ficha Tecnica");
console.log("Marca:", marca);
console.log("Cilindrada:", cilindrada);
console.log("Esta Encendida:", estaEncendida);
console.log("Kilometraje:", kilometraje);
console.log("Proximo Mantenimiento:", proximoMantenimiento);
proximoMantenimiento = null;
const necesitaMantenimiento: boolean = kilometraje > 3000;
if (necesitaMantenimiento) {
    console.log("Aviso: La moto necesita mantenimiento.");
} else {
    console.log("Aviso: La moto no necesita mantenimiento.");
    
}
