export {};

// Ejercicio 2: Tipos primitivos
// Contexto: Motos

// TODO: declara datos primitivos para una moto.
console.log("========= Tipos primitivos =======");

let marcaMoto: string = "Honda"
let placaMoto:string = "A456GST"
let cilindrada: number = 150
let tipoMotor: string = "4 tiempos"
let tanque: number = 12.5
let kilometraje: number = 2900
let mantenimiento: boolean = false

// TODO: calcula si necesita mantenimiento.
let mensaje = ""
kilometraje = 3001
if (kilometraje > 3000){
    mantenimiento = true
    mensaje = "La moto necesita mantenimiento."
}else{
    mensaje = "La moto no necesita mantenimiento."
}

console.log(`Marca de la moto: ${marcaMoto}\nPlaca: ${placaMoto}\nCilindrada: ${cilindrada}cc\nTipo de motor: ${tipoMotor}\nCapacidad del tanque: ${tanque}L\nKilometraje: ${kilometraje}km\n`)
console.log(mensaje)