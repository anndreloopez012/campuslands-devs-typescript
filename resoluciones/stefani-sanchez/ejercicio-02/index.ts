export {};

// Ejercicio 02: Tipos Primitivos
// Contexto: Motos Deportivas

const marca: string = "Kawasaki";
const modelo: string = "Ninja ZX-6R";
const cilindradaCc: number = 636;
const kilometraje: number = 4250;
const estaEncendida: boolean = true;
const proximoMantenimientoKm: number | null = 5000;
const ultimaRevision: undefined = undefined;

const umbralMantenimiento: number = 4000;
const alertaServicio: boolean = kilometraje >= umbralMantenimiento;

console.log("=== TELEMETRÍA Y FICHA TÉCNICA ===");
console.log({
  marca,
  modelo,
  cilindradaCc,
  kilometraje,
  estaEncendida,
  proximoMantenimientoKm,
  ultimaRevision
});

console.log(`Estado del motor: ${estaEncendida ? "En marcha" : "Detenido"}`);
if (alertaServicio) {
  console.log(`[ALERTA] La moto ha superado los ${umbralMantenimiento} km. Programar servicio preventivo en ${proximoMantenimientoKm} km.`);
} else {
  console.log("Sistema en óptimas condiciones para rodada.");
}
