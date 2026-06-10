
import destinos from "./datos.json" with { type: "json" };
import { filtrarPorPresupuesto, formatearDestino } from "./utilidades";
// Ejercicio 13: Modulos
// Contexto: Aplicacion de viajes

// TODO: usa las utilidades importadas para filtrar y mostrar destinos.
console.log(destinos);
console.log(filtrarPorPresupuesto);
console.log(formatearDestino);

export {};


// Simulación de lógica de módulos (separando interfaz y funcionalidad)
interface Destino {
 ciudad: string;
 presupuesto: number;
}


const filtrarDestinos = (lista: Destino[], max: number): Destino[] => {
 return lista.filter((d) => d.presupuesto <= max);
};


const misViajes: Destino[] = [
 { ciudad: "Tokio", presupuesto: 1500 },
 { ciudad: "París", presupuesto: 2500 },
];
const posibles = filtrarDestinos(misViajes, 2000);
console.log("Destinos al alcance:", posibles);
