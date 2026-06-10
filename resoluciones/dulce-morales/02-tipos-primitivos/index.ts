export {};

// Ejercicio 2: Tipos primitivos
// Contexto: Motos

// TODO: declara datos primitivos para una moto.
const marca: string = "Honda";
const modelo: string = "CB190R";
const cilindrada: number = 190;
const estaEncendida: boolean = false;
const kilometraje: number = 2000;
const proximoMantenimiento: number | null =null
let ultimoMantenimiento: number | undefined = undefined;
// TODO: calcula si necesita mantenimiento.
const necesitaMantenimiento: boolean = kilometraje >=  3000;

//Plantilla de cadena para mostrar la ficha técnica de la moto.
const fichaTecnica: string = `Marca: ${marca}
Modelo: ${modelo}
Cilindrada: ${cilindrada}cc
Kilometraje: ${kilometraje}km
Próximo mantenimiento: ${proximoMantenimiento ? proximoMantenimiento + "km" : "No programado"}
Último mantenimiento: ${ultimoMantenimiento ? ultimoMantenimiento + "km" : "Desconocido"}
Necesita mantenimiento: ${necesitaMantenimiento ? "Sí" : "No"}
Estado actual: ${estaEncendida ? "Encendida" : "Apagada"}`;

// TODO: muestra la ficha técnica y si necesita mantenimiento.
console.log("Ficha técnica de la moto:");
console.log(fichaTecnica);
console.log(`¿La moto necesita mantenimiento? ${necesitaMantenimiento ? "Sí, debe programar uno en breve" : "No, la moto sigue en buenas condiciones"}`);
