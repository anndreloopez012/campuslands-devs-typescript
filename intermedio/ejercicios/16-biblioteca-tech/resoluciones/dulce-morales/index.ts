export {};

// Intermedio 16: Biblioteca tech
// Tematica: libros
// Resolucion: Dulce Morales
//
// Problema: una biblioteca de libros de tecnologia presta ejemplares a sus socios.
// Hay que procesar las solicitudes del dia (prestar y devolver), respetar el limite de
// prestamos por socio, poner en lista de espera cuando no hay ejemplares, cobrar multa
// por cada dia de atraso y mostrar el estado final del catalogo.

// ===================== MODELO (objetos anidados) =====================

type Tema = "frontend" | "backend" | "datos" | "devops" | "seguridad";
type TipoSocio = "estudiante" | "profesional";

interface Libro {
  readonly isbn: string;
  readonly titulo: string;
  readonly autor: { readonly nombre: string; readonly pais: string };
  readonly tema: Tema;
  readonly anio: number;
  readonly ejemplares: number;
}

interface Socio {
  readonly id: string;
  readonly nombre: string;
  readonly tipo: TipoSocio;
}

interface Prestamo {
  readonly isbn: string;
  readonly socioId: string;
  readonly dia: number; // dia del anio en que se presto
  readonly vence: number; // dia limite de devolucion
}

type Solicitud =
  | { readonly accion: "prestar"; readonly socioId: string; readonly isbn: string }
  | { readonly accion: "devolver"; readonly socioId: string; readonly isbn: string };

interface Estado {
  readonly prestamos: readonly Prestamo[];
  readonly esperas: readonly { readonly isbn: string; readonly socioId: string }[];
  readonly multas: Readonly<Record<string, number>>;
}

type Resultado = { readonly ok: true; readonly estado: Estado; readonly mensaje: string } | { readonly ok: false; readonly error: string };

// ===================== REGLAS =====================

const DIAS_PRESTAMO: Readonly<Record<TipoSocio, number>> = { estudiante: 14, profesional: 21 };
const LIMITE_PRESTAMOS: Readonly<Record<TipoSocio, number>> = { estudiante: 2, profesional: 4 };
const MULTA_POR_DIA: number = 0.5;

// ===================== DATOS DE PRUEBA =====================

const HOY: number = 120; // dia 120 del anio

const libros: readonly Libro[] = [
  { isbn: "978-01", titulo: "TypeScript a Fondo", autor: { nombre: "Laura Mejia", pais: "Colombia" }, tema: "frontend", anio: 2024, ejemplares: 2 },
  { isbn: "978-02", titulo: "APIs con Node", autor: { nombre: "Pedro Gil", pais: "Mexico" }, tema: "backend", anio: 2023, ejemplares: 1 },
  { isbn: "978-03", titulo: "SQL para Humanos", autor: { nombre: "Ana Ruiz", pais: "Espana" }, tema: "datos", anio: 2021, ejemplares: 3 },
  { isbn: "978-04", titulo: "Docker sin Miedo", autor: { nombre: "Tomas Vera", pais: "Chile" }, tema: "devops", anio: 2022, ejemplares: 1 },
  { isbn: "978-05", titulo: "Hacking Etico 101", autor: { nombre: "Sara Lind", pais: "Argentina" }, tema: "seguridad", anio: 2020, ejemplares: 2 },
];

const socios: readonly Socio[] = [
  { id: "S1", nombre: "Camila", tipo: "estudiante" },
  { id: "S2", nombre: "Diego", tipo: "profesional" },
  { id: "S3", nombre: "Lucia", tipo: "estudiante" },
  { id: "S4", nombre: "Mateo", tipo: "profesional" },
];

// Prestamos que ya existian al empezar el dia
const estadoInicial: Estado = {
  prestamos: [
    { isbn: "978-02", socioId: "S2", dia: 95, vence: 116 }, // atrasado 4 dias
    { isbn: "978-04", socioId: "S1", dia: 106, vence: 120 }, // vence HOY: sin multa
    { isbn: "978-01", socioId: "S3", dia: 100, vence: 114 }, // atrasado 6 dias
    { isbn: "978-05", socioId: "S3", dia: 110, vence: 124 },
  ],
  esperas: [],
  multas: {},
};

const solicitudes: readonly Solicitud[] = [
  { accion: "devolver", socioId: "S2", isbn: "978-02" }, // devuelve con 4 dias de atraso
  { accion: "devolver", socioId: "S1", isbn: "978-04" }, // limite: el dia exacto del vencimiento
  { accion: "prestar", socioId: "S1", isbn: "978-01" },
  { accion: "prestar", socioId: "S1", isbn: "978-03" }, // Camila llega a su limite (2)
  { accion: "prestar", socioId: "S1", isbn: "978-05" }, // rechazado: limite de estudiante
  { accion: "prestar", socioId: "S4", isbn: "978-01" }, // no quedan ejemplares -> lista de espera
  { accion: "prestar", socioId: "S3", isbn: "978-03" }, // rechazado: tiene un libro atrasado
  { accion: "devolver", socioId: "S4", isbn: "978-03" }, // rechazado: no lo tiene prestado
  { accion: "prestar", socioId: "S9", isbn: "978-02" }, // rechazado: socio no existe
  { accion: "devolver", socioId: "S3", isbn: "978-01" }, // devuelve con 6 dias de atraso; pasa a Mateo
];

// ===================== BUSQUEDAS Y CALCULOS (funciones puras) =====================

function buscarLibro(isbn: string): Libro | undefined {
  return libros.find((l: Libro): boolean => l.isbn === isbn);
}

function buscarSocio(id: string): Socio | undefined {
  return socios.find((s: Socio): boolean => s.id === id);
}

function prestamosDe(estado: Estado, socioId: string): Prestamo[] {
  return estado.prestamos.filter((p: Prestamo): boolean => p.socioId === socioId);
}

function disponibles(estado: Estado, libro: Libro): number {
  return libro.ejemplares - estado.prestamos.filter((p: Prestamo): boolean => p.isbn === libro.isbn).length;
}

function diasAtraso(prestamo: Prestamo, hoy: number): number {
  return Math.max(0, hoy - prestamo.vence);
}

function sumarMulta(multas: Readonly<Record<string, number>>, socioId: string, monto: number): Record<string, number> {
  return { ...multas, [socioId]: (multas[socioId] ?? 0) + monto };
}

// ===================== OPERACIONES (devuelven un estado NUEVO) =====================

function prestar(estado: Estado, socioId: string, isbn: string): Resultado {
  const socio: Socio | undefined = buscarSocio(socioId);
  const libro: Libro | undefined = buscarLibro(isbn);
  if (socio === undefined) return { ok: false, error: `socio ${socioId} no existe` };
  if (libro === undefined) return { ok: false, error: `libro ${isbn} no existe` };

  const actuales: Prestamo[] = prestamosDe(estado, socioId);
  const atrasados: Prestamo[] = actuales.filter((p: Prestamo): boolean => diasAtraso(p, HOY) > 0);
  if (atrasados.length > 0) return { ok: false, error: `${socio.nombre} tiene ${atrasados.length} libro(s) atrasado(s)` };
  if (actuales.length >= LIMITE_PRESTAMOS[socio.tipo]) {
    return { ok: false, error: `${socio.nombre} ya tiene ${actuales.length} libros (limite ${socio.tipo}: ${LIMITE_PRESTAMOS[socio.tipo]})` };
  }

  if (disponibles(estado, libro) <= 0) {
    const yaEspera: boolean = estado.esperas.some((e): boolean => e.isbn === isbn && e.socioId === socioId);
    const esperas = yaEspera ? estado.esperas : [...estado.esperas, { isbn, socioId }];
    return { ok: true, estado: { ...estado, esperas }, mensaje: `sin ejemplares de "${libro.titulo}": ${socio.nombre} queda en lista de espera` };
  }

  const nuevo: Prestamo = { isbn, socioId, dia: HOY, vence: HOY + DIAS_PRESTAMO[socio.tipo] };
  return {
    ok: true,
    estado: { ...estado, prestamos: [...estado.prestamos, nuevo] },
    mensaje: `"${libro.titulo}" prestado a ${socio.nombre} hasta el dia ${nuevo.vence}`,
  };
}

function devolver(estado: Estado, socioId: string, isbn: string): Resultado {
  const prestamo: Prestamo | undefined = estado.prestamos.find((p: Prestamo): boolean => p.socioId === socioId && p.isbn === isbn);
  const socio: Socio | undefined = buscarSocio(socioId);
  const libro: Libro | undefined = buscarLibro(isbn);
  if (prestamo === undefined || socio === undefined || libro === undefined) {
    return { ok: false, error: `${socio?.nombre ?? socioId} no tiene prestado "${libro?.titulo ?? isbn}"` };
  }

  const atraso: number = diasAtraso(prestamo, HOY);
  const multa: number = atraso * MULTA_POR_DIA;
  let siguiente: Estado = {
    ...estado,
    prestamos: estado.prestamos.filter((p: Prestamo): boolean => p !== prestamo),
    multas: multa > 0 ? sumarMulta(estado.multas, socioId, multa) : estado.multas,
  };
  let mensaje: string = `${socio.nombre} devuelve "${libro.titulo}"${atraso > 0 ? ` con ${atraso} dia(s) de atraso: multa $${multa.toFixed(2)}` : " a tiempo"}`;

  // Si alguien esperaba este libro, se le presta automaticamente
  const enEspera = siguiente.esperas.find((e): boolean => e.isbn === isbn);
  if (enEspera !== undefined) {
    const sinEspera: Estado = { ...siguiente, esperas: siguiente.esperas.filter((e): boolean => e !== enEspera) };
    const automatico: Resultado = prestar(sinEspera, enEspera.socioId, isbn);
    if (automatico.ok) {
      siguiente = automatico.estado;
      mensaje += ` -> ${automatico.mensaje} (estaba en espera)`;
    }
  }
  return { ok: true, estado: siguiente, mensaje };
}

function procesar(estado: Estado, solicitud: Solicitud): Resultado {
  switch (solicitud.accion) {
    case "prestar":
      return prestar(estado, solicitud.socioId, solicitud.isbn);
    case "devolver":
      return devolver(estado, solicitud.socioId, solicitud.isbn);
  }
}

// ===================== SALIDA POR CONSOLA =====================

function main(): void {
  console.log(`================= BIBLIOTECA TECH - DIA ${HOY} =================`);
  let estado: Estado = estadoInicial;

  solicitudes.forEach((s: Solicitud, i: number): void => {
    const r: Resultado = procesar(estado, s);
    const etiqueta: string = `${String(i + 1).padStart(2)}. ${s.accion.padEnd(8)}`;
    if (r.ok) {
      estado = r.estado;
      console.log(`${etiqueta} OK  ${r.mensaje}`);
    } else {
      console.log(`${etiqueta} X   ${r.error}`);
    }
  });

  console.log("\n--- Catalogo al cierre ---");
  [...libros]
    .sort((a: Libro, b: Libro): number => a.tema.localeCompare(b.tema) || a.titulo.localeCompare(b.titulo))
    .forEach((l: Libro): void => {
      const libres: number = disponibles(estado, l);
      const espera: number = estado.esperas.filter((e): boolean => e.isbn === l.isbn).length;
      console.log(
        `${l.titulo.padEnd(19)} ${l.autor.nombre.padEnd(12)} ${l.tema.padEnd(10)} ${libres}/${l.ejemplares} disponibles${espera > 0 ? ` | ${espera} en espera` : ""}`,
      );
    });

  console.log("\n--- Prestamos activos ---");
  [...estado.prestamos]
    .sort((a: Prestamo, b: Prestamo): number => a.vence - b.vence)
    .forEach((p: Prestamo): void => {
      const atraso: number = diasAtraso(p, HOY);
      console.log(`${(buscarSocio(p.socioId)?.nombre ?? p.socioId).padEnd(7)} ${(buscarLibro(p.isbn)?.titulo ?? p.isbn).padEnd(19)} vence dia ${p.vence}${atraso > 0 ? `  ATRASADO ${atraso} dia(s)` : ""}`);
    });

  console.log("\n--- Multas cobradas hoy ---");
  const multas: [string, number][] = Object.entries(estado.multas);
  multas.forEach(([id, monto]): void => console.log(`${(buscarSocio(id)?.nombre ?? id).padEnd(7)} $${monto.toFixed(2)}`));
  const total: number = multas.reduce((t: number, [, monto]): number => t + monto, 0);
  console.log(`Total: $${total.toFixed(2)}`);
}

main();
