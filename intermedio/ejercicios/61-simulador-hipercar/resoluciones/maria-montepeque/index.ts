export {};

type Modo = "detenido" | "acelerando" | "velocidad-maxima" | "frenando";

interface Estado {
  readonly modo: Modo;
  readonly tiempo: number;
  readonly velocidadKmH: number;
  readonly marcas: { readonly a100?: number; readonly a200?: number; readonly a300?: number };
}

type Accion =
  | { readonly tipo: "acelerar" }
  | { readonly tipo: "frenar" }
  | { readonly tipo: "tick"; readonly dt: number };

const VELOCIDAD_MAXIMA = 340;
const ACELERACION_INICIAL = 22; // km/h por segundo
const FRENADA = 45;

const inicial: Estado = { modo: "detenido", tiempo: 0, velocidadKmH: 0, marcas: {} };

const redondear = (n: number): number => Math.round(n * 100) / 100;

const registrarMarcas = (anterior: Estado, velocidad: number, tiempo: number): Estado["marcas"] => ({
  a100: anterior.marcas.a100 ?? (velocidad >= 100 ? tiempo : undefined),
  a200: anterior.marcas.a200 ?? (velocidad >= 200 ? tiempo : undefined),
  a300: anterior.marcas.a300 ?? (velocidad >= 300 ? tiempo : undefined),
});

const reducer = (estado: Estado, accion: Accion): Estado => {
  switch (accion.tipo) {
    case "acelerar":
      return estado.modo === "velocidad-maxima" ? estado : { ...estado, modo: "acelerando" };
    case "frenar":
      return estado.velocidadKmH === 0 ? estado : { ...estado, modo: "frenando" };
    case "tick": {
      if (accion.dt <= 0 || estado.modo === "detenido") return estado;
      const tiempo = redondear(estado.tiempo + accion.dt);

      if (estado.modo === "frenando") {
        const velocidad = Math.max(estado.velocidadKmH - FRENADA * accion.dt, 0);
        return { ...estado, tiempo, velocidadKmH: redondear(velocidad), modo: velocidad === 0 ? "detenido" : "frenando" };
      }
      // La aceleracion cae a medida que la velocidad se acerca al maximo.
      const aceleracion = ACELERACION_INICIAL * (1 - estado.velocidadKmH / VELOCIDAD_MAXIMA);
      const velocidad = Math.min(estado.velocidadKmH + aceleracion * accion.dt, VELOCIDAD_MAXIMA - 0.5);
      return {
        modo: velocidad >= VELOCIDAD_MAXIMA - 1 ? "velocidad-maxima" : "acelerando",
        tiempo,
        velocidadKmH: redondear(velocidad),
        marcas: registrarMarcas(estado, velocidad, tiempo),
      };
    }
  }
};

const correr = (estado: Estado, acciones: readonly Accion[]): Estado => acciones.reduce(reducer, estado);
const ticks = (cantidad: number, dt: number): Accion[] => Array.from({ length: cantidad }, () => ({ tipo: "tick", dt }));

console.log("Ejercicio 61: Simulador de aceleracion hypercar");
let estado = correr(inicial, [{ tipo: "tick", dt: 1 }]);
console.log(`Sin acelerar: ${estado.modo}, ${estado.velocidadKmH} km/h`);

estado = correr(estado, [{ tipo: "acelerar" }, ...ticks(400, 0.1)]);
console.log(`Despues de 40 s: ${estado.modo}, ${estado.velocidadKmH} km/h`);
console.log(`Marcas -> 0-100: ${estado.marcas.a100 ?? "n/a"} s | 0-200: ${estado.marcas.a200 ?? "n/a"} s | 0-300: ${estado.marcas.a300 ?? "n/a"} s`);

estado = correr(estado, [{ tipo: "frenar" }, ...ticks(120, 0.1)]);
console.log(`Despues de frenar 12 s: ${estado.modo}, ${estado.velocidadKmH} km/h`);
