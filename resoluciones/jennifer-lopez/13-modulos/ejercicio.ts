import destinos from "./datos.json" with { type: "json" };
import { filtrarPorPresupuesto, formatearDestino } from "./utilidades";

console.log(" --- SISTEMA DE VIAJES --- ");
console.log("\nTodos los destinos disponibles:");
destinos.forEach(destino => {
  console.log(formatearDestino(destino));
});

const presupuestoMaximoUsuario = 500; 
console.log(`\n Filtrando destinos con presupuesto máximo de $${presupuestoMaximoUsuario} USD:`);

const destinosEconomicos = filtrarPorPresupuesto(destinos, presupuestoMaximoUsuario);
if (destinosEconomicos.length === 0) {
  console.log("No se encontraron destinos que se ajusten a tu presupuesto. Intenta aumentar tu presupuesto o revisar otros destinos.");
} else {
  destinosEconomicos.forEach(destino => {
    console.log(formatearDestino(destino));
  });
}