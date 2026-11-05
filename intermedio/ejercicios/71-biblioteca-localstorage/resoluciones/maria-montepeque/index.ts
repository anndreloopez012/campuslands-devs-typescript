export {};

// Misma forma que localStorage del navegador, pero en memoria para poder correrlo en Node.
interface Almacen {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
}

class AlmacenMemoria implements Almacen {
  private readonly datos = new Map<string, string>();

  getItem(clave: string): string | null {
    return this.datos.get(clave) ?? null;
  }

  setItem(clave: string, valor: string): void {
    this.datos.set(clave, valor);
  }
}

type EstadoLectura = "pendiente" | "leyendo" | "terminado";

interface Libro {
  readonly id: number;
  readonly titulo: string;
  readonly autor: string;
  readonly estado: EstadoLectura;
  readonly pagina: number;
  readonly paginas: number;
}

const CLAVE = "biblioteca-v1";

const esLibro = (valor: unknown): valor is Libro => {
  if (typeof valor !== "object" || valor === null) return false;
  const l = valor as Record<string, unknown>;
  return (
    typeof l.id === "number" &&
    typeof l.titulo === "string" &&
    typeof l.autor === "string" &&
    (l.estado === "pendiente" || l.estado === "leyendo" || l.estado === "terminado") &&
    typeof l.pagina === "number" &&
    typeof l.paginas === "number" &&
    l.paginas > 0
  );
};

class Biblioteca {
  private libros: Libro[] = [];

  constructor(private readonly almacen: Almacen) {
    this.cargar();
  }

  private cargar(): void {
    const crudo = this.almacen.getItem(CLAVE);
    if (crudo === null) return;
    try {
      const datos: unknown = JSON.parse(crudo);
      this.libros = Array.isArray(datos) ? datos.filter(esLibro) : [];
    } catch {
      console.log("  ! Datos guardados corruptos: se empieza con la biblioteca vacia");
    }
  }

  private guardar(): void {
    this.almacen.setItem(CLAVE, JSON.stringify(this.libros));
  }

  agregar(titulo: string, autor: string, paginas: number): void {
    if (titulo.trim() === "" || paginas <= 0) throw new Error("Libro invalido");
    const id = this.libros.reduce((max, l) => Math.max(max, l.id), 0) + 1;
    this.libros = [...this.libros, { id, titulo, autor, estado: "pendiente", pagina: 0, paginas }];
    this.guardar();
  }

  avanzar(id: number, pagina: number): void {
    this.libros = this.libros.map((l) => {
      if (l.id !== id) return l;
      const actual = Math.min(Math.max(pagina, 0), l.paginas);
      return { ...l, pagina: actual, estado: actual === l.paginas ? "terminado" : actual > 0 ? "leyendo" : "pendiente" };
    });
    this.guardar();
  }

  resumen(): string[] {
    return this.libros.map((l) => `#${l.id} ${l.titulo} (${l.autor}) - ${l.estado} ${Math.round((l.pagina / l.paginas) * 100)}%`);
  }
}

console.log("Ejercicio 71: Biblioteca con localStorage");
const almacen = new AlmacenMemoria();

console.log("Sesion 1:");
const sesion1 = new Biblioteca(almacen);
sesion1.agregar("Clean Code", "Robert Martin", 464);
sesion1.agregar("Eloquent JavaScript", "Marijn Haverbeke", 472);
sesion1.avanzar(1, 120);
sesion1.avanzar(2, 472);
try {
  sesion1.agregar("", "Nadie", 10);
} catch (error) {
  console.log(`  ! ${error instanceof Error ? error.message : "error"}`);
}
sesion1.resumen().forEach((l) => console.log(`  ${l}`));

console.log("Sesion 2 (se reabre la app, los datos persisten):");
const sesion2 = new Biblioteca(almacen);
sesion2.avanzar(1, 464);
sesion2.resumen().forEach((l) => console.log(`  ${l}`));

console.log("Sesion 3 con datos corruptos:");
almacen.setItem(CLAVE, "{esto no es json");
new Biblioteca(almacen).resumen().forEach((l) => console.log(`  ${l}`));
