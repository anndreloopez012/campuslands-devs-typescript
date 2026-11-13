export {};

type ClothingCategory = 'camisetas' | 'pantalones' | 'chaquetas';
type ClothingSize = 'XS' | 'S' | 'M' | 'L';
type CategoryFilter = ClothingCategory | 'todas';
type SizeFilter = ClothingSize | 'todas';

interface ClothingProduct {
  readonly id: number;
  readonly name: string;
  readonly category: ClothingCategory;
  readonly size: ClothingSize;
  readonly price: number;
  readonly color: string;
}

interface ProductFilters {
  readonly search: string;
  readonly category: CategoryFilter;
  readonly size: SizeFilter;
  readonly maxPrice: number | null;
}

function filterProducts(
  products: readonly ClothingProduct[],
  filters: ProductFilters,
): ClothingProduct[] {
  const query = filters.search.trim().toLocaleLowerCase('es');
  return products.reduce<ClothingProduct[]>((matches, product) => {
    const matchesSearch = product.name.toLocaleLowerCase('es').includes(query);
    const matchesCategory =
      filters.category === 'todas' || product.category === filters.category;
    const matchesSize = filters.size === 'todas' || product.size === filters.size;
    const matchesPrice =
      filters.maxPrice === null || product.price <= filters.maxPrice;
    if (matchesSearch && matchesCategory && matchesSize && matchesPrice) {
      matches.push(product);
    }
    return matches;
  }, []);
}

function countByCategory(
  products: readonly ClothingProduct[],
): Record<ClothingCategory, number> {
  return products.reduce<Record<ClothingCategory, number>>(
    (counts, product) => {
      counts[product.category] += 1;
      return counts;
    },
    { camisetas: 0, pantalones: 0, chaquetas: 0 },
  );
}

function isCategory(value: string): value is ClothingCategory {
  return value === 'camisetas' || value === 'pantalones' || value === 'chaquetas';
}

function isSize(value: string): value is ClothingSize {
  return value === 'XS' || value === 'S' || value === 'M' || value === 'L';
}

function addSelectOptions(
  page: Document,
  select: HTMLSelectElement,
  values: readonly string[],
): void {
  for (const value of values) {
    const option = page.createElement('option');
    option.value = value;
    option.textContent = value;
    select.append(option);
  }
}

function createStorePage(
  page: Document,
  products: readonly ClothingProduct[],
): HTMLElement {
  const app = page.createElement('main');
  const heading = page.createElement('h1');
  heading.textContent = 'Tienda Campus';
  const search = page.createElement('input');
  search.type = 'search';
  search.placeholder = 'Buscar prenda';
  search.setAttribute('aria-label', 'Buscar prenda');
  const category = page.createElement('select');
  category.setAttribute('aria-label', 'Filtrar por categoría');
  addSelectOptions(page, category, ['todas', 'camisetas', 'pantalones', 'chaquetas']);
  const size = page.createElement('select');
  size.setAttribute('aria-label', 'Filtrar por talla');
  addSelectOptions(page, size, ['todas', 'XS', 'S', 'M', 'L']);
  const maxPrice = page.createElement('input');
  maxPrice.type = 'number';
  maxPrice.min = '0';
  maxPrice.placeholder = 'Precio máximo';
  maxPrice.setAttribute('aria-label', 'Precio máximo');
  const results = page.createElement('section');
  results.setAttribute('aria-live', 'polite');
  app.append(heading, search, category, size, maxPrice, results);

  const render = (): void => {
    const selectedCategory: CategoryFilter =
      isCategory(category.value) ? category.value : 'todas';
    const selectedSize: SizeFilter = isSize(size.value) ? size.value : 'todas';
    const parsedPrice = Number(maxPrice.value);
    const filters: ProductFilters = {
      search: search.value,
      category: selectedCategory,
      size: selectedSize,
      maxPrice:
        maxPrice.value.trim() !== '' && Number.isFinite(parsedPrice) && parsedPrice >= 0
          ? parsedPrice
          : null,
    };
    const matches = filterProducts(products, filters);
    results.replaceChildren();
    if (matches.length === 0) {
      const emptyState = page.createElement('p');
      emptyState.textContent = 'No hay prendas que coincidan con los filtros.';
      results.append(emptyState);
      return;
    }
    for (const product of matches) {
      const card = page.createElement('article');
      card.textContent = `${product.name} · ${product.size} · ${product.color} · $${product.price.toLocaleString('es-CO')}`;
      results.append(card);
    }
  };

  search.addEventListener('input', render);
  category.addEventListener('change', render);
  size.addEventListener('change', render);
  maxPrice.addEventListener('input', render);
  render();
  return app;
}

const products: readonly ClothingProduct[] = [
  { id: 1, name: 'Camiseta básica', category: 'camisetas', size: 'M', price: 35000, color: 'azul' },
  { id: 2, name: 'Jean recto', category: 'pantalones', size: 'L', price: 89000, color: 'índigo' },
  { id: 3, name: 'Chaqueta liviana', category: 'chaquetas', size: 'M', price: 125000, color: 'negro' },
  { id: 4, name: 'Camiseta deportiva', category: 'camisetas', size: 'S', price: 42000, color: 'verde' },
];

const regularFilters: ProductFilters = {
  search: '',
  category: 'camisetas',
  size: 'M',
  maxPrice: 50000,
};
const regularResults = filterProducts(products, regularFilters);
console.log('Prendas para Juan Pérez:', regularResults);
console.log('Conteo por categoría:', countByCategory(products));
console.log(
  'Caso límite (filtros sin coincidencias):',
  filterProducts(products, { ...regularFilters, maxPrice: 1000 }).length,
  'prendas',
);

if (typeof document !== 'undefined') {
  document.body.append(createStorePage(document, products));
}
