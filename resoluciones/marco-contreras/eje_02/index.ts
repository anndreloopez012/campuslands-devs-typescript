export {};

// Ejercicio 2: Tipos primitivos
// Contexto: Motos
// usar `string`, `number`, `boolean`, `null` y `undefined` de forma segura.
//Modela datos basicos de una moto: marca, cilindrada, estaEncendida, kilometraje y proximoMantenimiento.

// TODO: declara datos primitivos para una moto.
const marca: string = "Ducati";
let cilindraje: number = 600;
let estaEncendida: boolean = true;
let kilometraje: number = 35000;
let proximoMantenimiento: number = 36000;
// La moto necesita mantenimiento cada 3000 kilometros
const intervalo: number = 3000;
let necesitaMantenimiento: boolean = false;

// TODO: calcula si necesita mantenimiento.
    if (proximoMantenimiento - kilometraje <= intervalo) {
            necesitaMantenimiento = false;
            console.log('Le faltan ' + (proximoMantenimiento - kilometraje) + ' kilometros para el proximo mantenimiento.');
    } else {
        console.log('Necesita mantenimiento urgente.');
    }
