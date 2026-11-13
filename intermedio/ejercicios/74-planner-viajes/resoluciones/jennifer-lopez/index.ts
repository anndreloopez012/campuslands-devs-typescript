export {};

type TripStatus = 'planned' | 'booked' | 'completed';
type TripStatusFilter = TripStatus | 'all';

interface Trip {
  readonly id: number;
  readonly destination: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly budget: number;
  readonly status: TripStatus;
}

interface TripFormDTO {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: TripStatus;
}

interface TripSummaryDTO {
  readonly tripCount: number;
  readonly bookedCount: number;
  readonly totalBudget: number;
  readonly averageBudget: number;
}

type TripValidation =
  | { readonly valid: true; readonly value: TripFormDTO }
  | { readonly valid: false; readonly message: string };

class InMemoryTripRepository {
  private readonly trips: Trip[];

  constructor(initialTrips: readonly Trip[]) {
    this.trips = [...initialTrips];
  }

  list(): readonly Trip[] {
    return this.trips;
  }

  add(trip: Trip): void {
    this.trips.push(trip);
  }
}

const initialTrips: readonly Trip[] = [
  { id: 1, destination: 'Cartagena', startDate: '2026-12-10', endDate: '2026-12-14', budget: 1250000, status: 'booked' },
  { id: 2, destination: 'Eje Cafetero', startDate: '2027-01-18', endDate: '2027-01-22', budget: 980000, status: 'planned' },
  { id: 3, destination: 'Medellín', startDate: '2026-10-04', endDate: '2026-10-07', budget: 720000, status: 'completed' },
];

function validateTrip(input: TripFormDTO): TripValidation {
  const destination = input.destination.trim();
  const start = Date.parse(input.startDate);
  const end = Date.parse(input.endDate);

  if (!destination) return { valid: false, message: 'Escribe un destino.' };
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return { valid: false, message: 'Selecciona fechas válidas.' };
  }
  if (end < start) return { valid: false, message: 'El regreso no puede ser anterior a la salida.' };
  if (!Number.isFinite(input.budget) || input.budget <= 0) {
    return { valid: false, message: 'El presupuesto debe ser mayor que cero.' };
  }

  return {
    valid: true,
    value: { ...input, destination, budget: Math.round(input.budget) },
  };
}

function summarizeTrips(trips: readonly Trip[]): TripSummaryDTO {
  const totalBudget = trips.reduce((sum, trip) => sum + trip.budget, 0);
  return {
    tripCount: trips.length,
    bookedCount: trips.filter((trip) => trip.status === 'booked').length,
    totalBudget,
    averageBudget: trips.length === 0 ? 0 : Math.round(totalBudget / trips.length),
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
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

interface PlannerState {
  trips: readonly Trip[];
  statusFilter: TripStatusFilter;
  search: string;
  message: string;
}

function mountPlanner(root: HTMLElement): void {
  const repository = new InMemoryTripRepository(initialTrips);
  const state: PlannerState = {
    trips: repository.list(),
    statusFilter: 'all',
    search: '',
    message: '',
  };
  let nextId = Math.max(...state.trips.map((trip) => trip.id)) + 1;

  const style = createElement('style');
  style.textContent = `
    .travel-planner { max-width: 900px; margin: 2rem auto; padding: 1.5rem; color: #172554; font: 16px/1.5 system-ui, sans-serif; }
    .travel-planner h1 { margin-bottom: .25rem; }
    .travel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem; }
    .travel-card, .travel-form, .travel-summary { border: 1px solid #cbd5e1; border-radius: 12px; padding: 1rem; }
    .travel-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: .75rem; margin: 1rem 0; }
    .travel-form label { display: grid; gap: .25rem; }
    .travel-planner input, .travel-planner select, .travel-planner button { font: inherit; padding: .5rem; }
    .travel-summary { display: flex; flex-wrap: wrap; gap: 1rem; background: #eff6ff; }
    .travel-message { min-height: 1.5rem; color: #9a3412; }
  `;
  root.append(style);

  const render = (): void => {
    const app = createElement('section');
    app.className = 'travel-planner';
    app.append(createElement('h1', 'Planner de viajes'));
    app.append(createElement('p', 'Organiza destinos, fechas y presupuesto en un solo lugar.'));

    const summary = summarizeTrips(state.trips);
    const summaryPanel = createElement('section');
    summaryPanel.className = 'travel-summary';
    summaryPanel.setAttribute('aria-label', 'Resumen del viaje');
    summaryPanel.append(
      createElement('span', `Viajes: ${summary.tripCount}`),
      createElement('span', `Reservados: ${summary.bookedCount}`),
      createElement('span', `Presupuesto total: ${formatCOP(summary.totalBudget)}`),
      createElement('span', `Promedio por viaje: ${formatCOP(summary.averageBudget)}`),
    );
    app.append(summaryPanel);

    const form = createElement('form');
    form.className = 'travel-form';
    const destination = createElement('input');
    destination.required = true;
    destination.placeholder = 'Ej. Santa Marta';
    destination.setAttribute('aria-label', 'Destino');
    const startDate = createElement('input');
    startDate.type = 'date';
    startDate.required = true;
    startDate.setAttribute('aria-label', 'Fecha de salida');
    const endDate = createElement('input');
    endDate.type = 'date';
    endDate.required = true;
    endDate.setAttribute('aria-label', 'Fecha de regreso');
    const budget = createElement('input');
    budget.type = 'number';
    budget.min = '1';
    budget.step = '1000';
    budget.required = true;
    budget.placeholder = 'Presupuesto COP';
    budget.setAttribute('aria-label', 'Presupuesto en pesos colombianos');
    const status = createElement('select');
    status.setAttribute('aria-label', 'Estado del viaje');
    const statusOptions: readonly { value: TripStatus; label: string }[] = [
      { value: 'planned', label: 'Planeado' },
      { value: 'booked', label: 'Reservado' },
      { value: 'completed', label: 'Realizado' },
    ];
    statusOptions.forEach((option) => {
      const item = createElement('option', option.label);
      item.value = option.value;
      status.append(item);
    });
    const addButton = createElement('button', 'Agregar viaje');
    addButton.type = 'submit';
    form.append(
      labeledControl('Destino', destination),
      labeledControl('Salida', startDate),
      labeledControl('Regreso', endDate),
      labeledControl('Presupuesto', budget),
      labeledControl('Estado', status),
      addButton,
    );

    const message = createElement('p', state.message);
    message.className = 'travel-message';
    message.setAttribute('role', 'status');
    form.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();
      const validation = validateTrip({
        destination: destination.value,
        startDate: startDate.value,
        endDate: endDate.value,
        budget: Number(budget.value),
        status: status.value as TripStatus,
      });
      if (!validation.valid) {
        state.message = validation.message;
      } else {
        repository.add({ id: nextId++, ...validation.value });
        state.trips = repository.list();
        state.message = `Viaje a ${validation.value.destination} agregado.`;
      }
      render();
    });
    app.append(form, message);

    const controls = createElement('div');
    const filter = createElement('select');
    filter.setAttribute('aria-label', 'Filtrar por estado');
    const filters: readonly { value: TripStatusFilter; label: string }[] = [
      { value: 'all', label: 'Todos los estados' },
      ...statusOptions,
    ];
    filters.forEach((option) => {
      const item = createElement('option', option.label);
      item.value = option.value;
      item.selected = state.statusFilter === option.value;
      filter.append(item);
    });
    filter.addEventListener('change', () => {
      state.statusFilter = filter.value as TripStatusFilter;
      render();
    });
    const searchForm = createElement('form');
    const search = createElement('input');
    search.value = state.search;
    search.placeholder = 'Buscar destino';
    search.setAttribute('aria-label', 'Buscar destino');
    const searchButton = createElement('button', 'Buscar');
    searchButton.type = 'submit';
    searchForm.append(search, searchButton);
    searchForm.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();
      state.search = search.value.trim();
      render();
    });
    controls.append(filter, searchForm);
    app.append(controls);

    const visibleTrips = state.trips.filter((trip) => {
      const matchesStatus = state.statusFilter === 'all' || trip.status === state.statusFilter;
      return matchesStatus && trip.destination.toLowerCase().includes(state.search.toLowerCase());
    });
    const tripGrid = createElement('div');
    tripGrid.className = 'travel-grid';
    visibleTrips.forEach((trip) => {
      const card = createElement('article');
      card.className = 'travel-card';
      card.append(
        createElement('h2', trip.destination),
        createElement('p', `${trip.startDate} – ${trip.endDate}`),
        createElement('p', `Presupuesto: ${formatCOP(trip.budget)}`),
        createElement('p', `Estado: ${statusOptions.find((option) => option.value === trip.status)?.label ?? trip.status}`),
      );
      tripGrid.append(card);
    });
    if (visibleTrips.length === 0) tripGrid.append(createElement('p', 'No hay viajes para estos filtros.'));
    app.append(tripGrid);
    root.replaceChildren(style, app);
  };

  render();
}

function labeledControl(label: string, control: HTMLElement): HTMLLabelElement {
  const wrapper = createElement('label');
  wrapper.append(createElement('span', label), control);
  return wrapper;
}

const initialSummary = summarizeTrips(initialTrips);
const invalidEdgeCase = validateTrip({
  destination: '  ',
  startDate: '2027-02-10',
  endDate: '2027-02-09',
  budget: 0,
  status: 'planned',
});
console.log('Planner de viajes — resumen inicial:', initialSummary);
console.log('Caso límite (destino y fechas inválidas):', invalidEdgeCase);

if (typeof document !== 'undefined') {
  const start = (): void => {
    let root = document.getElementById('travel-planner');
    if (!root) {
      root = createElement('main');
      root.id = 'travel-planner';
      document.body.append(root);
    }
    mountPlanner(root);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}
