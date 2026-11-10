export {};

// tipos
interface EquipoTemporada {
  readonly nombre: string;
  fuerza: number;
  puntos: number;
  golesFavor: number;
  golesContra: number;
}

// clases
class TemporadaFutbol {
  private readonly equipos: EquipoTemporada[];

  constructor(equipos: EquipoTemporada[]) {
    this.equipos = [...equipos];
  }

  jugarFecha(): void {
    const parejas = this.formarParejas();
    parejas.forEach(([local, visitante]) => {
      const golesLocal = this.calcularGoles(local.fuerza);
      const golesVisitante = this.calcularGoles(visitante.fuerza);

      local.golesFavor += golesLocal;
      local.golesContra += golesVisitante;
      visitante.golesFavor += golesVisitante;
      visitante.golesContra += golesLocal;

      if (golesLocal > golesVisitante) local.puntos += 3;
      else if (golesLocal < golesVisitante) visitante.puntos += 3;
      else {
        local.puntos += 1;
        visitante.puntos += 1;
      }
    });
  }

  private formarParejas(): [EquipoTemporada, EquipoTemporada][] {
    const barajados = [...this.equipos].sort(() => Math.random() - 0.5);
    const parejas: [EquipoTemporada, EquipoTemporada][] = [];
    for (let i = 0; i + 1 < barajados.length; i += 2) {
      parejas.push([barajados[i], barajados[i + 1]]);
    }
    return parejas;
  }

  private calcularGoles(fuerza: number): number {
    return Math.random() < fuerza / 100 ? 1 : 0;
  }

  tabla(): EquipoTemporada[] {
    return [...this.equipos].sort((a, b) => b.puntos - a.puntos || (b.golesFavor - b.golesContra) - (a.golesFavor - a.golesContra));
  }
}

// generics
function mejorDe<T extends { puntos: number }>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items.reduce((mejor, item) => (item.puntos > mejor.puntos ? item : mejor));
}

// datos
const equipos: EquipoTemporada[] = [
  { nombre: 'Lobos Sala', fuerza: 80, puntos: 0, golesFavor: 0, golesContra: 0 },
  { nombre: 'Rayo Futsal', fuerza: 65, puntos: 0, golesFavor: 0, golesContra: 0 },
  { nombre: 'Arena FC', fuerza: 72, puntos: 0, golesFavor: 0, golesContra: 0 },
  { nombre: 'Titanes', fuerza: 58, puntos: 0, golesFavor: 0, golesContra: 0 },
];

// salida
function mostrarResumen(equipos: EquipoTemporada[]): void {
  console.log('=== Temporada modo carrera ===');
  const temporada = new TemporadaFutbol(equipos);
  const fechas = 4;

  for (let fecha = 1; fecha <= fechas; fecha += 1) {
    temporada.jugarFecha();
  }

  console.log(`Tabla tras ${fechas} fechas:`);
  temporada.tabla().forEach((equipo, indice) => {
    console.log(`${indice + 1}. ${equipo.nombre} | Pts: ${equipo.puntos} | GF: ${equipo.golesFavor} | GC: ${equipo.golesContra}`);
  });

  const campeon = mejorDe(temporada.tabla());
  console.log(`Campeon: ${campeon ? campeon.nombre : 'sin equipos'}`);
}

mostrarResumen(equipos);
