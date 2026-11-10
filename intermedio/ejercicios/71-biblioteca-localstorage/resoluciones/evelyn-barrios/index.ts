export {};

interface LibroDTO {
  readonly isbn: string;
  readonly titulo: string;
  readonly autor: string;
  readonly anioPublicacion: number;
  readonly copiasDisponibles: number;
}

interface AlmacenamientoLocalStorageMock {
  obtenerItem(clave: string): string | null;
  guardarItem(clave: string, valor: string): void;
}

class RepositorioBibliotecaMemoria {
  private baseDatos: Map<string, string> = new Map();

  obtenerItem(clave: string): string | null {
    return this.baseDatos.get(clave) ?? null;
  }

  guardarItem(clave: string, valor: string): void {
    this.baseDatos.set(clave, valor);
  }
}

class ServicioBiblioteca {
  private readonly storageKey = "campuslands_libros_storage";

  constructor(private readonly storage: AlmacenamientoLocalStorageMock) {}

  guardarLibros(libros: readonly LibroDTO[]): void {
    this.storage.guardarItem(this.storageKey, JSON.stringify(libros));
  }

  recuperarLibros(): readonly LibroDTO[] {
    const raw = this.storage.obtenerItem(this.storageKey);
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as LibroDTO[];
      }
      return [];
    } catch {
      return [];
    }
  }

  prestarLibro(isbn: string): boolean {
    const libros = this.recuperarLibros();
    const index = libros.findIndex((l) => l.isbn === isbn);
    if (index === -1 || libros[index].copiasDisponibles <= 0) return false;

    const actualizados = libros.map((l, i) =>
      i === index ? { ...l, copiasDisponibles: l.copiasDisponibles - 1 } : l
    );
    this.guardarLibros(actualizados);
    return true;
  }
}

function main() {
  console.log("=== BIBLIOTECA CON LOCALSTORAGE / REPOSITORIO MEMORIA ===");
  const repo = new RepositorioBibliotecaMemoria();
  const servicio = new ServicioBiblioteca(repo);

  const inventarioInicial: LibroDTO[] = [
    { isbn: "978-0132350884", titulo: "Clean Code", autor: "Robert C. Martin", anioPublicacion: 2008, copiasDisponibles: 3 },
    { isbn: "978-0201616224", titulo: "The Pragmatic Programmer", autor: "Andrew Hunt", anioPublicacion: 1999, copiasDisponibles: 1 },
  ];

  servicio.guardarLibros(inventarioInicial);
  console.log("Inventario sincronizado en localStorage.");

  const prestado = servicio.prestarLibro("978-0201616224");
  console.log(`Prestamo de 'The Pragmatic Programmer': ${prestado ? "APROBADO" : "RECHAZADO"}`);

  const librosActuales = servicio.recuperarLibros();
  librosActuales.forEach((l) => {
    console.log(`- ${l.titulo} por ${l.autor} | Copias en estante: ${l.copiasDisponibles}`);
  });
}

main();
