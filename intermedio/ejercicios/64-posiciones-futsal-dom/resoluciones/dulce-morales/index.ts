export {};

// Intermedio 64: Tabla futsal interactiva
// Tematica: futbol sala
// Resolucion: Dulce Morales
//
// Problema: una pagina muestra la tabla de posiciones de una liga de futsal y el usuario interactua:
// hace clic en una columna para ordenar (otro clic invierte el orden), escribe en un buscador para
// filtrar, selecciona un equipo para ver su detalle y registra resultados nuevos. Cada interaccion
// es un evento tipado que entra a un reducer puro; la vista se vuelve a "pintar" con el estado nuevo.
//
// Nota: se ejecuta con Node, asi que no hay DOM real. Los clics y lo que se escribe en el buscador
// se simulan como eventos, y render() devuelve el texto que mostraria la tabla HTML.

// ===================== TIPOS =====================

type Columna = "puntos" | "dg" | "gf" | "nombre";
type Direccion = "desc" | "asc";

interface Equipo {
  readonly nombre: string;
  readonly pj: number;
  readonly g: number;
  readonly e: number;
  readonly p: number;
  readonly gf: number;
  readonly gc: number;
}

interface EstadoUI {
  readonly equipos: readonly Equipo[];
  readonly orden: { readonly columna: Columna; readonly direccion: Direccion };
  readonly filtro: string;
  readonly seleccionado: string | null;
  readonly error: string | null;
}

// Eventos de la interfaz: union discriminada
type EventoUI =
  | { readonly tipo: "CLIC_COLUMNA"; readonly columna: Columna }
  | { readonly tipo: "ESCRIBIR_BUSQUEDA"; readonly texto: string }
  | { readonly tipo: "CLIC_FILA"; readonly equipo: string }
  | { readonly tipo: "REGISTRAR_RESULTADO"; readonly local: string; readonly visita: string; readonly gl: number; readonly gv: number };

// ===================== CALCULOS =====================

const puntos = (e: Equipo): number => e.g * 3 + e.e;
const dg = (e: Equipo): number => e.gf - e.gc;

function valor(e: Equipo, c: Columna): number | string {
  switch (c) {
    case "puntos":
      return puntos(e);
    case "dg":
      return dg(e);
    case "gf":
      return e.gf;
    case "nombre":
      return e.nombre;
  }
}

function sumarPartido(e: Equipo, favor: number, contra: number): Equipo {
  return { ...e, pj: e.pj + 1, g: e.g + (favor > contra ? 1 : 0), e: e.e + (favor === contra ? 1 : 0), p: e.p + (favor < contra ? 1 : 0), gf: e.gf + favor, gc: e.gc + contra };
}

// ===================== REDUCER PURO =====================

function reducer(s: EstadoUI, ev: EventoUI): EstadoUI {
  switch (ev.tipo) {
    case "CLIC_COLUMNA": {
      // Mismo encabezado: invierte el orden. Otro encabezado: orden por defecto (nombre A-Z, numeros de mayor a menor)
      const direccion: Direccion =
        s.orden.columna === ev.columna ? (s.orden.direccion === "desc" ? "asc" : "desc") : ev.columna === "nombre" ? "asc" : "desc";
      return { ...s, orden: { columna: ev.columna, direccion }, error: null };
    }
    case "ESCRIBIR_BUSQUEDA":
      return { ...s, filtro: ev.texto.trim().toLowerCase(), error: null };
    case "CLIC_FILA":
      // Clic en la fila ya seleccionada: la deselecciona
      return { ...s, seleccionado: s.seleccionado === ev.equipo ? null : ev.equipo, error: null };
    case "REGISTRAR_RESULTADO": {
      const nombres: string[] = s.equipos.map((e) => e.nombre);
      if (!nombres.includes(ev.local) || !nombres.includes(ev.visita)) return { ...s, error: "equipo inexistente" };
      if (ev.local === ev.visita) return { ...s, error: "un equipo no juega contra si mismo" };
      if (![ev.gl, ev.gv].every((g) => Number.isInteger(g) && g >= 0)) return { ...s, error: "goles invalidos" };
      const equipos: Equipo[] = s.equipos.map((e) =>
        e.nombre === ev.local ? sumarPartido(e, ev.gl, ev.gv) : e.nombre === ev.visita ? sumarPartido(e, ev.gv, ev.gl) : e,
      );
      return { ...s, equipos, error: null };
    }
  }
}

// ===================== VISTA ("render") =====================

function filasVisibles(s: EstadoUI): Equipo[] {
  const signo: number = s.orden.direccion === "desc" ? -1 : 1;
  return s.equipos
    .filter((e) => e.nombre.toLowerCase().includes(s.filtro))
    .sort((a, b) => {
      const va: number | string = valor(a, s.orden.columna);
      const vb: number | string = valor(b, s.orden.columna);
      const comp: number = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      // Desempate como en una tabla real: puntos, diferencia de goles, goles a favor, nombre
      return signo * comp || puntos(b) - puntos(a) || dg(b) - dg(a) || b.gf - a.gf || a.nombre.localeCompare(b.nombre);
    });
}

function render(s: EstadoUI): string {
  // El encabezado de la columna ordenada lleva una flecha (v = mayor a menor, ^ = menor a mayor)
  const titulo = (texto: string, c: Columna | null, ancho: number): string => {
    const marca: string = c !== null && s.orden.columna === c ? (s.orden.direccion === "desc" ? "v" : "^") : "";
    return `${texto}${marca}`.padStart(ancho);
  };
  const lineas: string[] = [
    `   ${titulo("Equipo", "nombre", 7).trimStart().padEnd(14)}${titulo("PJ", null, 3)}${titulo("G", null, 3)}${titulo("E", null, 3)}${titulo("P", null, 3)}${titulo("GF", "gf", 5)}${titulo("GC", null, 5)}${titulo("DG", "dg", 5)}${titulo("PTS", "puntos", 6)}`,
  ];
  const filas: Equipo[] = filasVisibles(s);
  filas.forEach((e) => {
    const sel: string = s.seleccionado === e.nombre ? ">" : " ";
    const dif: string = dg(e) > 0 ? `+${dg(e)}` : String(dg(e));
    lineas.push(`${sel}  ${e.nombre.padEnd(14)}${String(e.pj).padStart(3)}${String(e.g).padStart(3)}${String(e.e).padStart(3)}${String(e.p).padStart(3)}${String(e.gf).padStart(5)}${String(e.gc).padStart(5)}${dif.padStart(5)}${String(puntos(e)).padStart(6)}`);
  });
  if (filas.length === 0) lineas.push(`   (ningun equipo coincide con "${s.filtro}")`);
  if (s.filtro !== "") lineas.push(`   filtro: "${s.filtro}" (${filas.length} de ${s.equipos.length})`);
  const sel: Equipo | undefined = s.equipos.find((e) => e.nombre === s.seleccionado);
  if (sel !== undefined) lineas.push(`   Detalle ${sel.nombre}: ${Math.round((puntos(sel) / (sel.pj * 3)) * 100)}% de los puntos posibles, ${(sel.gf / sel.pj).toFixed(1)} goles por partido`);
  if (s.error !== null) lineas.push(`   X ${s.error}`);
  return lineas.join("\n");
}

// ===================== SESION DEL USUARIO =====================

const inicial: EstadoUI = {
  equipos: [
    { nombre: "Rayos FS", pj: 6, g: 4, e: 1, p: 1, gf: 28, gc: 17 },
    { nombre: "Furia Roja", pj: 6, g: 4, e: 1, p: 1, gf: 24, gc: 13 },
    { nombre: "Titanes", pj: 6, g: 3, e: 2, p: 1, gf: 21, gc: 15 },
    { nombre: "Atletico Sala", pj: 6, g: 2, e: 1, p: 3, gf: 19, gc: 22 },
    { nombre: "Real Futsal", pj: 6, g: 1, e: 2, p: 3, gf: 15, gc: 24 },
    { nombre: "Rapidos", pj: 6, g: 1, e: 1, p: 4, gf: 14, gc: 30 },
  ],
  orden: { columna: "puntos", direccion: "desc" },
  filtro: "",
  seleccionado: null,
  error: null,
};

const sesion: readonly [string, EventoUI][] = [
  ["clic en 'GF'", { tipo: "CLIC_COLUMNA", columna: "gf" }],
  ["otro clic en 'GF' (invierte)", { tipo: "CLIC_COLUMNA", columna: "gf" }],
  ["escribe 'ra' en el buscador", { tipo: "ESCRIBIR_BUSQUEDA", texto: "ra" }],
  ["clic en la fila de Rapidos", { tipo: "CLIC_FILA", equipo: "Rapidos" }],
  ["escribe 'xyz'", { tipo: "ESCRIBIR_BUSQUEDA", texto: "xyz" }],
  ["borra la busqueda (sigue ordenada por GF)", { tipo: "ESCRIBIR_BUSQUEDA", texto: "" }],
  ["clic en 'PTS'", { tipo: "CLIC_COLUMNA", columna: "puntos" }],
  ["registra Furia Roja 5-2 Rayos FS", { tipo: "REGISTRAR_RESULTADO", local: "Furia Roja", visita: "Rayos FS", gl: 5, gv: 2 }],
  ["registra un resultado con goles negativos", { tipo: "REGISTRAR_RESULTADO", local: "Titanes", visita: "Rapidos", gl: -1, gv: 0 }],
  ["vuelve a hacer clic en Rapidos (deselecciona)", { tipo: "CLIC_FILA", equipo: "Rapidos" }],
];

function main(): void {
  // Empate: Rayos y Furia tienen 13 pts y +11; se desempata por goles a favor (Rayos 28, Furia 24)
  let s: EstadoUI = inicial;
  console.log("== Vista inicial (ordenada por puntos) ==");
  console.log(render(s));
  for (const [descripcion, evento] of sesion) {
    s = reducer(s, evento);
    console.log(`\n== ${descripcion} ==`);
    console.log(render(s));
  }
}

main();
