export {};

// Ejercicio 02: Tipos de datos - motos
// Completa el codigo siguiendo las instrucciones del README.md.

console.log("Ejercicio 02: Tipos de datos");

// 1. STRING (Texto): Para nombres, marcas o categorías.
const marca: string = "Ducati";
const modelo: string = "Panigale V4";

// 2. NUMBER (Número): Definidos explicitamente como 'number'.
let cilindraje: number = 1103; // cc
let velocidadMaxima: number = 299.5; // km/h
let combustibleLitros: number = 16; 

// 3. BOOLEAN: definidos como 'boolean'
let estaEncendida: boolean  = false;
let tieneFrenosABS: boolean = true;

// 4. NULL: En TS, es mejor especificar que puede ser 'string' o 'null'. 
// Esto evita errores de acceso si intentamos usar el nombre del dueno 
let propietarioActual: string | null = null; 

// 5. UNDEFINED (Indefinido): El valor no ha sido asignado. 
// Dejamos la variable declarada pero vacía. JavaScript le asigna 'undefined' automáticamente.
let proximoMantenimiento; 

// 6. ARRAY (Arreglo/Lista): Para almacenar una colección de elementos del mismo o diferente tipo.
const modosDeConduccion = ["Race", "Sport", "Street", "Wet"];


// ==========================================
// PRUEBA DE FUNCIONAMIENTO (LOGS)
// ==========================================
console.log(`--- FICHA TÉCNICA DE LA MOTO ---`);
console.log(`Vehículo: ${marca} ${modelo}`);
console.log(`Cilindraje: ${cilindraje} cc`);
console.log(`¿Está encendida?: ${tieneFrenosABS}`);
console.log(`Modo de conducción actual: ${modosDeConduccion[1]}`); // Accede a "Sport"
console.log(`Dueño asignado: ${propietarioActual}`);
console.log(`Alerta de mantenimiento: ${proximoMantenimiento}`); // Imprimirá 'undefined'

