export {};

interface Book {
    title: string;
    author: string;
    topic: string;
    pages: number;
    read: boolean;
}

const books: Book[] = [
    { title: "Codigo limpio", author: "R. Martin", topic: "software", pages: 464, read: true },
    { title: "Redes practicas", author: "L. Vega", topic: "redes", pages: 280, read: false },
    { title: "TypeScript moderno", author: "A. Ruiz", topic: "software", pages: 320, read: true },
];

const readBooks = books.filter((book) => book.read);
const pagesRead = readBooks.reduce((total, book) => total + book.pages, 0);

readBooks.forEach((book) => console.log(`${book.title} - ${book.author}`));
console.log(`Libros leidos: ${readBooks.length} de ${books.length}`);
console.log(`Paginas leidas: ${pagesRead}`);
