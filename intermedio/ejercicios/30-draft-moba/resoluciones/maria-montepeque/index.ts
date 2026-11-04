export {};

type Rol = "tanque" | "soporte" | "asesino" | "mago" | "tirador";

interface Heroe {
  readonly nombre: string;
  readonly rol: Rol;
}

interface Draft {
  readonly equipo: string;
  readonly picks: readonly string[];
}

const heroes: readonly Heroe[] = [
  { nombre: "Bastion", rol: "tanque" },
  { nombre: "Granito", rol: "tanque" },
  { nombre: "Aura", rol: "soporte" },
  { nombre: "Sombra", rol: "asesino" },
  { nombre: "Filo", rol: "asesino" },
  { nombre: "Nova", rol: "mago" },
  { nombre: "Rayo", rol: "tirador" },
  { nombre: "Halcon", rol: "tirador" },
];

const MAX_POR_ROL = 2;
const TAMANO_DRAFT = 5;

const drafts: readonly Draft[] = [
  { equipo: "Aguilas", picks: ["Bastion", "Aura", "Sombra", "Nova", "Rayo"] },
  { equipo: "Lobos", picks: ["Sombra", "Filo", "Nova", "Rayo", "Halcon"] },
  { equipo: "Titanes", picks: ["Bastion", "Granito", "Aura", "Nova", "Rayo"] },
  { equipo: "Cuervos", picks: ["Bastion", "Aura", "Aura", "Nova", "Rayo"] },
  { equipo: "Fantasmas", picks: ["Bastion", "Aura", "Zorro", "Nova", "Rayo"] },
  { equipo: "Cortos", picks: ["Bastion", "Aura"] },
];

const buscarHeroe = (nombre: string): Heroe | undefined =>
  heroes.find((heroe) => heroe.nombre === nombre);

const contarRoles = (picks: readonly string[]): Partial<Record<Rol, number>> =>
  picks.reduce<Partial<Record<Rol, number>>>((acc, nombre) => {
    const heroe = buscarHeroe(nombre);
    if (heroe) acc[heroe.rol] = (acc[heroe.rol] ?? 0) + 1;
    return acc;
  }, {});

const revisarDraft = (draft: Draft): string[] => {
  const problemas: string[] = [];
  const unicos = new Set(draft.picks);
  const desconocidos = draft.picks.filter((nombre) => !buscarHeroe(nombre));
  const roles = contarRoles(draft.picks);

  if (draft.picks.length !== TAMANO_DRAFT) problemas.push(`necesita ${TAMANO_DRAFT} picks`);
  if (unicos.size !== draft.picks.length) problemas.push("hay heroes repetidos");
  desconocidos.forEach((nombre) => problemas.push(`heroe desconocido: ${nombre}`));
  if (!roles.tanque) problemas.push("falta un tanque");
  if (!roles.soporte) problemas.push("falta un soporte");
  (Object.entries(roles) as [Rol, number][])
    .filter(([, cantidad]) => cantidad > MAX_POR_ROL)
    .forEach(([rol, cantidad]) => problemas.push(`demasiados ${rol} (${cantidad})`));

  return problemas;
};

console.log("Ejercicio 30: Draft inteligente MOBA");
drafts.forEach((draft) => {
  const problemas = revisarDraft(draft);
  console.log(
    problemas.length === 0
      ? `  ${draft.equipo}: draft VALIDO`
      : `  ${draft.equipo}: INVALIDO - ${problemas.join("; ")}`,
  );
});
