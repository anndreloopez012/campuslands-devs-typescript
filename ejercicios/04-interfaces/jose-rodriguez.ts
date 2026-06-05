export {};

// Ejercicio 05: Arrays - comida (Versión TypeScript)

console.log("Ejercicio 05: Arrays");

// 1. CREAR UN ARREGLO 
// Definimos el tipo como 'string[]' para asegurar que solo contenga texto
const menu: string[] = ["Pizza", "Hamburgesa", "Tacos"];

// 2. AGREGAR ELEMENTOS
menu.push("Pasta");
menu.push("Ensalada");
menu.push("Carne");

// 3. CONSULTAR POSICIONES (INDICES)
// TypeScript nos ayuda a identificar que estos valores son 'strings'
const primerPlato: string = menu[1]; 
const tercerPlato: string = menu[4]; 

console.log("=== CONSULTA DE POSICIONES ===");
console.log(`El segundo elemento (índice 1) es: ${primerPlato}`); // Nota: el índice 1 es el segundo elemento
console.log(`El quinto elemento (índice 4) es: ${tercerPlato}`); 
console.log(`Total de elementos en el menú: ${menu.length}`); 
console.log("---------------------------------------\n");

// 4. RECORRER EL ARREGLO (LOOPS/BUCLES)

console.log("=== RECORRIENDO EL MENU (Forma Moderna: for...Of) ===");
// TypeScript infiere automáticamente que 'platillo' es de tipo 'string'
for (const platillo of menu) {
    console.log(`🍽️ Platillo disponible: ${platillo}`);
}

console.log("-----------------------------------------\n");

console.log("=== RECORRIENDO EL MENU (forma clasica con Indice: for) ===");
// 'i' es definido como 'number' automáticamente
for (let i: number = 0; i < menu.length; i++) {
    console.log(`Posición ${i} -> Opción: ${menu[i]}`);
}