export {};

// Ejercicio 2: Tipos primitivos
// Contexto: Motos

// TODO: declara datos primitivos para una moto.
const nombreModeloMoto: string = "Yamaha MT-07";
const cilindradaEnCC: number = 689;
const esMotorEncendido: boolean = false;
const kilometrajeActual: number = 3500;

// null: valor vacío intencional (no hay cita aún)
const fechaCitaMantenimiento: string | null = null;

// undefined: valor que aún no se ha asignado
let identificadorChasis: string | undefined = undefined;

// TODO: calcula si necesita mantenimiento.
const limiteKilometrosParaRevision: number = 3000;
const esNecesarioMantenimiento: boolean =
  kilometrajeActual > limiteKilometrosParaRevision;

console.log("=== ESPECIFICACIONES DE LA MOTO ===");
console.log(`Modelo: ${nombreModeloMoto}`);
console.log(`Cilindrada: ${cilindradaEnCC}cc`);
console.log(`Estado del motor: ${esMotorEncendido ? "En marcha" : "Detenido"}`);
console.log(`Kilómetros recorridos: ${kilometrajeActual} km`);
console.log(`Próxima revisión: ${fechaCitaMantenimiento ?? "No programada"}`);
console.log(`ID Chasis: ${identificadorChasis ?? "No registrado"}`);

console.log("\n--- DIAGNÓSTICO ---");
if (esNecesarioMantenimiento) {
  console.log(
    "⚠️ AVISO: La moto requiere mantenimiento por exceso de kilometraje."
  );
} else {
  console.log("✅ Todo en orden: No requiere mantenimiento por ahora.");
}
