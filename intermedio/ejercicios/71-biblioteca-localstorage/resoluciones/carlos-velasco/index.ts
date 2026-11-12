export {};

// tipos
interface LibroAlmacen {
  readonly isbn: string;
  readonly titulo: string;
  estado: 'disponible' | 'prestado';
  vecesPrestado: number;
}

// persistencia simulada
interface Almacenamiento {
  guardar(clave: string, valor: string): void;
  leer(clave: string): string | null;
}

class AlmacenamientoNavegador implements Almacenamiento {
  guardar(clave: string, valor: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(clave, valor);
  }

  leer(clave: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(clave);
  }
}

class AlmacenamientoMemoria implements Almacenamiento {
  private readonly datos = new Map<string, string>();

  guardar(clave: string, valor: string): void {
    this.datos.set(clave, valor);
  }

  leer(clave: string): string | null {
    return this.datos.get(clave) ?? null;
  }
}

// clases
class BibliotecaPersistente {
  private readonly almacen: Almacenamiento;
  private static readonly CLAVE = 'biblioteca-libros';

  constructor(almacen: Almacenamiento) {
    this.almacen = almacen;
  }

  cargar(): LibroAlmacen[] {
    const crudo = this.almacen.leer(BibliotecaPersistente.CLAVE);
    if (!crudo) return [];
    return JSON.parse(crudo) as LibroAlmacen[];
  }

  guardar(libros: LibroAlmacen[]): void {
    this.almacen.guardar(BibliotecaPersistente.CLAVE, JSON.stringify(libros));
  }

  prestar(libros: LibroAlmacen[], isbn: string): boolean {
    const libro = libros.find((item) => item.isbn === isbn && item.estado === 'disponible');
    if (!libro) return false;

    libro.estado = 'prestado';
    libro.vecesPrestado += 1;
    this.guardar(libros);
    return true;
  }

  devolver(libros: LibroAlmacen[], isbn: string): boolean {
    const libro = libros.find((item) => item.isbn === isbn && item.estado === 'prestado');
    if (!libro) return false;

    libro.estado = 'disponible';
    this.guardar(libros);
    return true;
  }
}

// datos
const librosIniciales: LibroAlmacen[] = [
  { isbn: '978-1', titulo: 'Algoritmos sin miedo', estado: 'disponible', vecesPrestado: 0 },
  { isbn: '978-2', titulo: 'TypeScript en serio', estado: 'disponible', vecesPrestado: 0 },
  { isbn: '978-3', titulo: 'Redes para humanos', estado: 'prestado', vecesPrestado: 3 },
];

// salida
function mostrarResumen(): void {
  console.log('=== Biblioteca con localStorage ===');
  const navegador = new AlmacenamientoNavegador();
  const memoria = new AlmacenamientoMemoria();
  const biblioteca = new BibliotecaPersistente(typeof window !== 'undefined' && typeof localStorage !== 'undefined' ? navegador : memoria);

  const libros = [...librosIniciales];
  biblioteca.guardar(libros);
  console.log(`Prestamo de 978-1: ${biblioteca.prestar(libros, '978-1') ? 'aprobado' : 'rechazado'}`);
  console.log(`Prestamo duplicado de 978-1: ${biblioteca.prestar(libros, '978-1') ? 'aprobado' : 'rechazado'}`);
  console.log(`Devolucion de 978-3: ${biblioteca.devolver(libros, '978-3') ? 'aprobado' : 'rechazado'}`);

  const recuperados = biblioteca.cargar();
  console.log('Estado persistido:');
  recuperados.forEach((libro) => {
    console.log(`- ${libro.titulo} | ${libro.estado} | Prestamos: ${libro.vecesPrestado}`);
  });
}

mostrarResumen();
