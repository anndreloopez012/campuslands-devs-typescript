export {};

type AttractionCategory = 'culture' | 'nature' | 'food';
type CategoryFilter = AttractionCategory | 'all';

interface Attraction {
  readonly id: number;
  readonly name: string;
  readonly category: AttractionCategory;
  readonly city: string;
  readonly description: string;
  readonly rating: number;
  readonly visitCost: number;
  readonly mapX: number;
  readonly mapY: number;
}

interface AttractionCardDTO {
  readonly id: number;
  readonly title: string;
  readonly location: string;
  readonly categoryLabel: string;
  readonly details: string;
}

interface TourismSummaryDTO {
  readonly resultCount: number;
  readonly averageRating: number;
  readonly averageVisitCost: number;
}

class InMemoryAttractionRepository {
  constructor(private readonly attractions: readonly Attraction[]) {}

  list(): readonly Attraction[] {
    return this.attractions;
  }
}

const attractions: readonly Attraction[] = [
  { id: 1, name: 'Castillo de San Felipe', category: 'culture', city: 'Cartagena', description: 'Fortaleza colonial con vista a la bahía.', rating: 4.8, visitCost: 33000, mapX: 24, mapY: 28 },
  { id: 2, name: 'Playa Blanca', category: 'nature', city: 'Barú', description: 'Arena clara y agua tranquila para pasar el día.', rating: 4.6, visitCost: 12000, mapX: 69, mapY: 66 },
  { id: 3, name: 'Mercado de Bazurto', category: 'food', city: 'Cartagena', description: 'Sabores locales, frutas y cocina caribeña.', rating: 4.3, visitCost: 0, mapX: 43, mapY: 53 },
  { id: 4, name: 'Convento de La Popa', category: 'culture', city: 'Cartagena', description: 'Mirador histórico en el punto más alto de la ciudad.', rating: 4.7, visitCost: 15000, mapX: 78, mapY: 22 },
];

const categoryLabels: Readonly<Record<AttractionCategory, string>> = {
  culture: 'Cultura',
  nature: 'Naturaleza',
  food: 'Gastronomía',
};

function toAttractionCard(attraction: Attraction): AttractionCardDTO {
  return {
    id: attraction.id,
    title: attraction.name,
    location: attraction.city,
    categoryLabel: categoryLabels[attraction.category],
    details: `${attraction.description} Calificación ${attraction.rating.toFixed(1)} / 5.`,
  };
}

function filterAttractions(
  items: readonly Attraction[],
  category: CategoryFilter,
  search: string,
): readonly Attraction[] {
  const query = search.trim().toLocaleLowerCase('es');
  return items.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    const searchable = `${item.name} ${item.city} ${item.description}`.toLocaleLowerCase('es');
    return matchesCategory && searchable.includes(query);
  });
}

function summarizeAttractions(items: readonly Attraction[]): TourismSummaryDTO {
  const ratingTotal = items.reduce((sum, item) => sum + item.rating, 0);
  const costTotal = items.reduce((sum, item) => sum + item.visitCost, 0);
  return {
    resultCount: items.length,
    averageRating: items.length === 0 ? 0 : Number((ratingTotal / items.length).toFixed(1)),
    averageVisitCost: items.length === 0 ? 0 : Math.round(costTotal / items.length),
  };
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  return element;
}

function formatCOP(value: number): string {
  return value === 0
    ? 'Gratis'
    : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
}

interface TourismState {
  category: CategoryFilter;
  search: string;
  selectedId: number | null;
  favorites: Set<number>;
}

function mountTourismMap(root: HTMLElement): void {
  const repository = new InMemoryAttractionRepository(attractions);
  const state: TourismState = {
    category: 'all',
    search: '',
    selectedId: attractions[0]?.id ?? null,
    favorites: new Set<number>(),
  };

  const style = createElement('style');
  style.textContent = `
    .tourism-app { max-width: 1100px; margin: 2rem auto; padding: 1.5rem; color: #164e63; font: 16px/1.5 system-ui, sans-serif; }
    .tourism-controls { display: flex; flex-wrap: wrap; gap: .75rem; margin: 1rem 0; }
    .tourism-controls input, .tourism-controls select, .tourism-controls button, .tourism-app button { font: inherit; padding: .5rem .75rem; }
    .tourism-layout { display: grid; grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr); gap: 1rem; }
    .tourism-map { position: relative; min-height: 360px; overflow: hidden; border: 1px solid #67e8f9; border-radius: 14px; background: linear-gradient(135deg, #cffafe, #ecfeff 45%, #a5f3fc); }
    .tourism-map::before, .tourism-map::after { position: absolute; content: ''; border: 2px dashed #0891b2; opacity: .35; transform: rotate(-20deg); }
    .tourism-map::before { width: 120%; top: 45%; left: -10%; }
    .tourism-map::after { height: 130%; top: -15%; left: 52%; }
    .tourism-map-label { position: absolute; top: .75rem; left: .75rem; color: #155e75; font-weight: 700; }
    .tourism-pin { position: absolute; z-index: 1; transform: translate(-50%, -50%); border: 2px solid white; border-radius: 50%; background: #0e7490; color: white; cursor: pointer; }
    .tourism-pin[aria-pressed="true"] { background: #c2410c; }
    .tourism-list { display: grid; align-content: start; gap: .75rem; }
    .attraction-card { border: 1px solid #a5f3fc; border-radius: 12px; padding: 1rem; }
    .attraction-card[aria-current="true"] { outline: 2px solid #0891b2; }
    .tourism-summary { margin: 1rem 0; padding: .75rem; background: #ecfeff; border-radius: 10px; }
    @media (max-width: 700px) { .tourism-layout { grid-template-columns: 1fr; } }
  `;
  root.append(style);

  const render = (): void => {
    const app = createElement('section');
    app.className = 'tourism-app';
    app.append(
      createElement('h1', 'Explora Cartagena y sus alrededores'),
      createElement('p', 'Filtra la lista o selecciona un punto del mapa para ver sus detalles.'),
    );

    const controls = createElement('div');
    controls.className = 'tourism-controls';
    const filter = createElement('select');
    filter.setAttribute('aria-label', 'Filtrar por categoría');
    const options: readonly { value: CategoryFilter; label: string }[] = [
      { value: 'all', label: 'Todas las categorías' },
      { value: 'culture', label: categoryLabels.culture },
      { value: 'nature', label: categoryLabels.nature },
      { value: 'food', label: categoryLabels.food },
    ];
    options.forEach((option) => {
      const item = createElement('option', option.label);
      item.value = option.value;
      item.selected = state.category === option.value;
      filter.append(item);
    });
    filter.addEventListener('change', () => {
      state.category = filter.value as CategoryFilter;
      render();
    });

    const searchForm = createElement('form');
    const search = createElement('input');
    search.value = state.search;
    search.placeholder = 'Buscar lugar o ciudad';
    search.setAttribute('aria-label', 'Buscar lugar o ciudad');
    const searchButton = createElement('button', 'Buscar');
    searchButton.type = 'submit';
    searchForm.append(search, searchButton);
    searchForm.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();
      state.search = search.value;
      render();
    });
    controls.append(filter, searchForm);
    app.append(controls);

    const visibleAttractions = filterAttractions(repository.list(), state.category, state.search);
    if (!visibleAttractions.some((item) => item.id === state.selectedId)) {
      state.selectedId = visibleAttractions[0]?.id ?? null;
    }
    const summary = summarizeAttractions(visibleAttractions);
    app.append(createElement(
      'p',
      `${summary.resultCount} lugares · calificación media ${summary.averageRating.toFixed(1)} · visita promedio ${formatCOP(summary.averageVisitCost)}`,
    ));

    const layout = createElement('div');
    layout.className = 'tourism-layout';
    const map = createElement('section');
    map.className = 'tourism-map';
    map.setAttribute('aria-label', 'Mapa interactivo de lugares turísticos');
    const mapLabel = createElement('span', 'Mapa turístico · Bolívar');
    mapLabel.className = 'tourism-map-label';
    map.append(mapLabel);
    visibleAttractions.forEach((item) => {
      const pin = createElement('button', String(item.id));
      pin.type = 'button';
      pin.className = 'tourism-pin';
      pin.style.left = `${item.mapX}%`;
      pin.style.top = `${item.mapY}%`;
      pin.title = item.name;
      pin.setAttribute('aria-label', `Ver ${item.name} en la lista`);
      pin.setAttribute('aria-pressed', String(state.selectedId === item.id));
      pin.addEventListener('click', () => {
        state.selectedId = item.id;
        render();
      });
      map.append(pin);
    });

    const list = createElement('div');
    list.className = 'tourism-list';
    visibleAttractions.forEach((item) => {
      const cardData = toAttractionCard(item);
      const card = createElement('article');
      card.className = 'attraction-card';
      card.setAttribute('aria-current', String(state.selectedId === item.id));
      card.append(
        createElement('h2', cardData.title),
        createElement('p', `${cardData.location} · ${cardData.categoryLabel}`),
        createElement('p', cardData.details),
        createElement('p', `Entrada aproximada: ${formatCOP(item.visitCost)}`),
      );
      const favorite = createElement('button', state.favorites.has(item.id) ? '★ Guardado' : '☆ Guardar');
      favorite.type = 'button';
      favorite.setAttribute('aria-pressed', String(state.favorites.has(item.id)));
      favorite.addEventListener('click', () => {
        if (state.favorites.has(item.id)) state.favorites.delete(item.id);
        else state.favorites.add(item.id);
        render();
      });
      const select = createElement('button', 'Ubicar en mapa');
      select.type = 'button';
      select.addEventListener('click', () => {
        state.selectedId = item.id;
        render();
      });
      card.append(favorite, select);
      list.append(card);
    });
    if (visibleAttractions.length === 0) {
      list.append(createElement('p', 'No encontramos lugares con esos filtros. Prueba otra búsqueda.'));
    }
    layout.append(map, list);
    app.append(layout);
    root.replaceChildren(style, app);
  };

  render();
}

const normalSummary = summarizeAttractions(filterAttractions(attractions, 'culture', 'Cartagena'));
const emptyResult = filterAttractions(attractions, 'all', 'Lugar que no existe');
console.log('Lista turística — ejemplo filtrado:', normalSummary);
console.log('Caso límite (búsqueda sin resultados):', {
  places: emptyResult.length,
  summary: summarizeAttractions(emptyResult),
});

if (typeof document !== 'undefined') {
  const start = (): void => {
    let root = document.getElementById('tourism-map-list');
    if (!root) {
      root = createElement('main');
      root.id = 'tourism-map-list';
      document.body.append(root);
    }
    mountTourismMap(root);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}
