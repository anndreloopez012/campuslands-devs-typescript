// Solución Ejercicio Intermedio 46 - Stefani Sánchez
export {};

type Estilo = "realismo" | "tradicional" | "minimalista" | "geometrico";
type EstadoDiseno = "disponible" | "reservado" | "retirado";

interface Diseno {
  readonly id: number;
  readonly nombre: string;
  readonly estilo: Estilo;
  readonly tamanoCm: number;
  readonly horasEstimadas: number;
  readonly estado: EstadoDiseno;
  readonly fechaAlta: string;
}

const FECHA_REFERENCIA = "2026-08-01";
const TARIFA_HORA = 75;
const DIAS_ANTIGUO = 180;

const catalogo: readonly Diseno[] = [
  { id: 1, nombre: "Lobo Nocturno", estilo: "realismo", tamanoCm: 18, horasEstimadas: 6, estado: "disponible", fechaAlta: "2026-06-15" },
  { id: 2, nombre: "Ancla Clasica", estilo: "tradicional", tamanoCm: 10, horasEstimadas: 3, estado: "reservado", fechaAlta: "2025-12-01" },
  { id: 3, nombre: "Linea Montana", estilo: "minimalista", tamanoCm: 6, horasEstimadas: 1, estado: "disponible", fechaAlta: "2026-07-20" },
  { id: 4, nombre: "Mandala Hex", estilo: "geometrico", tamanoCm: 14, horasEstimadas: 4, estado: "disponible", fechaAlta: "2025-10-10" },
  { id: 5, nombre: "Rosa Vieja", estilo: "tradicional", tamanoCm: 12, horasEstimadas: 3, estado: "retirado", fechaAlta: "2025-03-05" },
  { id: 6, nombre: "Sin Medidas", estilo: "minimalista", tamanoCm: 0, horasEstimadas: 2, estado: "disponible", fechaAlta: "2026-05-05" },
  { id: 7, nombre: "Fecha Rota", estilo: "realismo", tamanoCm: 20, horasEstimadas: 5, estado: "disponible", fechaAlta: "ayer" },
];

const fechaValida = (fecha: string): boolean => !Number.isNaN(new Date(`${fecha}T00:00:00Z`).getTime());

const esDisenoValido = (d: Diseno): boolean =>
  d.nombre.trim().length > 0 && d.tamanoCm > 0 && d.horasEstimadas > 0 && fechaValida(d.fechaAlta);

const diasDesde = (fecha: string): number =>
  Math.floor((Date.parse(`${FECHA_REFERENCIA}T00:00:00Z`) - Date.parse(`${fecha}T00:00:00Z`)) / 86_400_000);

const agruparPor = <K extends string>(items: readonly Diseno[], clave: (d: Diseno) => K): Map<K, Diseno[]> =>
  items.reduce((mapa, d) => mapa.set(clave(d), [...(mapa.get(clave(d)) ?? []), d]), new Map<K, Diseno[]>());

const validos = catalogo.filter(esDisenoValido);
const invalidos = catalogo.filter((d) => !esDisenoValido(d));
const activos = validos.filter((d) => d.estado !== "retirado");
const antiguos = activos.filter((d) => diasDesde(d.fechaAlta) > DIAS_ANTIGUO);

console.log("Ejercicio 46: Catalogo de estilos tattoo");
console.log(`Disenos validos: ${validos.length} | invalidos: ${invalidos.length}`);
invalidos.forEach((d) => console.log(`  - #${d.id} "${d.nombre}" tiene datos invalidos`));
agruparPor(activos, (d) => d.estilo).forEach((items, estilo) => {
  const precio = items.reduce((acc, d) => acc + d.horasEstimadas * TARIFA_HORA, 0);
  console.log(`  ${estilo}: ${items.length} diseno(s), valor estimado $${precio}`);
});
agruparPor(validos, (d) => d.estado).forEach((items, estado) => console.log(`  estado ${estado}: ${items.length}`));
antiguos.forEach((d) => console.log(`  ! "${d.nombre}" lleva ${diasDesde(d.fechaAlta)} dias en catalogo`));
