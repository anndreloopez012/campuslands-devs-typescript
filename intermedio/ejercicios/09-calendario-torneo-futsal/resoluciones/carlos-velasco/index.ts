export {};

// tipos
interface Equipo {
  readonly nombre: string;
  readonly jugadoras: number;
}

interface Partido {
  readonly local: string;
  readonly visitante: string;
  golesLocal: number;
  golesVisitante: number;
  jugado: boolean;
}

interface PosicionTabla {
  readonly equipo: string;
  jugados: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  puntos: number;
}

// datos
const equipos: Equipo[] = [
  { nombre: 'Lobos Sala', jugadoras: 10 },
  { nombre: 'Rayo Futsal', jugadoras: 11 },
  { nombre: 'Arena FC', jugadoras: 9 },
];

const partidos: Partido[] = [
  { local: 'Lobos Sala', visitante: 'Rayo Futsal', golesLocal: 4, golesVisitante: 2, jugado: true },
  { local: 'Rayo Futsal', visitante: 'Arena FC', golesLocal: 3, golesVisitante: 3, jugado: true },
  { local: 'Arena FC', visitante: 'Lobos Sala', golesLocal: 1, golesVisitante: 1, jugado: true },
  { local: 'Lobos Sala', visitante: 'Arena FC', golesLocal: 0, golesVisitante: 0, jugado: false },
];

// validacion
function validarPartido(partido: Partido): boolean {
  return partido.golesLocal >= 0 && partido.golesVisitante >= 0 && partido.local !== partido.visitante;
}

// calculos
function iniciarTabla(equipos: Equipo[]): Record<string, PosicionTabla> {
  return equipos.reduce<Record<string, PosicionTabla>>((tabla, equipo) => {
    tabla[equipo.nombre] = { equipo: equipo.nombre, jugados: 0, ganados: 0, empatados: 0, perdidos: 0, puntos: 0 };
    return tabla;
  }, {});
}

function actualizarTabla(tabla: Record<string, PosicionTabla>, partido: Partido): void {
  const local = tabla[partido.local];
  const visitante = tabla[partido.visitante];

  if (!validarPartido(partido) || !local || !visitante) return;

  local.jugados += 1;
  visitante.jugados += 1;

  if (partido.golesLocal > partido.golesVisitante) {
    local.ganados += 1;
    visitante.perdidos += 1;
    local.puntos += 3;
  } else if (partido.golesLocal < partido.golesVisitante) {
    visitante.ganados += 1;
    local.perdidos += 1;
    visitante.puntos += 3;
  } else {
    local.empatados += 1;
    visitante.empatados += 1;
    local.puntos += 1;
    visitante.puntos += 1;
  }
}

function construirTabla(equipos: Equipo[], partidos: Partido[]): PosicionTabla[] {
  const tabla = iniciarTabla(equipos);
  partidos.forEach((partido) => actualizarTabla(tabla, partido));
  return Object.values(tabla).sort((a, b) => b.puntos - a.puntos);
}

// salida
function mostrarResumen(equipos: Equipo[], partidos: Partido[]): void {
  console.log('=== Calendario de torneo futsal ===');
  console.log('Tabla de posiciones:');
  construirTabla(equipos, partidos).forEach((posicion, indice) => {
    console.log(`${indice + 1}. ${posicion.equipo} | PJ: ${posicion.jugados} | PG: ${posicion.ganados} | PE: ${posicion.empatados} | PP: ${posicion.perdidos} | Pts: ${posicion.puntos}`);
  });

  const pendientes = partidos.filter((partido) => !partido.jugado).length;
  console.log(`Partidos pendientes: ${pendientes}`);
}

mostrarResumen(equipos, partidos);
