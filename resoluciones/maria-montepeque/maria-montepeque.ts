import destinos from "./maria-montepeque.json" with { type: "json" };
import { filtrarPorPresupuesto, formatearDestino } from "./maria-montepeque-utilidades";

const presupuesto = 600;
console.log(`Destinos disponibles con USD ${presupuesto}:`);
filtrarPorPresupuesto(destinos, presupuesto).forEach((d) =>
  console.log(formatearDestino(d)),
);
