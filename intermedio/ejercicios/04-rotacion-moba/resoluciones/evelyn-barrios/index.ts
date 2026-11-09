export {};

type RolMoba = "Top" | "Jungla" | "Mid" | "ADC" | "Support";
type Complejidad = "Baja" | "Media" | "Alta";

interface HeroeMoba {
  readonly id: string;
  readonly nombre: string;
  readonly rolPrincipal: RolMoba;
  readonly complejidad: Complejidad;
  readonly winRate: number;
  readonly estaEnRotacionGratuita: boolean;
}

interface EstadisticasRotacion {
  readonly totalHeroesRotacion: number;
  readonly rolesCubiertos: readonly RolMoba[];
  readonly promedioWinRate: number;
  readonly recomendacionPrincipiantes: readonly HeroeMoba[];
}

function calcularPromedioWinRate(heroes: readonly HeroeMoba[]): number {
  if (heroes.length === 0) return 0;
  const suma = heroes.reduce((acc, h) => acc + h.winRate, 0);
  return Number((suma / heroes.length).toFixed(2));
}

function obtenerRolesCubiertos(heroes: readonly HeroeMoba[]): RolMoba[] {
  const rolesUnicos = new Set<RolMoba>();
  for (const heroe of heroes) {
    rolesUnicos.add(heroe.rolPrincipal);
  }
  return Array.from(rolesUnicos);
}

function filtrarParaPrincipiantes(heroes: readonly HeroeMoba[]): HeroeMoba[] {
  return heroes.filter(
    (heroe) => heroe.complejidad === "Baja" && heroe.winRate >= 50
  );
}

function analizarRotacionSemanal(plantilla: readonly HeroeMoba[]): EstadisticasRotacion {
  const heroesEnRotacion = plantilla.filter((h) => h.estaEnRotacionGratuita);

  return {
    totalHeroesRotacion: heroesEnRotacion.length,
    rolesCubiertos: obtenerRolesCubiertos(heroesEnRotacion),
    promedioWinRate: calcularPromedioWinRate(heroesEnRotacion),
    recomendacionPrincipiantes: filtrarParaPrincipiantes(heroesEnRotacion),
  };
}

const catalogoHeroes: HeroeMoba[] = [
  { id: "mb-01", nombre: "Garen", rolPrincipal: "Top", complejidad: "Baja", winRate: 52.4, estaEnRotacionGratuita: true },
  { id: "mb-02", nombre: "Ahri", rolPrincipal: "Mid", complejidad: "Media", winRate: 51.1, estaEnRotacionGratuita: true },
  { id: "mb-03", nombre: "Lee Sin", rolPrincipal: "Jungla", complejidad: "Alta", winRate: 48.7, estaEnRotacionGratuita: false },
  { id: "mb-04", nombre: "Ashe", rolPrincipal: "ADC", complejidad: "Baja", winRate: 50.8, estaEnRotacionGratuita: true },
  { id: "mb-05", nombre: "Thresh", rolPrincipal: "Support", complejidad: "Alta", winRate: 49.9, estaEnRotacionGratuita: true },
  { id: "mb-06", nombre: "Warwick", rolPrincipal: "Jungla", complejidad: "Baja", winRate: 53.2, estaEnRotacionGratuita: true },
];

const resumenRotacion = analizarRotacionSemanal(catalogoHeroes);

console.log("=== ROTACIÓN SEMANAL MOBA ===");
console.log(`Héroes gratuitos esta semana: ${resumenRotacion.totalHeroesRotacion}`);
console.log(`Roles presentes: ${resumenRotacion.rolesCubiertos.join(", ")}`);
console.log(`WinRate promedio de la rotación: ${resumenRotacion.promedioWinRate}%`);
console.log("Héroes recomendados para principiantes:");
resumenRotacion.recomendacionPrincipiantes.forEach((h) => {
  console.log(`- ${h.nombre} (${h.rolPrincipal}) - WinRate: ${h.winRate}%`);
});
