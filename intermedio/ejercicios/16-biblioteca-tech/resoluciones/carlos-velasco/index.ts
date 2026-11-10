export {};

// tipos
type EstadoLibro = 'disponible' | 'prestado' | 'en_reparacion';

interface Libro {
  readonly isbn: string;
  readonly titulo: string;
  readonly anio: number;
  paginas: number;
  estado: EstadoLibro;
  etiquetas: string[];
}

// datos
const libros: Libro[] = [
  { isbn: '978-1', titulo: 'Algoritmos sin miedo', anio: 2021, paginas: 420, estado: 'disponible', etiquetas: ['algoritmos', 'basico'] },
  { isbn: '978-2', titulo: 'TypeScript en serio', anio: 2023, paginas: 380, estado: 'prestado', etiquetas: ['typescript', 'web'] },
  { isbn: '978-3', titulo: 'Redes para humanos', anio: 2019, paginas: 510, estado: 'disponible', etiquetas: ['redes', 'basico'] },
  { isbn: '978-4', titulo: 'Bases de datos modernas', anio: 2022, paginas: 0, estado: 'disponible', etiquetas: ['sql', 'datos'] },
];

// validacion
function validarLibro(libro: Libro): string[] {
  const errores: string[] = [];

  if (libro.paginas <= 0) errores.push(`${libro.titulo}: paginas invalidas`);
  if (libro.etiquetas.length === 0) errores.push(`${libro.titulo}: sin etiquetas`);

  return errores;
}

// calculos
function contarPorEstado(libros: Libro[]): Record<EstadoLibro, number> {
  return libros.reduce<Record<EstadoLibro, number>>((acumulador, libro) => {
    acumulador[libro.estado] = (acumulador[libro.estado] ?? 0) + 1;
    return acumulador;
  }, { disponible: 0, prestado: 0, en_reparacion: 0 });
}

function totalPaginas(libros: Libro[]): number {
  return libros.reduce((total, libro) => total + libro.paginas, 0);
}

function buscarPorEtiqueta(libros: Libro[], etiqueta: string): Libro[] {
  return libros.filter((libro) => libro.etiquetas.includes(etiqueta));
}

function prestar(libro: Libro): boolean {
  if (libro.estado !== 'disponible') return false;
  libro.estado = 'prestado';
  return true;
}

// salida
function mostrarResumen(libros: Libro[]): void {
  console.log('=== Biblioteca tech ===');
  console.log('Libros por estado:', contarPorEstado(libros));
  console.log(`Total de paginas: ${totalPaginas(libros)}`);
  console.log('Con etiqueta basico:', buscarPorEtiqueta(libros, 'basico').map((libro) => libro.titulo).join(', '));

  const prestado = prestar(libros[0]);
  console.log(`Prestamo de "${libros[0].titulo}": ${prestado ? 'aprobado' : 'rechazado'}`);

  libros.forEach((libro) => {
    const errores = validarLibro(libro);
    if (errores.length > 0) console.log(`Alerta: ${errores.join('; ')}`);
  });
}

mostrarResumen(libros);
