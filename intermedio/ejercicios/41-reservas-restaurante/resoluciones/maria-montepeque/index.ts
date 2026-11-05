export {};

type EstadoReserva = "confirmada" | "pendiente" | "cancelada";

interface Reserva {
  readonly id: number;
  readonly cliente: string;
  readonly fecha: string;
  readonly hora: string;
  readonly personas: number;
  readonly estado: EstadoReserva;
}

const CAPACIDAD_POR_DIA = 20;

const reservas: readonly Reserva[] = [
  { id: 1, cliente: "Familia Paz", fecha: "2026-05-02", hora: "13:00", personas: 6, estado: "confirmada" },
  { id: 2, cliente: "Oscar", fecha: "2026-05-02", hora: "20:30", personas: 2, estado: "confirmada" },
  { id: 3, cliente: "Empresa Alfa", fecha: "2026-05-02", hora: "14:00", personas: 10, estado: "confirmada" },
  { id: 4, cliente: "Rita", fecha: "2026-05-02", hora: "21:00", personas: 4, estado: "pendiente" },
  { id: 5, cliente: "Sergio", fecha: "2026-05-03", hora: "19:00", personas: 3, estado: "cancelada" },
  { id: 6, cliente: "Tania", fecha: "2026-05-03", hora: "12:30", personas: 5, estado: "confirmada" },
  { id: 7, cliente: "Ulises", fecha: "2026-02-30", hora: "13:00", personas: 2, estado: "confirmada" },
  { id: 8, cliente: "Vera", fecha: "2026-05-04", hora: "25:00", personas: 2, estado: "pendiente" },
  { id: 9, cliente: "Walter", fecha: "2026-05-04", hora: "18:00", personas: 0, estado: "confirmada" },
];

const fechaExiste = (fecha: string): boolean => {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!partes) return false;
  const [, anio, mes, dia] = partes.map(Number);
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  return d.getUTCFullYear() === anio && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
};

const horaExiste = (hora: string): boolean => {
  const partes = /^(\d{2}):(\d{2})$/.exec(hora);
  return partes !== null && Number(partes[1]) < 24 && Number(partes[2]) < 60;
};

const esReservaValida = (r: Reserva): boolean =>
  r.cliente.trim().length > 0 &&
  fechaExiste(r.fecha) &&
  horaExiste(r.hora) &&
  r.personas >= 1 &&
  r.personas <= 12;

const agruparPorFecha = (items: readonly Reserva[]): Map<string, Reserva[]> =>
  [...items]
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
    .reduce((mapa, r) => mapa.set(r.fecha, [...(mapa.get(r.fecha) ?? []), r]), new Map<string, Reserva[]>());

const validas = reservas.filter(esReservaValida);
const invalidas = reservas.filter((r) => !esReservaValida(r));

console.log("Ejercicio 41: Reservas de restaurante");
console.log(`Reservas validas: ${validas.length} | invalidas: ${invalidas.length}`);
invalidas.forEach((r) => console.log(`  - #${r.id} ${r.cliente || "(sin nombre)"} tiene fecha, hora o personas invalidas`));
agruparPorFecha(validas).forEach((dia, fecha) => {
  const ocupados = dia.filter((r) => r.estado !== "cancelada").reduce((acc, r) => acc + r.personas, 0);
  const alerta = ocupados > CAPACIDAD_POR_DIA ? ` SOBRECUPO (+${ocupados - CAPACIDAD_POR_DIA})` : "";
  console.log(`${fecha}: ${ocupados}/${CAPACIDAD_POR_DIA} lugares${alerta}`);
  dia.forEach((r) => console.log(`    ${r.hora} ${r.cliente} x${r.personas} [${r.estado}]`));
});
