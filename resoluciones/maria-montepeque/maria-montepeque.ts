export {};
// Ejercicio 1: Introduccion a TypeScript
const alias: string = "ViboraSilente";
const arma: string = "Escopeta de combate";
const balas: number = 64;
const escudoListo: boolean = false;

const escenario: string = "Refineria Abandonada";
const modalidad: string = "Eliminacion";

const estadoEscudo: string = escudoListo ? "disponible" : "agotado";

const resumen: string = `[${modalidad} en ${escenario}] ${alias} entra con ${arma}, ${balas} balas y escudo ${estadoEscudo}.`;

console.log(resumen);
