export {};

type BookCategory = 'novela' | 'historia' | 'ciencia';
type LoanStatus = 'disponible' | 'prestado';

interface Book {
  readonly id: number;
  readonly title: string;
  readonly author: string;
  readonly category: BookCategory;
  readonly price: number;
  status: LoanStatus;
}

interface BookDTO {
  id: number;
  title: string;
  author: string;
  category: BookCategory;
  price: number;
  status: LoanStatus;
}

interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

class MemoryStorage implements StoragePort {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

function isBookDTO(value: unknown): value is BookDTO {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'number' &&
    Number.isInteger(candidate.id) &&
    typeof candidate.title === 'string' &&
    typeof candidate.author === 'string' &&
    (candidate.category === 'novela' ||
      candidate.category === 'historia' ||
      candidate.category === 'ciencia') &&
    typeof candidate.price === 'number' &&
    Number.isFinite(candidate.price) &&
    candidate.price >= 0 &&
    (candidate.status === 'disponible' || candidate.status === 'prestado')
  );
}

function toBook(dto: BookDTO): Book {
  return { ...dto };
}

class LibraryRepository {
  private readonly key = 'biblioteca-libros';

  constructor(private readonly storage: StoragePort) {}

  getAll(): Book[] {
    const saved = this.storage.getItem(this.key);
    if (saved === null) return [];

    try {
      const parsed: unknown = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.filter(isBookDTO).map(toBook)
        : [];
    } catch {
      return [];
    }
  }

  saveAll(books: readonly Book[]): void {
    const dtos: BookDTO[] = books.map((book) => ({ ...book }));
    this.storage.setItem(this.key, JSON.stringify(dtos));
  }

  borrow(bookId: number): 'prestado' | 'no-encontrado' | 'ya-prestado' {
    const books = this.getAll();
    const book = books.find((item) => item.id === bookId);
    if (!book) return 'no-encontrado';
    if (book.status === 'prestado') return 'ya-prestado';

    book.status = 'prestado';
    this.saveAll(books);
    return 'prestado';
  }
}

interface LibraryReport {
  readonly totalBooks: number;
  readonly availableBooks: number;
  readonly inventoryValue: number;
}

function createReport(books: readonly Book[]): LibraryReport {
  return books.reduce<LibraryReport>(
    (report, book) => ({
      totalBooks: report.totalBooks + 1,
      availableBooks:
        report.availableBooks + (book.status === 'disponible' ? 1 : 0),
      inventoryValue: report.inventoryValue + book.price,
    }),
    { totalBooks: 0, availableBooks: 0, inventoryValue: 0 },
  );
}

function createStorage(): StoragePort {
  return typeof localStorage === 'undefined' ? new MemoryStorage() : localStorage;
}

const initialBooks: Book[] = [
  {
    id: 1,
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    category: 'novela',
    price: 52000,
    status: 'disponible',
  },
  {
    id: 2,
    title: 'Breve historia de Colombia',
    author: 'Jorge Orlando Melo',
    category: 'historia',
    price: 38000,
    status: 'disponible',
  },
  {
    id: 3,
    title: 'Cosmos',
    author: 'Carl Sagan',
    category: 'ciencia',
    price: 45000,
    status: 'prestado',
  },
];

const repository = new LibraryRepository(createStorage());
if (repository.getAll().length === 0) repository.saveAll(initialBooks);

console.log('Préstamo de Juan Pérez:', repository.borrow(1));
console.log('Préstamo de un libro inexistente:', repository.borrow(99));
console.log('Resumen de biblioteca:', createReport(repository.getAll()));

const invalidData = new MemoryStorage();
invalidData.setItem('biblioteca-libros', '{dato inválido');
console.log(
  'Caso límite (datos guardados corruptos):',
  new LibraryRepository(invalidData).getAll().length,
  'libros',
);
