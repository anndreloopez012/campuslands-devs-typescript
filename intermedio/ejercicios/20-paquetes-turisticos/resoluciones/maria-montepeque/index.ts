export {};

type Destino = "playa" | "montana" | "ciudad" | "selva";

interface Paquete {
  readonly id: number;
  readonly nombre: string;
  readonly destino: Destino;
  readonly noches: number;
  readonly precioTotal: number;
  readonly incluye: readonly string[];
  readonly calificacion: number;
}

interface PaqueteComparado extends Paquete {
  readonly precioPorNoche: number;
  readonly puntaje: number;
}

const paquetes: readonly Paquete[] = [
  { id: 1, nombre: "Semana en Livingston", destino: "playa", noches: 7, precioTotal: 560, incluye: ["hotel", "desayuno", "lancha"], calificacion: 8.7 },
  { id: 2, nombre: "Volcan Acatenango", destino: "montana", noches: 2, precioTotal: 180, incluye: ["guia", "carpa"], calificacion: 9.2 },
  { id: 3, nombre: "Fin de semana en Antigua", destino: "ciudad", noches: 3, precioTotal: 270, incluye: ["hotel", "tour"], calificacion: 8.1 },
  { id: 4, nombre: "Expedicion Peten", destino: "selva", noches: 5, precioTotal: 650, incluye: ["hotel", "guia", "comidas", "transporte"], calificacion: 9.0 },
  { id: 5, nombre: "Paquete Fantasma", destino: "playa", noches: 0, precioTotal: 300, incluye: [], calificacion: 7 },
  { id: 6, nombre: "Oferta Imposible", destino: "ciudad", noches: 2, precioTotal: 100, incluye: ["hotel"], calificacion: 12 },
];

const esPaqueteValido = (paquete: Paquete): boolean =>
  paquete.nombre.trim().length > 0 &&
  paquete.noches > 0 &&
  paquete.precioTotal > 0 &&
  paquete.incluye.length > 0 &&
  paquete.calificacion >= 0 &&
  paquete.calificacion <= 10;

const comparar = (paquete: Paquete): PaqueteComparado => {
  const precioPorNoche = paquete.precioTotal / paquete.noches;

  return {
    ...paquete,
    precioPorNoche: Math.round(precioPorNoche * 100) / 100,
    puntaje:
      Math.round(
        (paquete.calificacion * 10 +
          paquete.incluye.length * 2 -
          precioPorNoche / 10) *
          100,
      ) / 100,
  };
};

const validos = paquetes.filter(esPaqueteValido);
const invalidos = paquetes.filter((paquete) => !esPaqueteValido(paquete));
const ranking = validos.map(comparar).sort((a, b) => b.puntaje - a.puntaje);
const masBarato = ranking.reduce((a, b) =>
  b.precioPorNoche < a.precioPorNoche ? b : a,
);

console.log("Ejercicio 20: Comparador de turismo");
console.log(`Paquetes validos: ${validos.length} | invalidos: ${invalidos.length}`);
invalidos.forEach((paquete) =>
  console.log(`  - #${paquete.id} "${paquete.nombre}" tiene datos invalidos`),
);
ranking.forEach((p, i) =>
  console.log(
    `${i + 1}. ${p.nombre} (${p.destino}) - $${p.precioPorNoche}/noche - puntaje ${p.puntaje}`,
  ),
);
console.log(`Mas barato por noche: ${masBarato.nombre}`);
