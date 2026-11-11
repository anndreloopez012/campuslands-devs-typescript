export {};

// tipos
type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada';
type TamanoTatuaje = 'pequeno' | 'medio' | 'grande';

interface Cita {
  readonly id: number;
  readonly cliente: string;
  readonly artista: string;
  readonly dia: string;
  hora: string;
  tamano: TamanoTatuaje;
  estado: EstadoCita;
}

// datos
const citas: Cita[] = [
  { id: 1, cliente: 'Ana', artista: 'Tinta Roja', dia: 'lunes', hora: '10:00', tamano: 'pequeno', estado: 'confirmada' },
  { id: 2, cliente: 'Bruno', artista: 'Tinta Roja', dia: 'lunes', hora: '14:00', tamano: 'grande', estado: 'pendiente' },
  { id: 3, cliente: 'Carla', artista: 'Nigra', dia: 'martes', hora: '11:00', tamano: 'medio', estado: 'cancelada' },
  { id: 4, cliente: 'Ana', artista: 'Nigra', dia: 'lunes', hora: '10:00', tamano: 'pequeno', estado: 'pendiente' },
];

// reglas
const duracionHoras: Record<TamanoTatuaje, number> = { pequeno: 1, medio: 3, grande: 6 };
const citasMaximasPorDia = 4;

// validacion
function validarCita(cita: Cita, citas: Cita[]): string[] {
  const errores: string[] = [];

  const choque = citas.find((otra) => otra.id !== cita.id && otra.artista === cita.artista && otra.dia === cita.dia && otra.hora === cita.hora && otra.estado !== 'cancelada');
  if (choque) errores.push(`Cita ${cita.id}: choque de horario con la cita ${choque.id}`);

  return errores;
}

// calculos
function contarPorArtista(citas: Cita[]): Map<string, number> {
  return citas.reduce<Map<string, number>>((mapa, cita) => {
    mapa.set(cita.artista, (mapa.get(cita.artista) ?? 0) + 1);
    return mapa;
  }, new Map());
}

function horasAgendadas(citas: Cita[]): number {
  return citas
    .filter((cita) => cita.estado !== 'cancelada')
    .reduce((total, cita) => total + duracionHoras[cita.tamano], 0);
}

function clientesUnicos(citas: Cita[]): Set<string> {
  return new Set(citas.map((cita) => cita.cliente));
}

function agendaDelDia(citas: Cita[], dia: string): Cita[] {
  return citas
    .filter((cita) => cita.dia === dia && cita.estado !== 'cancelada')
    .sort((a, b) => a.hora.localeCompare(b.hora));
}

// salida
function mostrarResumen(citas: Cita[]): void {
  console.log('=== Agenda de tatuajes ===');
  contarPorArtista(citas).forEach((cantidad, artista) => {
    console.log(`${artista}: ${cantidad} citas`);
  });
  console.log(`Horas agendadas: ${horasAgendadas(citas)}`);
  console.log(`Clientes unicos: ${[...clientesUnicos(citas)].join(', ')}`);
  console.log('Agenda del lunes:');
  agendaDelDia(citas, 'lunes').forEach((cita) => {
    console.log(`- ${cita.hora} ${cita.cliente} (${cita.tamano}, ${cita.estado})`);
  });

  citas.forEach((cita) => {
    const errores = validarCita(cita, citas);
    if (errores.length > 0) console.log(`Alerta: ${errores.join('; ')}`);
  });
  console.log(`Limite por dia (${citasMaximasPorDia}): lunes tiene ${agendaDelDia(citas, 'lunes').length}`);
}

mostrarResumen(citas);
