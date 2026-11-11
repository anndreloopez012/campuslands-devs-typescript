export {};

// tipos
type Rol = 'tanque' | 'mago' | 'asesino' | 'tirador' | 'soporte';

interface Heroe {
  readonly nombre: string;
  roles: Rol[];
  nivelMaestria: number;
  partidasSemana: number;
  winrate: number;
  baneado: boolean;
}

// datos
const heroes: Heroe[] = [
  { nombre: 'Tormenta', roles: ['mago', 'soporte'], nivelMaestria: 7, partidasSemana: 14, winrate: 0.58, baneado: false },
  { nombre: 'Roca Viva', roles: ['tanque'], nivelMaestria: 5, partidasSemana: 9, winrate: 0.51, baneado: false },
  { nombre: 'Cuchilla', roles: ['asesino'], nivelMaestria: 8, partidasSemana: 21, winrate: 0.64, baneado: true },
  { nombre: 'Ojo Veloz', roles: ['tirador'], nivelMaestria: 3, partidasSemana: 4, winrate: 0.44, baneado: false },
  { nombre: 'Eco Blanco', roles: ['soporte', 'tanque'], nivelMaestria: 6, partidasSemana: 11, winrate: 0.55, baneado: false },
];

// validacion
function validarHeroe(heroe: Heroe): boolean {
  return heroe.roles.length > 0 && heroe.winrate >= 0 && heroe.winrate <= 1 && heroe.partidasSemana >= 0;
}

// calculos
function prioridadRotacion(heroe: Heroe): number {
  if (heroe.baneado) return 0;
  const bonoMaestria = 1 + heroe.nivelMaestria * 0.1;
  const penalizacionInactividad = heroe.partidasSemana < 5 ? 0.7 : 1;
  return Number((heroe.winrate * bonoMaestria * penalizacionInactividad).toFixed(2));
}

function construirRotacion(heroes: Heroe[]): string[] {
  return heroes
    .filter(validarHeroe)
    .filter((heroe) => !heroe.baneado)
    .sort((a, b) => prioridadRotacion(b) - prioridadRotacion(a))
    .slice(0, 3)
    .map((heroe) => heroe.nombre);
}

function contarPorRol(heroes: Heroe[]): Record<Rol, number> {
  const conteo: Record<Rol, number> = { tanque: 0, mago: 0, asesino: 0, tirador: 0, soporte: 0 };
  heroes.forEach((heroe) => {
    heroe.roles.forEach((rol) => {
      conteo[rol] += 1;
    });
  });
  return conteo;
}

// salida
function mostrarResumen(heroes: Heroe[]): void {
  console.log('=== Rotacion de heroes MOBA ===');
  console.log(`Rotacion semanal: ${construirRotacion(heroes).join(', ')}`);
  console.log('Heroes por rol:', contarPorRol(heroes));
  heroes.forEach((heroe) => {
    console.log(`${heroe.nombre} | Prioridad: ${prioridadRotacion(heroe)} | Baneado: ${heroe.baneado ? 'si' : 'no'}`);
  });
}

mostrarResumen(heroes);
