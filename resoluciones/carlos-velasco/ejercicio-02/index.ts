export { };

// Ejercicio 2: Tipos primitivos
// Contexto: Motos

// TODO: declara datos primitivos para una moto.

// TODO: calcula si necesita mantenimiento.

const marca: string = "Hunk";
const cilindraje: number = 200;
let encendida: boolean = true;
let kilometraje: number = 2500;
const proximoMantenimiento: number | null = null;

const mantenimiento: boolean = kilometraje >= 3000;

const fichaTecnica: string = `
--- FICHA TÉCNICA DE LA MOTOCICLETA ---
Marca:              ${marca}
Cilindraje:         ${cilindraje}cc
Estado:             ${encendida ? "Encendida" : "Apagada"}
Kilometraje:        ${kilometraje} km
Próximo mant.:      ${proximoMantenimiento ?? "No programado"}
¿Requiere servicio?: ${mantenimiento ? "SÍ" : "NO"}
---------------------------------------`;

console.log(fichaTecnica);

