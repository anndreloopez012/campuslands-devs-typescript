export {};

// tipos
type EstadoLectura = 'pendiente' | 'leyendo' | 'terminado';

interface LibroClub {
  readonly titulo: string;
  readonly paginas: number;
  estado: EstadoLectura;
  paginasLeidas: number;
}

// clases
class ClubLectura {
  private readonly libros: LibroClub[];

  constructor(libros: LibroClub[]) {
    this.libros = [...libros];
  }

  leer(libroTitulo: string, paginas: number): boolean {
    const libro = this.libros.find((item) => item.titulo === libroTitulo);
    if (!libro || paginas <= 0 || libro.paginasLeidas + paginas > libro.paginas) return false;

    libro.paginasLeidas += paginas;
    libro.estado = libro.paginasLeidas === libro.paginas ? 'terminado' : 'leyendo';
    return true;
  }

  progreso(titulo: string): number {
    const libro = this.libros.find((item) => item.titulo === titulo);
    if (!libro || libro.paginas === 0) return 0;
    return Number(((libro.paginasLeidas / libro.paginas) * 100).toFixed(1));
  }

  pendientes(): LibroClub[] {
    return this.libros.filter((libro) => libro.estado !== 'terminado');
  }

  paginasTotalesLeidas(): number {
    return this.libros.reduce((total, libro) => total + libro.paginasLeidas, 0);
  }
}

// generics
function mayorProgreso<T extends { paginasLeidas: number; paginas: number }>(libros: T[]): T | null {
  if (libros.length === 0) return null;
  return libros.reduce((mejor, libro) => (libro.paginasLeidas / libro.paginas > mejor.paginasLeidas / mejor.paginas ? libro : mejor));
}

// datos
const libros: LibroClub[] = [
  { titulo: 'La Maquina Vacía', paginas: 320, estado: 'pendiente', paginasLeidas: 0 },
  { titulo: 'Cronicas de Polvo', paginas: 280, estado: 'leyendo', paginasLeidas: 120 },
  { titulo: 'Faro Interior', paginas: 150, estado: 'terminado', paginasLeidas: 150 },
];

const sesiones: [string, number][] = [
  ['La Maquina Vacía', 50],
  ['Cronicas de Polvo', 160],
  ['Cronicas de Polvo', 200],
  ['Faro Interior', 10],
];

// salida
function mostrarResumen(): void {
  console.log('=== Club de lectura ===');
  const club = new ClubLectura(libros);

  sesiones.forEach(([titulo, paginas]) => {
    const leido = club.leer(titulo, paginas);
    console.log(`Lectura de ${paginas} paginas de "${titulo}": ${leido ? 'aplicada' : 'rechazada'}`);
  });

  console.log('Progreso por libro:');
  libros.forEach((libro) => {
    console.log(`- ${libro.titulo} | ${club.progreso(libro.titulo)}% | ${libro.estado}`);
  });

  console.log(`Paginas leidas en total: ${club.paginasTotalesLeidas()}`);
  console.log(`Libros pendientes: ${club.pendientes().map((libro) => libro.titulo).join(', ')}`);
  console.log(`Con mayor progreso: ${mayorProgreso(libros)?.titulo ?? 'ninguno'}`);
}

mostrarResumen();
