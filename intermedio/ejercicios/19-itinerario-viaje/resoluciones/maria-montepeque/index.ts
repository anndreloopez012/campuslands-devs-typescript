export {};

type TipoActividad = "transporte" | "hospedaje" | "tour" | "comida";

interface Actividad {
  readonly nombre: string;
  readonly tipo: TipoActividad;
  readonly horaInicio: number;
  readonly horaFin: number;
  readonly costo: number;
}

interface DiaItinerario {
  readonly dia: number;
  readonly ciudad: string;
  readonly actividades: readonly Actividad[];
}

interface ResumenDia {
  readonly dia: number;
  readonly ciudad: string;
  readonly costoTotal: number;
  readonly horasPlanificadas: number;
}

const itinerario: readonly DiaItinerario[] = [
  {
    dia: 1,
    ciudad: "Antigua Guatemala",
    actividades: [
      { nombre: "Shuttle al hotel", tipo: "transporte", horaInicio: 8, horaFin: 10, costo: 15 },
      { nombre: "Check-in", tipo: "hospedaje", horaInicio: 10, horaFin: 11, costo: 40 },
      { nombre: "Almuerzo en el mercado", tipo: "comida", horaInicio: 12, horaFin: 13, costo: 8 },
    ],
  },
  {
    dia: 2,
    ciudad: "Lago de Atitlan",
    actividades: [
      { nombre: "Lancha a San Pedro", tipo: "transporte", horaInicio: 9, horaFin: 10, costo: 6 },
      { nombre: "Tour de cafe", tipo: "tour", horaInicio: 11, horaFin: 15, costo: 25 },
    ],
  },
  {
    dia: 3,
    ciudad: "Tikal",
    actividades: [
      { nombre: "Tour amanecer", tipo: "tour", horaInicio: 5, horaFin: 11, costo: 60 },
      { nombre: "Cena", tipo: "comida", horaInicio: 10, horaFin: 9, costo: 12 },
    ],
  },
  { dia: 4, ciudad: "", actividades: [] },
];

const esActividadValida = (actividad: Actividad): boolean =>
  actividad.nombre.trim().length > 0 &&
  actividad.horaInicio >= 0 &&
  actividad.horaFin <= 24 &&
  actividad.horaFin > actividad.horaInicio &&
  actividad.costo >= 0;

const esDiaValido = (dia: DiaItinerario): boolean =>
  dia.ciudad.trim().length > 0 &&
  dia.actividades.length > 0 &&
  dia.actividades.every(esActividadValida);

const resumirDia = (dia: DiaItinerario): ResumenDia => ({
  dia: dia.dia,
  ciudad: dia.ciudad,
  costoTotal: dia.actividades.reduce((acc, a) => acc + a.costo, 0),
  horasPlanificadas: dia.actividades.reduce(
    (acc, a) => acc + (a.horaFin - a.horaInicio),
    0,
  ),
});

const validos = itinerario.filter(esDiaValido);
const invalidos = itinerario.filter((dia) => !esDiaValido(dia));
const resumenes = validos.map(resumirDia);
const presupuesto = resumenes.reduce((acc, r) => acc + r.costoTotal, 0);

console.log("Ejercicio 19: Itinerario de viaje");
console.log(`Dias validos: ${validos.length} | invalidos: ${invalidos.length}`);
invalidos.forEach((dia) => console.log(`  - Dia ${dia.dia} tiene datos invalidos`));
resumenes.forEach((r) =>
  console.log(
    `  Dia ${r.dia} - ${r.ciudad}: $${r.costoTotal} en ${r.horasPlanificadas} hora(s)`,
  ),
);
console.log(`Presupuesto total: $${presupuesto}`);
