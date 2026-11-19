export {};

// Intermedio 71: Biblioteca con localStorage
// Tematica: libros
// Resolucion: Dulce Morales
//
// Problema: una pequena app de biblioteca que guarda su catalogo y sus prestamos en localStorage.
// Como esto corre en Node (sin navegador), se simula un `Storage` con la misma forma que el de
// localStorage. La app esta en capas: DTO (datos que entran por el formulario o salen del storage)
// -> validacion -> modelo -> repositorio en memoria persistido -> servicio de prestamos -> reportes.

// ===================== STORAGE SIMULADO =====================

// Misma forma que window.localStorage: solo guarda strings
interface AlmacenTexto {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
  removeItem(clave: string): void;
}

class LocalStorageSimulado implements AlmacenTexto {
  private readonly datos: Map<string, string> = new Map();
  getItem(clave: string): string | null { return this.datos.get(clave) ?? null; }
  setItem(clave: string, valor: string): void { this.datos.set(clave, valor); }
  removeItem(clave: string): void { this.datos.delete(clave); }
  get bytes(): number { return [...this.datos.values()].reduce((a, v) => a + v.length, 0); }
}

// ===================== MODELO Y DTO =====================

type Genero = "novela" | "ciencia" | "historia" | "infantil" | "poesia";
const GENEROS: readonly Genero[] = ["novela", "ciencia", "historia", "infantil", "poesia"];

// DTO: lo que llega del formulario "Agregar libro" (todo es texto, como en un <input>)
interface LibroFormDTO {
  readonly isbn: string;
  readonly titulo: string;
  readonly autor: string;
  readonly genero: string;
  readonly anio: string;
  readonly ejemplares: string;
}

interface Libro {
  readonly isbn: string;
  readonly titulo: string;
  readonly autor: string;
  readonly genero: Genero;
  readonly anio: number;
  readonly ejemplares: number;
}

interface Prestamo {
  readonly id: number;
  readonly isbn: string;
  readonly socio: string;
  readonly prestadoDia: number;
  readonly devueltoDia: number | null;
}

type Resultado<T> = { readonly ok: true; readonly valor: T } | { readonly ok: false; readonly errores: readonly string[] };

// ===================== VALIDACION =====================

function esGenero(x: string): x is Genero {
  return GENEROS.some((g) => g === x);
}

function desdeFormulario(dto: LibroFormDTO): Resultado<Libro> {
  const errores: string[] = [];
  const isbn: string = dto.isbn.replace(/-/g, "").trim();
  if (!/^\d{13}$/.test(isbn)) errores.push("ISBN debe tener 13 digitos");
  if (dto.titulo.trim().length < 2) errores.push("titulo muy corto");
  if (dto.autor.trim().length === 0) errores.push("autor obligatorio");
  const genero: string = dto.genero.trim().toLowerCase();
  if (!esGenero(genero)) errores.push(`genero "${dto.genero}" no valido`);
  const anio: number = Number(dto.anio);
  if (!Number.isInteger(anio) || anio < 1450 || anio > 2026) errores.push("anio fuera de rango (1450-2026)");
  const ejemplares: number = Number(dto.ejemplares);
  if (!Number.isInteger(ejemplares) || ejemplares < 1) errores.push("ejemplares debe ser entero >= 1");
  if (errores.length > 0 || !esGenero(genero)) return { ok: false, errores };
  return { ok: true, valor: { isbn, titulo: dto.titulo.trim(), autor: dto.autor.trim(), genero, anio, ejemplares } };
}

// Lo que se lee de localStorage es `unknown`: puede estar viejo o corrupto
function esRegistro(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function esLibro(x: unknown): x is Libro {
  return esRegistro(x) && typeof x["isbn"] === "string" && typeof x["titulo"] === "string" && typeof x["autor"] === "string"
    && typeof x["genero"] === "string" && esGenero(x["genero"]) && typeof x["anio"] === "number" && typeof x["ejemplares"] === "number";
}

function esPrestamo(x: unknown): x is Prestamo {
  return esRegistro(x) && typeof x["id"] === "number" && typeof x["isbn"] === "string" && typeof x["socio"] === "string"
    && typeof x["prestadoDia"] === "number" && (x["devueltoDia"] === null || typeof x["devueltoDia"] === "number");
}

// ===================== REPOSITORIO PERSISTIDO =====================

// Repositorio generico: guarda en memoria y escribe un JSON en el storage cada vez que cambia
class RepositorioPersistido<T, K> {
  private items: Map<K, T> = new Map();
  readonly avisos: string[] = [];

  constructor(
    private readonly almacen: AlmacenTexto,
    private readonly clave: string,
    private readonly idDe: (item: T) => K,
    private readonly guarda: (x: unknown) => x is T,
  ) {
    this.cargar();
  }

  private cargar(): void {
    const texto: string | null = this.almacen.getItem(this.clave);
    if (texto === null) return;
    let datos: unknown;
    try {
      datos = JSON.parse(texto);
    } catch {
      this.avisos.push(`"${this.clave}" tenia JSON corrupto; se empieza vacio`);
      return;
    }
    if (!Array.isArray(datos)) {
      this.avisos.push(`"${this.clave}" no era una lista; se empieza vacio`);
      return;
    }
    const validos: T[] = datos.filter(this.guarda);
    if (validos.length < datos.length) this.avisos.push(`"${this.clave}": ${datos.length - validos.length} registro(s) invalido(s) descartado(s)`);
    this.items = new Map(validos.map((v) => [this.idDe(v), v]));
  }

  private guardar(): void {
    this.almacen.setItem(this.clave, JSON.stringify([...this.items.values()]));
  }

  todos(): readonly T[] { return [...this.items.values()]; }
  buscar(id: K): T | undefined { return this.items.get(id); }
  existe(id: K): boolean { return this.items.has(id); }
  guardarItem(item: T): void { this.items.set(this.idDe(item), item); this.guardar(); }
  borrar(id: K): boolean { const ok: boolean = this.items.delete(id); if (ok) this.guardar(); return ok; }
}

// ===================== SERVICIO =====================

const MAX_PRESTAMOS_SOCIO: number = 3;
const DIAS_PRESTAMO: number = 14;
const MULTA_POR_DIA: number = 5;

class Biblioteca {
  readonly libros: RepositorioPersistido<Libro, string>;
  readonly prestamos: RepositorioPersistido<Prestamo, number>;

  constructor(almacen: AlmacenTexto) {
    this.libros = new RepositorioPersistido<Libro, string>(almacen, "biblio.libros", (l) => l.isbn, esLibro);
    this.prestamos = new RepositorioPersistido<Prestamo, number>(almacen, "biblio.prestamos", (p) => p.id, esPrestamo);
  }

  agregar(dto: LibroFormDTO): string {
    const r: Resultado<Libro> = desdeFormulario(dto);
    if (!r.ok) return `RECHAZADO "${dto.titulo}": ${r.errores.join("; ")}`;
    const previo: Libro | undefined = this.libros.buscar(r.valor.isbn);
    if (previo !== undefined) {
      this.libros.guardarItem({ ...previo, ejemplares: previo.ejemplares + r.valor.ejemplares });
      return `"${previo.titulo}" ya existia: +${r.valor.ejemplares} ejemplar(es)`;
    }
    this.libros.guardarItem(r.valor);
    return `agregado "${r.valor.titulo}"`;
  }

  private activos(): Prestamo[] {
    return this.prestamos.todos().filter((p) => p.devueltoDia === null);
  }

  disponibles(isbn: string): number {
    const libro: Libro | undefined = this.libros.buscar(isbn);
    if (libro === undefined) return 0;
    return libro.ejemplares - this.activos().filter((p) => p.isbn === isbn).length;
  }

  prestar(isbn: string, socio: string, dia: number): string {
    const libro: Libro | undefined = this.libros.buscar(isbn);
    if (libro === undefined) return `no existe el ISBN ${isbn}`;
    const delSocio: Prestamo[] = this.activos().filter((p) => p.socio === socio);
    if (delSocio.length >= MAX_PRESTAMOS_SOCIO) return `${socio} ya tiene ${MAX_PRESTAMOS_SOCIO} prestamos`;
    const vencidos: Prestamo[] = delSocio.filter((p) => dia - p.prestadoDia > DIAS_PRESTAMO);
    if (vencidos.length > 0) return `${socio} tiene ${vencidos.length} prestamo(s) vencido(s)`;
    if (delSocio.some((p) => p.isbn === isbn)) return `${socio} ya tiene "${libro.titulo}"`;
    if (this.disponibles(isbn) <= 0) return `"${libro.titulo}" sin ejemplares disponibles`;
    const id: number = Math.max(0, ...this.prestamos.todos().map((p) => p.id)) + 1;
    this.prestamos.guardarItem({ id, isbn, socio, prestadoDia: dia, devueltoDia: null });
    return `prestamo #${id}: "${libro.titulo}" a ${socio}`;
  }

  devolver(id: number, dia: number): string {
    const p: Prestamo | undefined = this.prestamos.buscar(id);
    if (p === undefined || p.devueltoDia !== null) return `prestamo #${id} no esta activo`;
    this.prestamos.guardarItem({ ...p, devueltoDia: dia });
    const atraso: number = Math.max(0, dia - p.prestadoDia - DIAS_PRESTAMO);
    return `devuelto #${id} (${dia - p.prestadoDia} dias)${atraso > 0 ? ` multa $${atraso * MULTA_POR_DIA} por ${atraso} dia(s) de atraso` : " sin multa"}`;
  }

  // ===== Reportes (DTO de salida) =====
  reporte(dia: number): { readonly porGenero: Readonly<Record<Genero, number>>; readonly masPrestados: readonly string[]; readonly vencidos: readonly string[] } {
    const porGenero: Record<Genero, number> = { novela: 0, ciencia: 0, historia: 0, infantil: 0, poesia: 0 };
    for (const l of this.libros.todos()) porGenero[l.genero] += l.ejemplares;
    const conteo: Map<string, number> = new Map();
    for (const p of this.prestamos.todos()) conteo.set(p.isbn, (conteo.get(p.isbn) ?? 0) + 1);
    const masPrestados: string[] = [...conteo.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 3)
      .map(([isbn, n]) => `${this.libros.buscar(isbn)?.titulo ?? isbn} (${n})`);
    const vencidos: string[] = this.activos()
      .filter((p) => dia - p.prestadoDia > DIAS_PRESTAMO)
      .map((p) => `#${p.id} ${p.socio}: ${dia - p.prestadoDia - DIAS_PRESTAMO} dia(s) de atraso`);
    return { porGenero, masPrestados, vencidos };
  }
}

// ===================== DEMO =====================

const ISBN = { duna: "9788497596824", cosmos: "9788408086161", principito: "9788498381498", odisea: "9788491051411" } as const;

function main(): void {
  const storage: LocalStorageSimulado = new LocalStorageSimulado();

  console.log("=== Sesion 1: catalogo ===");
  const app: Biblioteca = new Biblioteca(storage);
  const formularios: readonly LibroFormDTO[] = [
    { isbn: "978-84-9759-682-4", titulo: "Duna", autor: "F. Herbert", genero: "Novela", anio: "1965", ejemplares: "2" },
    { isbn: ISBN.cosmos, titulo: "Cosmos", autor: "C. Sagan", genero: "ciencia", anio: "1980", ejemplares: "1" },
    { isbn: ISBN.principito, titulo: "El principito", autor: "A. de Saint-Exupery", genero: "infantil", anio: "1943", ejemplares: "3" },
    { isbn: ISBN.odisea, titulo: "La Odisea", autor: "Homero", genero: "epica", anio: "-700", ejemplares: "1" },
    { isbn: "123", titulo: "X", autor: "", genero: "poesia", anio: "2030", ejemplares: "0" },
    { isbn: ISBN.duna, titulo: "Duna (reimpresion)", autor: "F. Herbert", genero: "novela", anio: "2021", ejemplares: "1" },
  ];
  for (const f of formularios) console.log(" ", app.agregar(f));

  console.log("\n=== Sesion 1: prestamos ===");
  const ops: readonly (() => string)[] = [
    () => app.prestar(ISBN.cosmos, "ana", 1),
    () => app.prestar(ISBN.cosmos, "luis", 1),          // sin ejemplares
    () => app.prestar(ISBN.duna, "ana", 2),
    () => app.prestar(ISBN.duna, "ana", 2),             // ya lo tiene
    () => app.prestar(ISBN.principito, "ana", 3),
    () => app.prestar(ISBN.duna, "ana", 3),             // ya tiene 3
    () => app.prestar(ISBN.odisea, "luis", 3),          // no existe (fue rechazado)
    () => app.prestar(ISBN.duna, "luis", 4),
    () => app.devolver(1, 15),                          // limite: 14 dias exactos, sin multa
    () => app.devolver(1, 16),                          // ya devuelto
    () => app.prestar(ISBN.cosmos, "luis", 16),
  ];
  for (const op of ops) console.log(" ", op());
  console.log(`  localStorage ocupa ${storage.bytes} caracteres`);

  console.log("\n=== Sesion 2: se recarga la pagina (nueva instancia, mismo storage) ===");
  const recargada: Biblioteca = new Biblioteca(storage);
  console.log(`  libros cargados: ${recargada.libros.todos().length}, prestamos cargados: ${recargada.prestamos.todos().length}`);
  console.log(" ", recargada.prestar(ISBN.principito, "ana", 25));  // ana tiene vencido Duna (dia 2)
  console.log(" ", recargada.devolver(2, 25));                      // 23 dias: 9 de atraso
  console.log(" ", recargada.prestar(ISBN.principito, "luis", 25));
  console.log(" ", recargada.prestar(ISBN.principito, "beto", 25));

  const rep = recargada.reporte(25);
  console.log("\n=== Reporte dia 25 ===");
  console.log("  Ejemplares por genero:", GENEROS.map((g) => `${g}=${rep.porGenero[g]}`).join(", "));
  console.log("  Mas prestados:", rep.masPrestados.join(", "));
  console.log("  Vencidos:", rep.vencidos.length > 0 ? rep.vencidos.join(" | ") : "ninguno");

  console.log("\n=== Sesion 3: storage danado a mano ===");
  storage.setItem("biblio.prestamos", "{esto no es json");
  storage.setItem("biblio.libros", JSON.stringify([...recargada.libros.todos(), { isbn: 42, titulo: "Roto" }]));
  const danada: Biblioteca = new Biblioteca(storage);
  for (const a of [...danada.libros.avisos, ...danada.prestamos.avisos]) console.log("  aviso:", a);
  console.log(`  libros cargados: ${danada.libros.todos().length}, prestamos cargados: ${danada.prestamos.todos().length}`);
}

main();
