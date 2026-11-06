// Solución Ejercicio Intermedio 47 - Stefani Sánchez
export {};

type Tecnica = "grafito" | "tinta" | "digital" | "acuarela";
type EstadoObra = "borrador" | "terminada" | "publicada";

interface Obra {
  readonly id: number;
  readonly titulo: string;
  readonly tecnica: Tecnica;
  readonly fecha: string;
  readonly horas: number;
  readonly estado: EstadoObra;
}

const siguienteEstado: Record<EstadoObra, EstadoObra | null> = {
  borrador: "terminada",
  terminada: "publicada",
  publicada: null,
};

const obras: readonly Obra[] = [
  { id: 1, titulo: "Retrato de Abuela", tecnica: "grafito", fecha: "2026-01-20", horas: 12, estado: "publicada" },
  { id: 2, titulo: "Ciudad en Tinta", tecnica: "tinta", fecha: "2026-02-03", horas: 8, estado: "terminada" },
  { id: 3, titulo: "Dragon Cibernetico", tecnica: "digital", fecha: "2026-02-18", horas: 20, estado: "publicada" },
  { id: 4, titulo: "Lluvia de Mayo", tecnica: "acuarela", fecha: "2026-03-05", horas: 6, estado: "borrador" },
  { id: 5, titulo: "Boceto Rapido", tecnica: "grafito", fecha: "2026-03-09", horas: 1, estado: "borrador" },
  { id: 6, titulo: "Guerrera Neon", tecnica: "digital", fecha: "2026-03-28", horas: 15, estado: "terminada" },
  { id: 7, titulo: "", tecnica: "tinta", fecha: "2026-03-30", horas: 4, estado: "borrador" },
  { id: 8, titulo: "Mes Imposible", tecnica: "acuarela", fecha: "2026-14-01", horas: 5, estado: "borrador" },
];

const esObraValida = (o: Obra): boolean =>
  o.titulo.trim().length > 0 && o.horas > 0 && !Number.isNaN(new Date(`${o.fecha}T00:00:00Z`).getTime());

const avanzar = (obra: Obra): Obra => {
  const siguiente = siguienteEstado[obra.estado];
  return siguiente ? { ...obra, estado: siguiente } : obra;
};

const horasPorTecnica = (items: readonly Obra[]): Map<Tecnica, number> =>
  items.reduce((m, o) => m.set(o.tecnica, (m.get(o.tecnica) ?? 0) + o.horas), new Map<Tecnica, number>());

const obrasPorMes = (items: readonly Obra[]): Map<string, string[]> =>
  items.reduce((m, o) => m.set(o.fecha.slice(0, 7), [...(m.get(o.fecha.slice(0, 7)) ?? []), o.titulo]), new Map<string, string[]>());

const validas = obras.filter(esObraValida);
const invalidas = obras.filter((o) => !esObraValida(o));
const aPublicar = validas.filter((o) => o.estado === "terminada").map(avanzar);
const totalHoras = validas.reduce((acc, o) => acc + o.horas, 0);

console.log("Ejercicio 47: Portafolio de dibujo");
console.log(`Obras validas: ${validas.length} | invalidas: ${invalidas.length}`);
invalidas.forEach((o) => console.log(`  - #${o.id} "${o.titulo}" tiene datos invalidos`));
horasPorTecnica(validas).forEach((h, t) => console.log(`  ${t}: ${h} h`));
obrasPorMes(validas).forEach((titulos, mes) => console.log(`  ${mes}: ${titulos.join(", ")}`));
aPublicar.forEach((o) => console.log(`  >> "${o.titulo}" pasa a ${o.estado}`));
console.log(`Total: ${totalHoras} h | promedio por obra: ${Math.round((totalHoras / validas.length) * 10) / 10} h`);
