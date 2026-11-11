export {};

// tipos
type TipoActividad = 'cultura' | 'naturaleza' | 'gastronomia' | 'descanso';

interface Actividad {
  readonly nombre: string;
  tipo: TipoActividad;
  costoUsd: number;
  duracionHoras: number;
}

interface DiaItinerario {
  readonly numero: number;
  readonly ciudad: string;
  actividades: Actividad[];
}

// datos
const itinerario: DiaItinerario[] = [
  { numero: 1, ciudad: 'Lisboa', actividades: [
    { nombre: 'Barrio Alfama', tipo: 'cultura', costoUsd: 0, duracionHoras: 3 },
    { nombre: 'Cena de tapas', tipo: 'gastronomia', costoUsd: 25, duracionHoras: 2 },
  ] },
  { numero: 2, ciudad: 'Lisboa', actividades: [
    { nombre: 'Mirador del puente', tipo: 'naturaleza', costoUsd: 8, duracionHoras: 2 },
    { nombre: 'Museo de azulejos', tipo: 'cultura', costoUsd: 12, duracionHoras: 3 },
  ] },
  { numero: 3, ciudad: 'Sintra', actividades: [
    { nombre: 'Palacio de la Pena', tipo: 'cultura', costoUsd: 20, duracionHoras: 4 },
  ] },
];

// validacion
function validarDia(dia: DiaItinerario): string[] {
  const errores: string[] = [];

  if (dia.actividades.length === 0) errores.push(`Dia ${dia.numero}: sin actividades`);
  if (!dia.actividades.every((actividad) => actividad.costoUsd >= 0 && actividad.duracionHoras > 0)) errores.push(`Dia ${dia.numero}: actividad con datos invalidos`);

  return errores;
}

// calculos
function costoDia(dia: DiaItinerario): number {
  return dia.actividades.reduce((total, actividad) => total + actividad.costoUsd, 0);
}

function costoTotal(itinerario: DiaItinerario[]): number {
  return itinerario.reduce((total, dia) => total + costoDia(dia), 0);
}

function horasTotales(itinerario: DiaItinerario[]): number {
  return itinerario.reduce((total, dia) => total + dia.actividades.reduce((suma, actividad) => suma + actividad.duracionHoras, 0), 0);
}

function agregarActividad(dia: DiaItinerario, actividad: Actividad): void {
  dia.actividades.push(actividad);
}

function actividadesPorTipo(itinerario: DiaItinerario[]): Record<TipoActividad, number> {
  const conteo: Record<TipoActividad, number> = { cultura: 0, naturaleza: 0, gastronomia: 0, descanso: 0 };
  itinerario.forEach((dia) => {
    dia.actividades.forEach((actividad) => {
      conteo[actividad.tipo] += 1;
    });
  });
  return conteo;
}

// salida
function mostrarResumen(itinerario: DiaItinerario[]): void {
  console.log('=== Itinerario de viaje ===');
  itinerario.forEach((dia) => {
    const errores = validarDia(dia);
    console.log(`Dia ${dia.numero} (${dia.ciudad}) | Actividades: ${dia.actividades.length} | Costo: $${costoDia(dia)}${errores.length > 0 ? ` | ${errores.join('; ')}` : ''}`);
  });

  agregarActividad(itinerario[2], { nombre: 'Tarde de playa', tipo: 'descanso', costoUsd: 0, duracionHoras: 2 });
  console.log(`Costo total del viaje: $${costoTotal(itinerario)}`);
  console.log(`Horas planificadas: ${horasTotales(itinerario)}`);
  console.log('Actividades por tipo:', actividadesPorTipo(itinerario));
}

mostrarResumen(itinerario);
