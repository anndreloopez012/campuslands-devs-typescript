export {};

type Disciplina = "arquitectonico" | "estructural" | "electrico";
type EstadoPlano = "borrador" | "revision" | "aprobado";

interface Plano {
  readonly codigo: string;
  readonly proyecto: string;
  readonly disciplina: Disciplina;
  readonly revision: number;
  readonly fecha: string;
  readonly estado: EstadoPlano;
}

const planos: readonly Plano[] = [
  { codigo: "A-01", proyecto: "Torre Norte", disciplina: "arquitectonico", revision: 1, fecha: "2026-03-01", estado: "aprobado" },
  { codigo: "A-01", proyecto: "Torre Norte", disciplina: "arquitectonico", revision: 3, fecha: "2026-04-10", estado: "revision" },
  { codigo: "A-01", proyecto: "Torre Norte", disciplina: "arquitectonico", revision: 2, fecha: "2026-03-20", estado: "aprobado" },
  { codigo: "E-01", proyecto: "Torre Norte", disciplina: "estructural", revision: 2, fecha: "2026-03-25", estado: "aprobado" },
  { codigo: "L-01", proyecto: "Torre Norte", disciplina: "electrico", revision: 1, fecha: "2026-04-02", estado: "borrador" },
  { codigo: "A-01", proyecto: "Casa Lago", disciplina: "arquitectonico", revision: 1, fecha: "2026-02-14", estado: "aprobado" },
  { codigo: "E-01", proyecto: "Casa Lago", disciplina: "estructural", revision: 1, fecha: "2026-02-20", estado: "aprobado" },
  { codigo: "X-99", proyecto: "Casa Lago", disciplina: "electrico", revision: 0, fecha: "2026-02-20", estado: "borrador" },
  { codigo: "", proyecto: "Casa Lago", disciplina: "electrico", revision: 1, fecha: "2026-02-21", estado: "borrador" },
];

const esPlanoValido = (p: Plano): boolean =>
  p.codigo.trim().length > 0 &&
  p.revision >= 1 &&
  !Number.isNaN(new Date(`${p.fecha}T00:00:00Z`).getTime());

const ultimasRevisiones = (items: readonly Plano[]): Map<string, Plano> =>
  items.reduce((mapa, p) => {
    const clave = `${p.proyecto}|${p.codigo}`;
    const actual = mapa.get(clave);
    if (!actual || p.revision > actual.revision) mapa.set(clave, p);
    return mapa;
  }, new Map<string, Plano>());

const validos = planos.filter(esPlanoValido);
const invalidos = planos.filter((p) => !esPlanoValido(p));
const vigentes = [...ultimasRevisiones(validos).values()];
const porProyecto = vigentes.reduce(
  (mapa, p) => mapa.set(p.proyecto, [...(mapa.get(p.proyecto) ?? []), p]),
  new Map<string, Plano[]>(),
);

console.log("Ejercicio 49: Control de planos 3D");
console.log(`Registros validos: ${validos.length} | invalidos: ${invalidos.length}`);
invalidos.forEach((p) => console.log(`  - "${p.codigo}" rev ${p.revision} de ${p.proyecto} es invalido`));
porProyecto.forEach((items, proyecto) => {
  const aprobados = items.filter((p) => p.estado === "aprobado").length;
  console.log(`${proyecto}: ${aprobados}/${items.length} planos vigentes aprobados (${Math.round((aprobados / items.length) * 100)}%)`);
  items.forEach((p) => console.log(`    ${p.codigo} rev ${p.revision} [${p.estado}] ${p.fecha}`));
});
console.log(`Revisiones reemplazadas: ${validos.length - vigentes.length}`);
