export {};

// Ejercicio 2: Tipos primitivos
// Contexto: Motos
// Resolucion: Dulce Morales

// string: texto
const marca: string = "Yamaha";
const modelo: string = "MT-07";

// number: cilindrada (cc) y kilometraje (km)
const cilindrada: number = 689;
const kilometraje: number = 3450;

// boolean: estado del motor
const estaEncendida: boolean = false;

// null: valor vacio intencional (la moto no tiene placa asignada todavia)
const placa: string | null = null;

// undefined: valor que aun no se ha asignado (fecha del proximo mantenimiento)
let proximoMantenimiento: string | undefined;

// Reto extra: necesita mantenimiento si supera los 3000 km
const LIMITE_MANTENIMIENTO_KM: number = 3000;
const necesitaMantenimiento: boolean = kilometraje > LIMITE_MANTENIMIENTO_KM;

if (necesitaMantenimiento) {
  proximoMantenimiento = "Lo antes posible";
}

// Con strictNullChecks hay que decidir que mostrar cuando falta el valor
const textoPlaca: string = placa ?? "Sin placa asignada";
const textoMantenimiento: string = proximoMantenimiento ?? "Sin programar";
const kmRestantes: number = LIMITE_MANTENIMIENTO_KM - kilometraje;

console.log("========= FICHA TECNICA =========");
console.log(`Marca:                 ${marca}`);
console.log(`Modelo:                ${modelo}`);
console.log(`Cilindrada:            ${cilindrada} cc`);
console.log(`Kilometraje:           ${kilometraje} km`);
console.log(`Motor:                 ${estaEncendida ? "Encendido" : "Apagado"}`);
console.log(`Placa:                 ${textoPlaca}`);
console.log(`Proximo mantenimiento: ${textoMantenimiento}`);
console.log("=================================");

if (necesitaMantenimiento) {
  console.log(
    `AVISO: la moto supera los ${LIMITE_MANTENIMIENTO_KM} km (${kilometraje - LIMITE_MANTENIMIENTO_KM} km de mas). Necesita mantenimiento.`,
  );
} else {
  console.log(`OK: faltan ${kmRestantes} km para el mantenimiento.`);
}
