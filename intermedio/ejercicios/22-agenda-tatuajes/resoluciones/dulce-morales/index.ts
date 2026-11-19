export {};

// Intermedio 22: Agenda de tatuajes
// Tematica: tatuajes
// Resolucion: Dulce Morales
//
// Problema: un estudio de tatuajes recibe solicitudes de cita. Cada artista trabaja ciertos
// estilos y tiene su propio horario por dia. Hay que aceptar o rechazar cada solicitud
// (edad, estilo, horario, choques con otras citas, horas maximas por dia, anticipo para
// sesiones largas) y armar la agenda semanal de cada artista con lo que se va a cobrar.

// ===================== MODELO =====================

type Estilo = "fine line" | "blackwork" | "realismo" | "tradicional" | "acuarela";
type Tamano = "mini" | "mediano" | "grande" | "manga";
type DiaSemana = "lun" | "mar" | "mie" | "jue" | "vie" | "sab";
type Horario = readonly [inicio: number, fin: number] | null; // horas en formato 24h; null = no trabaja

interface Artista {
  readonly id: string;
  readonly nombre: string;
  readonly estilos: ReadonlySet<Estilo>;
  readonly tarifaHora: number;
  readonly horario: Readonly<Record<DiaSemana, Horario>>;
}

interface Solicitud {
  readonly folio: number;
  readonly cliente: string;
  readonly edad: number;
  readonly artistaId: string;
  readonly estilo: Estilo;
  readonly tamano: Tamano;
  readonly dia: DiaSemana;
  readonly hora: number; // hora de inicio
  readonly anticipoPagado: boolean;
}

interface Cita {
  readonly solicitud: Solicitud;
  readonly inicio: number;
  readonly fin: number;
  readonly costo: number;
}

type Respuesta = { readonly ok: true; readonly cita: Cita } | { readonly ok: false; readonly motivo: string };

// ===================== REGLAS =====================

const HORAS_POR_TAMANO: Readonly<Record<Tamano, number>> = { mini: 1, mediano: 2, grande: 4, manga: 6 };
const EDAD_MINIMA: number = 18;
const HORAS_MAX_DIA: number = 6; // un artista no tatua mas de 6 h al dia
const HORAS_CON_ANTICIPO: number = 3; // sesiones de 3 h o mas piden anticipo
const DIAS: readonly DiaSemana[] = ["lun", "mar", "mie", "jue", "vie", "sab"];

// ===================== DATOS DE PRUEBA =====================

const artistas: readonly Artista[] = [
  {
    id: "A1", nombre: "Luna", estilos: new Set<Estilo>(["fine line", "acuarela"]), tarifaHora: 60,
    horario: { lun: [10, 18], mar: [10, 18], mie: null, jue: [12, 20], vie: [12, 20], sab: [10, 14] },
  },
  {
    id: "A2", nombre: "Rex", estilos: new Set<Estilo>(["blackwork", "tradicional", "realismo"]), tarifaHora: 80,
    horario: { lun: null, mar: [11, 19], mie: [11, 19], jue: [11, 19], vie: [14, 22], sab: [12, 20] },
  },
];

const solicitudes: readonly Solicitud[] = [
  { folio: 1, cliente: "Valeria", edad: 24, artistaId: "A1", estilo: "fine line", tamano: "mini", dia: "lun", hora: 10, anticipoPagado: false },
  { folio: 2, cliente: "Tomas", edad: 30, artistaId: "A2", estilo: "realismo", tamano: "grande", dia: "mar", hora: 11, anticipoPagado: true },
  // Limite: cliente con 18 exactos -> si
  { folio: 3, cliente: "Ines", edad: 18, artistaId: "A1", estilo: "acuarela", tamano: "mediano", dia: "lun", hora: 11, anticipoPagado: false },
  // Menor de edad
  { folio: 4, cliente: "Mateo", edad: 17, artistaId: "A2", estilo: "tradicional", tamano: "mini", dia: "mar", hora: 16, anticipoPagado: false },
  // Choca con la cita de Tomas (11-15)
  { folio: 5, cliente: "Sara", edad: 27, artistaId: "A2", estilo: "blackwork", tamano: "mediano", dia: "mar", hora: 14, anticipoPagado: false },
  // Estilo que el artista no hace
  { folio: 6, cliente: "Diego", edad: 35, artistaId: "A1", estilo: "realismo", tamano: "mediano", dia: "jue", hora: 12, anticipoPagado: true },
  // Sesion larga sin anticipo
  { folio: 7, cliente: "Paula", edad: 29, artistaId: "A2", estilo: "blackwork", tamano: "manga", dia: "vie", hora: 14, anticipoPagado: false },
  // Limite: con esta cita Rex llega EXACTO a 6 h el martes (4 + 2) -> si
  { folio: 8, cliente: "Camilo", edad: 22, artistaId: "A2", estilo: "tradicional", tamano: "mediano", dia: "mar", hora: 16, anticipoPagado: false },
  // Rex ya tiene 6 h el martes (4 + 2): no puede mas
  { folio: 9, cliente: "Lucia", edad: 26, artistaId: "A2", estilo: "tradicional", tamano: "mini", dia: "mar", hora: 18, anticipoPagado: false },
  // Dia que no trabaja
  { folio: 10, cliente: "Marta", edad: 40, artistaId: "A1", estilo: "fine line", tamano: "mini", dia: "mie", hora: 12, anticipoPagado: false },
  // Se pasa del horario del sabado (10-14)
  { folio: 11, cliente: "Bruno", edad: 31, artistaId: "A1", estilo: "acuarela", tamano: "grande", dia: "sab", hora: 12, anticipoPagado: true },
  { folio: 12, cliente: "Elena", edad: 33, artistaId: "A2", estilo: "realismo", tamano: "manga", dia: "sab", hora: 12, anticipoPagado: true },
  { folio: 13, cliente: "Nico", edad: 21, artistaId: "A9", estilo: "fine line", tamano: "mini", dia: "lun", hora: 12, anticipoPagado: false },
  // Limite: termina EXACTO a las 14:00, cuando Luna cierra el sabado -> si
  { folio: 14, cliente: "Gabi", edad: 25, artistaId: "A1", estilo: "fine line", tamano: "mini", dia: "sab", hora: 13, anticipoPagado: false },
];

// ===================== VALIDACION (funciones puras) =====================

function horasOcupadas(citas: readonly Cita[], dia: DiaSemana): number {
  return citas.filter((c: Cita): boolean => c.solicitud.dia === dia).reduce((t: number, c: Cita): number => t + (c.fin - c.inicio), 0);
}

function seCruza(citas: readonly Cita[], dia: DiaSemana, inicio: number, fin: number): Cita | undefined {
  // Dos intervalos se cruzan si uno empieza antes de que el otro termine (terminar a la hora en que otro empieza no cuenta)
  return citas.find((c: Cita): boolean => c.solicitud.dia === dia && inicio < c.fin && c.inicio < fin);
}

function evaluar(s: Solicitud, artista: Artista | undefined, citasArtista: readonly Cita[]): Respuesta {
  if (artista === undefined) return { ok: false, motivo: `artista ${s.artistaId} no existe` };
  if (s.edad < EDAD_MINIMA) return { ok: false, motivo: `cliente de ${s.edad} anios (minimo ${EDAD_MINIMA})` };
  if (!artista.estilos.has(s.estilo)) return { ok: false, motivo: `${artista.nombre} no hace ${s.estilo} (hace ${[...artista.estilos].join(", ")})` };

  const duracion: number = HORAS_POR_TAMANO[s.tamano];
  const inicio: number = s.hora;
  const fin: number = s.hora + duracion;
  if (duracion >= HORAS_CON_ANTICIPO && !s.anticipoPagado) return { ok: false, motivo: `sesion de ${duracion} h requiere anticipo` };

  const horario: Horario = artista.horario[s.dia];
  if (horario === null) return { ok: false, motivo: `${artista.nombre} no trabaja el ${s.dia}` };
  const [abre, cierra] = horario;
  if (inicio < abre || fin > cierra) return { ok: false, motivo: `${inicio}:00-${fin}:00 fuera del horario (${abre}:00-${cierra}:00)` };

  const choque: Cita | undefined = seCruza(citasArtista, s.dia, inicio, fin);
  if (choque !== undefined) return { ok: false, motivo: `se cruza con la cita de ${choque.solicitud.cliente} (${choque.inicio}:00-${choque.fin}:00)` };

  const ocupadas: number = horasOcupadas(citasArtista, s.dia);
  if (ocupadas + duracion > HORAS_MAX_DIA) return { ok: false, motivo: `${artista.nombre} ya tiene ${ocupadas} h el ${s.dia} (maximo ${HORAS_MAX_DIA})` };

  return { ok: true, cita: { solicitud: s, inicio, fin, costo: duracion * artista.tarifaHora } };
}

// Procesa en orden de folio y guarda las citas por artista en un Map
function armarAgenda(lista: readonly Solicitud[]): { agenda: Map<string, Cita[]>; rechazos: { s: Solicitud; motivo: string }[] } {
  const porId: Map<string, Artista> = new Map(artistas.map((a: Artista): [string, Artista] => [a.id, a]));
  const agenda: Map<string, Cita[]> = new Map(artistas.map((a: Artista): [string, Cita[]] => [a.id, []]));
  const rechazos: { s: Solicitud; motivo: string }[] = [];

  for (const s of [...lista].sort((a, b): number => a.folio - b.folio)) {
    const citas: Cita[] = agenda.get(s.artistaId) ?? [];
    const r: Respuesta = evaluar(s, porId.get(s.artistaId), citas);
    if (r.ok) {
      agenda.set(s.artistaId, [...citas, r.cita]);
    } else {
      rechazos.push({ s, motivo: r.motivo });
    }
  }
  return { agenda, rechazos };
}

// ===================== SALIDA POR CONSOLA =====================

function main(): void {
  const { agenda, rechazos } = armarAgenda(solicitudes);

  console.log("====================== AGENDA DE LA SEMANA ======================");
  for (const artista of artistas) {
    const citas: Cita[] = agenda.get(artista.id) ?? [];
    const total: number = citas.reduce((t: number, c: Cita): number => t + c.costo, 0);
    console.log(`\n${artista.nombre} (${[...artista.estilos].join(", ")}) - $${artista.tarifaHora}/h`);
    for (const dia of DIAS) {
      const delDia: Cita[] = citas.filter((c: Cita): boolean => c.solicitud.dia === dia).sort((a, b): number => a.inicio - b.inicio);
      if (delDia.length === 0) continue;
      console.log(`  ${dia} (${horasOcupadas(citas, dia)} h):`);
      delDia.forEach((c: Cita): void => {
        const s: Solicitud = c.solicitud;
        console.log(`    ${String(c.inicio).padStart(2)}:00-${String(c.fin).padStart(2)}:00 ${s.cliente.padEnd(8)} ${s.estilo.padEnd(11)} ${s.tamano.padEnd(8)} $${c.costo}`);
      });
    }
    console.log(`  Total de la semana: ${citas.length} cita(s), $${total}`);
  }

  console.log("\n====================== SOLICITUDES RECHAZADAS ======================");
  rechazos.forEach(({ s, motivo }): void => console.log(`#${String(s.folio).padStart(2)} ${s.cliente.padEnd(7)} ${motivo}`));

  const estilosAgendados: Set<Estilo> = new Set(
    [...agenda.values()].flat().map((c: Cita): Estilo => c.solicitud.estilo),
  );
  const aceptadas: number = solicitudes.length - rechazos.length;
  console.log(`\nAceptadas ${aceptadas} de ${solicitudes.length} | estilos agendados: ${[...estilosAgendados].sort().join(", ")}`);
}

main();
