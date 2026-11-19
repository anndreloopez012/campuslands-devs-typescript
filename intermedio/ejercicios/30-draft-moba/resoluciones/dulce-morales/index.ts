export {};

// Intermedio 30: Draft inteligente MOBA
// Tematica: videojuegos MOBA
// Resolucion: Dulce Morales
//
// Problema: antes de una partida, dos equipos se turnan para bloquear (ban) y elegir (pick)
// heroes. El equipo Azul usa un asistente que recomienda cada pick segun: el winrate del heroe,
// si contrarresta a los heroes enemigos, si combina con los aliados y que rol le falta al equipo.
// El equipo Rojo elige a mano y el programa valida sus acciones (heroe ya tomado, rol repetido).

// ===================== MODELO =====================

type Rol = "tanque" | "jungla" | "mago" | "tirador" | "soporte";
type Equipo = "Azul" | "Rojo";
type Accion = "ban" | "pick";

interface Heroe {
  readonly nombre: string;
  readonly rol: Rol;
  readonly winrate: number; // %
}

interface Paso {
  readonly equipo: Equipo;
  readonly accion: Accion;
}

interface Recomendacion {
  readonly heroe: Heroe;
  readonly puntaje: number;
  readonly razones: readonly string[];
}

// ===================== DATOS (Record, Map, Set) =====================

const HEROES: readonly Heroe[] = [
  { nombre: "Gorrak", rol: "tanque", winrate: 51 }, { nombre: "Bastion", rol: "tanque", winrate: 49 },
  { nombre: "Vex", rol: "jungla", winrate: 53 }, { nombre: "Kael", rol: "jungla", winrate: 50 },
  { nombre: "Lyra", rol: "mago", winrate: 52 }, { nombre: "Orin", rol: "mago", winrate: 48 },
  { nombre: "Quill", rol: "tirador", winrate: 50 }, { nombre: "Vesper", rol: "tirador", winrate: 54 },
  { nombre: "Mira", rol: "soporte", winrate: 51 }, { nombre: "Elara", rol: "soporte", winrate: 50 },
  { nombre: "Nyx", rol: "jungla", winrate: 55 }, { nombre: "Zarek", rol: "mago", winrate: 53 },
  { nombre: "Ryn", rol: "tirador", winrate: 52 }, { nombre: "Thorn", rol: "jungla", winrate: 49 },
];

// Heroe -> heroes a los que contrarresta
const CONTRARRESTA: ReadonlyMap<string, ReadonlySet<string>> = new Map<string, ReadonlySet<string>>([
  ["Bastion", new Set(["Vex", "Nyx"])],
  ["Kael", new Set(["Lyra", "Zarek"])],
  ["Orin", new Set(["Gorrak", "Bastion"])],
  ["Quill", new Set(["Vesper"])],
  ["Elara", new Set(["Nyx", "Vex"])],
  ["Mira", new Set(["Quill"])],
  ["Zarek", new Set(["Mira", "Elara"])],
]);

// Parejas que combinan bien (sinergia)
const SINERGIAS: readonly (readonly [string, string])[] = [
  ["Gorrak", "Lyra"], ["Mira", "Vesper"], ["Bastion", "Quill"], ["Kael", "Elara"], ["Orin", "Gorrak"],
];

const PUNTOS: Readonly<Record<"contra" | "sinergia" | "rolFaltante", number>> = { contra: 6, sinergia: 4, rolFaltante: 10 };

// Orden del draft: 2 bans por equipo y luego picks alternados (1-2-2-2-2-1)
const ORDEN: readonly Paso[] = [
  { equipo: "Azul", accion: "ban" }, { equipo: "Rojo", accion: "ban" }, { equipo: "Azul", accion: "ban" }, { equipo: "Rojo", accion: "ban" },
  { equipo: "Azul", accion: "pick" }, { equipo: "Rojo", accion: "pick" }, { equipo: "Rojo", accion: "pick" },
  { equipo: "Azul", accion: "pick" }, { equipo: "Azul", accion: "pick" }, { equipo: "Rojo", accion: "pick" },
  { equipo: "Rojo", accion: "pick" }, { equipo: "Azul", accion: "pick" }, { equipo: "Azul", accion: "pick" }, { equipo: "Rojo", accion: "pick" },
];

// Lo que intenta el equipo Rojo (incluye errores para validar)
// (si un intento no es valido, pasa al siguiente de la lista)
const INTENTOS_ROJO: readonly string[] = [
  "Nyx", "Vesper", // bans
  "Vesper", // error: ya esta bloqueado
  "Gorrak",
  "Bastion", // error: Rojo ya tiene tanque
  "Quill",
  "Lyra", "Kael", "Elara", "Orin", "Mira", "Zarek", "Thorn",
];
// Bans del Azul
const BANS_AZUL: readonly string[] = ["Zarek", "Vex"];

// ===================== ESTADO DEL DRAFT =====================

interface Estado {
  readonly bloqueados: Set<string>;
  readonly picks: Record<Equipo, Heroe[]>;
}

function heroe(nombre: string): Heroe | undefined {
  return HEROES.find((h: Heroe): boolean => h.nombre === nombre);
}

function tomados(e: Estado): Set<string> {
  return new Set([...e.bloqueados, ...e.picks.Azul.map((h) => h.nombre), ...e.picks.Rojo.map((h) => h.nombre)]);
}

function validarAccion(e: Estado, equipo: Equipo, accion: Accion, nombre: string): string | null {
  const h: Heroe | undefined = heroe(nombre);
  if (h === undefined) return `${nombre} no existe`;
  if (tomados(e).has(nombre)) return `${nombre} ya fue bloqueado o elegido`;
  if (accion === "pick" && e.picks[equipo].some((x: Heroe): boolean => x.rol === h.rol)) return `${equipo} ya tiene un ${h.rol}`;
  return null;
}

// ===================== RECOMENDADOR =====================

function recomendar(e: Estado, equipo: Equipo): Recomendacion[] {
  const rival: Equipo = equipo === "Azul" ? "Rojo" : "Azul";
  const libres: Heroe[] = HEROES.filter((h: Heroe): boolean => !tomados(e).has(h.nombre));
  const rolesTomados: Set<Rol> = new Set(e.picks[equipo].map((h: Heroe): Rol => h.rol));

  return libres
    .filter((h: Heroe): boolean => !rolesTomados.has(h.rol)) // un heroe por rol
    .map((h: Heroe): Recomendacion => {
      const razones: string[] = [`winrate ${h.winrate}%`];
      let puntaje: number = h.winrate;
      const contras: string[] = e.picks[rival].filter((r: Heroe): boolean => CONTRARRESTA.get(h.nombre)?.has(r.nombre) ?? false).map((r) => r.nombre);
      if (contras.length > 0) {
        puntaje += PUNTOS.contra * contras.length;
        razones.push(`contrarresta a ${contras.join(", ")}`);
      }
      const amigos: string[] = e.picks[equipo]
        .filter((a: Heroe): boolean => SINERGIAS.some(([x, y]): boolean => (x === h.nombre && y === a.nombre) || (y === h.nombre && x === a.nombre)))
        .map((a) => a.nombre);
      if (amigos.length > 0) {
        puntaje += PUNTOS.sinergia * amigos.length;
        razones.push(`combina con ${amigos.join(", ")}`);
      }
      puntaje += PUNTOS.rolFaltante;
      return { heroe: h, puntaje, razones };
    })
    .sort((a, b): number => b.puntaje - a.puntaje || a.heroe.nombre.localeCompare(b.heroe.nombre));
}

// ===================== SIMULACION =====================

function main(): void {
  const estado: Estado = { bloqueados: new Set<string>(), picks: { Azul: [], Rojo: [] } };
  const intentosRojo: string[] = [...INTENTOS_ROJO];
  const bansAzul: string[] = [...BANS_AZUL];

  console.log("========================= DRAFT =========================");
  ORDEN.forEach((paso: Paso, i: number): void => {
    const n: string = `${String(i + 1).padStart(2)}. ${paso.equipo.padEnd(4)} ${paso.accion.padEnd(4)}`;

    if (paso.equipo === "Azul") {
      if (paso.accion === "ban") {
        const nombre: string = bansAzul.shift() ?? "";
        estado.bloqueados.add(nombre);
        console.log(`${n} ${nombre}`);
        return;
      }
      const [mejor, segunda] = recomendar(estado, "Azul");
      if (mejor === undefined) {
        console.log(`${n} X no quedan heroes libres para los roles que le faltan al equipo`);
        return;
      }
      estado.picks.Azul.push(mejor.heroe);
      const alterna: string = segunda ? ` | alternativa: ${segunda.heroe.nombre} (${segunda.puntaje})` : "";
      console.log(`${n} ${mejor.heroe.nombre.padEnd(8)} [${mejor.heroe.rol}] puntaje ${mejor.puntaje}: ${mejor.razones.join("; ")}${alterna}`);
      return;
    }

    // Equipo Rojo: prueba sus intentos en orden hasta que uno sea valido
    while (intentosRojo.length > 0) {
      const nombre: string = intentosRojo.shift() ?? "";
      const error: string | null = validarAccion(estado, "Rojo", paso.accion, nombre);
      if (error !== null) {
        console.log(`${n} X ${error}, se pide otro`);
        continue;
      }
      const h: Heroe | undefined = heroe(nombre);
      if (h === undefined) continue;
      if (paso.accion === "ban") estado.bloqueados.add(nombre);
      else estado.picks.Rojo.push(h);
      console.log(`${n} ${nombre}${paso.accion === "pick" ? ` [${h.rol}]` : ""}`);
      return;
    }
  });

  console.log("\n========================= RESULTADO =========================");
  (["Azul", "Rojo"] as const).forEach((eq: Equipo): void => {
    const lista: Heroe[] = estado.picks[eq];
    const promedio: number = Math.round((lista.reduce((s: number, h: Heroe): number => s + h.winrate, 0) / Math.max(1, lista.length)) * 10) / 10;
    console.log(`${eq.padEnd(4)}: ${lista.map((h) => `${h.nombre} (${h.rol})`).join(", ")} | winrate promedio ${promedio}%`);
  });
  console.log(`Bloqueados: ${[...estado.bloqueados].join(", ")}`);
}

main();
