export {};

// tipos
type Rol = 'tanque' | 'mago' | 'asesino' | 'tirador' | 'soporte';
type FaseDraft = 'baneo' | 'seleccion';

interface Heroe {
  readonly nombre: string;
  rol: Rol;
  poder: number;
  victorias: number;
  derrotas: number;
}

// datos
const plantilla: Heroe[] = [
  { nombre: 'Roca Viva', rol: 'tanque', poder: 6, victorias: 30, derrotas: 15 },
  { nombre: 'Tormenta', rol: 'mago', poder: 8, victorias: 25, derrotas: 18 },
  { nombre: 'Cuchilla', rol: 'asesino', poder: 9, victorias: 12, derrotas: 20 },
  { nombre: 'Ojo Veloz', rol: 'tirador', poder: 7, victorias: 28, derrotas: 12 },
  { nombre: 'Eco Blanco', rol: 'soporte', poder: 5, victorias: 22, derrotas: 14 },
  { nombre: 'Vortice', rol: 'mago', poder: 7, victorias: 10, derrotas: 10 },
];

const baneos = new Set<string>(['Cuchilla']);

// reglas
const tamanioEquipo = 5;

// validacion
function validarDraft(draft: DraftEquipo): string[] {
  const errores: string[] = [];

  if (draft.seleccionados.length > tamanioEquipo) errores.push(`${draft.equipo}: equipo incompleto, supera ${tamanioEquipo}`);
  if (draft.seleccionados.some((heroe) => baneos.has(heroe.nombre))) errores.push(`${draft.equipo}: selecciono un heroe baneado`);

  const rolesDuplicados = draft.seleccionados.some((heroe, indice) => draft.seleccionados.findIndex((otro) => otro.rol === heroe.rol) !== indice);
  if (rolesDuplicados) errores.push(`${draft.equipo}: rol repetido`);

  return errores;
}

// calculos
function winrate(heroe: Heroe): number {
  const partidas = heroe.victorias + heroe.derrotas;
  if (partidas === 0) return 0;
  return Number((heroe.victorias / partidas).toFixed(2));
}

interface DraftEquipo {
  readonly equipo: string;
  seleccionados: Heroe[];
}

function mejorOpcionDisponible(plantilla: Heroe[], draft: DraftEquipo): Heroe | null {
  const ocupados = new Set(draft.seleccionados.map((heroe) => heroe.nombre));
  const rolesOcupados = new Set(draft.seleccionados.map((heroe) => heroe.rol));

  const candidatos = plantilla
    .filter((heroe) => !ocupados.has(heroe.nombre) && !baneos.has(heroe.nombre) && !rolesOcupados.has(heroe.rol))
    .sort((a, b) => winrate(b) - winrate(a));

  return candidatos[0] ?? null;
}

function poderTotal(draft: DraftEquipo): number {
  return draft.seleccionados.reduce((total, heroe) => total + heroe.poder + winrate(heroe) * 10, 0);
}

// datos
const draftAzul: DraftEquipo = { equipo: 'Equipo Azul', seleccionados: [plantilla[0], plantilla[1]] };
const draftRojo: DraftEquipo = { equipo: 'Equipo Rojo', seleccionados: [plantilla[3], plantilla[4]] };

// salida
function mostrarResumen(plantilla: Heroe[], drafts: DraftEquipo[]): void {
  console.log('=== Draft inteligente MOBA ===');
  console.log(`Baneos: ${[...baneos].join(', ')}`);

  drafts.forEach((draft) => {
    const siguiente = mejorOpcionDisponible(plantilla, draft);
    console.log(`${draft.equipo} | Poder: ${poderTotal(draft).toFixed(1)} | Sugerencia: ${siguiente ? `${siguiente.nombre} (${siguiente.rol})` : 'sin opciones'}`);
    validarDraft(draft).forEach((error) => console.log(`Alerta: ${error}`));
  });
}

mostrarResumen(plantilla, [draftAzul, draftRojo]);
